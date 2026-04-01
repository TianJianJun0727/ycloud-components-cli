import { loadComponentData } from '../utils/loader';

export function semanticCommand(componentName: string, options: { format?: string; version?: string }) {
  const version = options.version || '1.0.0';
  const component = loadComponentData(version)[componentName];

  if (!component) {
    console.error(`Component ${componentName} not found in version ${version}`);
    process.exit(1);
  }

  if (options.format === 'json') {
    console.log(JSON.stringify(component.semantics, null, 2));
  } else {
    console.log(`Semantic classes for ${componentName}:`);
    component.semantics.forEach(s => {
      console.log(`  - ${s.className}: ${s.description}`);
    });
  }
}
