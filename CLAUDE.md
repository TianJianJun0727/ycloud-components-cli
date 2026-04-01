# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI tool (`ycc`) for querying @ycloud/components documentation. It provides commands to list components, view component properties, get demo code, and show semantic classNames for styling.

## Build and Development Commands

```bash
# Development with watch mode
pnpm dev

# Production build
pnpm build

# Test the CLI locally (after building)
node dist/cli.js <command>
```

## Architecture

### Command Structure

The CLI uses Commander.js with a command-based architecture. Each command is implemented as a separate module in `src/commands/`:

- `list` - Lists all available components
- `info <component>` - Shows component properties (props, description)
- `demo <component> <demoName>` - Retrieves demo code for a component
- `semantic <component>` - Shows semantic classNames for styling

All commands support:
- `-f, --format <format>` - Output format (default: json)
- `-v, --version <version>` - Component library version (default: 1.0.0)

### Data Loading System

Component data is stored in versioned JSON files (`src/data/v{version}.json`). The loader (`src/utils/loader.ts`) implements version resolution with this priority:

1. Explicit version from `--version` flag
2. Auto-detected from project's `package.json` (@ycloud/components dependency)
3. Latest available version in data directory

### Version Checking

The CLI automatically checks for updates on every run by fetching the latest version from npm registry. This happens asynchronously after command execution.

## Type Definitions

Core types in `src/types/index.ts`:
- `Component` - Full component definition with props, demos, semantics
- `ComponentProp` - Property definition (name, type, required, default, description)
- `ComponentDemo` - Demo code with name and description
- `ComponentSemantic` - Semantic className with description

## Build Configuration

Uses tsup with CommonJS output format. The `src/data` directory is copied to `dist` during build via `publicDir` config, making versioned JSON files available at runtime.
