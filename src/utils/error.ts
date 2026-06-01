export enum ErrorCode {
  COMPONENTS_NOT_FOUND = "COMPONENTS_NOT_FOUND",
  COMPONENTS_DEMO_NOT_FOUND = "COMPONENTS_DEMO_NOT_FOUND",
  DOCUMENT_NOT_FOUND = "DOCUMENT_NOT_FOUND",
  COMPONENT_NOT_FOUND = "COMPONENT_NOT_FOUND",
  METADATA_LOAD_ERROR = "METADATA_LOAD_ERROR",
  SKILL_SOURCE_NOT_FOUND = "SKILL_SOURCE_NOT_FOUND",
  SKILL_TARGET_NOT_FOUND = "SKILL_TARGET_NOT_FOUND",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/** Default suggestions for known error codes */
const ERROR_SUGGESTIONS: Record<string, string> = {
  [ErrorCode.COMPONENTS_NOT_FOUND]:
    "Run `npm config set @ycloud:registry https://npm.ycloud.com && npm install @ycloud/components` in your project to install the component library.",
  [ErrorCode.COMPONENT_NOT_FOUND]:
    "Run `ycc list --format json` to see all available component names.",
};

export class CLIError {
  public error: true = true;

  constructor(
    public code: string,
    public message: string,
    public suggestion?: string,
  ) {
    // Auto-fill suggestion from defaults if not provided
    if (!suggestion && ERROR_SUGGESTIONS[code]) {
      this.suggestion = ERROR_SUGGESTIONS[code];
    }
  }

  toJSON() {
    return {
      error: true,
      code: this.code,
      message: this.message,
      suggestion: this.suggestion,
    };
  }
}

export function printError(err: unknown, format?: string): void {
  process.exitCode = 1;

  if (err instanceof CLIError) {
    if (format === "json") {
      console.error(JSON.stringify(err.toJSON(), null, 2));
    } else {
      console.error(`【Error】: ${err.message}`);
      if (err.suggestion) {
        console.error(`【Suggestion】: ${err.suggestion}`);
      }
    }
  } else if (err instanceof Error) {
    if (format === "json") {
      console.error(
        JSON.stringify(
          {
            error: true,
            code: ErrorCode.UNKNOWN_ERROR,
            message: err.message,
          },
          null,
          2,
        ),
      );
    } else {
      console.error(`【Error】: ${err.message}`);
    }
  } else {
    console.error(err);
  }
}
