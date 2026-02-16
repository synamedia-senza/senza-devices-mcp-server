# Senza Devices MCP Workflow

## Overview
The Senza Devices MCP Server provides natural language access to device management through Claude.

## Architecture

```
┌─────────────────┐
│  Claude Desktop │
│                 │
│  "List devices" │
└────────┬────────┘
         │
         ↓
┌────────────────────┐
│  MCP Server        │
│  (Node.js/stdio)   │
│                    │
│  • listDevices()   │
│  • getDevice()     │
│  • updateDevice()  │
└────────┬───────────┘
         │
         ↓ OAuth Token
┌────────────────────┐
│  Senza API         │
│                    │
│  • GET /tenants/   │
│  • GET /devices/   │
│  • PUT /devices/   │
└────────────────────┘
```

## Authentication Flow

1. **Initial Setup:** Store CLIENT_ID, CLIENT_SECRET, TENANT_ID in config
2. **Token Request:** MCP server requests access token from auth server
3. **Token Caching:** Token cached and automatically refreshed before expiry
4. **API Calls:** Each API request includes the current valid token

## Available Operations

### 1. List Devices
**Command:** *"List all devices"* or *"Show me my devices"*

**Tool Called:** `senza_list_devices`

**Returns:**
- Device ID
- Status (Activated/Registered)
- Community (Alpha/Beta/Stable)
- Description (if set)

**Example Response:**
```
| Device ID         | Status    | Community | Description      |
|-------------------|-----------|-----------|------------------|
| 7e6e8eb10d21af04  | Activated | Beta      | Elias           |
| 7e6e07f20d21af04  | Activated | Stable    | Sam             |
```

### 2. Get Device Details
**Command:** *"When did Elias last connect?"* or *"Show me device details for 7e6e8eb10d21af04"*

**Tool Called:** `senza_get_device`

**Returns:**
- Full device information
- Activation and connection timestamps
- IP address and geolocation
- All device metadata

**Use Case:** When you need complete information about a specific device.

### 3. Update Device
**Command:** *"Move device to Beta"* or *"Update description to 'Living Room'"*

**Tool Called:** `senza_update_device`

**Can Update:**
- Community (Alpha/Beta/Stable) - changes release channel
- Description - human-readable label

**Example:**
```
User: "Change Elias's device to Beta community"
Claude: [Finds device ID, calls update, confirms change]
```

## Common Workflows

### Device Discovery
```
User: "I see device 7e6e8eb10d21af04 in the logs. Who owns it?"
Claude: [Looks up device, reports description field]
Result: "That's Elias's device, last connected July 22"
```

### Release Management
```
User: "Move all test devices to Alpha"
Claude: [Lists devices, identifies test devices, updates each]
Result: Multiple devices moved to Alpha channel
```

### Device Audit
```
User: "Which devices haven't connected in over a month?"
Claude: [Lists devices, checks connection times, reports inactive ones]
Result: List of inactive devices with last connection dates
```

## Integration with Analytics

The Devices API complements other data sources:

1. **BigQuery** → Shows device IDs in session data
2. **Devices API** → Provides owner/description for those IDs
3. **Combined View** → Complete picture of who's using what

**Example Workflow:**
```
User: "Show me the top 10 most active devices this month"
Claude: [Queries BigQuery for activity, looks up each device, combines results]
Result: Ranked list with device IDs, owners, and usage metrics
```

## Troubleshooting

### "Device not found" errors
- Device may be in a different tenant than configured
- Device ID might be incorrect (must be 16 hex characters)

### "OAuth authentication failed"
- Check CLIENT_ID and CLIENT_SECRET in config
- Verify credentials in Senza Console → API Keys
- Ensure permissions include `senza:device:read` and `senza:device:write`

### "Forbidden" errors
- API key doesn't have required permissions
- Enable device read/write when creating the API key

## Token Management

**Automatic Handling:**
- Tokens expire after ~1 hour
- MCP server automatically refreshes 5 minutes before expiry
- No manual intervention needed

**What You Don't Have To Do:**
- ✗ Copy tokens from browser DevTools
- ✗ Update config every hour
- ✗ Monitor token expiration
- ✓ Just use it!

## Best Practices

1. **Descriptive Device Names:** Always set descriptions for easier identification
2. **Community Management:** Use Alpha for testing, Beta for staging, Stable for production
3. **Regular Audits:** Periodically check for inactive devices
4. **Bulk Operations:** Use natural language for batch updates instead of scripting

## Comparison: Script vs. MCP

### Old Way (Node.js Script)
```bash
# 1. Write script
node device-lookup.js input.json output.json

# 2. Edit input.json
vim input.json

# 3. Run again
node device-lookup.js input.json output.json

# 4. Parse output.json
cat output.json | jq '.devices[] | select(.description == null)'
```

### New Way (MCP)
```
User: "Show me devices without descriptions"
Claude: [Done! Here's the list]
```

**Advantages:**
- No scripts to maintain
- No JSON files to manage
- Natural language instead of CLI syntax
- Conversational iteration: "Now update those with owner names"

## Next Steps

- Try combining with other MCP servers (BigQuery, MongoDB) for advanced workflows
- Build custom tools for your specific device management needs
- Explore the MCP SDK documentation at https://modelcontextprotocol.io

## Resources

- MCP Server Source: https://github.com/synamedia-senza/senza-devices-mcp-server
- Original Script Tutorial: https://developer.synamedia.com/senza/docs/device-lookup
- Senza Developer Docs: https://developer.synamedia.com/senza/docs
