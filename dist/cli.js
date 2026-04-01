#!/usr/bin/env node
"use strict";

// src/cli.ts
var import_commander = require("commander");

// src/utils/loader.ts
var import_fs = require("fs");
var import_path = require("path");
function getProjectVersion() {
  try {
    const pkgPath = (0, import_path.join)(process.cwd(), "package.json");
    if (!(0, import_fs.existsSync)(pkgPath)) return null;
    const pkg = JSON.parse((0, import_fs.readFileSync)(pkgPath, "utf-8"));
    const version = pkg.dependencies?.["@ycloud/components"] || pkg.devDependencies?.["@ycloud/components"];
    if (version) {
      return version.replace(/^[\^~]/, "");
    }
    return null;
  } catch {
    return null;
  }
}
function getLatestVersion() {
  const dataDir = (0, import_path.join)(__dirname);
  const files = (0, import_fs.readdirSync)(dataDir).filter(
    (f) => f.startsWith("v") && f.endsWith(".json")
  );
  const versions = files.map((f) => f.replace(/^v/, "").replace(/\.json$/, ""));
  return versions.sort().reverse()[0] || "1.0.0";
}
function loadComponentData(version) {
  const targetVersion = version || getProjectVersion() || getLatestVersion();
  const filePath = (0, import_path.join)(__dirname, `v${targetVersion}.json`);
  const data = JSON.parse((0, import_fs.readFileSync)(filePath, "utf-8"));
  return data.components;
}

// src/commands/list.ts
function listCommand(options) {
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
    descriptionZh: components[name].descriptionZh
  }));
  if (options.format === "json") {
    console.log(JSON.stringify(componentList, null, 2));
  } else {
    componentList.forEach((c) => console.log(`${c.name}: ${c.description}`));
  }
}

// src/commands/info.ts
function infoCommand(componentName, options) {
  const version = options.version || "1.0.0";
  const component = loadComponentData(version)[componentName];
  if (!component) {
    console.error(`Component ${componentName} not found in version ${version}`);
    process.exit(1);
  }
  const info = {
    name: component.name,
    description: component.description,
    props: component.props
  };
  if (options.format === "json") {
    console.log(JSON.stringify(info, null, 2));
  } else {
    console.log(`Component: ${info.name}`);
    console.log(`Description: ${info.description}`);
    console.log("\nProps:");
    info.props.forEach((prop) => {
      console.log(`  - ${prop.name}: ${prop.type}${prop.required ? " (required)" : ""}`);
      console.log(`    ${prop.description}`);
    });
  }
}

// src/commands/demo.ts
function demoCommand(componentName, demoName, options) {
  const version = options.version || "1.0.0";
  const component = loadComponentData(version)[componentName];
  if (!component) {
    console.error(`Component ${componentName} not found in version ${version}`);
    process.exit(1);
  }
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

// src/commands/semantic.ts
function semanticCommand(componentName, options) {
  const version = options.version || "1.0.0";
  const component = loadComponentData(version)[componentName];
  if (!component) {
    console.error(`Component ${componentName} not found in version ${version}`);
    process.exit(1);
  }
  if (options.format === "json") {
    console.log(JSON.stringify(component.semantics, null, 2));
  } else {
    console.log(`Semantic classes for ${componentName}:`);
    component.semantics.forEach((s) => {
      console.log(`  - ${s.className}: ${s.description}`);
    });
  }
}

// src/cli.ts
var program = new import_commander.Command();
program.name("ycc").description("CLI tool for @ycloud/components documentation").version("1.0.0");
program.command("list").description("List all components").option("-f, --format <format>", "Output format (json)", "json").option("-v, --version <version>", "Component library version", "1.0.0").action(listCommand);
program.command("info <component>").description("Show component properties").option("-f, --format <format>", "Output format (json)", "json").option("-v, --version <version>", "Component library version", "1.0.0").action(infoCommand);
program.command("demo <component> <demoName>").description("Get component demo code").option("-f, --format <format>", "Output format (json)", "json").option("-v, --version <version>", "Component library version", "1.0.0").action(demoCommand);
program.command("semantic <component>").description("Show semantic classNames for styling").option("-f, --format <format>", "Output format (json)", "json").option("-v, --version <version>", "Component library version", "1.0.0").action(semanticCommand);
program.parse();
