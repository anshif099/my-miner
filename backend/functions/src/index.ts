import { ServerValue } from "firebase-admin/database";
import { setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { ZodError } from "zod";
import { defaultSettings } from "@miner/shared";
import { appendAudit, auditEntry } from "./audit.js";
import { requireUser } from "./auth.js";
import { invalid } from "./errors.js";
import { db } from "./firebase.js";
import { createDeviceInputSchema, deviceIdInputSchema, emptyInputSchema, idInputSchema, updateSettingsInputSchema } from "./schemas.js";
import { createAuthorizedCommand } from "./services/commands.js";
import { listOwned, readOwned } from "./services/queries.js";

setGlobalOptions({ region: "asia-south1", maxInstances: 10 });
const options = { enforceAppCheck: process.env.FUNCTIONS_EMULATOR !== "true", cors: true } as const;

const parse = <T>(schema: { parse(value: unknown): T }, value: unknown): T => {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) invalid(error);
    throw error;
  }
};

export const ensureUserProfile = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  const [profile, settings] = await Promise.all([
    db.ref(`users/${ownerId}`).get(),
    db.ref(`settings/${ownerId}`).get()
  ]);
  const updates: Record<string, unknown> = {};
  if (!profile.exists()) {
    updates[`users/${ownerId}`] = {
      userId: ownerId,
      email: request.auth?.token.email ?? "",
      displayName: request.auth?.token.name ?? "",
      timezone: "Asia/Kolkata",
      createdAt: ServerValue.TIMESTAMP,
      updatedAt: ServerValue.TIMESTAMP
    };
  }
  if (!settings.exists()) {
    updates[`settings/${ownerId}`] = {
      ownerId,
      ...defaultSettings,
      createdAt: ServerValue.TIMESTAMP,
      updatedAt: ServerValue.TIMESTAMP
    };
  }
  if (Object.keys(updates).length > 0) await db.ref().update(updates);
  return { ok: true };
});

export const recordLogin = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  await appendAudit({ ownerId, actor: "USER", event: "LOGIN", result: "SUCCESS" });
  return { ok: true };
});

export const getDevices = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  parse(emptyInputSchema, request.data);
  return { devices: await listOwned("devices", ownerId) };
});

export const getDeviceStatus = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  const { deviceId } = parse(deviceIdInputSchema, request.data);
  return { device: await readOwned("devices", deviceId, ownerId) };
});

export const getMiningSession = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  const { id } = parse(idInputSchema, request.data);
  return { session: await readOwned("miningSessions", id, ownerId) };
});

export const getEarnings = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  parse(emptyInputSchema, request.data);
  return { earnings: await listOwned("earnings", ownerId) };
});

export const getSchedules = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  parse(emptyInputSchema, request.data);
  return { schedules: await listOwned("schedules", ownerId) };
});

export const getSettings = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  parse(emptyInputSchema, request.data);
  const snapshot = await db.ref(`settings/${ownerId}`).get();
  return { settings: snapshot.exists() ? snapshot.val() : null };
});

export const getAuditLogs = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  parse(emptyInputSchema, request.data);
  return { auditLogs: await listOwned("auditLogs", ownerId) };
});

export const createDevice = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  if (process.env.ALLOW_DEV_DEVICE_CREATION !== "true" || process.env.FUNCTIONS_EMULATOR !== "true") {
    throw new HttpsError("failed-precondition", "Development device creation is disabled.");
  }
  const input = parse(createDeviceInputSchema, request.data);
  const deviceId = db.ref("devices").push().key;
  if (!deviceId) throw new HttpsError("internal", "Could not allocate device identifier.");
  const audit = auditEntry({ ownerId, actor: "USER", deviceId, event: "DEVICE_REGISTERED", result: "SUCCESS", metadata: { developmentOnly: true } });
  await db.ref().update({
    [`devices/${deviceId}`]: {
      deviceId,
      ownerId,
      ...input,
      operationalState: "OFF",
      availability: "OFFLINE",
      hardware: {},
      capabilities: [],
      softwareVersion: "Not available",
      lastSeen: null,
      lastError: null,
      createdAt: ServerValue.TIMESTAMP,
      updatedAt: ServerValue.TIMESTAMP
    },
    [audit.path]: audit.data
  });
  return { deviceId, developmentOnly: true };
});

export const createCommand = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  try {
    return await createAuthorizedCommand(ownerId, request.data);
  } catch (error) {
    if (error instanceof ZodError) invalid(error);
    throw error;
  }
});

export const updateSettings = onCall(options, async (request) => {
  const ownerId = requireUser(request);
  const input = parse(updateSettingsInputSchema, request.data);
  const audit = auditEntry({ ownerId, actor: "USER", event: "CONFIG_CHANGED", result: "SUCCESS", metadata: { fields: Object.keys(input) } });
  await db.ref().update({
    [`settings/${ownerId}`]: {
      ownerId,
      ...input,
      updatedAt: ServerValue.TIMESTAMP
    },
    [audit.path]: audit.data
  });
  return { ok: true };
});