import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { equalTo, get, orderByChild, query, ref, set } from "firebase/database";

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-personal-miner",
    database: {
      rules: readFileSync(resolve(process.cwd(), "../../database.rules.json"), "utf8"),
      host: "127.0.0.1",
      port: 9000
    }
  });
});

beforeEach(async () => env.clearDatabase());
afterAll(async () => env.cleanup());

async function seed(): Promise<void> {
  await env.withSecurityRulesDisabled(async (context) => {
    const database = context.database();
    await set(ref(database, "devices/device-a"), { ownerId: "owner-a", deviceName: "A" });
    await set(ref(database, "earnings/earning-a"), { ownerId: "owner-a", amount: 1 });
    await set(ref(database, "miningSessions/session-a"), { ownerId: "owner-a" });
    await set(ref(database, "auditLogs/log-a"), { ownerId: "owner-a" });
    await set(ref(database, "profitabilitySnapshots/p-a"), { ownerId: "owner-a" });
  });
}

describe("Realtime Database ownership and server authority", () => {
  it("denies unauthenticated access", async () => {
    await seed();
    await assertFails(get(ref(env.unauthenticatedContext().database(), "devices/device-a")));
  });

  it("allows an owner to read their device", async () => {
    await seed();
    await assertSucceeds(get(ref(env.authenticatedContext("owner-a").database(), "devices/device-a")));
  });

  it("denies another user's device, earnings, and session", async () => {
    await seed();
    const database = env.authenticatedContext("owner-b").database();
    await assertFails(get(ref(database, "devices/device-a")));
    await assertFails(get(ref(database, "earnings/earning-a")));
    await assertFails(get(ref(database, "miningSessions/session-a")));
  });

  it("allows only an owner-filtered collection query", async () => {
    await seed();
    const database = env.authenticatedContext("owner-a").database();
    await assertSucceeds(get(query(ref(database, "devices"), orderByChild("ownerId"), equalTo("owner-a"))));
    await assertFails(get(ref(database, "devices")));
  });
  it("denies direct device and command creation", async () => {
    const database = env.authenticatedContext("owner-a").database();
    await assertFails(set(ref(database, "devices/new"), { ownerId: "owner-a" }));
    await assertFails(set(ref(database, "deviceCommands/new"), { ownerId: "owner-a" }));
  });

  it("keeps audit logs and profitability snapshots immutable", async () => {
    await seed();
    const database = env.authenticatedContext("owner-a").database();
    await assertFails(set(ref(database, "auditLogs/log-a"), { ownerId: "owner-a", changed: true }));
    await assertFails(set(ref(database, "profitabilitySnapshots/p-a"), { ownerId: "owner-a", changed: true }));
  });

  it("never exposes pairing codes", async () => {
    await env.withSecurityRulesDisabled(async (context) => set(ref(context.database(), "pairingCodes/code"), { ownerId: "owner-a" }));
    await assertFails(get(ref(env.authenticatedContext("owner-a").database(), "pairingCodes/code")));
  });
});