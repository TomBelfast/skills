# gstack-skills/

**These skills are NOT mine. They are mirrored from the [gstack](https://github.com/garrytan/gstack) project (© garrytan).**

They are included here as a backup/reference copy — with the self-learning loop (Pre-Run Checklist + learnings.md + Feedback Loop) layered on top for personal use.

## Canonical install

On a fresh Claude, install gstack via its own mechanism — **don't copy from here**:

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
```

Then add gstack to your `CLAUDE.md` per the gstack docs.

## What was added on top

Each skill in this folder has two additions vs. upstream:
1. `## Pre-Run Checklist` block inserted after frontmatter — loads `learnings.md` + `../brand-context/*.md` before Step 1
2. `learnings.md` file — personal self-learning log (gstack's own `gstack-learnings-log` is untouched and still works)

**Do not push these back upstream.** They are personalizations.

## Skills

32 skills — `autoplan`, `benchmark`, `browse`, `canary`, `careful`, `checkpoint`, `codex`, `connect-chrome`, `cso`, `design-consultation`, `design-html`, `design-review`, `design-shotgun`, `devex-review`, `document-release`, `freeze`, `gstack-upgrade`, `guard`, `investigate`, `land-and-deploy`, `learn`, `office-hours`, `plan-ceo-review`, `plan-design-review`, `plan-devex-review`, `plan-eng-review`, `qa`, `qa-only`, `retro`, `review`, `setup-browser-cookies`, `setup-deploy`, `ship`, `unfreeze` (and others).
