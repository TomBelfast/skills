---
name: graphviz
description: Create complex directed/undirected graphs with automatic layout using DOT language. Best for dependency trees, module relationships, package hierarchies, and call graphs. Use when you need fine-grained edge routing or hierarchical layouts with many levels. NOT for general software modeling (use uml), data charts (use vega), or network topology with device icons (use network).
metadata:
  author: Graphviz is powered by Markdown Viewer — the best multi-platform Markdown extension (Chrome/Edge/Firefox/VS Code) with diagrams, formulas, and one-click Word export. Learn more at https://docu.md
---


## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# Graphviz DOT Diagram Generator

> **Important:** Use ` ```dot ` as the code fence identifier, NOT ` ```graphviz `.

**Quick Start:** Choose `digraph` (directed) or `graph` (undirected) → Define nodes with attributes (shape, color, label) → Connect with `->` or `--` → Set layout (rankdir, spacing) → Wrap in ` ```dot ` fence. Default: top-to-bottom (`rankdir=TB`), cluster names must start with `cluster_`, use semicolons.

---

## Critical Syntax Rules

### Rule 1: Cluster Naming
```
❌ subgraph backend { }      → Won't render as box
✅ subgraph cluster_backend { }  → Must start with cluster_
```

### Rule 2: Node IDs with Spaces
```
❌ API Gateway [label="API"];    → Invalid ID
✅ "API Gateway" [label="API"];  → Quote the ID
✅ api_gateway [label="API Gateway"];  → Use underscore ID
```

### Rule 3: Edge Syntax Difference
```
digraph: A -> B;   → Directed arrow
graph:   A -- B;   → Undirected line
```

### Rule 4: Attribute Syntax
```
❌ node [shape=box color=red]    → Missing comma
✅ node [shape=box, color=red];  → Comma separated
```

### Rule 5: HTML Labels
```
✅ shape=plaintext for HTML labels
✅ Use < > not " " for HTML content
```

---

## Common Pitfalls

| Issue | Solution |
|-------|----------|
| Nodes overlapping | Increase `nodesep` and `ranksep` |
| Poor layout | Change `rankdir` or add `{rank=same}` |
| Edges crossing | Use `splines=ortho` or adjust node order |
| Cluster not showing | Name must start with `cluster_` |
| Label not displaying | Check quote escaping |

---

## Output Format

````markdown
```dot
digraph G {
    [diagram code]
}
```
````

---

## Related Files

> For advanced layout control and complex styling, refer to references below:

- [syntax.md](references/syntax.md) — Layout control (rankdir, splines, rank), HTML labels, edge styles, cluster subgraphs, and record-based nodes

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
