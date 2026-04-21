---
name: safari-compat
description: Use when frontend CSS or React code doesn't work in Safari or iOS Safari — clicks not registering, backdrop blur missing, animations broken, layout glitches. Not for non-Safari-specific bugs.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# Safari / WebKit Compatibility

## Overview

Safari (desktop and iOS) has specific CSS rendering bugs and missing features that cause silent failures. The most dangerous issues block pointer events — making the entire app non-clickable. Always audit these patterns before shipping to Mac/iOS users.

## Checklist — Run on Every Affected File

### 1. `transform-style: preserve-3d` + `backdrop-filter` — CRITICAL

**Never combine these two on the same element.** Safari creates conflicting compositing layers, breaking hit-testing. The entire element (and sometimes surrounding elements) stops receiving click/tap events.

```css
/* ❌ BREAKS Safari — non-clickable */
.card {
    transform-style: preserve-3d;
    backdrop-filter: blur(20px);
}

/* ✅ FIX — use perspective instead */
.card {
    perspective: 1200px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
```

**Why `perspective` is enough:** hover `rotateX/rotateY` effects work with `perspective` on the parent. `transform-style: preserve-3d` is only needed when *children* use 3D transforms — which is rare.

---

### 2. `-webkit-backdrop-filter` prefix — always required

Safari requires the `-webkit-` prefix even in 2025. Tailwind generates both automatically, but manual CSS does not.

```css
/* ❌ Invisible blur in Safari */
backdrop-filter: blur(10px);

/* ✅ */
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
```

React inline styles:
```jsx
// ❌
style={{ backdropFilter: 'blur(10px)' }}

// ✅
style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
```

**Grep to find missing prefixes:**
```bash
grep -rn "backdropFilter\|backdrop-filter" src/ | grep -v webkit | grep -v "none"
```

---

### 3. iOS Safari: `cursor: pointer` required for click events

iOS Safari does not fire `click` events on non-interactive elements (`div`, `span`, etc.) unless they have `cursor: pointer`. This causes tap-to-click to silently fail.

```jsx
/* ❌ Taps ignored on iOS Safari */
<div onClick={handleClick}>Click me</div>

/* ✅ */
<div onClick={handleClick} className="cursor-pointer">Click me</div>
```

**Grep to find `onClick` without `cursor-pointer`:**
```bash
grep -rn "onClick" src/components/ | grep -v "cursor-pointer\|cursor: pointer\|button\|Button\|<a "
```
Review results manually — not every hit is a bug, but all are candidates.

---

### 4. `background-attachment: fixed` — broken on iOS

iOS Safari does not correctly implement `background-attachment: fixed`. The background doesn't scroll properly and causes constant repaints. Remove it, especially from `body`.

```css
/* ❌ Causes repaint/scroll bugs on iOS */
body { background-attachment: fixed; }

/* ✅ Simply remove it */
body { /* background scrolls normally */ }
```

---

### 5. `@property` (CSS Houdini) — Safari 16.4+ only

`@property` for type-safe custom property animation is not supported before Safari 16.4. Without a fallback, the element may render invisibly or incorrectly.

```css
/* ✅ Pattern: base fallback + progressive enhancement */

/* Fallback — works everywhere */
.animated-element::after {
    border: 2px solid #FF6B00;
}

/* Enhancement — only where @property works */
@supports (background: conic-gradient(from 0deg, red, blue)) and (animation-timeline: scroll()) {
    .animated-element::after {
        border: none;
        background: conic-gradient(from var(--angle), transparent 70%, #FF6B00 100%);
        animation: rotate-angle 2s linear infinite;
    }
}
```

---

### 6. `mask-composite` — use both syntaxes

```css
/* ✅ Always both */
-webkit-mask-composite: xor;     /* Safari/WebKit */
mask-composite: exclude;          /* Standard */
```

---

## Quick Reference

| Property | Issue | Fix |
|----------|-------|-----|
| `transform-style: preserve-3d` + `backdrop-filter` | Non-clickable elements (hit-test bug) | Replace `preserve-3d` with `perspective` on parent |
| `backdrop-filter` without prefix | Blur invisible | Add `-webkit-backdrop-filter` |
| `onClick` on `div` without `cursor:pointer` | Taps ignored on iOS | Add `cursor-pointer` |
| `background-attachment: fixed` | Scroll/repaint bugs on iOS | Remove |
| `@property` without fallback | Animation broken, invisible `::after` | Add `@supports` fallback |
| `mask-composite: exclude` only | Mask broken | Add `-webkit-mask-composite: xor` |

---

## Workflow

1. Run grepping commands from sections 2 and 3 on affected codebase
2. Apply fixes top-to-bottom through the checklist
3. Restart dev server: `systemctl restart ama-frontend.service` (or equivalent)
4. Test in Safari: **Cmd+Shift+R** (hard refresh to clear CSS cache)

---

## Common Mistakes

- **Fixing only one file** — `backdrop-filter` is often written inline in TSX, in `<style>` tags, and in CSS files. Grep all three.
- **Assuming Tailwind handles it** — Tailwind `backdrop-blur-*` classes are fine. Manual CSS properties are not.
- **Thinking `pointer-events: none` on `::after` is enough** — It helps, but the compositing bug from point 1 must be fixed at the root.

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
