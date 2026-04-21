---
name: index
description: Generate comprehensive project documentation and knowledge base with intelligent organization
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# /sc:index - Project Documentation

## Triggers
- Project documentation creation and maintenance requirements
- Knowledge base generation and organization needs
- API documentation and structure analysis requirements
- Cross-referencing and navigation enhancement requests

## Usage
```
/sc:index [target] [--type docs|api|structure|readme] [--format md|json|yaml]
```

## Behavioral Flow
1. **Analyze**: Examine project structure and identify key documentation components
2. **Organize**: Apply intelligent organization patterns and cross-referencing strategies
3. **Generate**: Create comprehensive documentation with framework-specific patterns
4. **Validate**: Ensure documentation completeness and quality standards
5. **Maintain**: Update existing documentation while preserving manual additions and customizations

Key behaviors:
- Multi-persona coordination (architect, scribe, quality) based on documentation scope and complexity
- Sequential MCP integration for systematic analysis and comprehensive documentation workflows
- Context7 MCP integration for framework-specific patterns and documentation standards
- Intelligent organization with cross-referencing capabilities and automated maintenance

## MCP Integration
- **Sequential MCP**: Complex multi-step project analysis and systematic documentation generation
- **Context7 MCP**: Framework-specific documentation patterns and established standards
- **Persona Coordination**: Architect (structure), Scribe (content), Quality (validation)

## Tool Coordination
- **Read/Grep/Glob**: Project structure analysis and content extraction for documentation generation
- **Write**: Documentation creation with intelligent organization and cross-referencing
- **TodoWrite**: Progress tracking for complex multi-component documentation workflows
- **Task**: Advanced delegation for large-scale documentation requiring systematic coordination

## Key Patterns
- **Structure Analysis**: Project examination → component identification → logical organization → cross-referencing
- **Documentation Types**: API docs → Structure docs → README → Knowledge base approaches
- **Quality Validation**: Completeness assessment → accuracy verification → standard compliance → maintenance planning
- **Framework Integration**: Context7 patterns → official standards → best practices → consistency validation

## Examples

### Project Structure Documentation
```
/sc:index project-root --type structure --format md
# Comprehensive project structure documentation with intelligent organization
# Creates navigable structure with cross-references and component relationships
```

### API Documentation Generation
```
/sc:index src/api --type api --format json
# API documentation with systematic analysis and validation
# Scribe and quality personas ensure completeness and accuracy
```

### Knowledge Base Creation
```
/sc:index . --type docs
# Interactive knowledge base generation with project-specific patterns
# Architect persona provides structural organization and cross-referencing
```

## Boundaries

**Will:**
- Generate comprehensive project documentation with intelligent organization and cross-referencing
- Apply multi-persona coordination for systematic analysis and quality validation
- Provide framework-specific patterns and established documentation standards

**Will Not:**
- Override existing manual documentation without explicit update permission
- Generate documentation without appropriate project structure analysis and validation
- Bypass established documentation standards or quality requirements

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
