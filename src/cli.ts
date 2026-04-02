#!/usr/bin/env node

import { Command } from "commander";
import { listCommand } from "./commands/list";
import { infoCommand } from "./commands/info";
import { demoCommand } from "./commands/demo";
import { mcpCommand } from "./commands/mcp";
import { checkVersion, displayVersionInfo } from "./utils/version";
import { COMPONENT_PACKAGE_NAME } from "./constants";

const program = new Command();

program
  .name("ycc")
  .description(`CLI tool for ${COMPONENT_PACKAGE_NAME} documentation`)
  .version("1.0.0");

program
  .command("list")
  .description("List all components")
  .option("-f, --format <format>", "Output format (json)", "json")
  .option("-v, --version <version>", "Component library version", "1.0.0")
  .action(listCommand);

program
  .command("info <component>")
  .description("Show component properties")
  .option("-f, --format <format>", "Output format (json)", "json")
  .option("-v, --version <version>", "Component library version", "1.0.0")
  .action(infoCommand);

program
  .command("demo <component> [demoName]")
  .description("Get component demo code")
  .option("-f, --format <format>", "Output format (json)", "json")
  .option("-v, --version <version>", "Component library version", "1.0.0")
  .action(demoCommand);

program
  .command("mcp <component> [demoName]")
  .description(
    "Start MCP (Model Context Protocol) server for AI assistant integration",
  )
  .action(mcpCommand);

program.parse();

(async () => {
  const versionInfo = await checkVersion();
  if (versionInfo) {
    displayVersionInfo(versionInfo);
  }
})();
