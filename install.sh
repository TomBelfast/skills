#!/bin/bash
# install.sh — install tool-specific skills from this repository.

set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"

TOOL="claude"
DST=""
BRAND_DST=""
DRY=0
FORCE=0
WITH_GSTACK=0

usage() {
  cat <<'EOF'
Usage:
  ./install.sh
  ./install.sh --tool codex
  ./install.sh --tool antigravity
  ./install.sh --with-gstack
  ./install.sh --force
  ./install.sh --dry-run

Flags:
  --tool claude|cursor|codex|gemini|antigravity
  --target <path>
  --with-gstack
  --force      Refresh existing skills from the selected pack, preserving learnings.md
  --dry-run
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --tool) TOOL="$2"; shift 2 ;;
    --target) DST="$2"; shift 2 ;;
    --with-gstack) WITH_GSTACK=1; shift ;;
    --force) FORCE=1; shift ;;
    --dry-run) DRY=1; shift ;;
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
    SRC_SKILLS="$SRC/claude/skills"
    SRC_GSTACK="$SRC/claude/gstack-skills"
    [ -z "$DST" ] && DST="$HOME/.claude/skills"
    [ -z "$BRAND_DST" ] && BRAND_DST="$HOME/.claude/brand-context"
    ;;
  cursor)
    SRC_SKILLS="$SRC/cursor/skills"
    SRC_GSTACK="$SRC/cursor/gstack-skills"
    [ -z "$DST" ] && DST="$HOME/.cursor/skills"
    [ -z "$BRAND_DST" ] && BRAND_DST="$HOME/.cursor/brand-context"
    ;;
  codex)
    SRC_SKILLS="$SRC/codex/skills"
    [ -z "$DST" ] && DST="${CODEX_HOME:-$HOME/.codex}/skills"
    [ -z "$BRAND_DST" ] && BRAND_DST="${CODEX_HOME:-$HOME/.codex}/brand-context"
    ;;
  gemini)
    SRC_SKILLS="$SRC/gemini/skills"
    [ -z "$DST" ] && DST="$HOME/.gemini/skills"
    [ -z "$BRAND_DST" ] && BRAND_DST="$HOME/.gemini/brand-context"
    ;;
  antigravity)
    SRC_SKILLS="$SRC/antigravity/skills"
    [ -z "$DST" ] && DST="$(resolve_antigravity_target)"
    [ -z "$BRAND_DST" ] && BRAND_DST="$(dirname "$DST")/brand-context"
    ;;
  *)
    echo "Unknown --tool '$TOOL'. Use: claude|cursor|codex|gemini|antigravity"
    exit 1
    ;;
esac

if [ ! -d "$SRC_SKILLS" ]; then
  echo "Missing local tool pack: $SRC_SKILLS"
  exit 1
fi

echo "Tool:   $TOOL"
echo "Target: $DST"
echo "Brand:  $BRAND_DST"
[ "$DRY" -eq 1 ] && echo "Mode:   DRY RUN"
echo ""

mkdir -p "$DST" "$BRAND_DST"

added=0
updated=0
skipped=0

install_skill() {
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

  if [ "$FORCE" -eq 1 ]; then
    if [ "$DRY" -eq 1 ]; then
      echo "[update] $name"
    else
      rsync -a --delete --exclude='learnings.md' "$src/" "$target/"
      if [ ! -f "$target/learnings.md" ] && [ -f "$src/learnings.md" ]; then
        cp "$src/learnings.md" "$target/learnings.md"
      fi
    fi
    updated=$((updated + 1))
  else
    skipped=$((skipped + 1))
  fi
}

for skill in "$SRC_SKILLS"/*/; do
  [ -d "$skill" ] || continue
  install_skill "$skill"
done

if [ "$WITH_GSTACK" -eq 1 ] && [ -n "$SRC_GSTACK" ] && [ -d "$SRC_GSTACK" ]; then
  for skill in "$SRC_GSTACK"/*/; do
    [ -d "$skill" ] || continue
    install_skill "$skill"
  done
elif [ "$WITH_GSTACK" -eq 1 ]; then
  echo "No gstack mirror is defined for tool '$TOOL'; skipping."
fi

brand_added=0
for file in "$SRC/brand-context"/*.md; do
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
echo "=== Summary ==="
echo "Added:             $added"
echo "Updated:           $updated"
echo "Skipped:           $skipped"
echo "Brand templates:   $brand_added added"
echo ""
echo "Done. Target: $DST"
