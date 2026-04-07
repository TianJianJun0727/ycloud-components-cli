#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { listCmd } from "./commands/list";
import { infoCmd } from "./commands/info";
import { demoCmd } from "./commands/demo";
import { metaCmd } from "./commands/meta";
import { docCmd } from "./commands/doc";
import { mcpCmd } from "./commands/mcp";
import { checkCliVersion, displayVersionInfo } from "./utils/version";
import { COMPONENT_PACKAGE_NAME, CLI_NAME } from "./constants";
import { checkNodeVersion } from "./utils/version";
import pkg from "../package.json";

checkNodeVersion(pkg.engines.node, CLI_NAME);

(async () => {
  const versionInfo = await checkCliVersion();

  if (versionInfo) {
    displayVersionInfo(versionInfo);
  }

  yargs(hideBin(process.argv))
    .scriptName("ycc")
    .usage(`CLI tool for ${COMPONENT_PACKAGE_NAME} documentation`)
    .version(pkg.version)
    .alias("version", "V")
    .command(listCmd)
    .command(infoCmd)
    .command(demoCmd)
    .command(metaCmd)
    .command(docCmd)
    .command(mcpCmd)
    .demandCommand(1, "You need to specify a command")
    .strict()
    .help()
    .parse();
})();
