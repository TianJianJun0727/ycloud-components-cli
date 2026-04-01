import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

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

export function loadComponentData(version?: string) {
  const targetVersion = version || getProjectVersion() || getLatestVersion();
  const filePath = join(__dirname, `v${targetVersion}.json`);
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  return data.components;
}
