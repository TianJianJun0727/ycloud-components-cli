# @ycloud/components-cli

`ycc` 是 @ycloud/components 的命令行文档查询工具，支持查看组件属性、示例代码、语义化 className，并提供 MCP 服务集成。

## 安装

```bash
tmp_dir="$(mktemp -d)"
git clone --depth 1 --branch research-gitlab-binary-release \
  git@git.taovip.com:sunkaicheng/ycloud-components-cli.git \
  "$tmp_dir/ycloud-components-cli"
"$tmp_dir/ycloud-components-cli/scripts/install.sh"
```

安装脚本默认会：

- 从仓库内的 `release-assets/v2.0.0/` 读取当前平台的 `ycc-<os>-<arch>.tar.gz`
- 安装到 `~/.local/lib/ycc`
- 创建命令链接 `~/.local/bin/ycc`
- 将内置 skill 以软链方式初始化到 `~/.codex/skills` 和 `~/.claude/skills`

可通过环境变量调整：

```bash
YCC_INSTALL_ROOT=~/.local/lib/ycc \
YCC_BIN_DIR=~/.local/bin \
YCC_SKILL_TARGETS="$HOME/.codex/skills:$HOME/.claude/skills" \
bash install-ycc.sh
```

也可以从 GitLab Release 页面手动查看发布资产：

https://git.taovip.com/sunkaicheng/ycloud-components-cli/-/releases/v2.0.0

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

### `ycc demo <component> [name]`

获取组件的示例代码。

```bash
ycc demo Button basic
```

### `ycc meta`

查看当前元数据信息（版本、MUI 版本等）。

```bash
ycc meta
```

### `ycc config get/set source`

查看或配置元数据源。默认源为 `https://ui.ycloud.com/metadata.json`。

```bash
# 查看当前生效的元数据源
ycc config get source

# 设置长期使用的元数据源
ycc config set source https://example.com/metadata.json
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
| `YCC_META_DATA_URL` | 临时覆盖元数据 JSON 地址 | `https://ui.ycloud.com/metadata.json` |
| `YCC_USE_LOCAL_META_DATA` | 使用本地元数据（开发用） | `false` |
| `YCC_SKIP_UPDATE_CHECK` | 跳过版本更新检测 | `false` |

元数据源优先级：`YCC_META_DATA_URL` 环境变量 > `~/.config/ycc/config.json` 中的 `source` > 默认源。

元数据缓存默认写入 `~/.config/ycc/cache/metadata.json`。如果设置了 `XDG_CONFIG_HOME`，则写入 `$XDG_CONFIG_HOME/ycc/cache/metadata.json`。

## 开发

```bash
# 运行本地 CLI
cargo run -- <command>

# 运行测试
cargo test

# 构建
cargo build --release
mkdir -p dist
cp target/release/ycc dist/ycc

# 本地测试
./dist/ycc <command>
```

## 发布

当前发布流只构建并上传当前机器平台的二进制。

```bash
# 先 dry-run，确认构建产物和 GitLab URL
DRY_RUN=1 scripts/release-gitlab.sh

# 发布到 GitLab Generic Package Registry，并创建 Release 资产链接。
# 如果本机已登录 glab，可以不传 GITLAB_TOKEN。
GITLAB_TOKEN=<token> scripts/release-gitlab.sh
```

默认发布：

- 包名：`ycc`
- 版本：读取 `Cargo.toml`
- 标签：`v<version>`
- 当前平台产物：`dist/ycc-<os>-<arch>.tar.gz`
- 产物内容：`ycc` 和内置 `skills/`
- 本地兼容产物：`dist/ycc`

## License

MIT
