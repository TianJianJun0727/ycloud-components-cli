import { loadComponentData } from "../utils/loader";

export function listCommand(options: { format?: string; version?: string }) {
  const version = options.version;
  const components = loadComponentData(version);

  if (!components) {
    console.error(`Version ${version} not found`);
    process.exit(1);
  }

  const componentList = Object.keys(components).map((name) => ({
    name,
    nameZh: components[name].nameZh,
    description: components[name].description,
    descriptionZh: components[name].descriptionZh,
  }));

  if (options.format === "json") {
    console.log(JSON.stringify(componentList, null, 2));
  } else {
    componentList.forEach((c) => console.log(`${c.name}: ${c.description}`));
  }
}
