---
name: ln-513-regression-checker
description: Worker that runs existing tests to catch regressions. Auto-detects framework, reports pass/fail. No status changes or task creation.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# Regression Checker

Runs the existing test suite to ensure no regressions after implementation changes.

## Purpose & Scope
- Detect test framework (pytest/jest/vitest/go test/etc.) and test dirs.
- Execute full suite; capture results for Story quality gate.
- Return PASS/FAIL with counts/log excerpts; never modifies Linear or kanban.

## When to Use
- **Invoked by ln-510-quality-coordinator** Pass 1 (after ln-511 and ln-512)
- Code quality check passed

## Workflow (concise)
1) Auto-discover framework and test locations from repo config/files.
2) **Read `docs/project/runbook.md`** — get exact test commands, Docker setup, environment variables. Use commands from runbook, NOT guessed commands.
3) Build appropriate test command; run with timeout (~5m); capture stdout/stderr.
4) Parse results: passed/failed counts; key failing tests.
5) Output verdict JSON (PASS or FAIL + failures list) and add Linear comment.

## Critical Rules
- No selective test runs; run full suite.
- Do not fix tests or change status; only report.
- Language preservation in comment (EN/RU).

## Definition of Done
- Framework detected; command executed.
- Results parsed; verdict produced with failing tests (if any).
- Linear comment posted with summary.

## Reference Files
- Risk-based limits used downstream: `../shared/resources/risk_based_testing_guide.md`

---
**Version:** 3.1.0
**Last Updated:** 2026-01-09

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
