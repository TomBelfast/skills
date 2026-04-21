#!/bin/bash
# install.sh — Installs/updates Claude Code skills with self-learning loop pre-installed.
#
# Usage:
#   ./install.sh                       # → ~/.claude/skills (default)
#   ./install.sh --tool codex          # → ~/.codex/skills
#   ./install.sh --tool cursor         # → ~/.cursor/skills
#   ./install.sh --tool gemini         # → ~/.gemini/skills
#   ./install.sh --target /some/path   # → custom path
#   ./install.sh --with-gstack         # also copy gstack-skills/ (mirror of garrytan/gstack)
#   ./install.sh --force               # overwrite existing (WIPES local learnings.md!)
#   ./install.sh --dry-run             # preview only

set -e

SRC="$(cd "$(dirname "$0")" && pwd)"

TOOL="claude"
DST=""
BRAND_DST=""
FORCE=0
DRY=0
WITH_GSTACK=0

while [ $# -gt 0 ]; do
  case "$1" in
    --tool)      TOOL="$2"; shift 2 ;;
    --target)    DST="$2"; shift 2 ;;
    --force)     FORCE=1; shift ;;
    --dry-run)   DRY=1; shift ;;
    --with-gstack) WITH_GSTACK=1; shift ;;
    -h|--help)   sed -n '2,14p' "$0"; exit 0 ;;
    *)           echo "Unknown flag: $1"; exit 1 ;;
  esac
done

if [ -z "$DST" ]; then
  case "$TOOL" in
    claude) DST="$HOME/.claude/skills"; BRAND_DST="$HOME/.claude/brand-context" ;;
    codex)  DST="$HOME/.codex/skills";  BRAND_DST="$HOME/.codex/brand-context" ;;
    cursor) DST="$HOME/.cursor/skills"; BRAND_DST="$HOME/.cursor/brand-context" ;;
    gemini) DST="$HOME/.gemini/skills"; BRAND_DST="$HOME/.gemini/brand-context" ;;
    agent)  DST="$HOME/.agent/skills";  BRAND_DST="$HOME/.agent/brand-context" ;;
    *) echo "Unknown --tool '$TOOL'. Use: claude|codex|cursor|gemini|agent, or --target <path>"; exit 1 ;;
  esac
fi

[ -z "$BRAND_DST" ] && BRAND_DST="$(dirname "$DST")/brand-context"

echo "Target: $DST"
echo "Brand:  $BRAND_DST"
echo ""

mkdir -p "$DST" "$BRAND_DST"

added=0; skipped=0; overwritten=0

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

sync_folder "personal-skills"

if [ "$WITH_GSTACK" -eq 1 ]; then
  echo "⚠️  Copying gstack-skills/ (mirrored from github.com/garrytan/gstack)."
  echo "   Canonical install (recommended for Claude):"
  echo "   git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup"
  sync_folder "gstack-skills"
fi

# brand-context — never overwrite (user's filled-in templates must survive)
for f in "$SRC/brand-context"/*.md; do
  name=$(basename "$f")
  target="$BRAND_DST/$name"
  if [ ! -f "$target" ]; then
    [ "$DRY" -eq 1 ] && echo "[would add brand-context] $name" || cp "$f" "$target"
  fi
done

echo ""
echo "=== Summary ==="
echo "Added:       $added"
echo "Skipped:     $skipped  (already present — rerun with --force to overwrite, but that wipes local learnings.md)"
echo "Overwritten: $overwritten"
echo ""
echo "Next: fill in $BRAND_DST/*.md with your voice, ICP, and positioning."
