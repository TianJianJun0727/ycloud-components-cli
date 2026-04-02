import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { error, ErrorCode } from "./error";
import { getPackageRootPath } from "./tools";
import type { MetaData, Component } from "../types";
import { COMPONENT_PACKAGE_NAME } from "../constants";

let metadataCache: MetaData | null = null;

export function loadMetadata(): MetaData {
  if (metadataCache) return metadataCache;

  const pkgRoot = getPackageRootPath(COMPONENT_PACKAGE_NAME);

  if (!pkgRoot) {
    error({
      code: ErrorCode.COMPONENTS_NOT_FOUND,
      message: `${COMPONENT_PACKAGE_NAME} package not found. Please install it first.`,
    });
    process.exit(1);
  }

  const filePath = join(pkgRoot, "metadata", "index.json");

  if (!existsSync(filePath)) {
    error({
      code: ErrorCode.METADATA_FILE_NOT_FOUND,
      message: `Metadata file not found: ${filePath}`,
    });
    process.exit(1);
  }

  const result = JSON.parse(readFileSync(filePath, "utf-8"));
  if (!result) {
    error({
      code: ErrorCode.METADATA_NOT_ERROR,
      message: `${COMPONENT_PACKAGE_NAME} doc metadata not found`,
    });
    process.exit(1);
  }
  metadataCache = result;
  return result;
}

export function loadComponents(): Component[] {
  const components = loadMetadata()?.components;
  if (!components) return [];
  return components;
}

export function loadComponentForSpec(componentName: string): Component {
  const components = loadComponents();
  const component = components.find(
    (component) => component.name === componentName,
  );
  if (!component) {
    error({
      code: ErrorCode.COMPONENT_NOT_FOUND,
      message: `Component ${componentName} not found in metadata`,
    });
    process.exit(1);
  }
  return component;
}
