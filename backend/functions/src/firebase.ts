import { getApps, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

if (getApps().length === 0) initializeApp({ databaseURL: process.env.FIREBASE_DATABASE_URL ?? "https://dukaan-be1a4-default-rtdb.firebaseio.com" });
export const db = getDatabase();