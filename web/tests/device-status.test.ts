import { describe, expect, it } from "vitest";
import { effectiveAvailability } from "@/hooks/use-devices";
describe("device staleness", () => { it("marks an old heartbeat stale", () => expect(effectiveAvailability({ availability: "ONLINE", lastSeen: new Date(0).toISOString() } as never, 100_000)).toBe("STALE")); it("preserves unsupported", () => expect(effectiveAvailability({ availability: "UNSUPPORTED", lastSeen: null } as never)).toBe("UNSUPPORTED")); });

