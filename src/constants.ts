import { join } from "node:path";
import { homedir } from "node:os";
import type { Options } from "yargs";

export const __DEV__ = process.env.NODE_ENV === "development";

export const __PROD__ = process.env.NODE_ENV === "production";

export const CLI_NAME = "@ycloud/components-cli";

export const COMPONENT_PACKAGE_NAME = "@ycloud/components";

export const NPM_REGISTRY_URL = "https://npm.ycloud.com";

export const META_DATA_URL = "http://ui.ycloud.com/meta.json";

export const META_DATA_EXAMPLE_File = join(
  __dirname,
  "../metadata.example.json",
);

export const CACHE_DIR = join(homedir(), ".ycc", "cache");

export const CACHE_FILE = join(CACHE_DIR, "metadata.json");

export const cmdCommonOptions: Record<string, Options> = {
  format: {
    alias: "f",
    type: "string",
    description: "Output format (json)",
    default: "json",
  },
};
