---
name: read
description: Invoke when given any URL, web page link, or PDF to read. Fetches the content as clean Markdown via proxy cascade and saves to Downloads. Not for local files already in the repo.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# Read: Fetch Any URL or PDF as Markdown

Convert any URL or local PDF to clean Markdown and save it.

## Routing

| Input | Method |
|-------|--------|
| `feishu.cn`, `larksuite.com` | Feishu API script |
| `.pdf` URL or local PDF path | PDF extraction |
| Everything else | Run `scripts/fetch.sh {url}` (proxy cascade with auto-fallback) |

After routing, load `resources/read-methods.md` to get the specific commands for the chosen method, then execute.

## Output Format

```
Title:  {title}
Author: {author} (if available)
Source: {platform}
URL:    {original url}

Summary
{3-5 sentence summary}

Content
{full Markdown, truncated at 200 lines if long}
```

## Saving

Save to `~/Downloads/{title}.md` with YAML frontmatter by default.
Skip only if user says "just preview" or "don't save". Tell the user the saved path.

After saving and reporting the path, stop. Do not analyze, comment on, or discuss the content unless asked. If content was truncated at 200 lines, say so and offer to continue.

## Notes

- r.jina.ai and defuddle.md require no API key
- Network failures: prepend local proxy env vars if available
- Long content: `| head -n 200` to preview first
- GitHub URLs: prefer `gh` CLI over fetching directly

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
