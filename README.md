# @ycloud/components-cli

`ycc` 是 [@ycloud/components](https://npm.ycloud.com/-/web/detail/@ycloud/components) 的命令行文档查询工具，支持查看组件属性、示例代码、语义化 className，并提供 MCP 服务集成。

## 安装

```bash
npm install -g @ycloud/components-cli --registry=https://npm.ycloud.com
# 或
pnpm add -g @ycloud/components-cli --registry=https://npm.ycloud.com
```

## 命令

### `ycc list`

列出所有可用组件。

```bash
ycc list
```

### `ycc info <component>`

查看组件的属性（props）、示例、语义化 className 等详细信息。

```bash
ycc info Button
```

### `ycc demo <component> [demoName]`

获取组件的示例代码。

```bash
ycc demo Button basic
```

### `ycc meta`

查看当前元数据信息（版本、MUI 版本等）。

```bash
ycc meta
```

### `ycc doc <component>`

查看组件完整文档。

```bash
ycc doc Button
```

### `ycc mcp`

启动 MCP（Model Context Protocol）服务，供 AI 助手集成使用。

```bash
ycc mcp
```

### `ycc skill install [targetDir]`

将 CLI 内置的 skill 安装到本地目录。

如果未指定 `targetDir`，CLI 会检查当前项目根目录下是否存在 `.codex` 和 `.claude`：

- 存在 `.codex`，安装到 `.codex/skills`
- 存在 `.claude`，安装到 `.claude/skills`
- 两者都存在时，同时安装到两个目录
- 两者都不存在时，命令会报错并要求显式指定 `targetDir`

```bash
# 自动安装到当前项目下已存在的 .codex/skills 或 .claude/skills
ycc skill install

# 安装到指定 skills 目录
ycc skill install ~/.codex/skills

# 也可以直接传 .codex / .claude / .
ycc skill install .codex
ycc skill install .

# 覆盖已存在的同名 skill
ycc skill install ~/.codex/skills --force
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `YCC_META_DATA_URL` | 元数据 JSON 地址 | `http://ui.ycloud.com/metadata.json` |
| `YCC_USE_LOCAL_META_DATA` | 使用本地元数据（开发用） | `false` |
| `YCC_SKIP_UPDATE_CHECK` | 跳过版本更新检测 | `false` |

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（watch）
pnpm dev

# 构建
pnpm build

# 本地测试
pnpm link -> yc <command> 
or
node dist/cli.js <command> 
```

## License

MIT
