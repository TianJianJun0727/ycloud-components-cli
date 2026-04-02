import type { CommandModule } from "yargs";
import { loadComponentForSpec } from "../utils/loader";
import { output, OutputFormat } from "../utils/output";
import { cmdCommonOptions } from "../constants";
import type { CommonArgs } from "../types/commands";

export type DemoArgs = CommonArgs & {
  component: string;
  demoName?: string;
};

export const demoCmd: CommandModule<object, DemoArgs> = {
  command: "demo <component> [demoName]",
  describe: "Get component demo code",
  builder: cmdCommonOptions,
  handler: (argv) => {
    const component = loadComponentForSpec(argv.component);

    if (argv.demoName) {
      const demo = component.demos.find((d) => d.name === argv.demoName);
      if (!demo) {
        console.error(`Demo ${argv.demoName} not found for ${argv.component}`);
        return;
      }
      output(demo, argv.format as OutputFormat);
    } else {
      output(component.demos, argv.format as OutputFormat);
    }
  },
};
