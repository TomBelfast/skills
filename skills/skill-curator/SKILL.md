---
name: skill-curator
description: Use when maintaining a growing skill library, reviewing stale or overlapping skills, deciding what to keep, pin, improve, consolidate, archive, or restore, or running local skill lifecycle reports.
---

# Skill Curator

## Overview

Maintain the skill library without losing useful work. This skill adapts the Hermes Agent curator pattern: usage telemetry, pinned skills, stale/archive candidates, dry-run reports, and recoverable archival.

The local implementation is `tools/skill_curator.py`.

## Invariants

- Run a dry report before any lifecycle action.
- Never delete skills automatically.
- Archive only after a report identifies candidates and a backup exists.
- Respect pinned skills; pinned skills are excluded from stale/archive transitions.
- Treat generated reports as audit evidence.
- Keep operational state under `.skill-lab/curator/`, not in `SKILL.md`.

## Commands

```bash
python tools/skill_curator.py status
python tools/skill_curator.py run
python tools/skill_curator.py run --apply
python tools/skill_curator.py pin paid-ai-niche-discovery
python tools/skill_curator.py unpin paid-ai-niche-discovery
python tools/skill_curator.py mark-used paid-ai-niche-discovery
```

`run` without `--apply` writes a dry-run report and does not archive anything.

## Review Workflow

1. Run `status` to inspect the current library.
2. Pin strategic skills before a curator pass.
3. Run `run` and read `.skill-lab/curator/reports/*/REPORT.md`.
4. Improve or consolidate weak skills manually when they are still useful.
5. Use `run --apply` only when archive candidates are clearly obsolete.
6. Restore archived skills manually from `.skill-lab/curator/archive/` if needed.

## Curator Decisions

| Decision | Use When |
| --- | --- |
| Keep | Skill is active, useful, and distinct |
| Pin | Skill is strategic or manually curated |
| Improve | Skill is useful but unclear, stale, or missing tests |
| Consolidate | Two skills overlap and one can absorb the other |
| Archive | Skill is stale, unpinned, obsolete, and recoverable |

## Common Mistakes

- Running archival before reading the dry-run report.
- Treating archive as deletion.
- Letting many near-duplicate skills stay active because none are individually broken.
- Storing telemetry in frontmatter instead of the sidecar.
- Forgetting to pin strategic skills before a broad cleanup pass.
