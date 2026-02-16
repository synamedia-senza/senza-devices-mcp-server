// Senza Device API types

export interface Device {
  deviceId: string;
  tenant: string;
  community: "Alpha" | "Beta" | "Stable";
  deviceStatus: "Activated" | "Registered";
  activationTime?: number;
  connectionTime?: number;
  lastConnectedIp?: string;
  city?: string;
  region?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export interface DeviceListItem {
  deviceId: string;
  tenant: string;
  community: "Alpha" | "Beta" | "Stable";
  deviceStatus: "Activated" | "Registered";
  description?: string;
}

export interface ListDevicesResponse {
  devices: DeviceListItem[];
}

export interface DeviceUpdatePayload {
  community?: "Alpha" | "Beta" | "Stable";
  description?: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
}

export enum ResponseFormat {
  JSON = "json",
  MARKDOWN = "markdown"
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}
