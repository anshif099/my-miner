import { ServerValue } from "firebase-admin/database";
import { HttpsError } from "firebase-functions/v2/https";
import { createCommandInputSchema } from "@miner/shared";
import { auditEntry } from "../audit.js";
import { db } from "../firebase.js";
import { getOwned } from "../ownership.js";

const commandTtlSeconds = 60;
const priorities = { START: 10, STOP: 50, EMERGENCY_STOP: 100, STATUS_REQUEST: 5, CONFIG_UPDATE: 20 } as const;
const events = { START: "START_REQUESTED", STOP: "STOP_REQUESTED", EMERGENCY_STOP: "EMERGENCY_STOP", STATUS_REQUEST: "CONFIG_CHANGED", CONFIG_UPDATE: "CONFIG_CHANGED" } as const;

export function commandExpiration(nowMs: number): Date {
  return new Date(nowMs + commandTtlSeconds * 1000);
}

export function isCommandExpired(expiresAtMs: number, nowMs: number): boolean {
  return expiresAtMs <= nowMs;
}

export async function createAuthorizedCommand(ownerId: string, unknownInput: unknown): Promise<{ commandId: string; status: "PENDING"; expiresAt: string }> {
  const input = createCommandInputSchema.parse(unknownInput);
  const device = await getOwned(db.ref(`devices/${input.deviceId}`), ownerId);
  const availability = device.child("availability").val() as string;
  if (input.type === "START" && availability !== "ONLINE") {
    throw new HttpsError("failed-precondition", "Device is not online.", { code: "DEVICE_OFFLINE" });
  }

  const counter = await db.ref(`deviceCommandCounters/${input.deviceId}`).transaction((current: { sequence?: number } | null) => ({
    ownerId,
    deviceId: input.deviceId,
    sequence: (current?.sequence ?? 0) + 1,
    updatedAt: ServerValue.TIMESTAMP
  }));
  if (!counter.committed) throw new HttpsError("aborted", "Could not allocate command sequence.");
  const sequence = Number(counter.snapshot.child("sequence").val());

  const commandId = db.ref("deviceCommands").push().key;
  if (!commandId) throw new HttpsError("internal", "Could not allocate command identifier.");
  const expiresAt = commandExpiration(Date.now());
  const audit = auditEntry({ ownerId, actor: "USER", deviceId: input.deviceId, event: events[input.type], result: "SUCCESS", metadata: { commandId, commandType: input.type } });

  await db.ref().update({
    [`deviceCommands/${commandId}`]: {
      commandId,
      deviceId: input.deviceId,
      ownerId,
      type: input.type,
      payload: input.payload,
      priority: priorities[input.type],
      sequence,
      createdAt: ServerValue.TIMESTAMP,
      expiresAt: expiresAt.getTime(),
      status: "PENDING",
      acknowledgedAt: null,
      completedAt: null,
      result: null
    },
    [audit.path]: audit.data
  });

  return { commandId, status: "PENDING", expiresAt: expiresAt.toISOString() };
}