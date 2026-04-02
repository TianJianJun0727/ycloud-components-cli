import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ErrorCode, CLIError } from "./error";
import { getPackageRootPath } from "./tools";
import type { MetaData, Component } from "../types";
import { COMPONENT_PACKAGE_NAME } from "../constants";

let metadataCache: MetaData | null = null;

export function loadMetadata(): MetaData {
  if (metadataCache) return metadataCache;

  const pkgRoot = getPackageRootPath(COMPONENT_PACKAGE_NAME);

  if (!pkgRoot) {
    throw new CLIError(
      ErrorCode.COMPONENTS_NOT_FOUND,
      `${COMPONENT_PACKAGE_NAME} package not found. Please install it first.`,
    );
  }

  const filePath = join(pkgRoot, "metadata", "index.json");

  if (!existsSync(filePath)) {
    throw new CLIError(
      ErrorCode.METADATA_FILE_NOT_FOUND,
      `Metadata file not found: ${filePath}`,
    );
  }

  let result: MetaData;

  try {
    result = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (error) {
    throw new CLIError(
      ErrorCode.METADATA_NOT_ERROR,
      `${COMPONENT_PACKAGE_NAME} metadata not found`,
    );
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
    throw new CLIError(
      ErrorCode.COMPONENT_NOT_FOUND,
      `Component ${componentName} not found in metadata`,
    );
  }
  return component;
}
