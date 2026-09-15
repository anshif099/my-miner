import { describe, expect, it } from "vitest";
import { protectedDestination } from "@/lib/auth-guard";
describe("protected route decision", () => { it("waits for auth", () => expect(protectedDestination(true, false)).toBe("loading")); it("redirects anonymous users", () => expect(protectedDestination(false, false)).toBe("/login")); it("allows authenticated users", () => expect(protectedDestination(false, true)).toBe("allow")); });

