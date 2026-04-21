#!/bin/bash
# sync.sh — One-shot skills sync from TomBelfast/skills.
#
# Force-updates existing skills to the latest repo version.
# Preserves local learnings.md (per-skill learning history).
# Preserves local brand-context/*.md (user-filled templates).
# Adds skills missing locally.
#
# Usage (paste directly into a terminal or Claude Code session):
#   bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh)
#   bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --tool codex
#   bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --no-gstack
#   bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/sync.sh) --dry-run
#
# Flags:
#   --tool claude|codex|cursor|gemini|agent   Target AI tool (default: claude)
#   --target <path>                            Custom target skills dir
#   --no-gstack                                Skip gstack-skills/ folder
#   --dry-run                                  Preview without writing

set -e

REPO="https://github.com/TomBelfast/skills.git"
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

TOOL="claude"
DST=""
BRAND_DST=""
DRY=0
WITH_GSTACK=1

while [ $# -gt 0 ]; do
  case "$1" in
    --tool)       TOOL="$2"; shift 2 ;;
    --target)     DST="$2"; shift 2 ;;
    --dry-run)    DRY=1; shift ;;
    --no-gstack)  WITH_GSTACK=0; shift ;;
    -h|--help)    sed -n '2,22p' "$0"; exit 0 ;;
    *)            echo "Unknown flag: $1 (use --help)"; exit 1 ;;
  esac
done

if [ -z "$DST" ]; then
  case "$TOOL" in
    claude) DST="$HOME/.claude/skills";  BRAND_DST="$HOME/.claude/brand-context" ;;
    codex)  DST="$HOME/.codex/skills";   BRAND_DST="$HOME/.codex/brand-context" ;;
    cursor) DST="$HOME/.cursor/skills";  BRAND_DST="$HOME/.cursor/brand-context" ;;
    gemini) DST="$HOME/.gemini/skills";  BRAND_DST="$HOME/.gemini/brand-context" ;;
    agent)  DST="$HOME/.agent/skills";   BRAND_DST="$HOME/.agent/brand-context" ;;
    *) echo "Unknown --tool '$TOOL'. Use: claude|codex|cursor|gemini|agent"; exit 1 ;;
  esac
fi
[ -z "$BRAND_DST" ] && BRAND_DST="$(dirname "$DST")/brand-context"

echo "🔄 Syncing skills from $REPO"
echo "   Target: $DST"
echo "   Brand:  $BRAND_DST"
[ "$DRY" -eq 1 ] && echo "   DRY RUN — no changes will be written"
echo ""

git clone --depth=1 --quiet "$REPO" "$TMPDIR/repo"
mkdir -p "$DST" "$BRAND_DST"

added=0; updated=0; unchanged=0

sync_skill() {
  local src="$1"
  local name
  name=$(basename "$src")
  local target="$DST/$name"

  if [ ! -d "$target" ]; then
    if [ "$DRY" -eq 1 ]; then
      echo "[add]    $name"
    else
      mkdir -p "$target"
      rsync -a "$src/" "$target/"
    fi
    added=$((added+1))
    return
  fi

  # compare ignoring learnings.md (which is personal, preserved across updates)
  if diff -rq --brief --exclude='learnings.md' "$src" "$target" > /dev/null 2>&1; then
    unchanged=$((unchanged+1))
    return
  fi

  if [ "$DRY" -eq 1 ]; then
    echo "[update] $name"
  else
    rsync -a --delete --exclude='learnings.md' "$src/" "$target/"
    # bootstrap learnings.md from repo template if local doesn't have one yet
    if [ ! -f "$target/learnings.md" ] && [ -f "$src/learnings.md" ]; then
      cp "$src/learnings.md" "$target/learnings.md"
    fi
  fi
  updated=$((updated+1))
}

for d in "$TMPDIR/repo/personal-skills"/*/; do
  [ -d "$d" ] || continue
  sync_skill "$d"
done

if [ "$WITH_GSTACK" -eq 1 ] && [ -d "$TMPDIR/repo/gstack-skills" ]; then
  for d in "$TMPDIR/repo/gstack-skills"/*/; do
    [ -d "$d" ] || continue
    sync_skill "$d"
  done
fi

# brand-context: only add if missing (user edits must survive)
brand_added=0
for f in "$TMPDIR/repo/brand-context"/*.md; do
  [ -f "$f" ] || continue
  bname=$(basename "$f")
  btarget="$BRAND_DST/$bname"
  if [ ! -f "$btarget" ]; then
    [ "$DRY" -eq 1 ] && echo "[brand]  $bname" || cp "$f" "$btarget"
    brand_added=$((brand_added+1))
  fi
done

echo ""
echo "=== Sync summary ==="
echo "Added (new):       $added"
echo "Updated:           $updated  (SKILL.md & files refreshed, learnings.md preserved)"
echo "Unchanged:         $unchanged"
echo "Brand templates:   $brand_added added"
echo ""
echo "Done. Target: $DST"
