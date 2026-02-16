import { Device, DeviceListItem } from "../types.js";

/**
 * Format device data as markdown for human readability
 */
export function formatDeviceMarkdown(device: Device): string {
  const lines = [
    `# Device: ${device.deviceId}`,
    "",
    `**Status:** ${device.deviceStatus}`,
    `**Tenant:** ${device.tenant}`,
    `**Community:** ${device.community}`,
  ];

  if (device.description) {
    lines.push(`**Description:** ${device.description}`);
  }

  if (device.activationTime) {
    lines.push(
      `**Activated:** ${new Date(device.activationTime).toISOString()}`
    );
  }

  if (device.connectionTime) {
    lines.push(
      `**Last Connection:** ${new Date(device.connectionTime).toISOString()}`
    );
  }

  if (device.lastConnectedIp) {
    lines.push(`**Last IP:** ${device.lastConnectedIp}`);
  }

  if (device.city || device.region || device.country_name) {
    const location = [device.city, device.region, device.country_name]
      .filter(Boolean)
      .join(", ");
    lines.push(`**Location:** ${location}`);
  }

  if (device.latitude !== undefined && device.longitude !== undefined) {
    lines.push(`**Coordinates:** ${device.latitude}, ${device.longitude}`);
  }

  return lines.join("\n");
}

/**
 * Format device data as JSON string
 */
export function formatDeviceJson(device: Device): string {
  return JSON.stringify(device, null, 2);
}

/**
 * Format device list as markdown table
 */
export function formatDeviceListMarkdown(devices: DeviceListItem[]): string {
  if (devices.length === 0) {
    return "No devices found in this tenant.";
  }

  const lines = [
    `# Devices in Tenant (${devices.length} total)`,
    "",
    "| Device ID | Status | Community | Description |",
    "|-----------|--------|-----------|-------------|"
  ];

  for (const device of devices) {
    const desc = device.description || "-";
    lines.push(
      `| ${device.deviceId} | ${device.deviceStatus} | ${device.community} | ${desc} |`
    );
  }

  return lines.join("\n");
}

/**
 * Format device list as JSON string
 */
export function formatDeviceListJson(devices: DeviceListItem[]): string {
  return JSON.stringify({ devices, count: devices.length }, null, 2);
}
