---
name: explain
description: Provide clear explanations of code, concepts, and system behavior with educational clarity
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# /sc:explain - Code and Concept Explanation

## Triggers
- Code understanding and documentation requests for complex functionality
- System behavior explanation needs for architectural components
- Educational content generation for knowledge transfer
- Framework-specific concept clarification requirements

## Usage
```
/sc:explain [target] [--level basic|intermediate|advanced] [--format text|examples|interactive] [--context domain]
```

## Behavioral Flow
1. **Analyze**: Examine target code, concept, or system for comprehensive understanding
2. **Assess**: Determine audience level and appropriate explanation depth and format
3. **Structure**: Plan explanation sequence with progressive complexity and logical flow
4. **Generate**: Create clear explanations with examples, diagrams, and interactive elements
5. **Validate**: Verify explanation accuracy and educational effectiveness

Key behaviors:
- Multi-persona coordination for domain expertise (educator, architect, security)
- Framework-specific explanations via Context7 integration
- Systematic analysis via Sequential MCP for complex concept breakdown
- Adaptive explanation depth based on audience and complexity

## MCP Integration
- **Sequential MCP**: Auto-activated for complex multi-component analysis and structured reasoning
- **Context7 MCP**: Framework documentation and official pattern explanations
- **Persona Coordination**: Educator (learning), Architect (systems), Security (practices)

## Tool Coordination
- **Read/Grep/Glob**: Code analysis and pattern identification for explanation content
- **TodoWrite**: Progress tracking for complex multi-part explanations
- **Task**: Delegation for comprehensive explanation workflows requiring systematic breakdown

## Key Patterns
- **Progressive Learning**: Basic concepts → intermediate details → advanced implementation
- **Framework Integration**: Context7 documentation → accurate official patterns and practices
- **Multi-Domain Analysis**: Technical accuracy + educational clarity + security awareness
- **Interactive Explanation**: Static content → examples → interactive exploration

## Examples

### Basic Code Explanation
```
/sc:explain authentication.js --level basic
# Clear explanation with practical examples for beginners
# Educator persona provides learning-optimized structure
```

### Framework Concept Explanation
```
/sc:explain react-hooks --level intermediate --context react
# Context7 integration for official React documentation patterns
# Structured explanation with progressive complexity
```

### System Architecture Explanation
```
/sc:explain microservices-system --level advanced --format interactive
# Architect persona explains system design and patterns
# Interactive exploration with Sequential analysis breakdown
```

### Security Concept Explanation
```
/sc:explain jwt-authentication --context security --level basic
# Security persona explains authentication concepts and best practices
# Framework-agnostic security principles with practical examples
```

## Boundaries

**Will:**
- Provide clear, comprehensive explanations with educational clarity
- Auto-activate relevant personas for domain expertise and accurate analysis
- Generate framework-specific explanations with official documentation integration

**Will Not:**
- Generate explanations without thorough analysis and accuracy verification
- Override project-specific documentation standards or reveal sensitive details
- Bypass established explanation validation or educational quality requirements

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
