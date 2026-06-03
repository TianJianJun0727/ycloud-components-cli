#!/usr/bin/env bash
set -euo pipefail

VERSION="${VERSION:-2.0.7}"
PACKAGE_VERSION="${PACKAGE_VERSION:-v$VERSION}"
GITHUB_REPO="${YCC_GITHUB_REPO:-TianJianJun0727/ycloud-components-cli-installer}"
RELEASE_BASE_URL="${YCC_RELEASE_BASE_URL:-https://github.com/$GITHUB_REPO/releases/download}"
BIN_DIR="${YCC_BIN_DIR:-$HOME/.local/bin}"
LOCAL_ARCHIVE="${YCC_ARCHIVE:-}"
MIGRATE_NPM="${YCC_MIGRATE_NPM:-1}"

if [ -n "${BASH_SOURCE:-}" ]; then
  SCRIPT_PATH="${BASH_SOURCE[0]}"
else
  SCRIPT_PATH="$0"
fi

case "$SCRIPT_PATH" in
  */*) ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)" ;;
  *) ROOT_DIR="$(pwd)" ;;
esac

case "$(uname -s)" in
  Darwin) OS="darwin" ;;
  *) echo "Unsupported OS: $(uname -s). Only macOS is supported." >&2; exit 1 ;;
esac

case "$(uname -m)" in
  arm64|aarch64) ARCH="arm64" ;;
  x86_64|amd64) ARCH="x64" ;;
  *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

ASSET_NAME="ycc-$OS-$ARCH.tar.gz"
TMP_DIR="$(mktemp -d)"
ARCHIVE="$TMP_DIR/$ASSET_NAME"
REPO_ARCHIVE="$ROOT_DIR/$ASSET_NAME"
ARCHIVE_URL="$RELEASE_BASE_URL/$PACKAGE_VERSION/$ASSET_NAME"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

migrate_npm_install() {
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

reload_path() {
  local profile="$1"
  case ":$PATH:" in
    *":$BIN_DIR:"*) ;;
    *) export PATH="$BIN_DIR:$PATH" ;;
  esac

  if [[ -f "$profile" ]]; then
    set +u
    source "$profile" >/dev/null 2>&1 || true
    set -u
  fi
}

ensure_path() {
  local profile
  local path_line
  profile="$(shell_profile)"
  path_line="$(path_line_for_bin_dir)"

  touch "$profile"
  if grep -Fqx "$path_line" "$profile"; then
    reload_path "$profile"
    return
  fi

  if ! awk -v line="$path_line" '
    previous == "# ycc" && $0 == line { found = 1 }
    { previous = $0 }
    END { exit found ? 0 : 1 }
  ' "$profile"; then
    {
      printf '\n# ycc\n'
      printf '%s\n' "$path_line"
    } >> "$profile"
    echo "Added $BIN_DIR to PATH in $profile"
  fi

  reload_path "$profile"
  case ":$PATH:" in
    *":$BIN_DIR:"*) ;;
    *) echo "Open a new terminal or run: source \"$profile\"" ;;
  esac
}

echo "Installing $ASSET_NAME..."
if [[ -n "$LOCAL_ARCHIVE" ]]; then
  cp "$LOCAL_ARCHIVE" "$ARCHIVE"
elif [[ -f "$REPO_ARCHIVE" ]]; then
  cp "$REPO_ARCHIVE" "$ARCHIVE"
else
  if ! command -v curl >/dev/null 2>&1; then
    echo "curl is required to download $ARCHIVE_URL" >&2
    exit 1
  fi
  curl -fsSL "$ARCHIVE_URL" -o "$ARCHIVE"
fi

mkdir -p "$BIN_DIR"
tar -xzf "$ARCHIVE" -C "$TMP_DIR"
rm -f "$BIN_DIR/ycc"
install -m 0755 "$TMP_DIR/ycc" "$BIN_DIR/ycc"
migrate_npm_install
ensure_path

echo "Installed ycc to $BIN_DIR/ycc"

"$BIN_DIR/ycc" --version
