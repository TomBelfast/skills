---
name: save
description: Session lifecycle management with Serena MCP integration for session context persistence
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# /sc:save - Session Context Persistence

## Triggers
- Session completion and project context persistence needs
- Cross-session memory management and checkpoint creation requests
- Project understanding preservation and discovery archival scenarios
- Session lifecycle management and progress tracking requirements

## Usage
```
/sc:save [--type session|learnings|context|all] [--summarize] [--checkpoint]
```

## Behavioral Flow
1. **Analyze**: Examine session progress and identify discoveries worth preserving
2. **Persist**: Save session context and learnings using Serena MCP memory management
3. **Checkpoint**: Create recovery points for complex sessions and progress tracking
4. **Validate**: Ensure session data integrity and cross-session compatibility
5. **Prepare**: Ready session context for seamless continuation in future sessions

Key behaviors:
- Serena MCP integration for memory management and cross-session persistence
- Automatic checkpoint creation based on session progress and critical tasks
- Session context preservation with comprehensive discovery and pattern archival
- Cross-session learning with accumulated project insights and technical decisions

## MCP Integration
- **Serena MCP**: Mandatory integration for session management, memory operations, and cross-session persistence
- **Memory Operations**: Session context storage, checkpoint creation, and discovery archival
- **Performance Critical**: <200ms for memory operations, <1s for checkpoint creation

## Tool Coordination
- **write_memory/read_memory**: Core session context persistence and retrieval
- **think_about_collected_information**: Session analysis and discovery identification
- **summarize_changes**: Session summary generation and progress documentation
- **TodoRead**: Task completion tracking for automatic checkpoint triggers

## Key Patterns
- **Session Preservation**: Discovery analysis → memory persistence → checkpoint creation
- **Cross-Session Learning**: Context accumulation → pattern archival → enhanced project understanding
- **Progress Tracking**: Task completion → automatic checkpoints → session continuity
- **Recovery Planning**: State preservation → checkpoint validation → restoration readiness

## Examples

### Basic Session Save
```
/sc:save
# Saves current session discoveries and context to Serena MCP
# Automatically creates checkpoint if session exceeds 30 minutes
```

### Comprehensive Session Checkpoint
```
/sc:save --type all --checkpoint
# Complete session preservation with recovery checkpoint
# Includes all learnings, context, and progress for session restoration
```

### Session Summary Generation
```
/sc:save --summarize
# Creates session summary with discovery documentation
# Updates cross-session learning patterns and project insights
```

### Discovery-Only Persistence
```
/sc:save --type learnings
# Saves only new patterns and insights discovered during session
# Updates project understanding without full session preservation
```

## Boundaries

**Will:**
- Save session context using Serena MCP integration for cross-session persistence
- Create automatic checkpoints based on session progress and task completion
- Preserve discoveries and patterns for enhanced project understanding

**Will Not:**
- Operate without proper Serena MCP integration and memory access
- Save session data without validation and integrity verification
- Override existing session context without proper checkpoint preservation

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
