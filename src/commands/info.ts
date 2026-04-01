import { loadComponentForSpec } from "../utils/loader";
import { output, OutputFormat } from "../utils/output";

export function infoCommand(
  componentName: string,
  options: { format?: string; version?: string },
) {
  const version = options.version;
  const component = loadComponentForSpec(componentName, version);
  output(component, options.format as OutputFormat);
}
