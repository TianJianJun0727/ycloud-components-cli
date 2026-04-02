import { loadComponentForSpec } from "../utils/loader";
import { output, OutputFormat } from "../utils/output";

export function infoCommand(
  componentName: string,
  options: { format?: string },
) {
  const component = loadComponentForSpec(componentName);
  output(component, options.format as OutputFormat);
}
