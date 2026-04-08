import { join } from "node:path";
import { homedir } from "node:os";
import type { Options } from "yargs";

export const __DEV__ = process.env.NODE_ENV === "development";

export const __PROD__ = process.env.NODE_ENV === "production";

export const USE_LOCAL_META_DATA =
  __DEV__ && process.env.YCC_USE_LOCAL_META_DATA === "true";

export const CLI_NAME = "@ycloud/components-cli";

export const COMPONENT_PACKAGE_NAME = "@ycloud/components";

export const NPM_REGISTRY_URL = "https://npm.ycloud.com";

export const UPDATE_DETECT_INTERVAL = 1000 * 60 * 8;

export const META_DATA_URL =
  process.env.YCC_META_DATA_URL || "http://ui.ycloud.com/metadata.json";

export const META_DATA_EXAMPLE_FILE = join(
  __dirname,
  "../metadata.example.json",
);

export const CACHE_DIR = join(homedir(), ".ycc", "cache");

export const CACHE_FILE_METADATA = join(CACHE_DIR, "metadata.json");

export const CACHE_FILE_UPDATE_DETECT = join(CACHE_DIR, "update_detect.json");

export const cmdCommonOptions: Record<string, Options> = {
  format: {
    alias: "f",
    type: "string",
    description: "Output format (json)",
    default: "json",
  },
};
