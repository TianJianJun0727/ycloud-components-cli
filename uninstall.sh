#!/usr/bin/env bash
set -euo pipefail

INSTALL_ROOT="${YCC_INSTALL_ROOT:-$HOME/.local/share/ycc}"
BIN_DIR="${YCC_BIN_DIR:-$HOME/.local/bin}"
SKILL_TARGETS="${YCC_SKILL_TARGETS:-$HOME/.codex/skills:$HOME/.claude/skills}"

COMMAND_LINK="$BIN_DIR/ycc"

if [[ -L "$COMMAND_LINK" || -f "$COMMAND_LINK" ]]; then
  rm -f "$COMMAND_LINK"
  echo "Removed command: $COMMAND_LINK"
fi

printf '%s\n' "$SKILL_TARGETS" | tr ':' '\n' | while IFS= read -r target; do
  if [[ -z "$target" ]]; then
    continue
  fi

  link="$target/ycloud-components"
  if [[ -L "$link" ]]; then
    rm -f "$link"
    echo "Removed skill link: $link"
  elif [[ -e "$link" ]]; then
    echo "Skipped non-symlink skill path: $link"
  fi
done

if [[ -d "$INSTALL_ROOT" ]]; then
  rm -rf "$INSTALL_ROOT"
  echo "Removed install root: $INSTALL_ROOT"
fi

echo "ycc uninstalled."
