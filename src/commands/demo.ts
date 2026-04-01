import { loadComponentForSpec } from "../utils/loader";

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
    process.exit(1);
  }

  if (options.format === "json") {
    console.log(JSON.stringify(demo, null, 2));
  } else {
    console.log(`Demo: ${demo.name}`);
    console.log(`Description: ${demo.description}`);
    console.log("\nCode:");
    console.log(demo.code);
  }
}
