import { z } from "zod";

export const timestampSchema = z.union([z.number().nonnegative(), z.string().datetime()]);
export type TimestampValue = z.infer<typeof timestampSchema>;

export const deviceTypeSchema = z.enum(["WINDOWS", "ANDROID"]);
export const operationalStateSchema = z.enum(["OFF", "STARTING", "RUNNING", "STOPPING", "UNKNOWN", "ERROR"]);
export const availabilitySchema = z.enum(["ONLINE", "OFFLINE", "STALE", "UNSUPPORTED"]);
export const commandTypeSchema = z.enum(["START", "STOP", "EMERGENCY_STOP", "STATUS_REQUEST", "CONFIG_UPDATE"]);
export const commandStatusSchema = z.enum(["PENDING", "DELIVERED", "ACKNOWLEDGED", "SUCCEEDED", "FAILED", "EXPIRED", "CANCELLED"]);
export const errorCodeSchema = z.enum(["DEVICE_OFFLINE", "COMMAND_EXPIRED", "COMMAND_REPLAYED", "INVALID_STATE_TRANSITION", "UNSUPPORTED_ALGORITHM", "UNSUPPORTED_HARDWARE", "MINER_START_FAILED", "MINER_STOP_FAILED", "TEMPERATURE_LIMIT", "LOW_BATTERY", "CHARGING_REQUIRED", "MAX_SESSION_DURATION", "BACKEND_TIMEOUT", "POOL_UNAVAILABLE", "PRICE_DATA_UNAVAILABLE", "AUTHENTICATION_FAILED"]);
export const auditEventSchema = z.enum(["LOGIN", "DEVICE_REGISTERED", "START_REQUESTED", "STOP_REQUESTED", "EMERGENCY_STOP", "CONFIG_CHANGED", "SCHEDULE_CHANGED", "ERROR"]);

const owned = { ownerId: z.string().min(1) };
const dated = { createdAt: timestampSchema, updatedAt: timestampSchema };
export const userSchema = z.object({ userId: z.string().min(1), email: z.string().email(), displayName: z.string().max(100), timezone: z.string().default("Asia/Kolkata"), ...dated });
export const capabilitySchema = z.object({ algorithm: z.string(), supported: z.boolean(), reason: z.string(), source: z.string().nullable().default(null) });
export const deviceSchema = z.object({ deviceId: z.string(), ...owned, deviceType: deviceTypeSchema, deviceName: z.string().min(1).max(100), operationalState: operationalStateSchema, availability: availabilitySchema, hardware: z.record(z.string(), z.unknown()), capabilities: z.array(capabilitySchema), softwareVersion: z.string(), lastSeen: timestampSchema.nullable(), ...dated, lastError: z.object({ code: errorCodeSchema, message: z.string(), at: timestampSchema }).nullable() });
export const commandResultSchema = z.object({ success: z.boolean(), code: errorCodeSchema.optional(), message: z.string(), actualState: operationalStateSchema.optional() });
export const commandPayloadSchema = z.record(z.string(), z.unknown()).default({});
export const createCommandInputSchema = z.object({ deviceId: z.string().min(1), type: commandTypeSchema, payload: commandPayloadSchema });
export const deviceCommandSchema = z.object({ commandId: z.string(), deviceId: z.string(), ...owned, type: commandTypeSchema, payload: commandPayloadSchema, priority: z.number().int(), sequence: z.number().int().nonnegative(), createdAt: timestampSchema, expiresAt: timestampSchema, status: commandStatusSchema, acknowledgedAt: timestampSchema.nullable(), completedAt: timestampSchema.nullable(), result: commandResultSchema.nullable() });
export const miningSessionSchema = z.object({ sessionId: z.string(), deviceId: z.string(), ...owned, algorithm: z.string().nullable(), coin: z.string().nullable(), state: z.enum(["PENDING", "ACTIVE", "CLOSED", "FAILED"]), startedAt: timestampSchema.nullable(), endedAt: timestampSchema.nullable(), stopReason: z.string().nullable(), ...dated });
export const earningSchema = z.object({ earningId: z.string(), ...owned, sessionId: z.string().nullable(), coin: z.string(), amount: z.number().nonnegative(), timestamp: timestampSchema, source: z.string(), status: z.enum(["ESTIMATED", "REALIZED"]), inrValue: z.number().nonnegative().nullable(), priceTimestamp: timestampSchema.nullable() });
export const walletSchema = z.object({ walletId: z.string(), ...owned, coin: z.string(), network: z.string(), walletAddress: z.string().min(1), label: z.string(), ...dated });
export const scheduleSchema = z.object({ scheduleId: z.string(), ...owned, deviceIds: z.array(z.string()), timezone: z.string(), startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), stopTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(), enabled: z.boolean(), ...dated });
export const settingsSchema = z.object({ ...owned, timezone: z.string().default("Asia/Kolkata"), electricityPriceINRPerKWh: z.number().nonnegative().default(0), telemetryIntervalSeconds: z.number().int().min(10).max(300).default(30), backendTimeoutSeconds: z.number().int().min(30).max(3600).default(300), maxSessionDurationMinutes: z.number().int().min(1).max(1440).default(240), maxGpuTemperatureC: z.number().min(40).max(95).default(80), maxCpuTemperatureC: z.number().min(40).max(100).default(90), minBatteryPercent: z.number().int().min(5).max(100).default(25), chargingRequired: z.boolean().default(true), ...dated });
export const defaultSettings = settingsSchema.omit({ ownerId: true, createdAt: true, updatedAt: true }).parse({});
export const auditLogSchema = z.object({ auditId: z.string(), ...owned, actor: z.string(), userId: z.string(), deviceId: z.string().nullable(), event: auditEventSchema, result: z.enum(["SUCCESS", "FAILURE"]), metadata: z.record(z.string(), z.unknown()), serverTimestamp: timestampSchema });
export const telemetrySchema = z.object({ telemetryId: z.string(), ...owned, deviceId: z.string(), intervalStart: timestampSchema, intervalEnd: timestampSchema, sampleCount: z.number().int().positive(), metrics: z.record(z.string(), z.number().nullable()), source: z.string(), createdAt: timestampSchema });
export const profitabilitySnapshotSchema = z.object({ snapshotId: z.string(), ...owned, algorithm: z.string(), coin: z.string(), hashrate: z.number().nonnegative().nullable(), grossINRPerDay: z.number().nullable(), poolFeeINR: z.number().nullable(), electricityCostINR: z.number().nullable(), exchangeFeeINR: z.number().nullable(), networkFeeINR: z.number().nullable(), estimatedNetINRPerDay: z.number().nullable(), status: z.enum(["AVAILABLE", "DATA_UNAVAILABLE"]), source: z.string(), sourceTimestamp: timestampSchema.nullable(), createdAt: timestampSchema });

export type User = z.infer<typeof userSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type DeviceCommand = z.infer<typeof deviceCommandSchema>;
export type CommandResult = z.infer<typeof commandResultSchema>;
export type MiningSession = z.infer<typeof miningSessionSchema>;
export type Earning = z.infer<typeof earningSchema>;
export type Wallet = z.infer<typeof walletSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type Telemetry = z.infer<typeof telemetrySchema>;
export type ProfitabilitySnapshot = z.infer<typeof profitabilitySnapshotSchema>;

