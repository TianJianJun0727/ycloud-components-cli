import { readFileSync } from "node:fs";
import { ErrorCode, CLIError } from "./error";
import type { MetaData, Component, ChangeLog } from "../types";
import { loadMetadataFromUrl } from "./remote-loader";
import { __DEV__, META_DATA_EXAMPLE_File } from "../constants";

// 内存缓存：避免在同一进程中重复读取磁盘
let metadataCache: MetaData | null = null;

export async function loadMetadata(): Promise<MetaData> {
  if (metadataCache) return metadataCache;

  let data: MetaData | null;

  if (__DEV__) {
    // 开发环境读取本地文件
    data = JSON.parse(readFileSync(META_DATA_EXAMPLE_File, "utf-8"));
  } else {
    data = await loadMetadataFromUrl();
  }


  if (!data) {
    throw new CLIError(
      ErrorCode.METADATA_LOAD_ERROR,
      "Failed to load metadata from remote server",
      "Please check your network connection and try again.",
    );
  }

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
