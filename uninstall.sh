#!/usr/bin/env bash
set -euo pipefail

BIN_DIR="${YCC_BIN_DIR:-$HOME/.local/bin}"
MIGRATE_NPM="${YCC_MIGRATE_NPM:-1}"

COMMAND_LINK="$BIN_DIR/ycc"

detected_ycc() {
  command -v ycc 2>/dev/null || true
}

path_line_for_bin_dir() {
  if [[ "$BIN_DIR" == "$HOME/.local/bin" ]]; then
    printf 'export PATH="$HOME/.local/bin:$PATH"\n'
  else
    printf 'export PATH="%s:$PATH"\n' "$BIN_DIR"
  fi
}

shell_profile() {
  case "$(basename "${SHELL:-}")" in
    zsh) printf '%s\n' "$HOME/.zshrc" ;;
    bash) printf '%s\n' "$HOME/.bashrc" ;;
    *)
      if [[ -f "$HOME/.zshrc" ]]; then
        printf '%s\n' "$HOME/.zshrc"
      elif [[ -f "$HOME/.bashrc" ]]; then
        printf '%s\n' "$HOME/.bashrc"
      else
        printf '%s\n' "$HOME/.zshrc"
      fi
      ;;
  esac
}

remove_managed_path() {
  local profile
  local path_line
  local tmp_file
  local awk_status
  profile="$(shell_profile)"
  path_line="$(path_line_for_bin_dir)"

  if [[ ! -f "$profile" ]]; then
    return
  fi

  tmp_file="$(mktemp)"
  set +e
  awk -v line="$path_line" '
    previous == "# ycc" && $0 == line {
      previous = ""
      removed = 1
      next
    }
    previous != "" {
      print previous
    }
    { previous = $0 }
    END {
      if (previous != "") {
        print previous
      }
      exit removed ? 0 : 2
    }
  ' "$profile" > "$tmp_file"
  awk_status=$?
  set -e

  case "$awk_status" in
    0)
      mv "$tmp_file" "$profile"
      echo "Removed ycc PATH entry from $profile"
      ;;
    2)
      rm -f "$tmp_file"
      ;;
  esac
}

remove_command() {
  local detected
  detected="$(detected_ycc)"
  if [[ -n "$detected" ]]; then
    echo "Detected ycc: $detected"
  fi

  if [[ -L "$COMMAND_LINK" || -f "$COMMAND_LINK" ]]; then
    rm -f "$COMMAND_LINK"
    echo "Removed command: $COMMAND_LINK"
    return
  fi

  if [[ -n "$detected" && "$detected" == "$COMMAND_LINK" ]]; then
    rm -f "$detected"
    echo "Removed command: $detected"
  fi
}

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

remove_command

remove_npm_install

remove_managed_path

echo "ycc uninstalled."
