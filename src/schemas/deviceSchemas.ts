import { z } from "zod";

// Device ID validation
export const deviceIdRegex = /^[a-f0-9]{16}$/;

export const DeviceIdSchema = z.string()
  .regex(deviceIdRegex, "Device ID must be a 16-character hex string")
  .describe("Device ID in format: 7e6d37370d21af04");

// Community types
export const CommunitySchema = z.enum(["Alpha", "Beta", "Stable"])
  .describe("Release channel for the device");

// Response format
export const ResponseFormatSchema = z.enum(["json", "markdown"])
  .default("markdown")
  .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable");

// List devices schema
export const ListDevicesInputSchema = z.object({
  response_format: ResponseFormatSchema
}).strict();

export type ListDevicesInput = z.infer<typeof ListDevicesInputSchema>;

// Get device schema
export const GetDeviceInputSchema = z.object({
  deviceId: DeviceIdSchema,
  response_format: ResponseFormatSchema
}).strict();

export type GetDeviceInput = z.infer<typeof GetDeviceInputSchema>;

// Update device schema (removed tenant field - requires global access)
export const UpdateDeviceInputSchema = z.object({
  deviceId: DeviceIdSchema,
  community: CommunitySchema.optional(),
  description: z.string()
    .max(200, "Description must not exceed 200 characters")
    .optional()
    .describe("Human-readable description for the device"),
  response_format: ResponseFormatSchema
}).strict();

export type UpdateDeviceInput = z.infer<typeof UpdateDeviceInputSchema>;
