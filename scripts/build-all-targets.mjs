import { spawnSync } from "node:child_process";
import { platformBinaries } from "./platform-binaries.mjs";

for (const [platformKey, { rustTarget }] of Object.entries(platformBinaries)) {
  const result = spawnSync(
    "node",
    ["scripts/build-target.mjs", platformKey, rustTarget],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
