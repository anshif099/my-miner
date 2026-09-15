"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { protectedDestination } from "@/lib/auth-guard";
export function AuthGate({ children }: { children: ReactNode }) { const { user, loading } = useAuth(); const router = useRouter(); const destination = protectedDestination(loading, Boolean(user)); useEffect(() => { if (destination === "/login") router.replace("/login"); }, [destination, router]); if (destination !== "allow") return <main className="grid min-h-screen place-items-center"><p className="muted">Checking your session…</p></main>; return children; }

