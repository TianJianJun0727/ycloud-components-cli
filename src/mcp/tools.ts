import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { loadComponentForSpec } from "../utils/loader";
import { listComponents } from "../commands/list";
import { getComponentDemoCode } from "../commands/demo";
import { getComponentDoc } from "../commands/doc";
import { CLIError, ErrorCode } from "../utils/error";

type ToolResult = { content: { type: "text"; text: string }[]; isError?: true };

function toolResult(data: unknown, isError?: true): ToolResult {
  const result: ToolResult = {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
  if (isError) result.isError = true;
  return result;
}

function errorResult(err: unknown): ToolResult {
  if (err instanceof CLIError) {
    return toolResult(err.toJSON(), true);
  }
  return toolResult(
    {
      error: true,
      code: ErrorCode.UNKNOWN_ERROR,
      message: err instanceof Error ? err.message : String(err),
    },
    true,
  );
}

const tools = [
  {
    name: "ycc_list",
    config: {
      description:
        "List all available @ycloud/components with their names and descriptions",
    },
    handler: async () => {
      const components = await listComponents();
      return toolResult(components);
    },
  },
  {
    name: "ycc_info",
    config: {
      description:
        "Get component properties, usage guidelines, and documentation for a specific @ycloud/components component",
      inputSchema: {
        component: z.string().describe("Component name (e.g., Button, Input)"),
      },
    },
    handler: async ({ component }: { component: string }) => {
      const comp = await loadComponentForSpec(component);
      return toolResult(comp);
    },
  },
  {
    name: "ycc_demo",
    config: {
      description:
        "Get demo code examples for a specific @ycloud/components component. Returns all demos if demoName is not specified.",
      inputSchema: {
        component: z.string().describe("Component name (e.g., Button, Input)"),
        demoName: z
          .string()
          .optional()
          .describe("Specific demo name to retrieve (optional)"),
      },
    },
    handler: async ({
      component,
      demoName,
    }: {
      component: string;
      demoName?: string;
    }) => {
      const demoCode = await getComponentDemoCode(component, demoName);
      return toolResult(demoCode);
    },
  },
  {
    name: "ycc_doc",
    config: {
      description:
        "Get full documentation for a specific @ycloud/components component. Supports English and Chinese.",
      inputSchema: {
        component: z.string().describe("Component name (e.g., Button, Input)"),
        lang: z
          .enum(["en", "zh"])
          .optional()
          .describe("Language for documentation (en or zh, default: en)"),
      },
    },
    handler: async ({
      component,
      lang,
    }: {
      component: string;
      lang?: string;
    }) => {
      const doc = await getComponentDoc(component, lang);
      return toolResult(doc);
    },
  },
] as const;

export function registerAllTools(server: McpServer) {
  for (const tool of tools) {
    server.registerTool(tool.name, tool.config, async (args) => {
      try {
        return await (tool.handler as (args: unknown) => Promise<ToolResult>)(
          args,
        );
      } catch (err) {
        return errorResult(err);
      }
    });
  }
}
