---
name: ycloud-components
description: >
  当用户的任务涉及 @ycloud/components (ycloud components) 时使用 — 编写 @ycloud/components  组件、
  调试 @ycloud/components 问题、查询 @ycloud/components API/属性/Token/示例、跨版本迁移、
  或分析项目中的 @ycloud/components 使用情况。当检测到 @ycloud/components 相关代码、
  从 '@ycloud/components' 导入、或明确的 @ycloud/components 相关问题时触发。
allowed-tools:
  - Bash(ycc *)
  - Bash(ycc bug*)
  - Bash(ycc bug-cli*)
  - Bash(npm install -g @ycloud/components-cli)
  - Bash(which @ycloud/components)
---

# ycloud components CLI

你可以使用 `@ycloud/components-cli` — 一个本地 CLI 工具，内置了 @ycloud/components-cli 所有版本的完整元数据。用它来查询组件知识、分析项目、指导迁移。所有数据离线可用，无需网络。

## 初始设置

首次使用前，检查 CLI 是否已安装。如未安装，自动安装：

```bash
which ycc || npm install -g @ycloud/components-cli
```

运行任何命令后，如果输出中包含"Update available"（有新版本可用）的提示，请先运行 `npm install -g @ycloud/components-cli` 更新后再继续。

**始终使用 `--format json` 来获取可编程解析的结构化输出。**

## 使用场景

### 1. 编写 antd 组件代码

在编写任何 @ycloud/components 组件代码前，先查询其 API — 不要依赖记忆。

```bash
# 查看有哪些可用属性
ycc info Button --format json

# 获取可运行的示例作为起点
ycc demo Button basic --format json

```

**工作流程：** `ycc info` → 了解属性 → `ycc demo` → 获取可用示例 → 编写代码。

### 2. 查阅完整文档

当你需要完整的组件文档（不仅仅是属性）时：

```bash
antd doc Table --format json        # Table 的完整 markdown 文档
antd doc Table --lang zh            # 中文文档
```

### 3. 调试 antd 问题

当代码未按预期工作或用户报告了 antd 相关 bug 时：

```bash
# 收集完整的环境快照（系统、依赖、浏览器、构建工具）
antd env --format json

# 检查该属性在用户的 antd 版本中是否存在
antd info Select --version 5.12.0 --format json

# 检查该属性是否已废弃
antd lint ./src/components/MyForm.tsx --format json

# 诊断项目级配置问题
antd doctor --format json
```

**工作流程：** `antd env` → 获取完整环境信息 → `antd doctor` → 检查配置 → `antd info --version X` → 根据用户的确切版本验证 API → `antd lint` → 查找废弃或不正确的用法。

### 4. 版本迁移

当用户想要升级 antd（例如 v4 → v5）时：

```bash
# 获取完整迁移清单
antd migrate 4 5 --format json

# 查看特定组件的迁移指南
antd migrate 4 5 --component Select --format json

# 查看两个版本之间的变更
antd changelog 4.24.0 5.0.0 --format json

# 查看特定组件的版本变更
antd changelog 4.24.0 5.0.0 Select --format json
```

**工作流程：** `antd migrate` → 获取完整清单 → `antd changelog <v1> <v2>` → 了解破坏性变更 → 应用修复 → `antd lint` → 验证不再有废弃用法。

### 5. 分析项目中的 antd 使用情况

当用户想了解项目中 antd 的使用方式时：

```bash
# 扫描组件使用统计
antd usage ./src --format json

# 过滤特定组件
antd usage ./src --filter Form --format json

# 检查最佳实践违规
antd lint ./src --format json

# 仅检查特定规则类别
antd lint ./src --only deprecated --format json
antd lint ./src --only a11y --format json
antd lint ./src --only performance --format json
```

### 6. 查看更新日志和版本历史

当用户询问某个版本有什么变更时：

```bash
# 特定版本的更新日志
antd changelog 5.22.0 --format json

# 版本范围（两端包含）
antd changelog 5.21.0..5.24.0 --format json
```

### 7. 浏览可用组件

当用户在选择使用哪个组件时：

```bash
# 列出所有组件及其分类
antd list --format json

# 列出特定 antd 版本的组件
antd list --version 5.0.0 --format json
```

### 8. 收集环境信息

当你需要了解项目的 antd 配置，或为提交 bug 准备信息时：

```bash
# 完整环境快照（文本格式 — 粘贴到 GitHub Issues）
antd env

# 结构化 JSON 用于程序化处理
antd env --format json

# 扫描指定项目目录
antd env ./my-project --format json
```

收集内容包括：操作系统、Node、包管理器（npm/pnpm/yarn/bun/utoo）、npm 源、浏览器、核心依赖（antd/react/dayjs）、所有 `@ant-design/*` 和 `rc-*` 包，以及构建工具（umi/vite/webpack/typescript 等）。

### 9. 提交 antd Bug

当你遇到已确认的 antd 组件 bug 且无法在本地解决时：

