import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import chalk from "chalk";
import {
  CACHE_FILE_UPDATE_DETECT,
  NPM_REGISTRY_URL,
  COMPONENT_PACKAGE_NAME,
  UPDATE_DETECT_INTERVAL,
} from "../constants";
import { ensureCacheDir } from "./tools";
import pkg from "../../package.json";

export type CacheData = { version: string; lastCheckTime: number };

export class UpdateDetector {
  private static instance: UpdateDetector | null = null;
  private memoryCache: CacheData | null = null;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new UpdateDetector();
    }
    return this.instance;
  }

  async detect() {
    try {
      if (this.memoryCache) return this.memoryCache;

      const cacheFromDisk = await this.loadFromDisk();

      if (
        cacheFromDisk?.version &&
        Date.now() - cacheFromDisk.lastCheckTime < UPDATE_DETECT_INTERVAL
      ) {
        this.memoryCache = cacheFromDisk;
        return cacheFromDisk;
      }

      const latestVersion = await this.fetchLatestVersion();

      if (!latestVersion) return null;

      const nextCacheData = {
        version: latestVersion,
        lastCheckTime: Date.now(),
      };

      this.writeToDisk(nextCacheData);

      this.memoryCache = nextCacheData;

      return {
        currentVersion: pkg.version,
        latestVersion,
        hasUpdate: pkg.version !== latestVersion,
      };
    } catch (err) {
      console.log(chalk.red("Error detecting update: " + err));
      return null;
    }
  }

  private async fetchLatestVersion() {
    const response = await fetch(
      `${NPM_REGISTRY_URL}/${COMPONENT_PACKAGE_NAME}latest`,
    );
    if (!response.ok) return null;
    const data: any = await response.json();
    if (!data) return null;
    return data.version;
  }

  private loadFromDisk() {
    try {
      if (existsSync(CACHE_FILE_UPDATE_DETECT)) {
        return JSON.parse(readFileSync(CACHE_FILE_UPDATE_DETECT, "utf-8"));
      }
    } catch {}
    return null;
  }

  private writeToDisk(data: CacheData) {
    ensureCacheDir();
    const tmp = join(tmpdir(), `ycc-update-detect-${Date.now()}.json`);
    writeFileSync(tmp, JSON.stringify(data));
    renameSync(tmp, CACHE_FILE_UPDATE_DETECT);
  }
}

export const updateDetector = UpdateDetector.getInstance();
