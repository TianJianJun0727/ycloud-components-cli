import type { CommandModule } from "yargs";
import { loadComponents } from "../utils/loader";
import { output, OutputFormat } from "../utils/output";
import { printError } from "../utils/error";
import { cmdCommonOptions } from "../constants";
import type { CommonArgs } from "../types/commands";

export async function listComponents() {
  const components = await loadComponents();
  return components.map((c) => ({
    name: c.name,
    description: c.description,
    since: c.since,
  }));
}

export const listCmd: CommandModule<object, CommonArgs> = {
  command: "list",
  describe: "List all components",
  builder: cmdCommonOptions,
  handler: async (argv) => {
    try {
      const componentList = await listComponents();
      output(componentList, argv.format as OutputFormat);
    } catch (err) {
      printError(err, argv.format);
    }
  },
};
