# Senza Devices MCP Server - Quick Start

Get up and running with the Senza Devices MCP server in 5 minutes.

## Step 1: Get Your API Credentials

1. Log into the [Senza Console](https://console.senza.synamedia.com)
2. Navigate to **API Keys** in the sidebar
3. Click **Create Application**
4. Fill out the form:
   - **Name**: Give your application a name (e.g., "MCP Device Manager")
   - **Tenant**: Select your tenant
   - **Permissions**: Filter for "device" and check:
     - ✅ `senza:device:read`
     - ✅ `senza:device:write`
5. Click **Create Application**
6. **Copy** the Client ID and Client Secret (you'll need these!)

## Step 2: Install the Server

```bash
cd senza-devices-mcp-server
npm install
```

## Step 3: Configure Environment

Create a `.env` file in the project root:

```bash
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
TENANT_ID=your_tenant_id_here
```

Replace the values with:
- Your **Client ID** from Step 1
- Your **Client Secret** from Step 1
- Your **Tenant ID** (found in the Senza Console)

## Step 4: Build the Server

```bash
npm run build
```

## Step 5: Add to Claude Desktop

Edit your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "senza-devices": {
      "command": "node",
      "args": [
        "/FULL/PATH/TO/senza-devices-mcp-server/dist/index.js"
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

**Important:** Replace `/FULL/PATH/TO/` with the actual absolute path to the project directory!

## Step 6: Restart Claude Desktop

Quit Claude Desktop completely and restart it.

## Step 7: Test It Out!

In Claude Desktop, try these commands:

> "Get information for device 7e6d37370d21af04"

> "Change device 7e6d37370d21af04 to Stable community"

> "Update the description for device 7e6d37370d21af04 to 'Living Room Device'"

## Troubleshooting

### "CLIENT_ID, CLIENT_SECRET, and TENANT_ID environment variables are required"

Make sure your `.env` file exists and has all three values filled in.

### "OAuth authentication failed"

Double-check your Client ID and Client Secret in the Senza Console.

### "Device not found"

- Verify the device ID is exactly 16 hex characters
- Ensure the device exists in your tenant

### MCP server not appearing in Claude

- Check that the path in `claude_desktop_config.json` is absolute and correct
- Ensure you've restarted Claude Desktop completely
- Check Claude's logs for errors

## What's Next?

See the full [README.md](README.md) for:
- Detailed API documentation
- More examples
- Advanced configuration
- Development guide

## Need Help?

Check the [Senza Developer Documentation](https://developer.synamedia.com/senza/docs) or reach out to your Synamedia contact.