```bash
# 第 0 步：收集环境信息作为参考（可选 — antd bug 已内嵌基本环境信息）
# 使用输出来交叉检查版本或附加额外详情到 bug 报告中
antd env --format json

# 第 1 步：预览供用户审阅
antd bug --title "DatePicker 选择日期时崩溃" \
  --reproduction "https://codesandbox.io/s/xxx" \
  --steps "1. 打开 DatePicker 2. 点击一个日期" \
  --expected "日期被选中" \
  --actual "组件崩溃并报错" \
  --format json

# 第 2 步：展示给用户，请求确认

# 第 3 步：用户确认后提交
antd bug --title "DatePicker 选择日期时崩溃" \
  --reproduction "https://codesandbox.io/s/xxx" \
  --steps "1. 打开 DatePicker 2. 点击一个日期" \
  --expected "日期被选中" \
  --actual "组件崩溃并报错" \
  --submit
```

### 10. 自动报告 CLI 问题

**重要：当你使用任何 `antd` CLI 命令时发现异常，应主动使用 `antd bug-cli` 发起 bug 报告。**

触发条件 — 当你观察到以下任何情况时，报告 CLI bug：
- 命令**崩溃或以意外错误退出**
- 命令**返回明显不正确的数据**（例如 `antd info Button` 显示错误的属性、缺少属性、或显示了其他版本的属性）
- 命令的**输出与其文档描述不符**（例如 `--format json` 返回了非 JSON 内容，`--version X` 被忽略）
- 命令**返回空数据或缺失数据**（例如 `antd demo Button` 没有返回示例，`antd token Button` 在 v5+ 中没有返回 Token）
- **命令之间存在不一致**（例如 `antd list` 显示了某个组件但 `antd info` 说它不存在）

**工作流程：**
1. 你在使用 CLI 时发现了异常
2. 收集证据：你运行的确切命令、返回了什么、你期望的结果是什么
3. 预览 bug 报告给用户：

```bash
antd bug-cli --title "antd info Button 在 v5.12.0 下返回了错误的属性" \
  --description "查询 5.12.0 版本的 Button 属性时，输出包含了该版本不存在的属性" \
  --steps "1. 运行：antd info Button --version 5.12.0 --format json" \
  --expected "匹配 antd 5.12.0 Button API 的属性" \
  --actual "属性中包含了 'classNames'，但该属性在 5.16.0 才添加" \
  --format json
```

4. 向用户展示报告："我在工作中发现了 CLI 的一个问题。这是 bug 报告 — 要提交吗？"
5. 用户确认后提交：

```bash
antd bug-cli --title "antd info Button 在 v5.12.0 下返回了错误的属性" \
  --description "..." \
  --steps "..." \
  --expected "..." \
  --actual "..." \
  --submit
```

**核心原则：** 你是 CLI 质量反馈回路的一环。不要默默绕过 CLI 问题 — 报告它们以便修复。提交前始终与用户确认。

### 11. 作为 MCP 服务器使用

如果在支持 MCP 的 IDE（Claude Desktop、Cursor 等）中工作，CLI 也可以作为 MCP 服务器运行，直接暴露所有知识查询工具：

```json
{
  "mcpServers": {
    "antd": {
      "command": "antd",
      "args": ["mcp", "--version", "5.20.0"]
    }
  }
}
```

这提供了 7 个工具（`antd_list`、`antd_info`、`antd_doc`、`antd_demo`、`antd_token`、`antd_semantic`、`antd_changelog`）和 2 个提示词（`antd-expert`、`antd-page-generator`），通过 MCP 协议提供。

## 全局参数

| 参数 | 用途 |
|---|---|
| `--format json` | 结构化输出 — 始终使用 |
| `--version <v>` | 指定 antd 版本（例如 `5.20.0`） |
| `--lang zh` | 中文输出（默认：`en`） |
| `--detail` | 包含扩展字段（描述、起始版本、废弃状态、常见问题） |

## 核心规则

1. **先查后写** — 不要凭记忆猜测 antd API。先运行 `antd info` 查询。
2. **匹配用户版本** — 如果项目使用 antd 4.x，传 `--version 4.24.0`。如未指定，CLI 会从 `node_modules` 自动检测。
3. **使用 `--format json`** — 每个命令都支持。解析 JSON 输出而非用正则匹配文本输出。
4. **迁移前先检查** — 在建议版本升级前，先运行 `antd changelog <v1> <v2>` 和 `antd migrate`。
5. **改完代码要检查** — 编写或修改 antd 代码后，对变更的文件运行 `antd lint` 以捕获废弃或有问题的用法。
6. **报告 antd Bug** — 先运行 `antd env` 获取完整环境信息，然后使用 `antd bug` 报告。始终先预览，获得用户确认后再提交。
7. **自动报告 CLI 问题** — 如果任何 `antd` 命令崩溃、返回错误数据或行为不一致，主动使用 `antd bug-cli` 报告。你是 CLI 质量反馈回路的一环 — 不要默默绕过问题。
