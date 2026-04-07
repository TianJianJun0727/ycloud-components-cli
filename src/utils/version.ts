import { readFileSync } from "node:fs";
import { join } from "node:path";
import semver from "semver";
import chalk from "chalk";
import { COMPONENT_PACKAGE_NAME, NPM_REGISTRY_URL } from "../constants";

export async function checkNodeVersion(wanted: string, id: string) {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(
      chalk.red(
        "You are using Node " +
          process.version +
          ", but this version of " +
          id +
          " requires Node " +
          wanted +
          ".\nPlease upgrade your Node version.",
      ),
    );
    process.exit(1);
  }
}

export async function checkCliVersion() {
  try {
    const pkgPath = join(__dirname, "../package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    const currentVersion = pkg.version;

    const response = await fetch(`${NPM_REGISTRY_URL}/${pkg.name}`);
    if (!response.ok) return null;

    const data = await response.json();
    const latestVersion = data["dist-tags"]?.latest;

    if (!latestVersion) return null;

    return {
      currentVersion,
      latestVersion,
      hasUpdate: currentVersion !== latestVersion,
    };
  } catch {
    return null;
  }
}

export function displayVersionInfo(info: {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
}) {
  console.log(`\n📦 Current version: ${info.currentVersion}`);

  if (info.hasUpdate) {
    console.log(`\n🎉 New version available: ${info.latestVersion}`);
    console.log(
      `\n💡 Update now: npm install -g ${COMPONENT_PACKAGE_NAME}@latest\n`,
    );
  }
}
