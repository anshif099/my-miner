import { z } from "zod";
import { deviceTypeSchema, settingsSchema } from "@miner/shared";

export const emptyInputSchema = z.object({}).default({});
export const idInputSchema = z.object({ id: z.string().min(1) });
export const deviceIdInputSchema = z.object({ deviceId: z.string().min(1) });
export const createDeviceInputSchema = z.object({ deviceName: z.string().trim().min(1).max(100), deviceType: deviceTypeSchema });
export const updateSettingsInputSchema = settingsSchema.omit({ ownerId: true, createdAt: true, updatedAt: true });

