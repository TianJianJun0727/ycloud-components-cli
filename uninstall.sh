#!/usr/bin/env bash
set -euo pipefail

INSTALL_ROOT="${YCC_INSTALL_ROOT:-$HOME/.local/share/ycc}"
BIN_DIR="${YCC_BIN_DIR:-$HOME/.local/bin}"
SKILL_TARGETS="${YCC_SKILL_TARGETS:-$HOME/.codex/skills:$HOME/.claude/skills}"
MIGRATE_NPM="${YCC_MIGRATE_NPM:-1}"

COMMAND_LINK="$BIN_DIR/ycc"

remove_npm_install() {
  if [[ "$MIGRATE_NPM" != "1" ]]; then
    return
  fi

  if ! command -v npm >/dev/null 2>&1; then
    return
  fi

  if npm list -g @ycloud/components-cli --depth=0 >/dev/null 2>&1; then
    echo "Removing old npm installation: @ycloud/components-cli"
    npm uninstall -g @ycloud/components-cli >/dev/null
  fi
}

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

remove_npm_install

echo "ycc uninstalled."
