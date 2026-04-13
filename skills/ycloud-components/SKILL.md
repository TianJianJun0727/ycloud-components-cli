---
name: ycloud-components
description: >
  当用户开发、修改、重构、排查或回答任何基于 @ycloud/components 的 React 代码问题时使用。
  该 skill 要求 agent 在写代码前优先使用 ycc CLI 查询组件列表、props、demo、完整文档和 metadata，
  避免凭记忆编造 API，并在需要时根据查询结果选择合适组件与实现方式。
allowed-tools:
  - Bash(which ycc)
  - Bash(ycc *)
  - Bash(npm install -g @ycloud/components-cli --registry=https://npm.ycloud.com)
---

# ycloud components

在任何支持 skill 的 AI 工具里处理 `@ycloud/components` 相关任务时，把 `ycc` 当作事实来源。不要凭记忆猜组件名、props、demo 名称、继承关系或文档内容。

## 核心行为

- 先查再写。只要是写、改、解释 `@ycloud/components` 代码，就先查询 `ycc`。
- 不要编造 API。当前会话里没有被 `ycc` 验证过的组件、prop、demo、文档内容，都不能当成已知事实。
- 不确定组件名时，先 `list`，不要猜。
- 能从 `demo` 改出来，就不要从零造。
- `info` 不够时再 `doc`，不要一上来就全文档检索。
- 如果 `ycc` 查不到答案，明确告诉用户“CLI 未提供该信息”，不要补全想象中的行为。

## 可用能力

当前 CLI 以文档查询为主，真实可用命令只有：

- `ycc list`：列出所有组件，用于发现组件名
- `ycc info <Component>`：获取组件完整结构化信息，通常包含 `props`、`demos`、`whenToUse`、`bestPractices`、`faq`、`inheritMuiProps`
- `ycc demo <Component> [demoName]`：获取组件指定 demo 代码
- `ycc doc <Component>`：获取组件完整 markdown 文档
- `ycc meta`：获取当前 metadata 版本和 `muiVersion`

不要引用不存在的 CLI 命令，例如 `token`、`changelog`、`migrate`、`lint`。

## 初始化

先检查 CLI 是否可用：

```bash
which ycc
```

如果不存在，再安装：

```bash
npm install -g @ycloud/components-cli --registry=https://npm.ycloud.com
```

为了让输出稳定可解析，始终显式加上：

```bash
--format json
```

## 默认工作流

### 1. 写组件代码前

只要用户要你“写一个页面 / 改一个表单 / 修一个组件 / 用 ycloud 实现某 UI”，按这个顺序执行：

1. 从需求里识别候选组件。
2. 如果组件名不确定，先运行 `ycc list --format json`。
3. 对每个准备使用的组件运行 `ycc info <Component> --format json`。
4. 需要实现范式或参考代码时，运行 `ycc demo <Component> [demoName] --format json`。
5. 当 `info` 里的字段仍不足以回答问题时，再运行 `ycc doc <Component> --format json`。
6. 根据查询结果写代码，而不是根据记忆写代码。

### 2. 改已有代码时

如果你要修改已有 tsx/jsx 文件：

1. 先读当前文件，确认里面实际用了哪些 `@ycloud/components` 组件。
2. 对所有会被你修改到的组件逐个运行 `ycc info --format json`。
3. 如果要调整交互、布局或示例写法，再补 `ycc demo`。
4. 如果当前代码里出现你不认识的 prop，不要直接保留或删除；先用 `ycc info` 验证。

### 3. 回答问题时

如果用户是在问“有没有这个 prop”“这个组件怎么用”“哪个组件适合这个场景”：

- 先查 `ycc info`
- 需要组件候选列表时查 `ycc list`
- 需要例子时查 `ycc demo`
- 需要完整说明时查 `ycc doc`

回答时基于查询结果下结论，不要把经验当事实。

## 命令选择规则

### 不确定用什么组件

```bash
ycc list --format json
```

先找出真实存在的组件，再决定方案。

### 想知道组件支持哪些 props / demo / 用法

```bash
ycc info Button --format json
```

`info` 是默认入口。大多数编码任务先查它，不要直接跳过。

### 想拿可运行示例做起点

```bash
ycc demo Button basic --format json
```

如果你不知道 demo 名，可以先：

```bash
ycc info Button --format json
```

看 `demos` 列表后再取指定 demo；或者直接：

```bash
ycc demo Button --format json
```

获取全部 demo。

### 需要完整文档、FAQ、长说明

```bash
ycc doc Button --format json
```

只在 `info` 不能解决问题时使用。

### 需要确认 MUI 继承关系

- 如果 `ycc info` 返回了 `inheritMuiProps` 字段，说明该组件继承了某个 MUI 组件的 props。

这时：

1. 先以 `ycc info` 返回结果为主
2. 如果仍缺少关键信息，再运行 `ycc meta --format json` 确认 `muiVersion`
3. 检查mui mcp 服务是否可用，若可用则调用mcp查对应版本的 MUI 文档

不要默认“最新 MUI 文档”一定适用。

- 如果 `ycc info` 没有返回 `inheritMuiProps` 字段，但 `ycc doc`中明确表示该组件继承自MUI的某个组件的props。

这时：

1. 先以 `ycc info` 及 `ycc doc` 返回结果为主
2. 如果仍缺少关键信息，再运行 `ycc meta --format json` 确认 `muiVersion`
3. 检查mui mcp 服务是否可用，若可用则调用mcp查对应版本的 MUI 文档

## AI agent 要主动做的事

- 用户一旦提到 “ycloud components / @ycloud/components ”等组件开发任务，就主动先查 CLI，不要等用户提醒。
- 用户让你“照着现有风格加一个功能”时，也要先验证相关组件 API，再动手改代码。
- 如果需求里同时涉及多个组件，分别查询每个组件，不要只查一个就开始拼装。
- 如果你准备使用某个 prop，但没有在 `ycc info` 中见到它，就停下来继续查询，不要直接写进代码。
- 如果 `demo` 已经覆盖了用户要的模式，优先在 demo 基础上改，而不是重新设计 JSX 结构。

## 错误处理

`ycc` 在 `--format json` 下出错时会输出 JSON 错误对象，并以非零退出码结束。常见错误码与处理方式：

- `COMPONENT_NOT_FOUND`
  先运行 `ycc list --format json`，找到准确组件名后重试。
- `COMPONENTS_DEMO_NOT_FOUND`
  先运行 `ycc info <Component> --format json` 查看 demo 名，再重试；或直接 `ycc demo <Component> --format json`。
- `DOCUMENT_NOT_FOUND`
  说明没有完整文档，此时继续依赖 `info` 和 `demo`，不要编造缺失文档内容。
- `METADATA_LOAD_ERROR`
  告知用户当前 metadata 无法加载，停止猜测 API。
- `UNKNOWN_ERROR`
  直接暴露错误信息，不要继续基于不完整信息写代码。

## 推荐查询模板

```bash
ycc list --format json
ycc info LoadingButton --format json
ycc demo LoadingButton basic --format json
ycc doc LoadingButton --format json
ycc meta --format json
```

## 输出要求

当你基于该 skill 完成任务时：

- 代码实现必须能追溯到刚刚查询过的 `ycc` 结果
- 描述方案时，优先引用“查到的组件能力”和“查到的 demo 结构”
- 如果某个行为只是推测，必须明确标注为推测
- 如果 CLI 没提供答案，明确说缺口在哪里，而不是用常见组件库经验补齐
