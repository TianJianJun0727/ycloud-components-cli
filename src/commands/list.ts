import type { CommandModule } from "yargs";
import { loadComponents } from "../utils/loader";
import { output, OutputFormat } from "../utils/output";
import { cmdCommonOptions } from "../constants";
import type { CommonArgs } from "../types/commands";

export const listCmd: CommandModule<object, CommonArgs> = {
  command: "list",
  describe: "List all components",
  builder: cmdCommonOptions,
  handler: (argv) => {
    const components = loadComponents();

    if (components.length === 0) {
      if (argv.format === "json") {
        output([], argv.format as OutputFormat);
      } else {
        console.log("No component data available.");
      }
      return;
    }

    const componentList = components.map((c) => ({
      name: c.name,
      nameZh: c.nameZh,
      description: c.description,
      descriptionZh: c.descriptionZh,
    }));

    output(componentList, argv.format as OutputFormat);
  },
};
