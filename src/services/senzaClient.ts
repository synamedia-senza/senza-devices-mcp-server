import { SENZA_API_BASE_URL, DEVICES_API_PATH, TENANTS_API_PATH, REQUEST_TIMEOUT_MS } from "../constants.js";
import { Device, DeviceUpdatePayload, ListDevicesResponse, ApiErrorResponse } from "../types.js";
import { AuthManager } from "./authManager.js";

export class SenzaApiClient {
  private authManager: AuthManager;
  private tenantId: string;

  constructor(authManager: AuthManager, tenantId: string) {
    this.authManager = authManager;
    this.tenantId = tenantId;
  }

  /**
   * Make an authenticated request to the Senza Devices API
   */
  private async makeRequest<T>(
    method: "GET" | "PUT",
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${SENZA_API_BASE_URL}${path}`;
    
    // Get a valid access token (will refresh if needed)
    const accessToken = await this.authManager.getAccessToken();
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        let errorMessage: string;
        
        try {
          const errorJson = JSON.parse(errorText) as ApiErrorResponse;
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText;
        }

        // If we get a 401, the token might be invalid - clear it
        if (response.status === 401) {
          this.authManager.clearToken();
        }

        throw new Error(
          `Senza API error (${response.status}): ${errorMessage}`
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeout);
      
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms`);
        }
        throw error;
      }
      
      throw new Error("Unknown error occurred");
    }
  }

  /**
   * List all devices in the tenant
   */
  async listDevices(): Promise<ListDevicesResponse> {
    return this.makeRequest<ListDevicesResponse>(
      "GET", 
      `${TENANTS_API_PATH}/${this.tenantId}/devices`
    );
  }

  /**
   * Get device information by device ID
   */
  async getDevice(deviceId: string): Promise<Device> {
    const response = await this.makeRequest<any>("GET", `${DEVICES_API_PATH}/${deviceId}`);
    // API may return { device: {...} } or just {...}
    return response?.device ?? response;
  }

  /**
   * Update device properties
   */
  async updateDevice(
    deviceId: string,
    updates: DeviceUpdatePayload
  ): Promise<Device> {
    const response = await this.makeRequest<any>(
      "PUT",
      `${DEVICES_API_PATH}/${deviceId}`,
      updates
    );
    // API may return { device: {...} } or just {...}
    return response?.device ?? response;
  }
}
