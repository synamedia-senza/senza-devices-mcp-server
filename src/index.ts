#!/usr/bin/env node

import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AuthManager } from "./services/authManager.js";
import { SenzaApiClient } from "./services/senzaClient.js";
import { registerDeviceTools } from "./tools/deviceTools.js";

// Get OAuth credentials from environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TENANT_ID = process.env.TENANT_ID;

if (!CLIENT_ID || !CLIENT_SECRET || !TENANT_ID) {
  console.error("Error: CLIENT_ID, CLIENT_SECRET, and TENANT_ID environment variables are required");
  console.error("\nUsage:");
  console.error("  export CLIENT_ID='your_client_id'");
  console.error("  export CLIENT_SECRET='your_client_secret'");
  console.error("  export TENANT_ID='your_tenant_id'");
  console.error("  npm start");
  console.error("\nOr create a .env file with these values.");
  console.error("\nTo get your API credentials:");
  console.error("  1. Go to the Senza Console");
  console.error("  2. Navigate to API Keys");
  console.error("  3. Create an application with device read/write permissions");
  process.exit(1);
}

// Initialize MCP server
const server = new McpServer({
  name: "senza-devices-mcp-server",
  version: "1.0.0"
});

// Initialize authentication manager and API client
const authManager = new AuthManager({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  tenantId: TENANT_ID
});

const senzaClient = new SenzaApiClient(authManager, TENANT_ID);

// Register all device management tools
registerDeviceTools(server, senzaClient);

// Run server with stdio transport
async function runStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("Senza Devices MCP server running on stdio");
  console.error(`Tenant: ${TENANT_ID}`);
  console.error("OAuth authentication configured successfully");
}

runStdio().catch(error => {
  console.error("Server error:", error);
  process.exit(1);
});
