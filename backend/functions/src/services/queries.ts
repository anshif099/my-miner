import { db } from "../firebase.js";
import { getOwned } from "../ownership.js";

export async function listOwned(path: string, ownerId: string, resultLimit = 100): Promise<Record<string, unknown>[]> {
  const snapshot = await db.ref(path).orderByChild("ownerId").equalTo(ownerId).limitToFirst(resultLimit).get();
  const value = snapshot.val() as Record<string, Record<string, unknown>> | null;
  return value ? Object.entries(value).map(([id, data]) => ({ id, ...data })) : [];
}

export async function readOwned(path: string, id: string, ownerId: string): Promise<Record<string, unknown>> {
  const snapshot = await getOwned(db.ref(path).child(id), ownerId);
  return { id: snapshot.key, ...(snapshot.val() as Record<string, unknown>) };
}