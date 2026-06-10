---
name: skill-creator
description: Meta-skill used to create NEW skills. Ensures all new skills automatically include the Auto-Correction Rules.
---

# Skill Creator (Meta-Skill)

## Auto-Correction Rules

When you use this skill and find an error, outdated command, missing step,
or pitfall — FIX IT IMMEDIATELY. Do not wait or ask permission.

1. Read the current SKILL.md using your file reading tools.
2. Edit it with your file editing tools (`replace_file_content` or `multi_replace_file_content`) to correct the mistake.
3. Add any discovered pitfalls to the `## Pitfalls` section.
4. Report what you fixed to the user.

If a command doesn't work, a path is wrong, or a step is missing — 
update the skill before finishing your current task.

## Pitfalls

- (Puste)

## Overview

You are the Antigravity Skill Creator. When the user asks you to create a new skill in this repository, you MUST follow these steps exactly:

1. Create a new directory for the skill.
2. Copy the contents of `_template/SKILL.md` into the new `SKILL.md` file. Do NOT start from scratch.
3. Update the `name` and `description` in the YAML frontmatter.
4. Update the `# Nazwa Skilla` H1 tag.
5. Keep the `## Auto-Correction Rules` and `## Pitfalls` sections exactly as they are in the template.
6. Fill in the `## Overview` and other necessary sections based on the user's requirements for the new skill.
7. Save the file and inform the user.
