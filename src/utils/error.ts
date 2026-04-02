export enum ErrorCode {
  COMPONENTS_NOT_FOUND = "COMPONENTS_NOT_FOUND",
  METADATA_FILE_NOT_FOUND = "METADATA_FILE_NOT_FOUND",
  COMPONENT_NOT_FOUND = "COMPONENT_NOT_FOUND",
  METADATA_NOT_ERROR = "METADATA_NOT_ERROR",
}

export type CLIError = {
  code: string;
  message: string;
  suggestion?: string;
};

export function error(err: CLIError, format?: string): void {
  if (format === "json") {
    console.error(JSON.stringify(err, null, 2));
  } else {
    console.error(`【Error】: ${err.message}`);
    if (err.suggestion) {
      console.error(`【Suggestion】: ${err.suggestion}`);
    }
  }
}
