import { dirname, join } from "path";
import { existsSync } from "fs";

export function getPackageRootPath(packageName: string) {
  try {
    const entryPath = require.resolve(packageName);
    let currentDir = dirname(entryPath);
    while (true) {
      const pkgJsonPath = join(currentDir, "package.json");
      if (existsSync(pkgJsonPath)) {
        return currentDir;
      }
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) {
        throw new Error(`未找到 ${packageName} 的 package.json`);
      }
      currentDir = parentDir;
    }
  } catch (err: any) {
    throw new Error(`获取包路径失败：${err.message}`);
  }
}
