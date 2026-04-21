---
name: vega
description: Create data-driven charts with Vega-Lite (simple) and Vega (advanced). Best for bar, line, scatter, heatmap, area charts, and multi-series analytics. Use when you have numeric data arrays needing statistical visualization. Vega for radar charts and word clouds. NOT for process diagrams (use uml) or quick KPI cards (use infographic).
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# Vega / Vega-Lite Visualizer

**Quick Start:** Structure data as array of objects → Choose mark type (bar/line/point/area/arc/rect) → Map encodings (x, y, color, size) to fields → Set data types (quantitative/nominal/ordinal/temporal) → Wrap in ` ```vega-lite ` or ` ```vega ` fence. Always include `$schema`, use valid JSON with double quotes, field names are case-sensitive. **Use Vega-Lite for 90% of charts; Vega only for radar, word cloud, force-directed.**

---

## Critical Syntax Rules

### Rule 1: Always Include Schema
```json
"$schema": "https://vega.github.io/schema/vega-lite/v5.json"
```

### Rule 2: Valid JSON Only
```
❌ {field: "x",}     → Trailing comma, unquoted key
✅ {"field": "x"}    → Proper JSON
```

### Rule 3: Field Names Must Match Data
```
❌ "field": "Category"  when data has "category"
✅ "field": "category"  → Case-sensitive match
```

### Rule 4: Type Must Be Valid
```
✅ quantitative | nominal | ordinal | temporal
❌ numeric | string | date
```

---

## Common Pitfalls

| Issue | Solution |
|-------|----------|
| Chart not rendering | Check JSON validity, verify `$schema` |
| Data not showing | Field names must match exactly |
| Wrong chart type | Match mark to data structure |
| Colors not visible | Check color scale contrast |
| Dual-axis issues | Add `resolve: {scale: {y: "independent"}}` |

---

## Output Format

````markdown
```vega-lite
{...}
```
````

Or for full Vega:

````markdown
```vega
{...}
```
````

---

## Related Files

> For advanced chart patterns and complex visualizations, refer to references below:

- [examples.md](resources/examples.md) — Stacked bar, grouped bar, multi-series line, area, heatmap, radar (Vega), word cloud (Vega), and interactive chart examples

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
