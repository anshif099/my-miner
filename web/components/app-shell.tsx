"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, CalendarClock, CircleDollarSign, LayoutDashboard, ListTree, LogOut, MonitorCog, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
const links = [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }, { href: "/devices", label: "Devices", icon: MonitorCog }, { href: "/earnings", label: "Earnings", icon: CircleDollarSign }, { href: "/schedules", label: "Schedules", icon: CalendarClock }, { href: "/logs", label: "Audit logs", icon: ListTree }, { href: "/settings", label: "Settings", icon: Settings }];
export function AppShell({ children }: { children: React.ReactNode }) { const path = usePathname(); const router = useRouter(); const { user, logout } = useAuth(); return <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
  <aside className="border-b p-4 md:min-h-screen md:border-b-0 md:border-r" style={{ borderColor: "var(--line)", background: "var(--panel)" }}><div className="mb-6 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl" style={{ background: "var(--accent)", color: "white" }}><Activity /></span><div><strong>MY MINER</strong><div className="muted text-xs">Foundation mode</div></div></div><nav className="flex gap-2 overflow-x-auto md:flex-col">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5" style={path === href ? { background: "var(--panel-2)", color: "var(--accent)" } : undefined}><Icon size={18}/>{label}</Link>)}</nav><div className="mt-8 hidden md:block"><div className="muted truncate text-sm">{user?.email}</div><button className="mt-3 flex items-center gap-2 text-sm" onClick={async () => { await logout(); router.replace("/login"); }}><LogOut size={16}/> Sign out</button></div></aside>
  <main className="p-4 md:p-8">{children}</main></div>; }

