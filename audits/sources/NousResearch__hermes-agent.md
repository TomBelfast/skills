# NousResearch/hermes-agent Curator Audit

Source: https://github.com/NousResearch/hermes-agent

Inspected local staging path: `.skill-lab/sources/NousResearch__hermes-agent`

## Curator Pattern

Hermes Agent implements curator as a background skill lifecycle system. The important transferable ideas are:

- Track skill usage in a sidecar file instead of frontmatter.
- Keep pinned skills out of automated transitions.
- Run dry-run reports before mutation.
- Archive stale skills instead of deleting them.
- Write per-run `run.json` and `REPORT.md` audit artifacts.
- Create backups before mutating the skill library.
- Separate deterministic stale/archive transitions from model-based review.

## Relevant Source Areas

- `website/docs/user-guide/features/curator.md` documents user-facing behavior.
- `agent/curator.py` implements scheduler gates, state, reports, and review orchestration.
- `agent/curator_backup.py` implements pre-run snapshots and rollback.
- `tools/skill_usage.py` implements sidecar usage telemetry and pinned state.
- `tools/skill_provenance.py` separates foreground writes from background-review writes.

## Local Adaptation

This repo implements a smaller local-first version in `tools/skill_curator.py`:

- `status` prints a lifecycle summary.
- `run` writes a dry-run report under `.skill-lab/curator/reports/`.
- `run --apply` archives only unpinned archive candidates and writes a backup first.
- `pin`, `unpin`, and `mark-used` update `.skill-lab/curator/usage.json`.

The local version does not run a background model review. It provides deterministic lifecycle evidence for human/Codex-guided maintenance.
