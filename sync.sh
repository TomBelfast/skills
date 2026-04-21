#!/bin/bash
# sync.sh — sync tool-specific skills from TomBelfast/skills.
#
# Preserves local learnings.md and brand-context/*.md.
# Refreshes existing skills to the version stored in the selected tool pack.

set -euo pipefail

REPO="https://github.com/TomBelfast/skills.git"
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

TOOL="claude"
DST=""
BRAND_DST=""
DRY=0
WITH_GSTACK=1

usage() {
  cat <<'EOF'
Usage:
  bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh)
  bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --tool codex
  bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --tool antigravity
  bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --no-gstack
  bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --dry-run

Flags:
  --tool claude|cursor|codex|gemini|antigravity
  --target <path>
  --no-gstack
  --dry-run
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --tool) TOOL="$2"; shift 2 ;;
    --target) DST="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    --no-gstack) WITH_GSTACK=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown flag: $1"; usage; exit 1 ;;
  esac
done

resolve_antigravity_target() {
  if [ -d "$HOME/.gemini/antigravity/global_skills" ]; then
    echo "$HOME/.gemini/antigravity/global_skills"
  elif [ -d "$HOME/.gemini/antigravity/skills" ]; then
    echo "$HOME/.gemini/antigravity/skills"
  else
    echo "$HOME/.gemini/antigravity/skills"
  fi
}

SRC_SKILLS=""
SRC_GSTACK=""

case "$TOOL" in
  claude)
    SRC_SKILLS="claude/skills"
    SRC_GSTACK="claude/gstack-skills"
    [ -z "$DST" ] && DST="$HOME/.claude/skills"
    [ -z "$BRAND_DST" ] && BRAND_DST="$HOME/.claude/brand-context"
    ;;
  cursor)
    SRC_SKILLS="cursor/skills"
    SRC_GSTACK="cursor/gstack-skills"
    [ -z "$DST" ] && DST="$HOME/.cursor/skills"
    [ -z "$BRAND_DST" ] && BRAND_DST="$HOME/.cursor/brand-context"
    ;;
  codex)
    SRC_SKILLS="codex/skills"
    [ -z "$DST" ] && DST="${CODEX_HOME:-$HOME/.codex}/skills"
    [ -z "$BRAND_DST" ] && BRAND_DST="${CODEX_HOME:-$HOME/.codex}/brand-context"
    ;;
  gemini)
    SRC_SKILLS="gemini/skills"
    [ -z "$DST" ] && DST="$HOME/.gemini/skills"
    [ -z "$BRAND_DST" ] && BRAND_DST="$HOME/.gemini/brand-context"
    ;;
  antigravity)
    SRC_SKILLS="antigravity/skills"
    [ -z "$DST" ] && DST="$(resolve_antigravity_target)"
    [ -z "$BRAND_DST" ] && BRAND_DST="$(dirname "$DST")/brand-context"
    ;;
  *)
    echo "Unknown --tool '$TOOL'. Use: claude|cursor|codex|gemini|antigravity"
    exit 1
    ;;
esac

echo "Syncing skills from $REPO"
echo "  Tool:   $TOOL"
echo "  Target: $DST"
echo "  Brand:  $BRAND_DST"
[ "$DRY" -eq 1 ] && echo "  Mode:   DRY RUN"
echo ""

git clone --depth=1 --quiet "$REPO" "$TMPDIR/repo"

SRC_ROOT="$TMPDIR/repo/$SRC_SKILLS"
GSTACK_ROOT="$TMPDIR/repo/$SRC_GSTACK"

if [ ! -d "$SRC_ROOT" ]; then
  echo "Missing tool pack in repo: $SRC_SKILLS"
  exit 1
fi

mkdir -p "$DST" "$BRAND_DST"

added=0
updated=0
unchanged=0

sync_skill() {
  local src="$1"
  local name target
  name=$(basename "$src")
  target="$DST/$name"

  if [ ! -d "$target" ]; then
    if [ "$DRY" -eq 1 ]; then
      echo "[add]    $name"
    else
      mkdir -p "$target"
      rsync -a "$src/" "$target/"
    fi
    added=$((added + 1))
    return
  fi

  if diff -rq --brief --exclude='learnings.md' "$src" "$target" >/dev/null 2>&1; then
    unchanged=$((unchanged + 1))
    return
  fi

  if [ "$DRY" -eq 1 ]; then
    echo "[update] $name"
  else
    rsync -a --delete --exclude='learnings.md' "$src/" "$target/"
    if [ ! -f "$target/learnings.md" ] && [ -f "$src/learnings.md" ]; then
      cp "$src/learnings.md" "$target/learnings.md"
    fi
  fi
  updated=$((updated + 1))
}

for skill in "$SRC_ROOT"/*/; do
  [ -d "$skill" ] || continue
  sync_skill "$skill"
done

if [ "$WITH_GSTACK" -eq 1 ] && [ -n "$SRC_GSTACK" ] && [ -d "$GSTACK_ROOT" ]; then
  for skill in "$GSTACK_ROOT"/*/; do
    [ -d "$skill" ] || continue
    sync_skill "$skill"
  done
fi

brand_added=0
for file in "$TMPDIR/repo/brand-context"/*.md; do
  [ -f "$file" ] || continue
  name=$(basename "$file")
  target="$BRAND_DST/$name"
  if [ ! -f "$target" ]; then
    if [ "$DRY" -eq 1 ]; then
      echo "[brand]  $name"
    else
      cp "$file" "$target"
    fi
    brand_added=$((brand_added + 1))
  fi
done

echo ""
echo "=== Sync summary ==="
echo "Added:             $added"
echo "Updated:           $updated"
echo "Unchanged:         $unchanged"
echo "Brand templates:   $brand_added added"
echo ""
echo "Done. Target: $DST"
