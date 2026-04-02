import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "../mcp/tools";

export async function mcpCommand() {
  const server = new McpServer(
    { name: "ycc", version: "1.0.0" },
    { capabilities: { tools: {}, prompts: {} } },
  );

  registerAllTools(server);

  const transport = new StdioServerTransport();
  
  await server.connect(transport);
}
