"use client";

import type { User } from "firebase/auth";
import { ref, runTransaction, serverTimestamp } from "firebase/database";
import { defaultSettings } from "@miner/shared";
import { database } from "@/lib/firebase";

export async function ensureUserProfile(user: User): Promise<void> {
  await Promise.all([
    runTransaction(ref(database, `users/${user.uid}`), (current) => current ?? {
      userId: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      timezone: "Asia/Kolkata",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }),
    runTransaction(ref(database, `settings/${user.uid}`), (current) => current ?? {
      ownerId: user.uid,
      ...defaultSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  ]);
}