# ycc installer

用于安装 `ycc` 命令和内置 skills。

二进制归档通过 GitHub Releases 发布，安装脚本会按当前系统下载对应的 release asset。

支持平台：

- macOS Apple Silicon: `ycc-darwin-arm64.tar.gz`
- macOS Intel: `ycc-darwin-x64.tar.gz`

## 安装

```bash
/bin/zsh -c "$(curl -fsSL https://raw.githubusercontent.com/TianJianJun0727/ycloud-components-cli-installer/main/install.sh)"
```

默认安装内容：

- `ycc` 和内置 skills 安装到 `~/.local/share/ycc`
- 命令软链到 `~/.local/bin/ycc`
- 内置 skill 软链到 `~/.codex/skills` 和 `~/.claude/skills`
- 如果检测到旧版 npm 全局包 `@ycloud/components-cli`，默认自动卸载，避免 PATH 继续命中旧版 `ycc`

可通过环境变量调整：

```bash
YCC_INSTALL_ROOT=~/.local/share/ycc \
YCC_BIN_DIR=~/.local/bin \
YCC_SKILL_TARGETS="$HOME/.codex/skills:$HOME/.claude/skills" \
/bin/zsh -c "$(curl -fsSL https://raw.githubusercontent.com/TianJianJun0727/ycloud-components-cli-installer/main/install.sh)"
```

保留旧版 npm 全局包：

```bash
YCC_MIGRATE_NPM=0 /bin/zsh -c "$(curl -fsSL https://raw.githubusercontent.com/TianJianJun0727/ycloud-components-cli-installer/main/install.sh)"
```

## 更新

```bash
/bin/zsh -c "$(curl -fsSL https://raw.githubusercontent.com/TianJianJun0727/ycloud-components-cli-installer/main/update.sh)"
```

`update.sh` 会先检查本地已安装版本，版本一致时直接跳过；需要更新时会优先复用 `~/.cache/ycc/downloads` 中已下载的归档，避免重复下载。

指定版本更新：

```bash
VERSION=2.0.2 /bin/zsh -c "$(curl -fsSL https://raw.githubusercontent.com/TianJianJun0727/ycloud-components-cli-installer/main/update.sh)"
```

## 卸载

```bash
/bin/zsh -c "$(curl -fsSL https://raw.githubusercontent.com/TianJianJun0727/ycloud-components-cli-installer/main/uninstall.sh)"
```

卸载脚本也会默认清理旧版 npm 全局包 `@ycloud/components-cli`。如需保留：

```bash
YCC_MIGRATE_NPM=0 /bin/zsh -c "$(curl -fsSL https://raw.githubusercontent.com/TianJianJun0727/ycloud-components-cli-installer/main/uninstall.sh)"
```
