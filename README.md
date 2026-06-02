# ycc installer

用于安装 `ycc` 命令和内置 skills。

## 安装

```bash
/bin/zsh -c "$(curl -fsSL https://raw.githubusercontent.com/TianJianJun0727/ycloud-components-cli/main/install.sh)"
```

默认安装内容：

- `ycc` 安装到 `~/.local/lib/ycc/ycc`
- 命令软链到 `~/.local/bin/ycc`
- 内置 skill 软链到 `~/.codex/skills` 和 `~/.claude/skills`

可通过环境变量调整：

```bash
YCC_INSTALL_ROOT=~/.local/lib/ycc \
YCC_BIN_DIR=~/.local/bin \
YCC_SKILL_TARGETS="$HOME/.codex/skills:$HOME/.claude/skills" \
/bin/zsh -c "$(curl -fsSL https://raw.githubusercontent.com/TianJianJun0727/ycloud-components-cli/main/install.sh)"
```

## 卸载

```bash
rm -f ~/.local/bin/ycc
rm -rf ~/.local/lib/ycc
rm -f ~/.codex/skills/ycloud-components
rm -f ~/.claude/skills/ycloud-components
```
