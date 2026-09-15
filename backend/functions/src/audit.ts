import { ServerValue } from "firebase-admin/database";
import type { z } from "zod";
import { auditEventSchema } from "@miner/shared";
import { db } from "./firebase.js";

type AuditEvent = z.infer<typeof auditEventSchema>;
export interface AuditInput {
  ownerId: string;
  actor: string;
  deviceId?: string | null;
  event: AuditEvent;
  result: "SUCCESS" | "FAILURE";
  metadata?: Record<string, unknown>;
}

export function auditEntry(input: AuditInput): { id: string; path: string; data: Record<string, unknown> } {
  const id = db.ref("auditLogs").push().key;
  if (!id) throw new Error("Unable to allocate audit identifier.");
  return {
    id,
    path: `auditLogs/${id}`,
    data: {
      auditId: id,
      ownerId: input.ownerId,
      userId: input.ownerId,
      actor: input.actor,
      deviceId: input.deviceId ?? null,
      event: input.event,
      result: input.result,
      metadata: input.metadata ?? {},
      serverTimestamp: ServerValue.TIMESTAMP
    }
  };
}

export async function appendAudit(input: AuditInput): Promise<string> {
  const entry = auditEntry(input);
  await db.ref(entry.path).set(entry.data);
  return entry.id;
}