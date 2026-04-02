export enum ErrorCode {
  COMPONENTS_NOT_FOUND = "COMPONENTS_NOT_FOUND",
  METADATA_FILE_NOT_FOUND = "METADATA_FILE_NOT_FOUND",
  COMPONENT_NOT_FOUND = "COMPONENT_NOT_FOUND",
  METADATA_NOT_ERROR = "METADATA_NOT_ERROR",
}

export class CLIError {
  constructor(
    public code: string,
    public message: string,
    public suggestion?: string,
  ) {}
}

export function printError(err: unknown, format?: string): void {
  if (err instanceof CLIError) {
    if (format === "json") {
      console.error(JSON.stringify(err, null, 2));
    } else {
      console.error(`【Error】: ${err.message}`);
      if (err.suggestion) {
        console.error(`【Suggestion】: ${err.suggestion}`);
      }
    }
  } else {
    console.error(err);
  }
}
