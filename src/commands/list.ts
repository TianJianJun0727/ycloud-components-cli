import type { CommandModule } from "yargs";
import { loadComponents } from "../utils/loader";
import { output, OutputFormat } from "../utils/output";
import { printError } from "../utils/error";
import { cmdCommonOptions } from "../constants";
import type { CommonArgs } from "../types/commands";

export function listComponents() {
  const components = loadComponents();
  return components.map((c) => ({
    name: c.name,
    nameZh: c.nameZh,
    description: c.description,
    descriptionZh: c.descriptionZh,
  }));
}

export const listCmd: CommandModule<object, CommonArgs> = {
  command: "list",
  describe: "List all components",
  builder: cmdCommonOptions,
  handler: (argv) => {
    try {
      const componentList = listComponents();
      output(componentList, argv.format as OutputFormat);
    } catch (err) {
      printError(err);
    }
  },
};
