#!/usr/bin/env bash
set -euo pipefail

VERSION="${VERSION:-2.0.0}"
PACKAGE_VERSION="${PACKAGE_VERSION:-v$VERSION}"
INSTALLER_REPO_URL="${YCC_INSTALLER_REPO_URL:-git@git.taovip.com:tianjianjun/ycloud-components-cli.git}"
INSTALLER_DIR="${YCC_INSTALLER_DIR:-$HOME/.local/share/ycc-installer}"
INSTALL_ROOT="${YCC_INSTALL_ROOT:-$HOME/.local/lib/ycc}"
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

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

ensure_installer_repo() {
  if [[ -f "$REPO_ARCHIVE" ]]; then
    return
  fi

  if ! command -v git >/dev/null 2>&1; then
    echo "git is required to install ycc." >&2
    exit 1
  fi

  echo "Preparing installer repository..."
  if [[ -d "$INSTALLER_DIR/.git" ]]; then
    git -C "$INSTALLER_DIR" fetch --depth 1 origin main
    git -C "$INSTALLER_DIR" checkout -q main
    git -C "$INSTALLER_DIR" reset --hard origin/main
  else
    rm -rf "$INSTALLER_DIR"
    mkdir -p "$(dirname "$INSTALLER_DIR")"
    git clone --depth 1 "$INSTALLER_REPO_URL" "$INSTALLER_DIR"
  fi

  ROOT_DIR="$INSTALLER_DIR"
  REPO_ARCHIVE="$ROOT_DIR/release-assets/$PACKAGE_VERSION/$ASSET_NAME"
}

echo "Installing $ASSET_NAME..."
if [[ -n "$LOCAL_ARCHIVE" ]]; then
  cp "$LOCAL_ARCHIVE" "$ARCHIVE"
else
  ensure_installer_repo
  if [[ ! -f "$REPO_ARCHIVE" ]]; then
    echo "Release archive not found: $REPO_ARCHIVE" >&2
    echo "Set YCC_ARCHIVE to a local archive path, or publish the archive into release-assets." >&2
    exit 1
  fi
  cp "$REPO_ARCHIVE" "$ARCHIVE"
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
