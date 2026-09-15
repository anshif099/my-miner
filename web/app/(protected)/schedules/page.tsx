import { PageHeading } from "@/components/page-heading";
export default function SchedulesPage() { return <><PageHeading title="Schedules" description="Backend-authoritative schedules will be activated in a later phase."/><section className="panel p-8 text-center"><h2>No schedules yet</h2><p className="muted">Default timezone: Asia/Kolkata. Automatic commands are not active in Phase 2.</p><button className="button" disabled>Add schedule · Coming later</button></section></>; }

