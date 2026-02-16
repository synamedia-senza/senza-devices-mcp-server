// API Configuration
export const SENZA_API_BASE_URL = "https://hyperscale-op-manager.ingress.active.streaming.synamedia.com";
export const SENZA_AUTH_URL = "https://auth.synamedia.com/oauth/token";
export const SENZA_AUDIENCE = "https://projects.synamedia.com";
export const DEVICES_API_PATH = "/devices/1.0";
export const TENANTS_API_PATH = "/tenants/1.0";

// Response limits
export const CHARACTER_LIMIT = 50000;

// HTTP configuration
export const REQUEST_TIMEOUT_MS = 30000;

// Token refresh configuration
export const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
