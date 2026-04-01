import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import type { MetaData, Component } from "../types";

function getProjectVersion(): string | null {
  try {
    const pkgPath = join(process.cwd(), "package.json");
    if (!existsSync(pkgPath)) return null;

    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    const version =
      pkg.dependencies?.["@ycloud/components"] ||
      pkg.devDependencies?.["@ycloud/components"];

    if (version) {
      return version.replace(/^[\^~]/, "");
    }
    return null;
  } catch {
    return null;
  }
}

function getLatestVersion(): string {
  const dataDir = join(__dirname);
  const files = readdirSync(dataDir).filter(
    (f) => f.startsWith("v") && f.endsWith(".json"),
  );
  const versions = files.map((f) => f.replace(/^v/, "").replace(/\.json$/, ""));
  return versions.sort().reverse()[0] || "1.0.0";
}

export function loadMetaDataForVersion(version?: string): MetaData {
  const targetVersion = version || getProjectVersion() || getLatestVersion();
  const filePath = join(__dirname, `v${targetVersion}.json`);
  const result = JSON.parse(readFileSync(filePath, "utf-8"));
  if (!result) {
    console.error(`Version ${version} not found`);
    process.exit(1);
  }
  return result;
}

export function loadComponents(version?: string): Component[] {
  const components = loadMetaDataForVersion(version)?.components;
  if (!components) return [];
  return components;
}

export function loadComponentForSpec(
  componentName: string,
  version?: string,
): Component {
  const components = loadComponents(version);
  const component = components.find(
    (component) => component.name === componentName,
  );
  if (!component) {
    console.error(`Component ${componentName} not found in version ${version}`);
    process.exit(1);
  }
  return component;
}
