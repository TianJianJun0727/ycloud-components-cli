#!/usr/bin/env node

import { Command } from 'commander';
import { listCommand } from './commands/list';
import { infoCommand } from './commands/info';
import { demoCommand } from './commands/demo';
import { semanticCommand } from './commands/semantic';

const program = new Command();

program
  .name('ycc')
  .description('CLI tool for @ycloud/components documentation')
  .version('1.0.0');

program
  .command('list')
  .description('List all components')
  .option('-f, --format <format>', 'Output format (json)', 'json')
  .option('-v, --version <version>', 'Component library version', '1.0.0')
  .action(listCommand);

program
  .command('info <component>')
  .description('Show component properties')
  .option('-f, --format <format>', 'Output format (json)', 'json')
  .option('-v, --version <version>', 'Component library version', '1.0.0')
  .action(infoCommand);

program
  .command('demo <component> <demoName>')
  .description('Get component demo code')
  .option('-f, --format <format>', 'Output format (json)', 'json')
  .option('-v, --version <version>', 'Component library version', '1.0.0')
  .action(demoCommand);

program
  .command('semantic <component>')
  .description('Show semantic classNames for styling')
  .option('-f, --format <format>', 'Output format (json)', 'json')
  .option('-v, --version <version>', 'Component library version', '1.0.0')
  .action(semanticCommand);

program.parse();
