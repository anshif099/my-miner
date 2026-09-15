"use client";
import { useEffect, useState } from "react";
import { equalTo, onValue, orderByChild, query, ref } from "firebase/database";
import type { Device } from "@miner/shared";
import { database } from "@/lib/firebase";
import { useAuth } from "./use-auth";

export function effectiveAvailability(device: Device, now = Date.now()): Device["availability"] {
  if (device.availability === "UNSUPPORTED") return "UNSUPPORTED";
  const lastSeen = typeof device.lastSeen === "number" ? device.lastSeen : device.lastSeen ? Date.parse(String(device.lastSeen)) : null;
  const threshold = Number(process.env.NEXT_PUBLIC_STALE_DEVICE_SECONDS ?? 90) * 1000;
  return lastSeen !== null && now - lastSeen > threshold ? "STALE" : device.availability;
}

export function useDevices(): { devices: Device[]; loading: boolean; error: string | null } {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const ownedDevices = query(ref(database, "devices"), orderByChild("ownerId"), equalTo(user.uid));
    return onValue(ownedDevices, (snapshot) => {
      const value = snapshot.val() as Record<string, Device> | null;
      setDevices(value ? Object.values(value) : []);
      setLoading(false);
      setError(null);
    }, () => {
      setError("Device status is unavailable.");
      setLoading(false);
    });
  }, [user]);

  return user ? { devices, loading, error } : { devices: [], loading: false, error: null };
}