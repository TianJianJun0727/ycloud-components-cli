import { loadComponentForSpec } from "../utils/loader";

export function infoCommand(
  componentName: string,
  options: { format?: string; version?: string },
) {
  const version = options.version;
  const component = loadComponentForSpec(componentName, version);

  const info = {
    name: component.name,
    description: component.description,
    props: component.props,
  };

  if (options.format === "json") {
    console.log(JSON.stringify(info, null, 2));
  } else {
    console.log(`Component: ${info.name}`);
    console.log(`Description: ${info.description}`);
    console.log("\nProps:");
    info.props.forEach((prop) => {
      console.log(
        `  - ${prop.name}: ${prop.type}${prop.required ? " (required)" : ""}`,
      );
      console.log(`    ${prop.description}`);
    });
  }
}
