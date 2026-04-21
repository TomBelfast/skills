---
name: check
description: Invoke after any implementation task completes or before merging. Reviews the diff, auto-fixes safe issues, runs specialist security and architecture reviewers on large diffs. Not for exploring ideas or debugging.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# Check: Review Before You Ship

Read the diff, find the problems, fix what can be fixed safely, ask about the rest. Do not claim done until verification has run in this session.

## Get the Diff

```bash
git fetch origin
git diff origin/main
```

If the base branch is not `main`, ask before running. Already on the base branch? Stop and ask which commits to review.

## Scope the Review

Count the diff and classify depth. This determines which reviewers activate.

```bash
git diff origin/main --stat | tail -1
```

| Depth | Criteria | Reviewers |
|-------|----------|-----------|
| **Quick** | Under 100 lines, 1-5 files | Base review only (this skill) |
| **Standard** | 100-500 lines, or 6-10 files | Base + conditional specialists |
| **Deep** | 500+ lines, or 10+ files, or touches auth/payments/data mutation | Base + all relevant specialists + adversarial pass |

State the depth before proceeding. If the diff is Quick, skip to "Did We Build What Was Asked?" and run the standard single-pass flow. If Standard or Deep, continue to "Specialist Review" after completing the standard flow.

## Did We Build What Was Asked?

Before reading the code, check for scope drift:
- Pull up recent commit messages and any task files
- Does the diff match the stated goal? Flag anything outside that scope: unrelated files, voluntary additions, missing requirements
- Label it: **on target** / **drift** / **incomplete** and note it, but do not block on it

## What to Look For

### Hard stops (fix before merging)

These are not negotiable:

- **Destructive auto-execution**: any task flagged as "safe" or "auto-run" that modifies user-visible state (history files, config files, stored preferences, installed software, cache entries the user can inspect) must require explicit confirmation. "Safe" means no side effects, not "probably harmless." If a task deletes or rewrites something the user can see, it is not safe by default.
- **Release artifacts missing**: a GitHub release with an empty body, missing assets, or unuploaded build files is not a completed release. Verify every artifact listed in the release template exists as a local file and has been uploaded before declaring done.
- **Translated file naming collision**: when placing a file in a language-specific directory (e.g., `_posts_en/`, `en/`), the file name must not repeat the language suffix. Check the naming convention of existing files in the same directory first.

- **GitHub issue or PR number mismatch**: before commenting on, closing, or acting on a GitHub issue or PR, verify the number matches the one discussed in this session. Do not rely on memory. Run `gh issue view N` or `gh pr view N` to confirm the title matches before writing.

- **GitHub comment style**: PR review comments and issue replies must be brief (1-2 sentences), natural-sounding, and friendly. Not verbose. Not formatted like a report. Not AI-sounding. If a comment needs more than 2 sentences, it should be structured as a list, not a paragraph.

- **Injection and validation**: SQL, command, path injection; inputs that bypass validation at system entry points
- **Shared state**: unsynchronized writes, check-then-act races, missing locks
- **External trust**: output from LLMs, APIs, or user input fed into commands or queries without sanitization; credentials hardcoded or logged
- **Missing cases**: enum or match exhaustiveness; use grep on sibling values outside the diff to confirm
- **Unknown identifiers in diff**: any function, method, variable, or type name introduced in the diff that does not exist in the codebase is a hard stop. Before writing or approving a reference to an identifier, grep for it: `grep -r "identifier_name" .` -- if it returns no results outside the diff itself, it does not exist. Do not assume the name is correct from memory.

- **Dependency changes**: unexpected additions or version bumps in `package.json`, `Cargo.toml`, `go.mod`, or `requirements.txt`. Flag any new dependency not obviously required by the diff.

### Soft signals (flag, do not block)

Worth noting but not merge-blocking:

- Side effects that are not obvious from the function signature
- Magic literals that should be named constants
- Dead code, stale comments, style gaps relative to the surrounding code
- Untested new paths
- Loop queries, missing indexes, unbounded growth

## Specialist Review (Standard and Deep only)

Load `references/persona-catalog.md` to determine which specialists activate for this diff.

For each specialist that activates: launch it via the Agent tool, passing the full diff and the relevant agent prompt from `agents/`. Run all activated specialists in parallel.

After all agents complete, merge findings:
- Deduplicate: if two specialists flag the same file and line, keep the more severe finding and note the agreement
- Cross-reviewer agreement on the same issue raises its priority

Then proceed to Autofix Routing before presenting findings.

## Autofix Routing

Classify each finding from the standard review and specialists:

| Class | Definition | Action |
|-------|------------|--------|
| `safe_auto` | Unambiguous, risk-free: typos, missing imports, style inconsistencies | Apply immediately |
| `gated_auto` | Likely correct but changes behavior: null checks on new paths, error handling additions | Batch into one AskUserQuestion |
| `manual` | Requires judgment: architecture, behavior changes, security tradeoffs | Present in sign-off |
| `advisory` | Informational, no code change warranted | Note in sign-off |

