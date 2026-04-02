import type { Options } from "yargs";

export const COMPONENT_PACKAGE_NAME = "@ycloud/components";

export const cmdCommonOptions: Record<string, Options> = {
  format: {
    alias: "f",
    type: "string",
    description: "Output format (json)",
    default: "json",
  },
};
