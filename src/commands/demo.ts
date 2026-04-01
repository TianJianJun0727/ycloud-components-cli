import { loadComponentForSpec } from "../utils/loader";
import { output, OutputFormat } from "../utils/output";

export function demoCommand(
  componentName: string,
  demoName: string,
  options: { format?: string; version?: string },
) {
  const version = options.version;
  const component = loadComponentForSpec(componentName, version);

  const demo = component.demos.find((d) => d.name === demoName);

  if (!demo) {
    console.error(`Demo ${demoName} not found for ${componentName}`);
    return;
  }

  output(demo, options.format as OutputFormat);
}
