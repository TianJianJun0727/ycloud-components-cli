---
name: ycloud-components
description: >
  查询 @ycloud/components 组件文档、API、示例、设计 Token、版本迁移和代码检查。
  当涉及 @ycloud/components 组件开发、调试或迁移时使用。
allowed-tools:
  - Bash(ycc *)
  - Bash(npm install -g @ycloud/components-cli)
  - Bash(which ycc)
---

# ycloud components CLI

你可以使用 `@ycloud/components-cli` — 一个本地 CLI 工具， 通过读取用户项目中 @ycloud/components 包下的metadata/index.json 文件来查询组件文档、分析项目、指导迁移。所有数据离线可用，无需网络。

## 初始设置

首次使用前，检查并安装 CLI：

```bash
which ycc || npm install -g @ycloud/components-cli
```

如果命令输出包含 "New version available"，先更新：

```bash
npm update -g @ycloud/components-cli
```

**重要：所有命令都应使用 `--format json` 获取结构化输出。**

## 使用场景

### 1. 编写 @ycloud/components 组件代码

在编写任何 @ycloud/components 组件代码前，先查询其 API — 不要依赖记忆。

```bash
# 查看有哪些可用属性
ycc info LoadingButton --format json

# 获取可运行的示例作为起点
ycc demo LoadingButton basic --format json

```

**工作流程：** `ycc info` → 了解属性 → `ycc demo` → 获取可用示例 → 编写代码。

### 2. 查阅完整文档

当你需要完整的组件文档（不仅仅是属性）时：

```bash
ycc doc Pagination --format json        # Pagination 的完整 markdown 文档
```

### 3. 查询设计 Token

查看组件的设计 Token（颜色、间距、字体等）：

```bash
ycc token Button --format json
```

### 4. 查询 Material UI 官方文档

当组件 info 包含 `inheritMuiProps` 字段且当前文档 `props` 不满足需求时，调用 MCP 服务 "mui-mcp" 查询 MUI 组件属性：

```bash
ycc meta --format json      # 获取 MUI 版本信息
```

然后调用 mui-mcp 工具查询对应版本的 MUI 组件文档。

### 5. 浏览可用组件

列出所有组件

```bash
ycc list --format json
```

### 6. 版本迁移

升级 @ycloud/components 版本前，检查变更：

```bash
# 查看两个版本间的变更日志
ycc changelog 5.19.0 5.20.0 --format json

# 分析项目中需要迁移的代码
ycc migrate --from 5.19.0 --to 5.20.0 --format json
```

### 7. 代码检查

编写或修改代码后，检查是否使用了废弃的 API：

```bash
ycc lint src/components/MyComponent.tsx --format json
```

## 全局参数

| 参数 | 说明 | 使用建议 |
|---|---|---|
| `--format json` | 输出 JSON 格式 | 必须使用，便于解析 |
| `--version <V>` | 指定组件库版本 | 通常自动检测，跨版本查询时使用 |
| `--lang <L>` | 文档语言（zh/en） | 仅 `doc` 命令支持，默认 en |

## 核心规则

1. **先查后写** — 编写组件前必须运行 `ycc info` 查询 API，不要凭记忆猜测
2. **不要编造 API** — 如果 `ycc info`、`ycc doc` 且调用mcp服务 `mui mcp` 都找不到props，告知用户而非编造
3. **始终用 JSON 格式** — 所有命令都加 `--format json`，解析 JSON 而非文本
4. **迁移前先检查** — 版本升级前运行 `ycc changelog` 和 `ycc migrate` 了解变更
5. **代码检查** — 修改代码后运行 `ycc lint` 检查废弃用法
6. **优先使用 demo** — 有示例代码时用 `ycc demo` 获取，比从零开始更准确

## 命令选择流程

```text
需要编写组件？
  ├─ 不熟悉 API → ycc info <组件名>
  ├─ 需要示例 → ycc demo <组件名> <demo名>
  ├─ 需要完整文档 → ycc doc <组件名>
  └─ 需要设计 Token → ycc token <组件名>

需要选择组件？
  └─ ycc list

需要版本升级？
  ├─ ycc changelog <旧版本> <新版本>
  └─ ycc migrate --from <旧版本> --to <新版本>

代码写完了？
  └─ ycc lint <文件路径>
```

## 故障排查

### 错误输出格式

所有 `ycc` 命令在出错时会返回 JSON 格式的错误对象（配合 `--format json`），并以非零退出码退出。错误格式如下：

```json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "错误描述",
  "suggestion": "修复建议"
}
```

**处理规则：当命令返回非零退出码时，解析 stderr 中的 JSON 错误对象，根据 `code` 字段采取对应操作。**

### 错误码及处理方法

| 错误码 | 含义 | 自动处理 |
|---|---|---|
| `COMPONENTS_NOT_FOUND` | 项目未安装 @ycloud/components | 提示用户运行 `npm install @ycloud/components` |
| `METADATA_FILE_NOT_FOUND` | metadata/index.json 不存在 | 提示用户更新 `npm update @ycloud/components` |
| `COMPONENT_NOT_FOUND` | 组件名不存在 | 运行 `ycc list --format json` 查找正确名称，再重试 |
| `METADATA_NOT_ERROR` | metadata 文件损坏/无法解析 | 提示用户重装 `npm install @ycloud/components` |
| `PACKAGE_PATH_ERROR` | 包路径解析失败 | 确认在正确项目目录下运行，检查 node_modules |
| `UNKNOWN_ERROR` | 未知错误 | 告知用户错误信息，建议更新 CLI |

### 错误恢复流程

```text
命令返回错误？
  ├─ code = COMPONENTS_NOT_FOUND
  │    └─ 告知用户需先安装 @ycloud/components，不要继续猜测 API
  ├─ code = COMPONENT_NOT_FOUND
  │    ├─ 运行 ycc list --format json 获取组件列表
  │    ├─ 检查是否拼写错误（如 button → Button）
  │    └─ 用正确的组件名重试
  ├─ code = METADATA_FILE_NOT_FOUND 或 METADATA_NOT_ERROR
  │    └─ 提示用户更新/重装 @ycloud/components
  └─ code = UNKNOWN_ERROR
       └─ 告知用户完整错误信息，建议运行 npm update -g @ycloud/components-cli
```

### CLI 未安装或版本过旧

```bash
npm install -g @ycloud/components-cli
# 或
npm update -g @ycloud/components-cli
```

### 命令运行超时或崩溃

如果 `ycc` 命令无响应或崩溃（非 JSON 错误输出）：

1. 检查 CLI 版本：`ycc --version`
2. 重装 CLI：`npm install -g @ycloud/components-cli`
3. 如仍无法解决，告知用户并给出手动查阅文档的建议
