"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { ensureUserProfile } from "@/lib/profile";

interface AuthValue { user: User | null; loading: boolean; logout: () => Promise<void>; }
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, (next) => { setUser(next); setLoading(false); }), []);
  const value = useMemo(() => ({ user, loading, logout: async () => { await signOut(auth); } }), [user, loading]);
  useEffect(() => { if (user) void ensureUserProfile(user).catch((error) => console.error("Unable to initialize user profile", error)); }, [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthValue { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; }

