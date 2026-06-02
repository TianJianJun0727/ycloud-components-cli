# ycc installer

用于安装 `ycc` 命令和内置 skills。

## 安装

```bash
/bin/zsh -c "$(git archive --remote=git@git.taovip.com:tianjianjun/ycloud-components-cli.git main install.sh | tar -xO install.sh)"
```

该命令通过 SSH 读取安装脚本，适用于私有 GitLab 仓库；请先确保本机 SSH key 已能访问 `git.taovip.com`。

默认安装内容：

- `ycc` 安装到 `~/.local/lib/ycc/ycc`
- 命令软链到 `~/.local/bin/ycc`
- 内置 skill 软链到 `~/.codex/skills` 和 `~/.claude/skills`

可通过环境变量调整：

```bash
YCC_INSTALL_ROOT=~/.local/lib/ycc \
YCC_BIN_DIR=~/.local/bin \
YCC_SKILL_TARGETS="$HOME/.codex/skills:$HOME/.claude/skills" \
/bin/zsh -c "$(git archive --remote=git@git.taovip.com:tianjianjun/ycloud-components-cli.git main install.sh | tar -xO install.sh)"
```

## 卸载

```bash
rm -f ~/.local/bin/ycc
rm -rf ~/.local/lib/ycc
rm -f ~/.codex/skills/ycloud-components
rm -f ~/.claude/skills/ycloud-components
```
