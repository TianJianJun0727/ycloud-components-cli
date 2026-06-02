#!/usr/bin/env bash
set -euo pipefail

VERSION="${VERSION:-2.0.0}"
PACKAGE_VERSION="${PACKAGE_VERSION:-v$VERSION}"
GITHUB_REPO="${YCC_GITHUB_REPO:-TianJianJun0727/ycloud-components-cli}"
GITHUB_REF="${YCC_GITHUB_REF:-main}"
RAW_BASE_URL="${YCC_RAW_BASE_URL:-https://raw.githubusercontent.com/$GITHUB_REPO/$GITHUB_REF}"
INSTALL_ROOT="${YCC_INSTALL_ROOT:-$HOME/.local/share/ycc}"
BIN_DIR="${YCC_BIN_DIR:-$HOME/.local/bin}"
SKILL_TARGETS="${YCC_SKILL_TARGETS:-$HOME/.codex/skills:$HOME/.claude/skills}"
FORCE_SKILLS="${YCC_FORCE_SKILLS:-1}"
LOCAL_ARCHIVE="${YCC_ARCHIVE:-}"

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
  Linux) OS="linux" ;;
  *) echo "Unsupported OS: $(uname -s)" >&2; exit 1 ;;
esac

case "$(uname -m)" in
  arm64|aarch64) ARCH="arm64" ;;
  x86_64|amd64) ARCH="x64" ;;
  *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

ASSET_NAME="ycc-$OS-$ARCH.tar.gz"
TMP_DIR="$(mktemp -d)"
ARCHIVE="$TMP_DIR/$ASSET_NAME"
REPO_ARCHIVE="$ROOT_DIR/release-assets/$PACKAGE_VERSION/$ASSET_NAME"
ARCHIVE_URL="$RAW_BASE_URL/release-assets/$PACKAGE_VERSION/$ASSET_NAME"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

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

mkdir -p "$INSTALL_ROOT" "$BIN_DIR"
rm -rf "$INSTALL_ROOT"
mkdir -p "$INSTALL_ROOT" "$BIN_DIR"
tar -xzf "$ARCHIVE" -C "$INSTALL_ROOT"
chmod +x "$INSTALL_ROOT/ycc"
ln -sf "$INSTALL_ROOT/ycc" "$BIN_DIR/ycc"

echo "Installed ycc to $INSTALL_ROOT/ycc"
echo "Linked command to $BIN_DIR/ycc"

printf '%s\n' "$SKILL_TARGETS" | tr ':' '\n' | while IFS= read -r target; do
  if [[ -z "$target" ]]; then
    continue
  fi
  mkdir -p "$target"
  for skill in "$INSTALL_ROOT"/skills/*; do
    if [[ ! -d "$skill" ]]; then
      continue
    fi
    name="$(basename "$skill")"
    link="$target/$name"
    if [[ -e "$link" || -L "$link" ]]; then
      if [[ "$FORCE_SKILLS" == "1" ]]; then
        rm -rf "$link"
      else
        echo "Skip existing skill: $link"
        continue
      fi
    fi
    ln -s "$skill" "$link"
    echo "Linked skill: $link -> $skill"
  done
done

"$INSTALL_ROOT/ycc" --version
