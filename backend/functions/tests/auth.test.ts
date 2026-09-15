import { describe, expect, it } from "vitest";
import { requireUser } from "../src/auth.js";

describe("authentication protection", () => {
  it("returns authenticated uid", () => expect(requireUser({ auth: { uid: "owner-a" } } as never)).toBe("owner-a"));
  it("rejects unauthenticated calls", () => expect(() => requireUser({ auth: undefined } as never)).toThrow("Authentication is required"));
});

