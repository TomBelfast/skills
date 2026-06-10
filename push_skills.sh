#!/bin/bash
# push_skills.sh — Push local skills that don't exist on GitHub (TomBelfast/skills)
#
# Usage:
#   ./push_skills.sh --local ~/.agents/skills
#   ./push_skills.sh --local ~/.claude/skills --dry-run
#
# Flags:
#   --local <path>   Path to local skills directory (REQUIRED)
#   --dry-run        Preview only, no changes
#   --force          Overwrite skills that already exist on GitHub
#
# How it works:
#   1. Clones TomBelfast/skills repo to a temp dir
#   2. Compares local skill folders against personal-skills/ in the repo
#   3. Copies missing skills into personal-skills/ in the repo clone
#   4. Runs inject_autocorrect.py on new skills
#   5. Commits and pushes back to GitHub

set -e

REPO="https://github.com/TomBelfast/skills.git"
INJECT_URL="https://raw.githubusercontent.com/TomBelfast/skills/main/inject_autocorrect.py"
LOCAL=""
DRY=0
FORCE=0
TMPDIR_REPO=$(mktemp -d)
trap 'rm -rf "$TMPDIR_REPO"' EXIT

while [ $# -gt 0 ]; do
  case "$1" in
    --local)   LOCAL="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    --force)   FORCE=1; shift ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "Unknown flag: $1"; exit 1 ;;
  esac
done

if [ -z "$LOCAL" ]; then
  echo "Error: --local <path> is required."
  echo "Example: ./push_skills.sh --local ~/.agents/skills"
  exit 1
fi

if [ ! -d "$LOCAL" ]; then
  echo "Error: Local skills directory '$LOCAL' does not exist."
  exit 1
fi

echo "📂 Local skills:  $LOCAL"
echo "🌍 Remote repo:   $REPO"
[ "$DRY" -eq 1 ] && echo "   DRY RUN — no changes will be pushed"
echo ""

echo "⬇️  Cloning remote repo..."
git clone --depth=1 --quiet "$REPO" "$TMPDIR_REPO/repo"

REMOTE_SKILLS="$TMPDIR_REPO/repo/personal-skills"
added=0; skipped=0

for skill_dir in "$LOCAL"/*/; do
  [ -d "$skill_dir" ] || continue
  name=$(basename "$skill_dir")
  remote_target="$REMOTE_SKILLS/$name"

  if [ -d "$remote_target" ] && [ "$FORCE" -eq 0 ]; then
    echo "  [skip]   $name (already on GitHub — use --force to overwrite)"
    skipped=$((skipped + 1))
    continue
  fi

  if [ "$DRY" -eq 1 ]; then
    echo "  [would push] $name"
    added=$((added + 1))
    continue
  fi

  echo "  [push]   $name"
  rm -rf "$remote_target"
  cp -a "$skill_dir" "$remote_target"
  added=$((added + 1))
done

if [ "$DRY" -eq 1 ]; then
  echo ""
  echo "=== Dry-run summary ==="
  echo "Would push: $added"
  echo "Skipped:    $skipped"
  exit 0
fi

if [ "$added" -eq 0 ]; then
  echo ""
  echo "✅ Nothing new to push. All local skills are already on GitHub."
  exit 0
fi

# Inject Auto-Correction Rules into newly added skills
if command -v python3 &>/dev/null; then
  echo ""
  echo "🤖 Injecting Auto-Correction Rules..."
  TMP_INJECT=$(mktemp /tmp/inject_autocorrect.XXXXXX.py)
  if curl -fsSL "$INJECT_URL" -o "$TMP_INJECT" 2>/dev/null; then
    python3 "$TMP_INJECT" "$REMOTE_SKILLS"
  fi
  rm -f "$TMP_INJECT"
fi

# Commit and push
cd "$TMPDIR_REPO/repo"
git config user.email "agent@antigravity.local"
git config user.name "Antigravity Agent"
git add -A

if git diff --cached --quiet; then
  echo ""
  echo "✅ No changes to commit."
else
  git commit -m "feat: push local skills from $(hostname) [$(date '+%Y-%m-%d')]"
  git push origin main
  echo ""
  echo "=== Push summary ==="
  echo "Pushed:   $added new skill(s) to GitHub"
  echo "Skipped:  $skipped (already existed)"
  echo ""
  echo "✅ Done! View at: https://github.com/TomBelfast/skills"
fi
