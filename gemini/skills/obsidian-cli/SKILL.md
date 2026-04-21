---
name: obsidian-cli
description: Obsidian vault automation w tym repozytorium — używaj wyłącznie dokumentu kanonicznego i helpera obsidian-rest. Nie stosuj przykładów z oficjalnego `obsidian` CLI ani npm `obsidian-cli` tutaj bez sprawdzenia OBSIDIAN_KB.md.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# Obsidian — integracja w tym środowisku

**Jedno źródło prawdy (komendy, env, czego nie używać):**

`/root/obsidian-kb-agent/docs/OBSIDIAN_KB.md`

Tam jest: Local REST API, `/usr/local/bin/obsidian-rest`, ścieżki SMB, oraz wyjaśnienie różnicy wobec npm `obsidian-cli` i oficjalnego CLI z aplikacji Obsidian.

Skille `obsidian-markdown` i `obsidian-bases` dotyczą składni Markdown/Bases w Obsidianie (ogólne); **integracja z naszym vaultem i API** — zawsze `OBSIDIAN_KB.md`.

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
