import { chmodSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { platformBinaries } from "./platform-binaries.mjs";

const [platformKey, rustTarget] = process.argv.slice(2);

if (!platformKey || !rustTarget) {
  console.error("Usage: node scripts/build-target.mjs <platform-key> <rust-target>");
  process.exit(1);
}

const config = platformBinaries[platformKey];

if (!config) {
  console.error(`Unknown platform key: ${platformKey}`);
  process.exit(1);
}

if (config.rustTarget !== rustTarget) {
  console.error(
    `Rust target mismatch for ${platformKey}: expected ${config.rustTarget}, got ${rustTarget}`,
  );
  process.exit(1);
}

const cargoResult = spawnSync(
  "cargo",
  ["build", "--release", "--target", rustTarget],
  { stdio: "inherit" },
);

if (cargoResult.status !== 0) {
  process.exit(cargoResult.status ?? 1);
}

const sourceBinary = join("target", rustTarget, "release", config.binaryName);
const targetDir = join("dist", platformKey);
const targetBinary = join(targetDir, config.binaryName);

if (!existsSync(sourceBinary)) {
  console.error(`Built binary not found: ${sourceBinary}`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });
copyFileSync(sourceBinary, targetBinary);
chmodSync(targetBinary, 0o755);

console.log(`Built ${platformKey}: ${targetBinary}`);
