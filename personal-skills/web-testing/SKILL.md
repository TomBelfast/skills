---
name: web-testing
description: Web testing with Playwright, Vitest, k6. E2E/unit/integration/load/security/visual/a11y testing. Use for test automation, flakiness, Core Web Vitals, mobile gestures, cross-browser.
license: Apache-2.0
version: 2.0.0
---


## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# Web Testing Skill

Comprehensive web testing: unit, integration, E2E, load, security, visual regression, accessibility.

## Quick Start

```bash
npx vitest run                    # Unit tests
npx playwright test               # E2E tests
npx playwright test --ui          # E2E with UI
k6 run load-test.js               # Load tests
npx @axe-core/cli https://example.com  # Accessibility
npx lighthouse https://example.com     # Performance
```

## Testing Pyramid (70-20-10)

| Layer | Ratio | Framework | Speed |
|-------|-------|-----------|-------|
| Unit | 70% | Vitest/Jest | <50ms |
| Integration | 20% | Vitest + fixtures | 100-500ms |
| E2E | 10% | Playwright | 5-30s |

## When to Use

- **Unit**: Functions, utilities, state logic
- **Integration**: API endpoints, database ops, modules
- **E2E**: Critical flows (login, checkout, payment)
- **Load**: Pre-release performance validation
- **Security**: Pre-deploy vulnerability scanning
- **Visual**: UI regression detection

## Reference Documentation

### Core Testing
- `./references/unit-integration-testing.md` - Unit/integration patterns
- `./references/e2e-testing-playwright.md` - Playwright E2E workflows
- `./references/component-testing.md` - React/Vue/Angular component testing
- `./references/testing-pyramid-strategy.md` - Test ratios, priority matrix

### Cross-Browser & Mobile
- `./references/cross-browser-checklist.md` - Browser/device matrix
- `./references/mobile-gesture-testing.md` - Touch, swipe, orientation
- `./references/shadow-dom-testing.md` - Web components testing

### Interactive & Forms
- `./references/interactive-testing-patterns.md` - Forms, keyboard, drag-drop
- `./references/functional-testing-checklist.md` - Feature testing

### Performance & Quality
- `./references/performance-core-web-vitals.md` - LCP/CLS/INP, Lighthouse CI
- `./references/visual-regression.md` - Screenshot comparison
- `./references/test-flakiness-mitigation.md` - Stability strategies

### Accessibility
- `./references/accessibility-testing.md` - WCAG checklist, axe-core

### Security
- `./references/security-testing-overview.md` - OWASP Top 10, tools
- `./references/security-checklists.md` - Auth, API, headers
- `./references/vulnerability-payloads.md` - SQL/XSS/CSRF payloads

### API & Load
- `./references/api-testing.md` - API test patterns
- `./references/load-testing-k6.md` - k6 load test patterns

### Checklists
- `./references/pre-release-checklist.md` - Complete release checklist

## CI/CD Integration

```yaml
jobs:
  test:
    steps:
      - run: npm run test:unit      # Gate 1: Fast fail
      - run: npm run test:e2e       # Gate 2: After unit pass
      - run: npm run test:a11y      # Accessibility
      - run: npx lhci autorun       # Performance
```

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
