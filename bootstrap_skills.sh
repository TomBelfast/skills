#!/bin/bash
# bootstrap_skills.sh — Per-project skill manager.
#
# Reads .skills.conf from current directory to determine which skills to pull.
# If .skills.conf doesn't exist, creates a default one.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/bootstrap_skills.sh | bash
#   # or locally:
#   bash bootstrap_skills.sh
#
# Flags:
#   --tool claude|codex|cursor|gemini|agent   Target AI tool (default: agent)
#   --push                                    Also push local skills not on GitHub
#   --dry-run                                 Preview only

set -e

REPO="https://github.com/TomBelfast/skills.git"
INJECT_URL="https://raw.githubusercontent.com/TomBelfast/skills/main/inject_autocorrect.py"
SKILLS_CONF=".skills.conf"
TOOL="agent"
DRY=0
PUSH=0
TMPDIR_REPO=$(mktemp -d)
trap 'rm -rf "$TMPDIR_REPO"' EXIT

while [ $# -gt 0 ]; do
  case "$1" in
    --tool)    TOOL="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    --push)    PUSH=1; shift ;;
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
    *) echo "Unknown flag: $1"; exit 1 ;;
  esac
done

# Determine destination
case "$TOOL" in
  claude) DST="$HOME/.claude/skills" ;;
  codex)  DST="$HOME/.codex/skills" ;;
  cursor) DST="$HOME/.cursor/skills" ;;
  gemini) DST="$HOME/.gemini/skills" ;;
  agent)  DST="$HOME/.agents/skills" ;;
  *) echo "Unknown --tool '$TOOL'. Use: claude|codex|cursor|gemini|agent"; exit 1 ;;
esac

# Create default .skills.conf if missing
if [ ! -f "$SKILLS_CONF" ]; then
  echo "📝 No .skills.conf found. Creating default..."
  cat > "$SKILLS_CONF" << 'EOF'
# .skills.conf — Project-specific skill list
# List one skill name per line (must match folder names in TomBelfast/skills/personal-skills/)
# Lines starting with # are comments.
# Leave empty to sync ALL available skills.
#
# Examples:
#   coolify-manager
#   proxmox-full
#   github-docker-vm1070
#   karpathy-guidelines
#   skill-creator
EOF
  echo "   Created .skills.conf — edit it to specify which skills this project needs."
  echo "   Run this script again after editing."
  exit 0
fi

# Read skills from conf (ignore comments and empty lines)
SELECTED_SKILLS=()
while IFS= read -r line; do
  line="${line%%#*}"   # strip inline comments
  line="${line//[$'\t\r\n ']}"  # trim whitespace
  [ -n "$line" ] && SELECTED_SKILLS+=("$line")
done < "$SKILLS_CONF"

echo "🎯 Project skill bootstrap"
echo "   Config:  $(pwd)/$SKILLS_CONF"
echo "   Target:  $DST"
echo "   Skills:  ${#SELECTED_SKILLS[@]} selected"
[ "${#SELECTED_SKILLS[@]}" -eq 0 ] && echo "           (none listed = will sync ALL)"
[ "$DRY" -eq 1 ] && echo "   DRY RUN"
echo ""

mkdir -p "$DST"
echo "⬇️  Cloning remote repo..."
git clone --depth=1 --quiet "$REPO" "$TMPDIR_REPO/repo"
REMOTE_SKILLS="$TMPDIR_REPO/repo/personal-skills"

added=0; updated=0; unchanged=0

sync_skill() {
  local src="$1"
  local name
  name=$(basename "$src")
  local target="$DST/$name"

  if [ ! -d "$target" ]; then
    [ "$DRY" -eq 1 ] && echo "  [would add]    $name" || { cp -a "$src" "$target"; echo "  [add]    $name"; }
    added=$((added + 1))
  elif diff -rq --exclude='learnings.md' "$src" "$target" > /dev/null 2>&1; then
    unchanged=$((unchanged + 1))
  else
    [ "$DRY" -eq 1 ] && echo "  [would update] $name" || { rsync -a --delete --exclude='learnings.md' "$src/" "$target/"; echo "  [update] $name"; }
    updated=$((updated + 1))
  fi
}

# Sync selected skills (or all if none specified)
if [ "${#SELECTED_SKILLS[@]}" -eq 0 ]; then
  for d in "$REMOTE_SKILLS"/*/; do
    [ -d "$d" ] || continue
    sync_skill "$d"
  done
else
  for skill in "${SELECTED_SKILLS[@]}"; do
    src="$REMOTE_SKILLS/$skill"
    if [ -d "$src" ]; then
      sync_skill "$src"
    else
      echo "  [missing] $skill — not found on GitHub, skipping."
    fi
  done
fi

# Push local skills not on GitHub (if --push)
if [ "$PUSH" -eq 1 ] && [ "$DRY" -eq 0 ]; then
  echo ""
  echo "⬆️  Checking for local skills to push..."
  pushed=0
  for skill_dir in "$DST"/*/; do
    [ -d "$skill_dir" ] || continue
    name=$(basename "$skill_dir")
    if [ ! -d "$REMOTE_SKILLS/$name" ]; then
      echo "  [push]   $name (new — not on GitHub)"
      cp -a "$skill_dir" "$REMOTE_SKILLS/$name"
      pushed=$((pushed + 1))
    fi
  done

  if [ "$pushed" -gt 0 ]; then
    TMP_INJECT=$(mktemp /tmp/inject_autocorrect.XXXXXX.py)
    curl -fsSL "$INJECT_URL" -o "$TMP_INJECT" 2>/dev/null && python3 "$TMP_INJECT" "$REMOTE_SKILLS"
    rm -f "$TMP_INJECT"

    cd "$TMPDIR_REPO/repo"
    git config user.email "agent@antigravity.local"
    git config user.name "Antigravity Agent"
    git add -A
    git diff --cached --quiet || git commit -m "feat: push local skills from $(hostname) [$(date '+%Y-%m-%d')]" && git push origin main
    cd - > /dev/null
    echo "  ✅ Pushed $pushed skill(s) to GitHub"
  else
    echo "  All local skills already on GitHub."
  fi
fi

# Inject Auto-Correction Rules
if [ "$DRY" -eq 0 ] && command -v python3 &>/dev/null; then
  echo ""
  echo "🤖 Injecting Auto-Correction Rules..."
  TMP_INJECT=$(mktemp /tmp/inject_autocorrect.XXXXXX.py)
  curl -fsSL "$INJECT_URL" -o "$TMP_INJECT" 2>/dev/null && python3 "$TMP_INJECT" "$DST"
  rm -f "$TMP_INJECT"
fi

echo ""
echo "=== Summary ==="
echo "Added:     $added"
echo "Updated:   $updated"
echo "Unchanged: $unchanged"
echo ""
echo "✅ Skills ready at: $DST"
echo ""
echo "💡 TIP: Add .skills.conf to your repo's git to share project skill requirements with your team."
