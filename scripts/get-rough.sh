#!/usr/bin/env bash
# Fetch the genuine rough.js (the same version the page loads from its CDN) and
# wrap it as a Playwright init script, so verification renders exactly what
# visitors will see.
#
# Why this exists: sandboxed and CI environments often block the CDN the page
# loads rough.js from. A hand-written stub renders fills as flat blocks, which
# hides real problems (a full-width hachure band looked fine on a stub and was
# unusable for real). Always verify against the genuine library.
#
# Usage: scripts/get-rough.sh            -> writes scripts/rough-init.js
set -euo pipefail
VERSION="${ROUGH_VERSION:-4.6.6}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$HERE/rough-init.js"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fetched=""
# 1) npm registry: usually reachable even where CDNs are blocked
if command -v npm >/dev/null 2>&1; then
  if (cd "$TMP" && npm pack "roughjs@$VERSION" --silent >/dev/null 2>&1); then
    tar xzf "$TMP"/roughjs-*.tgz -C "$TMP"
    cp "$TMP/package/bundled/rough.js" "$TMP/rough.js"
    fetched="npm"
  fi
fi
# 2) CDN fallback
if [ -z "$fetched" ] && command -v curl >/dev/null 2>&1; then
  if curl -fsSL "https://cdn.jsdelivr.net/npm/roughjs@$VERSION/bundled/rough.js" -o "$TMP/rough.js" 2>/dev/null; then
    fetched="cdn"
  fi
fi
if [ -z "$fetched" ]; then
  echo "get-rough: could not fetch roughjs@$VERSION from npm or the CDN." >&2
  echo "Verification will still run, but drawn shapes will not render." >&2
  exit 1
fi

# The bundle declares `var rough=...`; an init script runs inside a wrapper, so
# that var never reaches window. Publish it explicitly.
{ cat "$TMP/rough.js"; printf '\n;window.rough=rough;\n'; } > "$OUT"
echo "get-rough: roughjs@$VERSION via $fetched -> $OUT ($(wc -c < "$OUT") bytes)"
