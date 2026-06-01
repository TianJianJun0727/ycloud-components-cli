---
name: ycloud-components
description: >
  Use when the user is developing, modifying, refactoring, debugging, or answering any
  React code questions based on @ycloud/components. This skill requires the agent to
  query the ycc CLI for component lists, props, demos, full docs, and metadata before
  writing code — avoiding hallucinated APIs and choosing the right component based on
  query results.
allowed-tools:
  - Bash(which ycc)
  - Bash(ycc *)
  - Bash(npm config set @ycloud:registry https://npm.ycloud.com && npm install -g @ycloud/components-cli)
---

# ycloud components

When handling `@ycloud/components` tasks in any AI tool that supports skills, treat `ycc` as the source of truth. Do not guess component names, props, demo names, inheritance relationships, or documentation content from memory.

## Core Behaviors

- Query before writing. Whenever you write, modify, or explain `@ycloud/components` code, query `ycc` first.
- Do not fabricate APIs. Any component, prop, demo, or doc content not verified by `ycc` in the current session must not be treated as fact.
- When unsure of a component name, run `list` first — do not guess.
- If a `demo` can be adapted to fit the need, do not build from scratch.
- Only reach for `doc` when `info` is insufficient — do not start with full-doc search.
- If `ycc` cannot answer the question, explicitly tell the user "the CLI does not provide this information" — do not fill in imagined behavior.

## Available Capabilities

The CLI is primarily a documentation query tool. The only real commands available are:

- `ycc list` — list all components, used to discover component names
- `ycc info <Component>` — get full structured info for a component, typically includes `props`, `demos`, `whenToUse`, `bestPractices`, `faq`, `inheritMuiProps`
- `ycc demo <Component> [demoName]` — get demo code for a component
- `ycc doc <Component>` — get the full markdown documentation for a component
- `ycc meta` — get the current metadata version and `muiVersion`

Do not reference CLI commands that do not exist, such as `token`, `changelog`, `migrate`, or `lint`.

## Initialization

Check the Node version and CLI availability:

```bash
node --version
which ycc
```

If the Node version is below `v22.0.0`, stop and inform the user:

> The current Node.js version does not meet the requirement (>=22.0.0). Please upgrade Node.js before continuing.

If the Node version is satisfied but the CLI is not found, install it:

```bash
npm config set @ycloud:registry https://npm.ycloud.com && npm install -g @ycloud/components-cli
```

To keep output stable and parseable, always explicitly add:

```bash
--format json
```

## Default Workflow

### 1. Before writing component code

Whenever the user asks you to "build a page / update a form / fix a component / implement some UI with ycloud", follow this order:

1. Identify candidate components from the requirements.
2. If component names are uncertain, run `ycc list --format json` first.
3. Run `ycc info <Component> --format json` for each component you plan to use.
4. When you need implementation patterns or reference code, run `ycc demo <Component> [demoName] --format json`.
5. Only run `ycc doc <Component> --format json` when fields from `info` are still insufficient.
6. Write code based on query results, not from memory.

### 2. When modifying existing code

If you are editing an existing tsx/jsx file:

1. Read the current file first to confirm which `@ycloud/components` components are actually used.
2. Run `ycc info --format json` for each component you will touch.
3. If adjusting interactions, layout, or example patterns, supplement with `ycc demo`.
4. If you encounter an unfamiliar prop in the existing code, do not keep or remove it blindly — verify with `ycc info` first.

### 3. When answering questions

If the user is asking "does this prop exist", "how do I use this component", or "which component fits this use case":

- Query `ycc info` first
- Query `ycc list` when you need a list of candidate components
- Query `ycc demo` when you need examples
- Query `ycc doc` when you need a full explanation

Base your answers on query results — do not treat experience as fact.

## Command Selection Rules

### Unsure which component to use

```bash
ycc list --format json
```

Find out which components actually exist before deciding on an approach.

### Want to know what props / demos / usage a component supports

```bash
ycc info Button --format json
```

`info` is the default entry point. For most coding tasks, query it first — do not skip it.

### Want a runnable example as a starting point

```bash
ycc demo Button basic --format json
```

If you don't know the demo name, first run:

```bash
ycc info Button --format json
```

Check the `demos` list, then fetch the specific demo. Or get all demos at once:

```bash
ycc demo Button --format json
```

### Need full docs, FAQ, or long explanations

```bash
ycc doc Button --format json
```

Only use this when `info` cannot resolve the question.

### Need to confirm MUI inheritance

- If `ycc info` returns an `inheritMuiProps` field, the component inherits props from a MUI component.

In that case:

1. Prioritize the `ycc info` result
2. If key information is still missing, run `ycc meta --format json` to confirm `muiVersion`
3. Check if the MUI MCP service is available; if so, use it to query the corresponding MUI version docs

Do not assume the latest MUI docs always apply.

- If `ycc info` does not return `inheritMuiProps`, but `ycc doc` explicitly states the component inherits props from a MUI component:

In that case:

1. Prioritize results from `ycc info` and `ycc doc`
2. If key information is still missing, run `ycc meta --format json` to confirm `muiVersion`
3. Check if the MUI MCP service is available; if so, use it to query the corresponding MUI version docs

## What the AI Agent Should Do Proactively

- As soon as the user mentions a "ycloud components / @ycloud/components" development task, query the CLI proactively — do not wait for the user to remind you.
- When the user asks you to "add a feature following the existing style", verify the relevant component APIs before touching the code.
- If the requirements involve multiple components, query each one separately — do not query just one and start assembling.
- If you are about to use a prop that you have not seen in `ycc info`, stop and keep querying — do not write it into the code.
- If a `demo` already covers the pattern the user wants, prefer adapting the demo over redesigning the JSX structure from scratch.

## Error Handling

When `ycc` encounters an error under `--format json`, it outputs a JSON error object and exits with a non-zero code. Common error codes and how to handle them:

- `COMPONENT_NOT_FOUND`
  Run `ycc list --format json` to find the correct component name, then retry.
- `COMPONENTS_DEMO_NOT_FOUND`
  Run `ycc info <Component> --format json` to check available demo names, then retry; or run `ycc demo <Component> --format json` directly.
- `DOCUMENT_NOT_FOUND`
  No full documentation exists. Continue relying on `info` and `demo` — do not fabricate missing doc content.
- `METADATA_LOAD_ERROR`
  Inform the user that metadata cannot be loaded. Stop guessing at the API.
- `UNKNOWN_ERROR`
  Surface the error message directly. Do not continue writing code based on incomplete information.

## Recommended Query Templates

```bash
ycc list --format json
ycc info LoadingButton --format json
ycc demo LoadingButton basic --format json
ycc doc LoadingButton --format json
ycc meta --format json
```

## Output Requirements

When completing a task based on this skill:

- Code implementations must be traceable to `ycc` query results from the current session
- When describing a solution, prioritize citing "queried component capabilities" and "queried demo structure"
- If a behavior is only inferred, explicitly mark it as an inference
- If the CLI did not provide an answer, clearly state where the gap is — do not fill it with general component library knowledge
