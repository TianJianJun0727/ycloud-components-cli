#!/usr/bin/env bash
set -euo pipefail

BIN_DIR="${YCC_BIN_DIR:-$HOME/.local/bin}"
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

remove_npm_install

echo "ycc uninstalled."
