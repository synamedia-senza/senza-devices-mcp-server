# Senza Devices MCP Server

MCP (Model Context Protocol) server for managing Synamedia Senza devices via the Devices API.

## Features

- **Get Device Info**: Retrieve detailed device information including status, tenant, location
- **Update Devices**: Modify device properties including community channel and description
- **OAuth Authentication**: Secure authentication using client credentials

## Prerequisites

- Node.js 18+ 
- Senza API credentials (Client ID and Client Secret)
- Access to a Senza tenant

## Installation

```bash
cd senza-devices-mcp-server
npm install
npm run build
```

## Configuration

### Getting API Credentials

To use this MCP server, you need to create an API key for your tenant:

1. Log into the [Senza Console](https://console.senza.synamedia.com)
2. Click **API Keys** in the sidebar
3. Click the **Create Application** button
4. Fill out the form:
   - Enter a name for your application
   - Select your tenant from the choices
   - Filter permissions for "device"
   - Check `senza:device:read` and `senza:device:write`
5. Click **Create Application**
6. Copy the **Client ID** and **Client Secret**

> **Note:** API keys are scoped to a single tenant. The MCP server will only be able to access devices within that tenant.

### Environment Variables

Create a `.env` file in the project root:

```bash
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
TENANT_ID=your_tenant_id_here
```

You can also copy `.env.example` and fill in your values:

```bash
cp .env.example .env
# Then edit .env with your credentials
```

## Usage

### Running Locally

```bash
# Make sure your .env file is configured
npm start

# Or for development with auto-reload
npm run dev
```

## Available Tools

### 1. `senza_get_device`

Retrieve device information by device ID.

**Parameters:**
- `deviceId` (string, required): 16-character hex device ID (e.g., `7e6d37370d21af04`)
- `response_format` (enum, optional): `markdown` or `json` (default: `markdown`)

**Example:**
```typescript
{
  "deviceId": "7e6d37370d21af04",
  "response_format": "markdown"
}
```

### 2. `senza_update_device`

Update device properties.

**Parameters:**
- `deviceId` (string, required): 16-character hex device ID
- `community` (enum, optional): `Alpha`, `Beta`, or `Stable`
- `description` (string, optional): Human-readable description (max 200 chars)
- `response_format` (enum, optional): `markdown` or `json` (default: `markdown`)

**Example - Change community:**
```typescript
{
  "deviceId": "7e6d37370d21af04",
  "community": "Stable"
}
```

**Example - Update description:**
```typescript
{
  "deviceId": "7e6d37370d21af04",
  "description": "Living Room Device"
}
```

> **Note:** The API key used must have `senza:device:write` permission and be scoped to the tenant that owns the device.

## Integration with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "senza-devices": {
      "command": "node",
      "args": [
        "/path/to/senza-devices-mcp-server/dist/index.js"
      ],
      "env": {
        "CLIENT_ID": "your_client_id",
        "CLIENT_SECRET": "your_client_secret",
        "TENANT_ID": "your_tenant_id"
      }
    }
  }
}
```

Replace `/path/to/senza-devices-mcp-server` with the actual path to this project.

## Common Use Cases

### Check Device Status
> "Get information for device 7e6d37370d21af04"

### Change Release Channel
> "Switch device 7e6d37370d21af04 to Stable community"

### Update Device Description
> "Set description for device 7e6d37370d21af04 to 'Living Room Device'"

### Multiple Operations
> "Get info for device 7e6d37370d21af04, then change it to Beta community"

## How OAuth Works

The MCP server uses the OAuth 2.0 client credentials flow:

1. When a request is made, the server checks if it has a valid access token
2. If no token exists or the token is about to expire, it requests a new one from the Senza auth server
3. The access token is included in all API requests
4. Tokens are automatically refreshed before they expire (with a 5-minute buffer)

This means you don't need to manually manage tokens - the server handles authentication automatically.

## API Endpoints

The server uses these Senza API endpoints:

- `POST /oauth/token` - OAuth authentication (automatic)
- `GET /devices/1.0/{deviceId}` - Get device information
- `PUT /devices/1.0/{deviceId}` - Update device properties

## Error Handling

The server provides clear error messages:

- **401 Unauthorized**: OAuth credentials are invalid
- **403 Forbidden**: API key lacks permission for this operation
- **404 Not Found**: Device ID doesn't exist
- **400 Bad Request**: Invalid parameters
- **Timeout**: Request took longer than 30 seconds

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run built version
npm start
```

## Project Structure

```
senza-devices-mcp-server/
├── src/
│   ├── index.ts                  # Main entry point
│   ├── types.ts                  # TypeScript type definitions
│   ├── constants.ts              # Configuration constants
│   ├── schemas/
│   │   └── deviceSchemas.ts      # Zod validation schemas
│   ├── services/
│   │   ├── authManager.ts        # OAuth token management
│   │   ├── senzaClient.ts        # API client
│   │   └── formatter.ts          # Response formatting
│   └── tools/
│       └── deviceTools.ts        # Tool implementations
├── dist/                         # Compiled JavaScript (generated)
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Security Notes

- **Never commit** your `.env` file or credentials to version control
- **Use environment variables** for credential storage
- **Keep credentials secure**: API keys have read/write access to devices
- **Scope limitation**: Each API key is limited to a single tenant

## Troubleshooting

### "CLIENT_ID, CLIENT_SECRET, and TENANT_ID environment variables are required"
Create a `.env` file with your credentials:
```bash
cp .env.example .env
# Edit .env with your values
```

### "OAuth authentication failed (401)"
Your client ID or client secret is incorrect. Double-check your credentials in the Senza Console.

### "Senza API error (403): Forbidden"
Your API key doesn't have the required permissions. Ensure you've enabled `senza:device:read` and `senza:device:write` when creating the application.

### "Error: Device not found"
Double-check the device ID format (must be 16 hex characters) and ensure the device exists in your tenant.

### Build errors
Ensure TypeScript compiles successfully:
```bash
npm run build
```

## License

For Synamedia partners and customers. See LICENSE for details.
# senza-devices-mcp-server
