---
name: test
description: Execute tests with coverage analysis and automated quality reporting
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# /sc:test - Testing and Quality Assurance

## Triggers
- Test execution requests for unit, integration, or e2e tests
- Coverage analysis and quality gate validation needs
- Continuous testing and watch mode scenarios
- Test failure analysis and debugging requirements

## Usage
```
/sc:test [target] [--type unit|integration|e2e|all] [--coverage] [--watch] [--fix]
```

## Behavioral Flow
1. **Discover**: Categorize available tests using runner patterns and conventions
2. **Configure**: Set up appropriate test environment and execution parameters
3. **Execute**: Run tests with monitoring and real-time progress tracking
4. **Analyze**: Generate coverage reports and failure diagnostics
5. **Report**: Provide actionable recommendations and quality metrics

Key behaviors:
- Auto-detect test framework and configuration
- Generate comprehensive coverage reports with metrics
- Activate Playwright MCP for e2e browser testing
- Provide intelligent test failure analysis
- Support continuous watch mode for development

## MCP Integration
- **Playwright MCP**: Auto-activated for `--type e2e` browser testing
- **QA Specialist Persona**: Activated for test analysis and quality assessment
- **Enhanced Capabilities**: Cross-browser testing, visual validation, performance metrics

## Tool Coordination
- **Bash**: Test runner execution and environment management
- **Glob**: Test discovery and file pattern matching
- **Grep**: Result parsing and failure analysis
- **Write**: Coverage reports and test summaries

## Key Patterns
- **Test Discovery**: Pattern-based categorization → appropriate runner selection
- **Coverage Analysis**: Execution metrics → comprehensive coverage reporting
- **E2E Testing**: Browser automation → cross-platform validation
- **Watch Mode**: File monitoring → continuous test execution

## Examples

### Basic Test Execution
```
/sc:test
# Discovers and runs all tests with standard configuration
# Generates pass/fail summary and basic coverage
```

### Targeted Coverage Analysis
```
/sc:test src/components --type unit --coverage
# Unit tests for specific directory with detailed coverage metrics
```

### Browser Testing
```
/sc:test --type e2e
# Activates Playwright MCP for comprehensive browser testing
# Cross-browser compatibility and visual validation
```

### Development Watch Mode
```
/sc:test --watch --fix
# Continuous testing with automatic simple failure fixes
# Real-time feedback during development
```

## Boundaries

**Will:**
- Execute existing test suites using project's configured test runner
- Generate coverage reports and quality metrics
- Provide intelligent test failure analysis with actionable recommendations

**Will Not:**
- Generate test cases or modify test framework configuration
- Execute tests requiring external services without proper setup
- Make destructive changes to test files without explicit permission

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
