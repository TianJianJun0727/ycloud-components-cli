/** 构建时由 tsup define 注入 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      YCC_USE_LOCAL_META_DATA?: string;
      YCC_META_DATA_URL?: string;
      YCC_SKIP_UPDATE_CHECK?: string;
    }
  }
}

export {};
