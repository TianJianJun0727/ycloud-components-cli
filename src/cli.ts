#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { listCmd } from "./commands/list";
import { infoCmd } from "./commands/info";
import { demoCmd } from "./commands/demo";
import { mcpCmd } from "./commands/mcp";
import { checkVersion, displayVersionInfo } from "./utils/version";
import { COMPONENT_PACKAGE_NAME } from "./constants";
import pkg from "../package.json";

yargs(hideBin(process.argv))
  .scriptName("ycc")
  .usage(`CLI tool for ${COMPONENT_PACKAGE_NAME} documentation`)
  .version(pkg.version)
  .alias("version", "V")
  .command(listCmd)
  .command(infoCmd)
  .command(demoCmd)
  .command(mcpCmd)
  .demandCommand(1, "You need to specify a command")
  .strict()
  .help()
  .parse();

(async () => {
  const versionInfo = await checkVersion();
  if (versionInfo) {
    displayVersionInfo(versionInfo);
  }
})();
