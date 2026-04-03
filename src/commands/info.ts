import type { CommandModule } from "yargs";
import { loadComponentForSpec } from "../utils/loader";
import { printError } from "../utils/error";
import { output, OutputFormat } from "../utils/output";
import { cmdCommonOptions } from "../constants";
import type { CommonArgs } from "../types/commands";

export type InfoArgs = CommonArgs & {
  component: string;
};

export const infoCmd: CommandModule<object, InfoArgs> = {
  command: "info <component>",
  describe: "Show component properties",
  builder: cmdCommonOptions,
  handler: (argv) => {
    try {
      const component = loadComponentForSpec(argv.component);
      output(component, argv.format as OutputFormat);
    } catch (err) {
      printError(err, argv.format);
    }
  },
};
