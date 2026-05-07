# Skill Learnings

## Non-Negotiable Rules
- Keep descriptions focused on triggering conditions, not workflow. [pattern=description-triggers; promoted=2026-04-23; count=2]

## Promotion Criteria
- Record each repeated correction as a pattern with a stable `pattern` key.
- Promote a pattern to `Non-Negotiable Rules` when it appears at least twice and the fix is still valid.
- Keep rules imperative, reusable, and focused on future behavior.

## Patterns Observed
- [2026-04-23] pattern=description-triggers skills=skill-creator,writing-skills source=test rule="Keep descriptions focused on triggering conditions, not workflow." :: Workflow-heavy descriptions caused the agent to skip the full skill instructions.

- [2026-04-23] pattern=description-triggers skills=writing-skills source=review rule="Keep descriptions focused on triggering conditions, not workflow." :: A second review found the same issue in another skill authoring pass.

## Promotion History
- [2026-04-23] pattern=description-triggers count=2 rule="Keep descriptions focused on triggering conditions, not workflow."
