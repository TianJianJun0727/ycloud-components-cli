import { defineConfig } from "tsup";
import { config } from "dotenv";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

/**
 * 按优先级加载 .env 文件（后加载的优先级更高）：
 *   1. .env                — 所有环境通用的默认值
 *   2. .env.local          — 本地覆盖（git ignored）
 *   3. .env.[mode]         — 环境专属 (.env.development / .env.production)
 *   4. .env.[mode].local   — 环境专属本地覆盖（git ignored）
 */
function loadEnv(mode: string): Record<string, string> {
  const envFiles = [
    ".env",
    ".env.local",
    `.env.${mode}`,
    `.env.${mode}.local`,
  ];

  const merged: Record<string, string> = {};

  for (const file of envFiles) {
    const filePath = resolve(process.cwd(), file);
    if (!existsSync(filePath)) continue;

    const { parsed } = config({ path: filePath });
    if (parsed) {
      Object.assign(merged, parsed);
    }
  }

  return merged;
}

export default defineConfig(({ watch }) => {
  const mode = watch ? "development" : "production";
  const envVars = loadEnv(mode);

  // 构建 tsup define 映射，将 process.env.XXX 替换为静态值
  const define: Record<string, string> = {
    "process.env.NODE_ENV": JSON.stringify(mode),
  };

  for (const [key, value] of Object.entries(envVars)) {
    define[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    entry: ["src/cli.ts"],
    format: ["cjs"],
    clean: true,
    shims: true,
    define,
  };
});
