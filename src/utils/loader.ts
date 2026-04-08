import { readFileSync } from "node:fs";
import { ErrorCode, CLIError } from "./error";
import type { MetaData, Component, ChangeLog } from "../types";
import { loadMetadataFromUrl } from "./remote-loader";
import { MetaDataSchema } from "../schema/metadata";
import {
  __DEV__,
  USE_LOCAL_META_DATA,
  META_DATA_EXAMPLE_FILE,
} from "../constants";

// 内存缓存：避免在同一进程中重复读取磁盘
let metadataCache: MetaData | null = null;

/**
 * 使用 Zod Schema 校验 metadata 数据结构
 * 确保数据严格符合 MetaData 类型定义
 */
function validateMetadata(data: unknown): MetaData {
  const result = MetaDataSchema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new CLIError(
      ErrorCode.METADATA_LOAD_ERROR,
      `Metadata validation failed:\n${issues}`,
      "The metadata file does not match the expected schema. Please check the data source.",
    );
  }

  return result.data;
}

export async function loadMetadata(): Promise<MetaData> {
  if (metadataCache) return metadataCache;

  let raw: unknown;

  if (USE_LOCAL_META_DATA) {
    // 开发环境读取本地文件
    raw = JSON.parse(readFileSync(META_DATA_EXAMPLE_FILE, "utf-8"));
  } else {
    raw = await loadMetadataFromUrl();
  }

  if (!raw) {
    throw new CLIError(
      ErrorCode.METADATA_LOAD_ERROR,
      "Failed to load metadata from remote server",
      "Please check your network connection and try again.",
    );
  }

  const data = validateMetadata(raw);
  metadataCache = data;
  return data;
}

export async function loadComponents(): Promise<Component[]> {
  const { components } = await loadMetadata();
  return components ?? [];
}

export async function loadComponentForSpec(
  componentName: string,
): Promise<Component> {
  const components = await loadComponents();
  const component = components.find((c) => c.name === componentName);

  if (!component) {
    throw new CLIError(
      ErrorCode.COMPONENT_NOT_FOUND,
      `Component ${componentName} not found in metadata`,
    );
  }
  return component;
}

export async function loadChangeLogs(): Promise<ChangeLog[]> {
  const { changeLogs } = await loadMetadata();
  return changeLogs ?? [];
}
