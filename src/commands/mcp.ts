import type { CommandModule } from "yargs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "../mcp/tools";

export const mcpCmd: CommandModule = {
  command: "mcp",
  describe:
    "Start MCP (Model Context Protocol) server for AI assistant integration",
  handler: async () => {
    const server = new McpServer(
      { name: "ycc-server", version: "1.0.0" },
      { capabilities: { tools: {}, prompts: {} } },
    );

    registerAllTools(server);

    const transport = new StdioServerTransport();

    await server.connect(transport);
  },
};
