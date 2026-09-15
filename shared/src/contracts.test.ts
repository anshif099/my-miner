import { describe, expect, it } from "vitest";
import { createCommandInputSchema, defaultSettings, operationalStateSchema, settingsSchema } from "./index.js";

describe("shared contracts", () => {
  it("accepts every operational state", () => expect(["OFF", "STARTING", "RUNNING", "STOPPING", "UNKNOWN", "ERROR"].every((v) => operationalStateSchema.safeParse(v).success)).toBe(true));
  it("rejects unknown state", () => expect(operationalStateSchema.safeParse("MINING").success).toBe(false));
  it("validates commands", () => expect(createCommandInputSchema.safeParse({ deviceId: "d1", type: "START", payload: {} }).success).toBe(true));
  it("rejects unsafe telemetry interval", () => expect(settingsSchema.safeParse({ ownerId: "u", ...defaultSettings, telemetryIntervalSeconds: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).success).toBe(false));
});

