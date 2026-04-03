import { dirname, join } from "path";
import { existsSync } from "fs";
import { CLIError, ErrorCode } from "./error";

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
        throw new CLIError(
          ErrorCode.PACKAGE_PATH_ERROR,
          `Cannot find package.json for ${packageName}`,
        );
      }
      currentDir = parentDir;
    }
  } catch (err: any) {
    if (err instanceof CLIError) throw err;
    throw new CLIError(
      ErrorCode.COMPONENTS_NOT_FOUND,
      `${packageName} package not found: ${err.message}`,
    );
  }
}
