import type { CommandModule } from "yargs";
import { loadComponentForSpec } from "../utils/loader";
import { output, OutputFormat } from "../utils/output";
import { cmdCommonOptions } from "../constants";
import type { CommonArgs } from "../types/commands";
import { CLIError, ErrorCode, printError } from "../utils/error";

export type DemoArgs = CommonArgs & {
  component: string;
  demoName?: string;
};

export function getComponentDemoCode(componentName: string, demoName?: string) {
  const component = loadComponentForSpec(componentName);
  if (demoName) {
    const demo = component.demos.find((d) => d.name === demoName);
    if (!demo) {
      throw new CLIError(
        ErrorCode.COMPONENTS_NOT_FOUND,
        `Demo ${demoName} not found for ${componentName}`,
      );
    }
    return demo.code;
  }
  return component.demos.map((demo) => demo.code);
}

export const demoCmd: CommandModule<object, DemoArgs> = {
  command: "demo <component> [demoName]",
  describe: "Get component demo code",
  builder: cmdCommonOptions,
  handler: (argv) => {
    try {
      const demo = getComponentDemoCode(argv.component, argv.demoName);
      output(demo, argv.format as OutputFormat);
    } catch (err) {
      printError(err);
    }
  },
};
