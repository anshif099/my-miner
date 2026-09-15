import { describe, expect, it } from "vitest";
import { createCommandInputSchema } from "@miner/shared";
import { commandExpiration, isCommandExpired } from "../src/services/commands.js";

describe("command policy", () => {
  it("assigns a short server-side expiry", () => expect(commandExpiration(1_000).getTime()).toBe(61_000));
  it("treats the expiry boundary as expired", () => expect(isCommandExpired(10_000, 10_000)).toBe(true));
  it("rejects an invalid command", () => expect(createCommandInputSchema.safeParse({ deviceId: "d", type: "LAUNCH", payload: {} }).success).toBe(false));
  it("does not accept client authorization fields", () => {
    const parsed = createCommandInputSchema.parse({ deviceId: "d", type: "STOP", payload: {}, ownerId: "attacker", sequence: 99 });
    expect(parsed).not.toHaveProperty("ownerId"); expect(parsed).not.toHaveProperty("sequence");
  });
});

