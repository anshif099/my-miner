export function StatusPill({ label }: { label: string }) { const active = label === "ONLINE" || label === "RUNNING"; return <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-bold" style={{ borderColor: "var(--line)", color: active ? "var(--accent)" : "var(--muted)", background: "var(--panel-2)" }}>{label}</span>; }

