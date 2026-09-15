import type { DataSnapshot, Reference } from "firebase-admin/database";
import { forbidden, notFound } from "./errors.js";

export function assertOwnership(snapshot: DataSnapshot, ownerId: string, label = "Resource"): void {
  if (!snapshot.exists()) notFound(label);
  if (snapshot.child("ownerId").val() !== ownerId) forbidden();
}

export async function getOwned(reference: Reference, ownerId: string): Promise<DataSnapshot> {
  const snapshot = await reference.get();
  assertOwnership(snapshot, ownerId);
  return snapshot;
}