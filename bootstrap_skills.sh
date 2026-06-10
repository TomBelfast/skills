#!/bin/bash
# bootstrap_skills.sh — Per-project skill manager with AUTO two-way sync.
#
# Reads .skills.conf from current directory to determine which skills to pull.
# If .skills.conf doesn't exist, creates a default one and exits for editing.
#
# What it does automatically (no flags needed):
#   1. PULL  — downloads selected skills from GitHub, updates any that differ
#   2. MERGE — protects local `## Pitfalls` from being overwritten
#   3. PUSH  — sends local skills that don't exist on GitHub back to the repo
#   4. INJECT — adds Auto-Correction Rules to every SKILL.md
#
# Usage:
#   bash <(curl -fsSL https://raw.githubusercontent.com/TomBelfast/skills/main/bootstrap_skills.sh)
#
# Flags:
#   --tool <name>    Target AI tool (claude|codex|cursor|gemini|agent)
#   --no-push        Skip auto-push of local-only skills
#   --dry-run        Preview only, no changes
#   --yes, -y        Skip the confirmation prompt

set -e

REPO="https://github.com/TomBelfast/skills.git"
BASE_URL="https://raw.githubusercontent.com/TomBelfast/skills/main"
SKILLS_CONF=".skills.conf"
TOOL="agent"
DRY=0
NO_PUSH=0
AUTO_CONFIRM=0
TMPDIR_REPO=$(mktemp -d)
trap 'rm -rf "$TMPDIR_REPO"' EXIT

while [ $# -gt 0 ]; do
  case "$1" in
    --tool)     TOOL="$2"; shift 2 ;;
    --dry-run)  DRY=1; shift ;;
    --no-push)  NO_PUSH=1; shift ;;
    --yes|-y)   AUTO_CONFIRM=1; shift ;;
    -h|--help)  sed -n '2,19p' "$0"; exit 0 ;;
    *) echo "Unknown flag: $1 (use --help)"; exit 1 ;;
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

# ─── Create default .skills.conf if missing ────────────────────────────────
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
  echo "   Created .skills.conf — edit it to add the skills this project needs."
  echo "   Then run this script again."
  exit 0
fi

# ─── Read .skills.conf ─────────────────────────────────────────────────────
SELECTED_SKILLS=()
while IFS= read -r line; do
  line="${line%%#*}"
  line="${line//[$'\t\r\n ']}"
  [ -n "$line" ] && SELECTED_SKILLS+=("$line")
done < "$SKILLS_CONF"

echo "🎯 Project skill bootstrap (two-way sync)"
echo "   Config:   $(pwd)/$SKILLS_CONF"
echo "   Target:   $DST"
echo "   Skills:   ${#SELECTED_SKILLS[@]} selected"
[ "${#SELECTED_SKILLS[@]}" -eq 0 ] && echo "             (none listed = will sync ALL)"
[ "$NO_PUSH" -eq 1 ] && echo "   Auto-push: disabled (--no-push)"
echo ""

mkdir -p "$DST"

# ─── Step 1: Clone remote repo & download helpers ─────────────────────────
echo "⬇️  Connecting to GitHub..."
git clone --depth=1 --quiet "$REPO" "$TMPDIR_REPO/repo"
REMOTE_SKILLS="$TMPDIR_REPO/repo/personal-skills"

TMP_INJECT=$(mktemp /tmp/inject_autocorrect.XXXXXX.py)
TMP_MERGE=$(mktemp /tmp/merge_pitfalls.XXXXXX.py)
curl -fsSL "$BASE_URL/inject_autocorrect.py" -o "$TMP_INJECT" 2>/dev/null || true
curl -fsSL "$BASE_URL/merge_pitfalls.py" -o "$TMP_MERGE" 2>/dev/null || true


# ─── Step 2: PLAN PHASE (Dry Run) ──────────────────────────────────────────
plan_add=()
plan_update=()
plan_push=()
plan_missing=()

