#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

VERSION="${VERSION:-$(awk -F '"' '/^version = / { print $2; exit }' Cargo.toml)}"
PACKAGE_NAME="${PACKAGE_NAME:-ycc}"
TAG_NAME="${TAG_NAME:-v$VERSION}"
PACKAGE_VERSION="${PACKAGE_VERSION:-$TAG_NAME}"
REF="${REF:-$(git rev-parse HEAD)}"
GITLAB_URL="${GITLAB_URL:-https://git.taovip.com}"
REMOTE_URL="$(git remote get-url origin)"
PROJECT_PATH="${GITLAB_PROJECT_PATH:-}"
PROJECT_ID="${GITLAB_PROJECT_ID:-}"
TOKEN="${GITLAB_TOKEN:-${PRIVATE_TOKEN:-}}"
DRY_RUN="${DRY_RUN:-0}"

case "$(uname -s)" in
  Darwin) OS="darwin" ;;
  Linux) OS="linux" ;;
  MINGW*|MSYS*|CYGWIN*) OS="windows" ;;
  *) OS="$(uname -s | tr '[:upper:]' '[:lower:]')" ;;
esac

case "$(uname -m)" in
  arm64|aarch64) ARCH="arm64" ;;
  x86_64|amd64) ARCH="x64" ;;
  *) ARCH="$(uname -m)" ;;
esac

EXT=""
if [[ "$OS" == "windows" ]]; then
  EXT=".exe"
fi

BASE_NAME="${BASE_NAME:-ycc-$OS-$ARCH}"
ASSET_NAME="${ASSET_NAME:-$BASE_NAME.tar.gz}"
DIST_DIR="$ROOT_DIR/dist"
DIST_FILE="$DIST_DIR/$ASSET_NAME"
LOCAL_FILE="$DIST_DIR/ycc$EXT"

if [[ -z "$PROJECT_PATH" ]]; then
  if [[ "$REMOTE_URL" =~ ^git@([^:]+):(.+)\.git$ ]]; then
    PROJECT_PATH="${BASH_REMATCH[2]}"
  elif [[ "$REMOTE_URL" =~ ^https?://[^/]+/(.+)\.git$ ]]; then
    PROJECT_PATH="${BASH_REMATCH[1]}"
  else
    echo "Unable to derive GitLab project path from origin: $REMOTE_URL" >&2
    echo "Set GITLAB_PROJECT_PATH or GITLAB_PROJECT_ID explicitly." >&2
    exit 1
  fi
fi

if [[ -z "$PROJECT_ID" ]]; then
  PROJECT_ID="$(python3 - "$PROJECT_PATH" <<'PY'
import sys
from urllib.parse import quote
print(quote(sys.argv[1], safe=""))
PY
)"
fi

PACKAGE_URL="$GITLAB_URL/api/v4/projects/$PROJECT_ID/packages/generic/$PACKAGE_NAME/$PACKAGE_VERSION/$ASSET_NAME"
RELEASE_API_URL="$GITLAB_URL/api/v4/projects/$PROJECT_ID/releases"
RELEASE_PAGE_URL="$GITLAB_URL/$PROJECT_PATH/-/releases/$TAG_NAME"

echo "Building ycc $VERSION for $OS-$ARCH..."
cargo build --release
mkdir -p "$DIST_DIR"
cp "target/release/ycc$EXT" "$LOCAL_FILE"
chmod +x "$LOCAL_FILE"
tar -C "$DIST_DIR" -czf "$DIST_FILE" "ycc$EXT" -C "$ROOT_DIR" skills

echo "Built: $DIST_FILE"
echo "Package URL: $PACKAGE_URL"
echo "Release page URL: $RELEASE_PAGE_URL"

if [[ "$DRY_RUN" == "1" ]]; then
  echo "DRY_RUN=1, skip upload and release creation."
  exit 0
fi

if [[ -z "$TOKEN" ]]; then
  if command -v glab >/dev/null 2>&1 && glab auth status >/dev/null 2>&1; then
    echo "GITLAB_TOKEN is not set; using glab authenticated release flow..."
    glab release create "$TAG_NAME" "$DIST_FILE#$ASSET_NAME#package" \
      --use-package-registry \
      --package-name "$PACKAGE_NAME" \
      --name "ycc $VERSION" \
      --notes "ycc $VERSION single-platform $OS-$ARCH binary release." \
      --ref "$REF"
    echo "Release created or updated: $RELEASE_PAGE_URL"
    exit 0
  fi
  echo "GITLAB_TOKEN or PRIVATE_TOKEN is required, unless glab is installed and authenticated." >&2
  exit 1
fi

echo "Uploading $ASSET_NAME to GitLab Generic Package Registry..."
upload_status="$(
  curl --silent --show-error --location \
    --header "PRIVATE-TOKEN: $TOKEN" \
    --upload-file "$DIST_FILE" \
    --write-out "%{http_code}" \
    --output /tmp/ycc-upload-response.txt \
    "$PACKAGE_URL"
)"

if [[ "$upload_status" != "201" && "$upload_status" != "200" ]]; then
  cat /tmp/ycc-upload-response.txt >&2 || true
  echo "Upload failed with HTTP $upload_status" >&2
  exit 1
fi

payload="$(
  python3 - "$TAG_NAME" "$VERSION" "$PACKAGE_URL" "$ASSET_NAME" "$REF" <<'PY'
import json
import sys

tag, version, package_url, asset_name, ref = sys.argv[1:]
print(json.dumps({
    "name": f"ycc {version}",
    "tag_name": tag,
    "ref": ref,
    "description": f"ycc {version}",
    "assets": {
        "links": [{
            "name": asset_name,
            "url": package_url,
            "direct_asset_path": f"/bin/{asset_name}",
            "link_type": "package",
        }]
    },
}, ensure_ascii=False))
PY
)"

echo "Creating GitLab Release $TAG_NAME..."
release_status="$(
  curl --silent --show-error --location \
    --header "PRIVATE-TOKEN: $TOKEN" \
    --header "Content-Type: application/json" \
    --request POST \
    --data "$payload" \
    --write-out "%{http_code}" \
    --output /tmp/ycc-release-response.txt \
    "$RELEASE_API_URL"
)"

if [[ "$release_status" == "201" || "$release_status" == "200" ]]; then
  echo "Release created: $TAG_NAME"
  echo "Release page: $RELEASE_PAGE_URL"
  exit 0
fi

cat /tmp/ycc-release-response.txt >&2 || true
echo "Release creation failed with HTTP $release_status" >&2
exit 1
