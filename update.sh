#!/usr/bin/env bash
set -euo pipefail

VERSION="${VERSION:-2.0.2}"
PACKAGE_VERSION="${PACKAGE_VERSION:-v$VERSION}"
GITHUB_REPO="${YCC_GITHUB_REPO:-TianJianJun0727/ycloud-components-cli-installer}"
RELEASE_BASE_URL="${YCC_RELEASE_BASE_URL:-https://github.com/$GITHUB_REPO/releases/download}"
INSTALL_ROOT="${YCC_INSTALL_ROOT:-$HOME/.local/share/ycc}"
BIN_DIR="${YCC_BIN_DIR:-$HOME/.local/bin}"
SKILL_TARGETS="${YCC_SKILL_TARGETS:-$HOME/.codex/skills:$HOME/.claude/skills}"
FORCE_SKILLS="${YCC_FORCE_SKILLS:-1}"
CACHE_DIR="${YCC_CACHE_DIR:-$HOME/.cache/ycc/downloads}"
FORCE_UPDATE="${YCC_FORCE_UPDATE:-0}"
MIGRATE_NPM="${YCC_MIGRATE_NPM:-1}"

case "$(uname -s)" in
  Darwin) OS="darwin" ;;
  *) echo "Unsupported OS: $(uname -s). Only macOS is supported." >&2; exit 1 ;;
esac

case "$(uname -m)" in
  arm64|aarch64) ARCH="arm64" ;;
  x86_64|amd64) ARCH="x64" ;;
  *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

installed_version() {
  if [[ ! -x "$INSTALL_ROOT/ycc" ]]; then
    return 1
  fi

  "$INSTALL_ROOT/ycc" --version 2>/dev/null | awk '{print $NF}'
}

CURRENT_VERSION="$(installed_version || true)"
if [[ "$FORCE_UPDATE" != "1" && "$CURRENT_VERSION" == "$VERSION" ]]; then
  echo "ycc $VERSION is already installed."
  exit 0
fi

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

ASSET_NAME="ycc-$OS-$ARCH.tar.gz"
ARCHIVE_URL="$RELEASE_BASE_URL/$PACKAGE_VERSION/$ASSET_NAME"
CACHED_ARCHIVE="$CACHE_DIR/$PACKAGE_VERSION/$ASSET_NAME"

mkdir -p "$CACHE_DIR"

if [[ -f "$CACHED_ARCHIVE" ]]; then
  echo "Using cached package: $CACHED_ARCHIVE"
else
  if ! command -v curl >/dev/null 2>&1; then
    echo "curl is required to download $ARCHIVE_URL" >&2
    exit 1
  fi

  echo "Downloading $ARCHIVE_URL..."
  mkdir -p "$(dirname "$CACHED_ARCHIVE")"
  curl -fL "$ARCHIVE_URL" -o "$CACHED_ARCHIVE.tmp"
  mv "$CACHED_ARCHIVE.tmp" "$CACHED_ARCHIVE"
fi

mkdir -p "$INSTALL_ROOT" "$BIN_DIR"
rm -rf "$INSTALL_ROOT"
mkdir -p "$INSTALL_ROOT" "$BIN_DIR"
tar -xzf "$CACHED_ARCHIVE" -C "$INSTALL_ROOT"
chmod +x "$INSTALL_ROOT/ycc"
ln -sf "$INSTALL_ROOT/ycc" "$BIN_DIR/ycc"
migrate_npm_install

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
