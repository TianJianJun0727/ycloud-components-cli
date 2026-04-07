import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  renameSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { MetaData } from "../types";
import { META_DATA_URL, CACHE_DIR, CACHE_FILE } from "../constants";

/** 确保缓存目录存在，不存在则递归创建 */
function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * 从磁盘读取缓存的 metadata
 * @returns 缓存的 MetaData，文件不存在或解析失败时返回 null
 */
function readCache(): MetaData | null {
  try {
    if (existsSync(CACHE_FILE)) {
      return JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
    }
  } catch {}
  return null;
}

/**
 * 将 metadata 原子性地写入磁盘缓存
 * 采用 write-then-rename 模式，避免进程崩溃时缓存文件损坏
 * @param data - 要缓存的 metadata
 */
function writeCache(data: MetaData) {
  ensureCacheDir();
  const tmp = join(tmpdir(), `ycc-metadata-${Date.now()}.json`);
  writeFileSync(tmp, JSON.stringify(data));
  renameSync(tmp, CACHE_FILE);
}

/**
 * 从远端服务器拉取 metadata
 * @returns 解析后的 MetaData
 * @throws HTTP 响应异常时抛出错误
 */
async function fetchRemote(): Promise<MetaData> {
  const res = await fetch(META_DATA_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<MetaData>;
}

/** 后台静默刷新缓存（stale-while-revalidate） */
function revalidateInBackground() {
  fetchRemote()
    .then(writeCache)
    .catch(() => {});
}

/**
 * 加载远端 metadata（stale-while-revalidate 策略）：
 * - 有缓存 → 立即返回缓存，后台异步刷新
 * - 无缓存 → 等待远端请求完成并写入缓存
 */
export async function loadMetadataFromUrl(): Promise<MetaData | null> {
  const cached = readCache();

  if (cached) {
    revalidateInBackground();
    return cached;
  }

  try {
    const data = await fetchRemote();
    writeCache(data);
    return data;
  } catch {
    return null;
  }
}
