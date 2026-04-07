import { existsSync, mkdirSync } from "node:fs";
import { CACHE_DIR } from "../constants";

/** 确保缓存目录存在，不存在则递归创建 */
export function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}
