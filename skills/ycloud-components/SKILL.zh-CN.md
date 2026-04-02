---
name: ycloud-components
description: >
  当用户的任务涉及 @ycloud/components (ycloud components) 时使用 — 编写 @ycloud/components  组件、
  调试 @ycloud/components 问题、查询 @ycloud/components API/属性/Token/示例、跨版本迁移、
  或分析项目中的 @ycloud/components 使用情况。当检测到 @ycloud/components 相关代码、
  从 '@ycloud/components' 导入、或明确的 @ycloud/components 相关问题时触发。
allowed-tools:
  - Bash(ycc *)
  - Bash(npm install -g @ycloud/components-cli)
  - Bash(which ycc)
---

# ycloud components CLI

你可以使用 `@ycloud/components-cli` — 一个本地 CLI 工具， 通过读取用户项目中 @ycloud/components 包下的metadata/index.json 文件来查询组件知识、分析项目、指导迁移。所有数据离线可用，无需网络。

## 初始设置

首次使用前，检查 CLI 是否已安装。如未安装，自动安装：

```bash
which ycc || npm install -g @ycloud/components-cli
```

运行任何命令后，如果输出中包含"New version available"（有新版本可用）的提示，请先运行 `npm install -g @ycloud/components-cli` 更新后再继续。

**始终使用 `--format json` 来获取可编程解析的结构化输出。**

## 使用场景

### 1. 编写 @ycloud/components 组件代码

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
```

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

这提供了 7 个工具（`ycc_list`、`ycc_info`、`ycc_doc`、`ycc_demo`、`ycc_token`、`ycc_semantic`、`ycc_changelog`）和 2 个提示词（`ycc-expert`、`ycc-page-generator`），通过 MCP 协议提供。

## 全局参数

| 参数 | 用途 |
|---|---|
| `--format json` | 结构化输出 — 始终使用 |
| `--version <v>` | 指定 antd 版本（例如 `5.20.0`） |
| `--lang zh` | 中文输出（默认：`en`） |
| `--detail` | 包含扩展字段（描述、起始版本、废弃状态、常见问题） |

## 核心规则

1. **先查后写** — 不要凭记忆猜测 @ycloud/components API。先运行 `ycc info` 查询。
2. **使用 `--format json`** — 每个命令都支持。解析 JSON 输出而非用正则匹配文本输出。
3. **迁移前先检查** — 在建议版本升级前，先运行 `ycc changelog <v1> <v2>` 和 `ycc migrate`。
4. **改完代码要检查** — 编写或修改 @ycloud/components 代码后，对变更的文件运行 `ycc lint` 以捕获废弃或有问题的用法。
