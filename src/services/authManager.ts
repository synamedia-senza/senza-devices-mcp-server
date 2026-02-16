import { 
  SENZA_AUTH_URL, 
  SENZA_AUDIENCE, 
  TOKEN_REFRESH_BUFFER_MS,
  REQUEST_TIMEOUT_MS 
} from "../constants.js";
import { OAuthTokenResponse, OAuthCredentials } from "../types.js";

/**
 * Manages OAuth authentication and token lifecycle for Senza API
 */
export class AuthManager {
  private credentials: OAuthCredentials;
  private accessToken: string | null = null;
  private tokenExpiryTime: number | null = null;

  constructor(credentials: OAuthCredentials) {
    this.credentials = credentials;
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiryTime) {
      const now = Date.now();
      if (now < this.tokenExpiryTime - TOKEN_REFRESH_BUFFER_MS) {
        // Token is still valid
        return this.accessToken;
      }
    }

    // Need to fetch a new token
    await this.refreshToken();
    
    if (!this.accessToken) {
      throw new Error("Failed to obtain access token");
    }

    return this.accessToken;
  }

  /**
   * Fetch a new access token using OAuth client credentials flow
   */
  private async refreshToken(): Promise<void> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
      audience: SENZA_AUDIENCE
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(SENZA_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `OAuth authentication failed (${response.status}): ${errorText}`
        );
      }

      const data = await response.json() as OAuthTokenResponse;
      
      if (!data.access_token) {
        throw new Error("No access_token in OAuth response");
      }

      this.accessToken = data.access_token;
      
      // Calculate expiry time (default to 1 hour if not provided)
      const expiresInMs = (data.expires_in || 3600) * 1000;
      this.tokenExpiryTime = Date.now() + expiresInMs;

    } catch (error) {
      clearTimeout(timeout);
      
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`OAuth request timeout after ${REQUEST_TIMEOUT_MS}ms`);
        }
        throw error;
      }
      
      throw new Error("Unknown error during OAuth authentication");
    }
  }

  /**
   * Clear cached token (useful for testing or error recovery)
   */
  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiryTime = null;
  }
}
