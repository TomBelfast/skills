---
name: analyze
description: Comprehensive code analysis across quality, security, performance, and architecture domains
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# /sc:analyze - Code Analysis and Quality Assessment

## Triggers
- Code quality assessment requests for projects or specific components
- Security vulnerability scanning and compliance validation needs
- Performance bottleneck identification and optimization planning
- Architecture review and technical debt assessment requirements

## Usage
```
/sc:analyze [target] [--focus quality|security|performance|architecture] [--depth quick|deep] [--format text|json|report]
```

## Behavioral Flow
1. **Discover**: Categorize source files using language detection and project analysis
2. **Scan**: Apply domain-specific analysis techniques and pattern matching
3. **Evaluate**: Generate prioritized findings with severity ratings and impact assessment
4. **Recommend**: Create actionable recommendations with implementation guidance
5. **Report**: Present comprehensive analysis with metrics and improvement roadmap

Key behaviors:
- Multi-domain analysis combining static analysis and heuristic evaluation
- Intelligent file discovery and language-specific pattern recognition
- Severity-based prioritization of findings and recommendations
- Comprehensive reporting with metrics, trends, and actionable insights

## Tool Coordination
- **Glob**: File discovery and project structure analysis
- **Grep**: Pattern analysis and code search operations
- **Read**: Source code inspection and configuration analysis
- **Bash**: External analysis tool execution and validation
- **Write**: Report generation and metrics documentation

## Key Patterns
- **Domain Analysis**: Quality/Security/Performance/Architecture → specialized assessment
- **Pattern Recognition**: Language detection → appropriate analysis techniques
- **Severity Assessment**: Issue classification → prioritized recommendations
- **Report Generation**: Analysis results → structured documentation

## Examples

### Comprehensive Project Analysis
```
/sc:analyze
# Multi-domain analysis of entire project
# Generates comprehensive report with key findings and roadmap
```

### Focused Security Assessment
```
/sc:analyze src/auth --focus security --depth deep
# Deep security analysis of authentication components
# Vulnerability assessment with detailed remediation guidance
```

### Performance Optimization Analysis
```
/sc:analyze --focus performance --format report
# Performance bottleneck identification
# Generates HTML report with optimization recommendations
```

### Quick Quality Check
```
/sc:analyze src/components --focus quality --depth quick
# Rapid quality assessment of component directory
# Identifies code smells and maintainability issues
```

## Boundaries

**Will:**
- Perform comprehensive static code analysis across multiple domains
- Generate severity-rated findings with actionable recommendations
- Provide detailed reports with metrics and improvement guidance

**Will Not:**
- Execute dynamic analysis requiring code compilation or runtime
- Modify source code or apply fixes without explicit user consent
- Analyze external dependencies beyond import and usage patterns

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
