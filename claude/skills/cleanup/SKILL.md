---
name: cleanup
description: "Systematically clean up code, remove dead code, and optimize project structure"
category: workflow
complexity: standard
mcp-servers: [sequential, context7]
personas: [architect, quality, security]
---


## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# /sc:cleanup - Code and Project Cleanup

## Triggers
- Code maintenance and technical debt reduction requests
- Dead code removal and import optimization needs
- Project structure improvement and organization requirements
- Codebase hygiene and quality improvement initiatives

## Usage
```
/sc:cleanup [target] [--type code|imports|files|all] [--safe|--aggressive] [--interactive]
```

## Behavioral Flow
1. **Analyze**: Assess cleanup opportunities and safety considerations across target scope
2. **Plan**: Choose cleanup approach and activate relevant personas for domain expertise
3. **Execute**: Apply systematic cleanup with intelligent dead code detection and removal
4. **Validate**: Ensure no functionality loss through testing and safety verification
5. **Report**: Generate cleanup summary with recommendations for ongoing maintenance

Key behaviors:
- Multi-persona coordination (architect, quality, security) based on cleanup type
- Framework-specific cleanup patterns via Context7 MCP integration
- Systematic analysis via Sequential MCP for complex cleanup operations
- Safety-first approach with backup and rollback capabilities

## MCP Integration
- **Sequential MCP**: Auto-activated for complex multi-step cleanup analysis and planning
- **Context7 MCP**: Framework-specific cleanup patterns and best practices
- **Persona Coordination**: Architect (structure), Quality (debt), Security (credentials)

## Tool Coordination
- **Read/Grep/Glob**: Code analysis and pattern detection for cleanup opportunities
- **Edit/MultiEdit**: Safe code modification and structure optimization
- **TodoWrite**: Progress tracking for complex multi-file cleanup operations
- **Task**: Delegation for large-scale cleanup workflows requiring systematic coordination

## Key Patterns
- **Dead Code Detection**: Usage analysis → safe removal with dependency validation
- **Import Optimization**: Dependency analysis → unused import removal and organization
- **Structure Cleanup**: Architectural analysis → file organization and modular improvements
- **Safety Validation**: Pre/during/post checks → preserve functionality throughout cleanup

## Examples

### Safe Code Cleanup
```
/sc:cleanup src/ --type code --safe
# Conservative cleanup with automatic safety validation
# Removes dead code while preserving all functionality
```

### Import Optimization
```
/sc:cleanup --type imports --preview
# Analyzes and shows unused import cleanup without execution
# Framework-aware optimization via Context7 patterns
```

### Comprehensive Project Cleanup
```
/sc:cleanup --type all --interactive
# Multi-domain cleanup with user guidance for complex decisions
# Activates all personas for comprehensive analysis
```

### Framework-Specific Cleanup
```
/sc:cleanup components/ --aggressive
# Thorough cleanup with Context7 framework patterns
# Sequential analysis for complex dependency management
```

## Boundaries

**Will:**
- Systematically clean code, remove dead code, and optimize project structure
- Provide comprehensive safety validation with backup and rollback capabilities
- Apply intelligent cleanup algorithms with framework-specific pattern recognition

**Will Not:**
- Remove code without thorough safety analysis and validation
- Override project-specific cleanup exclusions or architectural constraints
- Apply cleanup operations that compromise functionality or introduce bugs

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
