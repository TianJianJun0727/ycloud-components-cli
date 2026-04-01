import { loadComponents } from "../utils/loader";

export function listCommand(options: { format?: string; version?: string }) {
  const version = options.version;

  const components = loadComponents(version);

  if (components.length === 0) {
    if (options.format === "json") {
      console.log(JSON.stringify([], null, 2));
    } else {
      console.log("No component data available.");
    }
    return;
  }

  if (components.length === 0) {
    console.error(`No components found in version ${version}`);
    process.exit(1);
  }

  const componentList = components.map((c) => ({
    name: c.name,
    nameZh: c.nameZh,
    description: c.description,
    descriptionZh: c.descriptionZh,
  }));

  if (options.format === "json") {
    console.log(JSON.stringify(componentList, null, 2));
  } else {
    componentList.forEach((c) => console.log(`${c.name}: ${c.description}`));
  }
}
