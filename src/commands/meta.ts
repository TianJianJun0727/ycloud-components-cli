import type { CommandModule } from "yargs";
import { loadMetadata } from "../utils/loader";
import { output, OutputFormat } from "../utils/output";
import { printError } from "../utils/error";
import { cmdCommonOptions } from "../constants";
import type { CommonArgs } from "../types/commands";

export async function getMetaInfo() {
  const metadata = await loadMetadata();
  return {
    version: metadata.version,
    muiVersion: metadata.muiVersion,
  };
}

export const metaCmd: CommandModule<object, CommonArgs> = {
  command: "meta",
  describe: "Show metadata info (version, muiVersion)",
  builder: cmdCommonOptions,
  handler: async (argv) => {
    try {
      const meta = await getMetaInfo();
      output(meta, argv.format as OutputFormat);
    } catch (err) {
      printError(err, argv.format);
    }
  },
};
