---
name: git
description: Git operations with intelligent commit messages and workflow optimization
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# /sc:git - Git Operations

## Triggers
- Git repository operations: status, add, commit, push, pull, branch
- Need for intelligent commit message generation
- Repository workflow optimization requests
- Branch management and merge operations

## Usage
```
/sc:git [operation] [args] [--smart-commit] [--interactive]
```

## Behavioral Flow
1. **Analyze**: Check repository state and working directory changes
2. **Validate**: Ensure operation is appropriate for current Git context
3. **Execute**: Run Git command with intelligent automation
4. **Optimize**: Apply smart commit messages and workflow patterns
5. **Report**: Provide status and next steps guidance

Key behaviors:
- Generate conventional commit messages based on change analysis
- Apply consistent branch naming conventions
- Handle merge conflicts with guided resolution
- Provide clear status summaries and workflow recommendations

## Tool Coordination
- **Bash**: Git command execution and repository operations
- **Read**: Repository state analysis and configuration review
- **Grep**: Log parsing and status analysis
- **Write**: Commit message generation and documentation

## Key Patterns
- **Smart Commits**: Analyze changes → generate conventional commit message
- **Status Analysis**: Repository state → actionable recommendations
- **Branch Strategy**: Consistent naming and workflow enforcement
- **Error Recovery**: Conflict resolution and state restoration guidance

## Examples

### Smart Status Analysis
```
/sc:git status
# Analyzes repository state with change summary
# Provides next steps and workflow recommendations
```

### Intelligent Commit
```
/sc:git commit --smart-commit
# Generates conventional commit message from change analysis
# Applies best practices and consistent formatting
```

### Interactive Operations
```
/sc:git merge feature-branch --interactive
# Guided merge with conflict resolution assistance
```

## Boundaries

**Will:**
- Execute Git operations with intelligent automation
- Generate conventional commit messages from change analysis
- Provide workflow optimization and best practice guidance

**Will Not:**
- Modify repository configuration without explicit authorization
- Execute destructive operations without confirmation
- Handle complex merges requiring manual intervention

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
