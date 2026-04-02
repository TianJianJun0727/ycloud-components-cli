import { loadComponents } from "../utils/loader";
import { output, OutputFormat } from "../utils/output";

export function listCommand(options: { format?: string }) {
  const components = loadComponents();

  if (components.length === 0) {
    if (options.format === "json") {
      output([], options.format as OutputFormat);
    } else {
      console.log("No component data available.");
    }
    return;
  }

  const componentList = components.map((c) => ({
    name: c.name,
    nameZh: c.nameZh,
    description: c.description,
    descriptionZh: c.descriptionZh,
  }));

  output(componentList, options.format as OutputFormat);
}