if [ "${#SELECTED_SKILLS[@]}" -eq 0 ]; then
  for d in "$REMOTE_SKILLS"/*/; do
    [ -d "$d" ] || continue
    name=$(basename "$d")
    SELECTED_SKILLS+=("$name")
  done
fi

for skill in "${SELECTED_SKILLS[@]}"; do
  src="$REMOTE_SKILLS/$skill"
  target="$DST/$skill"
  
  if [ ! -d "$src" ]; then
    plan_missing+=("$skill")
    continue
  fi

  if [ ! -d "$target" ]; then
    plan_add+=("$skill")
  elif diff -rq --exclude='learnings.md' --exclude='.git' "$src" "$target" > /dev/null 2>&1; then
    : # unchanged
  else
    plan_update+=("$skill")
  fi
done

if [ "$NO_PUSH" -eq 0 ]; then
  for skill_dir in "$DST"/*/; do
    [ -d "$skill_dir" ] || continue
    name=$(basename "$skill_dir")
    remote_target="$REMOTE_SKILLS/$name"
    if [ ! -d "$remote_target" ]; then
      plan_push+=("$name")
    fi
  done
fi

# Print Plan
echo "📋 Synchronization Plan:"
[ ${#plan_add[@]} -gt 0 ]    && echo "  [+] Will ADD:    ${plan_add[*]}"
[ ${#plan_update[@]} -gt 0 ] && echo "  [~] Will UPDATE: ${plan_update[*]}"
[ ${#plan_push[@]} -gt 0 ]   && echo "  [^] Will PUSH:   ${plan_push[*]}"
[ ${#plan_missing[@]} -gt 0 ] && echo "  [?] Missing on GitHub (skipping): ${plan_missing[*]}"

total_changes=$((${#plan_add[@]} + ${#plan_update[@]} + ${#plan_push[@]}))

if [ "$total_changes" -eq 0 ]; then
  echo "  ✅ All skills are up to date. Nothing to do."
  exit 0
fi

if [ "$DRY" -eq 1 ]; then
  echo ""
  echo "🛑 DRY RUN complete. No changes made."
  exit 0
fi

if [ "$AUTO_CONFIRM" -eq 0 ]; then
  echo ""
  read -p "Apply these changes? [Y/n] " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ -n $REPLY ]]; then
    echo "Aborted."
    exit 0
  fi
fi

# ─── Step 3: EXECUTE PHASE ─────────────────────────────────────────────────
echo ""
echo "🚀 Applying changes..."

# PULL
for skill in "${plan_add[@]}"; do
  cp -a "$REMOTE_SKILLS/$skill" "$DST/$skill"
  echo "  [add]    $skill"
done

for skill in "${plan_update[@]}"; do
  src="$REMOTE_SKILLS/$skill"
  target="$DST/$skill"
  
  # Merge pitfalls before rsync overwrites
  if command -v python3 &>/dev/null && [ -f "$TMP_MERGE" ]; then
    python3 "$TMP_MERGE" "$target/SKILL.md" "$src/SKILL.md" 2>/dev/null || true
  fi

  rsync -a --delete --exclude='learnings.md' --exclude='.git' "$src/" "$target/"
  # keep learnings.md if it already existed locally
  [ ! -f "$target/learnings.md" ] && [ -f "$src/learnings.md" ] && cp "$src/learnings.md" "$target/learnings.md"
  echo "  [update] $skill"
done

# PUSH
if [ ${#plan_push[@]} -gt 0 ]; then
  echo ""
  echo "⬆️  Pushing local-only skills to GitHub..."
  for skill in "${plan_push[@]}"; do
    skill_dir="$DST/$skill"
    remote_target="$REMOTE_SKILLS/$skill"
    mkdir -p "$remote_target"
    rsync -a --exclude='.git' "$skill_dir/" "$remote_target/"
    echo "  [push]   $skill"
  done

  # Inject auto-correct into newly pushed skills
  if command -v python3 &>/dev/null && [ -f "$TMP_INJECT" ]; then
    python3 "$TMP_INJECT" "$REMOTE_SKILLS" 2>/dev/null || true
  fi

  cd "$TMPDIR_REPO/repo"
  git config user.email "agent@antigravity.local"
  git config user.name "Antigravity Agent"
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "feat: push local-only skills from $(hostname) [$(date '+%Y-%m-%d')]"
    git push origin main
    echo "  ✅ Pushed ${#plan_push[@]} skill(s) to GitHub"
  fi
  cd - > /dev/null
fi

# ─── Step 4: INJECT — Auto-Correction Rules ────────────────────────────────
if command -v python3 &>/dev/null && [ -f "$TMP_INJECT" ]; then
  echo ""
  echo "🤖 Checking Auto-Correction Rules..."
  python3 "$TMP_INJECT" "$DST"
fi

rm -f "$TMP_INJECT" "$TMP_MERGE"

echo ""
echo "✅ Skills synchronization complete!"
