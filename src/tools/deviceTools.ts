import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SenzaApiClient } from "../services/senzaClient.js";
import { 
  formatDeviceMarkdown, 
  formatDeviceJson,
  formatDeviceListMarkdown,
  formatDeviceListJson
} from "../services/formatter.js";
import {
  ListDevicesInputSchema,
  ListDevicesInput,
  GetDeviceInputSchema,
  GetDeviceInput,
  UpdateDeviceInputSchema,
  UpdateDeviceInput
} from "../schemas/deviceSchemas.js";
import { ResponseFormat } from "../types.js";

export function registerDeviceTools(
  server: McpServer,
  client: SenzaApiClient
): void {
  /**
   * List all devices in the tenant
   */
  server.registerTool(
    "senza_list_devices",
    {
      title: "List Senza Devices",
      description: `List all devices in the tenant.

Returns a summary list of all devices including their device ID, status, community, and description.

Args:
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  List of devices with:
  - deviceId: Unique device identifier
  - deviceStatus: Current status (Activated or Registered)
  - community: Release channel (Alpha, Beta, or Stable)
  - description: Human-readable description (optional)

Examples:
  - "List all devices in my tenant"
  - "Show me all devices"
  - "How many devices do I have?"

Note: This returns a short summary for each device. Use senza_get_device to get full details for a specific device.`,
      inputSchema: ListDevicesInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: ListDevicesInput) => {
      try {
        const response = await client.listDevices();
        
        const textContent = params.response_format === ResponseFormat.MARKDOWN
          ? formatDeviceListMarkdown(response.devices)
          : formatDeviceListJson(response.devices);

        return {
          content: [{
            type: "text",
            text: textContent
          }],
          structuredContent: {
            devices: response.devices,
            count: response.devices.length
          } as unknown as Record<string, unknown>
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            content: [{
              type: "text",
              text: `Error listing devices: ${error.message}`
            }],
            isError: true
          };
        }
        throw error;
      }
    }
  );

  /**
   * Get device information
   */
  server.registerTool(
    "senza_get_device",
    {
      title: "Get Senza Device Information",
      description: `Retrieve detailed information about a Senza device by its device ID.

Returns comprehensive device data including status, tenant assignment, community channel, 
activation/connection times, and location information.

Args:
  - deviceId (string): 16-character hex device ID (e.g., "7e6d37370d21af04")
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Device information including:
  - deviceId: Unique device identifier
  - tenant: Tenant ID the device is assigned to
  - community: Release channel (Alpha, Beta, or Stable)
  - deviceStatus: Current status (Activated or Registered)
  - activationTime: Unix timestamp of first activation (optional)
  - connectionTime: Unix timestamp of last connection (optional)
  - lastConnectedIp: Last known IP address (optional)
  - city, region, country_name: Geographic location (optional)
  - latitude, longitude: GPS coordinates (optional)
  - description: Human-readable description (optional)

Examples:
  - "Get information for device 7e6d37370d21af04"
  - "Show me details about my living room device"
  - "What tenant is device 7e6ecdb60d21af04 assigned to?"

Error Handling:
  - Returns "Device not found" if deviceId doesn't exist (404)
  - Returns "Unauthorized" if API credentials are invalid (401)
  - Returns "Forbidden" if you don't have permission to access this device (403)`,
      inputSchema: GetDeviceInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: GetDeviceInput) => {
      try {
        const device = await client.getDevice(params.deviceId);
        
        const textContent = params.response_format === ResponseFormat.MARKDOWN
          ? formatDeviceMarkdown(device)
          : formatDeviceJson(device);

        return {
          content: [{
            type: "text",
            text: textContent
          }],
          structuredContent: device as unknown as Record<string, unknown>
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            content: [{
              type: "text",
              text: `Error fetching device: ${error.message}`
            }],
            isError: true
          };
        }
        throw error;
      }
    }
  );

  /**
   * Update device properties
   */
  server.registerTool(
    "senza_update_device",
    {
      title: "Update Senza Device",
      description: `Update device properties including community channel and description.

This tool can change the device's release channel or update its human-readable description. 
At least one update field must be provided.

**Note:** This tool can only modify devices within the tenant associated with your API key.

Args:
  - deviceId (string): 16-character hex device ID (e.g., "7e6d37370d21af04")
  - community ('Alpha' | 'Beta' | 'Stable', optional): New release channel
  - description (string, optional): Human-readable description (max 200 chars)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Updated device information with all current properties.

Examples:
  - "Change device 7e6ecdb60d21af04 to Stable community"
  - "Set description for device 7e6d37370d21af04 to 'Living Room Device'"
  - "Switch my device to Beta and update description to 'Test Device'"

Error Handling:
  - Returns "Device not found" if deviceId doesn't exist (404)
  - Returns "Unauthorized" if API credentials are invalid (401)
  - Returns "Forbidden" if the device is not in your tenant (403)
  - Returns "Invalid community" if community value is not Alpha/Beta/Stable (400)`,
      inputSchema: UpdateDeviceInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: UpdateDeviceInput) => {
      try {
        // Extract update payload (exclude deviceId and response_format)
        const { deviceId, response_format, ...updates } = params;
        
        // Ensure at least one field is being updated
        if (Object.keys(updates).length === 0) {
          return {
            content: [{
              type: "text",
              text: "Error: At least one field (community or description) must be provided for update"
            }],
            isError: true
          };
        }

        const updatedDevice = await client.updateDevice(deviceId, updates);
        
        const textContent = response_format === ResponseFormat.MARKDOWN
          ? formatDeviceMarkdown(updatedDevice)
          : formatDeviceJson(updatedDevice);

        return {
          content: [{
            type: "text",
            text: textContent
          }],
          structuredContent: updatedDevice as unknown as Record<string, unknown>
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            content: [{
              type: "text",
              text: `Error updating device: ${error.message}`
            }],
            isError: true
          };
        }
        throw error;
      }
    }
  );
}
