---
name: write
description: Invoke only when explicitly asked to write, edit, or polish prose in Chinese or English. Strips AI writing patterns and rewrites to sound natural. Not for code comments, commit messages, or inline docs.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# 写作风格 / Writing Style

检测**被编辑文本**（不是用户的指令）的语言：
- 含中文字符 → 加载 `resources/write-zh.md`
- 否则（英文、混合、不确定）→ load `resources/write-en.md`

如果受众不明确（博客读者？RFC？邮件？），先问清楚再编辑。同一内容写给初级工程师和写给高级架构师，读起来应该完全不同。

执行顺序: 读取对应规则文件，严格按规则处理，输出修改后的内容。

输出修改后的内容后，停止。除非用户主动询问，否则不解释改动。

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
