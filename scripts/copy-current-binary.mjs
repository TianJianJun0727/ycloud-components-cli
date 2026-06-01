import { chmodSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { currentPlatformKey, platformBinaries } from "./platform-binaries.mjs";

const platformKey = currentPlatformKey();
const { binaryName } = platformBinaries[platformKey];
const sourceBinary = join("target", "release", binaryName);
const targetDir = join("dist", platformKey);
const targetBinary = join(targetDir, binaryName);

if (!existsSync(sourceBinary)) {
  throw new Error(`Built binary not found: ${sourceBinary}`);
}

mkdirSync(targetDir, { recursive: true });
copyFileSync(sourceBinary, targetBinary);
chmodSync(targetBinary, 0o755);

if (process.platform !== "win32") {
  copyFileSync(sourceBinary, join("dist", "ycc"));
  chmodSync(join("dist", "ycc"), 0o755);
}

console.log(`Copied ${sourceBinary} -> ${targetBinary}`);
