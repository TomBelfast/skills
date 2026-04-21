#!/bin/bash
# install.sh — Pulls personal Claude Code skills with self-learning loop pre-installed.
# Usage:
#   ./install.sh                     # copies personal-skills into ~/.claude/skills
#   ./install.sh --with-gstack       # also copies gstack-skills/ (mirrored from garrytan/gstack)
#   ./install.sh --force             # overwrites existing skills (wipes local learnings.md)
#   ./install.sh --dry-run           # shows what would happen

set -e

SRC="$(cd "$(dirname "$0")" && pwd)"
DST="$HOME/.claude/skills"
BRAND_DST="$HOME/.claude/brand-context"

FORCE=0
DRY=0
WITH_GSTACK=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --dry-run) DRY=1 ;;
    --with-gstack) WITH_GSTACK=1 ;;
    -h|--help) sed -n '2,7p' "$0"; exit 0 ;;
  esac
done

mkdir -p "$DST" "$BRAND_DST"

sync_folder() {
  local folder="$1"
  for d in "$SRC/$folder"/*/; do
    [ -d "$d" ] || continue
    local name=$(basename "$d")
    local target="$DST/$name"
    if [ -d "$target" ]; then
      if [ "$FORCE" -eq 1 ]; then
        [ "$DRY" -eq 1 ] && echo "[would overwrite] $folder/$name" || { rm -rf "$target"; cp -a "$d" "$target"; }
        overwritten=$((overwritten+1))
      else
        skipped=$((skipped+1))
      fi
    else
      [ "$DRY" -eq 1 ] && echo "[would add] $folder/$name" || cp -a "$d" "$target"
      added=$((added+1))
    fi
  done
}

added=0; skipped=0; overwritten=0
sync_folder "personal-skills"

if [ "$WITH_GSTACK" -eq 1 ]; then
  echo "⚠️  Copying gstack-skills/ — these are mirrored from github.com/garrytan/gstack."
  echo "    Prefer canonical install: git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup"
  sync_folder "gstack-skills"
fi

# brand-context — never overwrite existing (user's edits must survive)
for f in "$SRC/brand-context"/*.md; do
  name=$(basename "$f")
  target="$BRAND_DST/$name"
  if [ ! -f "$target" ]; then
    [ "$DRY" -eq 1 ] && echo "[would add brand-context] $name" || cp "$f" "$target"
  fi
done

echo ""
echo "=== Install summary ==="
echo "Added:       $added"
echo "Skipped:     $skipped  (already present — use --force to overwrite)"
echo "Overwritten: $overwritten"
echo ""
echo "Next: fill in ~/.claude/brand-context/*.md with your voice, ICP, and positioning."
