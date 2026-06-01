#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { join } = require("node:path");

const binaryByPlatform = {
  "darwin-arm64": "darwin-arm64/ycc",
  "darwin-x64": "darwin-x64/ycc",
  "linux-x64": "linux-x64/ycc",
  "win32-x64": "windows-x64/ycc.exe",
};

const platformKey = `${process.platform}-${process.arch}`;
const binaryPath = binaryByPlatform[platformKey];

if (!binaryPath) {
  console.error(
    `Unsupported platform for ycc: ${process.platform} ${process.arch}`,
  );
  process.exit(1);
}

const resolvedBinaryPath = join(__dirname, "..", "dist", binaryPath);

if (!existsSync(resolvedBinaryPath)) {
  console.error(
    `Missing ycc binary for ${platformKey}: ${resolvedBinaryPath}\n` +
      "Please install a package that includes this platform binary or rebuild from source.",
  );
  process.exit(1);
}

const result = spawnSync(resolvedBinaryPath, process.argv.slice(2), {
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
