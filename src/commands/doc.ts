import type { CommandModule } from "yargs";
import { loadComponentForSpec } from "../utils/loader";
import { output, OutputFormat } from "../utils/output";
import { printError } from "../utils/error";
import { cmdCommonOptions } from "../constants";
import type { CommonArgs } from "../types/commands";
import { CLIError, ErrorCode } from "../utils/error";

export type DocArgs = CommonArgs & {
  component: string;
  lang?: string;
};

export async function getComponentDoc(componentName: string, lang?: string) {
  const component = await loadComponentForSpec(componentName);

  const doc = component.doc;

  if (!doc) {
    throw new CLIError(
      ErrorCode.DOCUMENT_NOT_FOUND,
      `Documentation not found for component ${componentName}}`,
    );
  }

  return {
    name: component.name,
    description: component.description,
    doc,
  };
}

export const docCmd: CommandModule<object, DocArgs> = {
  command: "doc <component>",
  describe: "Get full documentation for a component",
  builder: {
    ...cmdCommonOptions,
    lang: {
      alias: "l",
      type: "string",
      description: "Language (en or zh)",
      default: "en",
      choices: ["en", "zh"],
    },
  },
  handler: async (argv) => {
    try {
      const doc = await getComponentDoc(argv.component, argv.lang);
      output(doc, argv.format as OutputFormat);
    } catch (err) {
      printError(err, argv.format);
    }
  },
};
