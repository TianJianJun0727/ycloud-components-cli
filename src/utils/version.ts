import { readFileSync } from "fs";
import { join } from "path";

export async function checkVersion() {
  try {
    const pkgPath = join(__dirname, "../package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    const currentVersion = pkg.version;

    const response = await fetch(`https://registry.npmjs.org/${pkg.name}`);
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
      `\n💡 Update now: npm install -g @ycloud/components-cli@latest\n`,
    );
  }
}
