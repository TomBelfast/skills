---
name: canvas
description: Create spatial node-based diagrams with free positioning. Best for mind maps, knowledge graphs, concept maps, and planning boards where precise spatial layout matters. Use JSON format with x/y coordinates. NOT for sequential flows (use uml) or data charts (use vega).
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# JSON Canvas Visualizer

**Quick Start:** Define nodes with `id`, `type`, `x`, `y`, `width`, `height` → Plan layout on 100px grid → Connect edges with `fromNode`/`toNode` → Apply colors (1-6) → Wrap in ` ```canvas ` fence. Origin (0,0) at top-left, X right, Y down. Obsidian Canvas compatible.

---

## Critical Syntax Rules

### 1. Structure Format
```canvas
{
  "nodes": [
    {"id": "n1", "type": "text", "text": "Node 1", "x": 0, "y": 0, "width": 120, "height": 50}
  ],
  "edges": []
}
```

### 2. Node Types
| Type | Required Fields | Purpose |
|------|----------------|---------|
| `text` | `text` | Display custom text content |
| `file` | `file` | Reference external files |
| `link` | `url` | External URL references |
| `group` | `label` | Visual container for grouping |

### 3. Required Node Attributes
All nodes require: `id`, `type`, `x`, `y`, `width`, `height`

### 4. Color Presets
| Value | Color |
|-------|-------|
| `"1"` | Red |
| `"2"` | Orange |
| `"3"` | Yellow |
| `"4"` | Green |
| `"5"` | Cyan |
| `"6"` | Purple |

### 5. Edge Connections
```json
{
  "id": "e1",
  "fromNode": "n1",
  "fromSide": "right",
  "toNode": "n2", 
  "toSide": "left",
  "toEnd": "arrow"
}
```

### 6. Coordinate System
- Origin (0,0) at top-left
- X increases to the right
- Y increases downward

### 7. Node Sizing
- Consider text content when setting node dimensions
- Multi-line text requires more height to display all lines
- Long words require more width to avoid overflow

---

## Common Pitfalls

| Issue | Solution |
|-------|----------|
| Nodes overlapping | Increase spacing (100+ px) |
| Edges not visible | Verify `fromNode`/`toNode` match node IDs |
| Invalid JSON | Check quotes and commas |
| IDs invalid | Use only a-z, A-Z, 0-9, -, _ |

---

## Output Format

````markdown
```canvas
{
  "nodes": [...],
  "edges": [...]
}
```
````

---

## Related Files

> For detailed syntax and advanced features, refer to references below:

- [syntax.md](resources/syntax.md) — Complete attribute reference: node types, edge properties, group styling, and advanced examples

## Resources

- [JSON Canvas Specification](https://jsoncanvas.org/spec/1.0/)

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
