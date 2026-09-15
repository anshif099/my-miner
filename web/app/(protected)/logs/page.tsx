"use client";
import { useEffect, useState } from "react";
import { equalTo, limitToLast, onValue, orderByChild, query, ref } from "firebase/database";
import type { AuditLog } from "@miner/shared";
import { PageHeading } from "@/components/page-heading";
import { useAuth } from "@/hooks/use-auth";
import { database } from "@/lib/firebase";

export default function LogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!user) return;
    const ownedLogs = query(ref(database, "auditLogs"), orderByChild("ownerId"), equalTo(user.uid), limitToLast(100));
    return onValue(ownedLogs, (snapshot) => {
      const value = snapshot.val() as Record<string, AuditLog> | null;
      setLogs(value ? Object.values(value).sort((a, b) => Number(b.serverTimestamp) - Number(a.serverTimestamp)) : []);
    });
  }, [user]);

  return <><PageHeading title="Audit logs" description="Server-generated security and control events."/><section className="panel overflow-hidden">{logs.length === 0 ? <div className="p-8 text-center"><h2>No audit events yet</h2><p className="muted">Events appear after trusted backend actions.</p></div> : <ul className="divide-y" style={{ borderColor: "var(--line)" }}>{logs.map((log) => <li className="p-4" key={log.auditId}><strong>{log.event}</strong><span className="muted ml-3">{log.result}</span></li>)}</ul>}</section></>;
}