Apply all `safe_auto` fixes before presenting anything. Batch all `gated_auto` items into one confirmation block. Never ask separately about each one.

## Adversarial Pass (Deep only)

After all findings are collected, run one focused adversarial pass. Ask: "If I were trying to break this system through this specific diff, what would I exploit?"

Four angles to check (load `references/persona-catalog.md` for detail):
1. **Assumption violation** -- what does this code assume is always true, and what breaks when it is not?
2. **Composition failures** -- what breaks when this new code runs concurrently with the rest of the system?
3. **Cascade construction** -- what sequence of valid operations leads to an invalid state?
4. **Abuse cases** -- what happens on the 1000th request, during a deploy, or with concurrent mutations?

Suppress adversarial findings below 0.60 confidence. Only file findings with a concrete scenario.

## How to Handle Findings

Fix directly when the correct answer is unambiguous: clear bugs, null checks on crash paths, style inconsistencies matching the surrounding code, trivial test additions.

Batch everything else into a single AskUserQuestion when the fix involves behavior changes, architectural choices, or anything where "right" depends on intent:

```
[N items need a decision]

1. [hard stop / signal] What: ... Suggested fix: ... Keep / Skip?
2. ...
```

## GitHub Operations

Use `gh` CLI for all GitHub interactions. If `gh` is not installed, run `brew install gh && gh auth login` (or guide the user through their platform's install).

```bash
# Before commenting or closing issues, verify the number
gh issue view 123 --json title,state --jq '.title'

# Before merging, check CI status
gh pr checks

# Create PR with structured body
gh pr create --title "..." --body "..."

# Review PR diff
gh pr diff 123

# Leave a comment (keep it 1-2 sentences, natural tone)
gh pr comment 123 --body "Looks good, one small fix applied."
```

Do not use the GitHub MCP or raw API when `gh` can do the same thing. `gh` handles auth, pagination, and error messages cleanly.

## Judgment Quality

Beyond correctness, ask three questions a senior reviewer would ask:

- **Right problem?** Does the diff solve what was actually needed, or a slightly different version of it? A technically correct solution to the wrong problem is a bug with extra steps.
- **Mature approach?** Is the implementation idiomatic for this codebase and language, or does it introduce a pattern that will confuse the next person? Clever code that nobody else can maintain is a liability.
- **Honest edge cases?** Does the code handle failure modes and boundary conditions explicitly, or does it silently succeed in the happy path and silently corrupt in the others? Check what happens on nil, empty, zero, concurrent access, and upstream failure.

These do not block a merge on their own, but a "no" on any of them is worth flagging explicitly.

## Regression Coverage

For every new code path: trace it, check if a test covers it. If this change fixes a bug, a test that fails on the old code must exist before this is done.

## Verification

After all fixes are applied, run `scripts/verify.sh` from this skill via `CLAUDE_SKILL_DIR`, or the project's known verification command:

```bash
bash "$CLAUDE_SKILL_DIR/scripts/verify.sh"
```

If nothing is detected, ask the user for the verification command before proceeding.

Paste the full output. Report exact numbers. Done means: the command ran in this session and passed.

If no verification command exists or the command fails: halt. Do not claim done. Ask the user how to verify before proceeding.

If any of these phrases appear in your reasoning, stop and run the verification command before continuing:

- "should work now" / "should be fine"
- "probably correct" / "probably fixed"
- "seems to be working" / "appears to work"
- "I'm confident" / "clearly fixed"
- "trivial change, no need to verify"

These are rationalization patterns, not evidence. Verification ran and passed = done. Everything else = not done.

## Gotchas

Real failures from prior sessions, in order of frequency:

- **Commented on the wrong issue.** Left a comment on #249 when the conversation was about #255. Run `gh issue view N` or `gh pr view N` to confirm title before commenting or closing.
- **PR comments sounded like a report.** User had to iterate multiple times on comment tone. GitHub comments should be 1-2 sentences, natural, like a colleague, not a structured review output.
- **Announced release done before uploading artifacts.** Pushed the GitHub release with no .dmg/.zip/.sha256 attached. Verify every artifact listed in the release template exists as a local file and has been uploaded.
- **Language suffix doubled.** Placed `article.en.md` inside `_posts_en/`, generating a duplicate URL. Check the naming convention of existing files in the target directory first.
- **Skipped verification on "trivial" changes.** "It's a one-line fix" is how trivial changes break things. If the urge to skip arises, run `scripts/verify.sh` anyway.
- **Deployed without env vars.** Pushed to Vercel while API keys only existed in local `.env.local`. Site returned 401 on every request. Run `vercel env ls` or equivalent and diff against local keys before deploying.
- **Git push failed from auth mismatch.** Two failed pushes before discovering remote was HTTPS but local expected SSH. Run `git remote -v` and verify auth method before the first push in a new project.

## Sign-off

```
files changed:    N (+X -Y)
scope:            on target / drift: [what]
review depth:     quick / standard / deep
hard stops:       N found, N fixed, N deferred
signals:          N noted
specialists:      [security, architecture] or none
new tests:        N
verification:     [command] -> pass / fail
```

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
