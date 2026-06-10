#!/usr/bin/env python3
"""
inject_autocorrect.py — Injects Auto-Correction Rules into all SKILL.md files.
Run automatically by install.sh and sync.sh after syncing skills.

Usage:
  python3 inject_autocorrect.py <skills_dir>
"""

import os
import sys

injection_block = """\
## Auto-Correction Rules

When you use this skill and find an error, outdated command, missing step,
or pitfall — FIX IT IMMEDIATELY. Do not wait or ask permission.

1. Read the current SKILL.md using your file reading tools.
2. Edit it with your file editing tools (`replace_file_content` or `multi_replace_file_content`) to correct the mistake.
3. Add any discovered pitfalls to the `## Pitfalls` section.
4. Report what you fixed to the user.

If a command doesn't work, a path is wrong, or a step is missing — \\
update the skill before finishing your current task.

## Pitfalls

- **yaml vs yml**: Be aware of `.yml` vs `.yaml` extensions in config files. If a file operation fails, always check both extensions."""


def inject_to_skill(filepath):
    try:
        if not os.path.isfile(filepath):
            return False
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"  [skip] Cannot read {filepath}: {e}")
        return False

    if "## Auto-Correction Rules" in content:
        return False  # already injected

    lines = content.split("\n")
    frontmatter_end = -1
    if lines and lines[0].startswith("---"):
        for i in range(1, len(lines)):
            if lines[i].startswith("---"):
                frontmatter_end = i
                break

    if frontmatter_end != -1:
        insert_idx = frontmatter_end + 1
        while insert_idx < len(lines) and lines[insert_idx].strip() == "":
            insert_idx += 1
        # Skip the H1 title line if present
        if insert_idx < len(lines) and lines[insert_idx].startswith("# "):
            insert_idx += 1

        new_lines = lines[:insert_idx] + ["", injection_block, ""] + lines[insert_idx:]
        new_content = "\n".join(new_lines)
    else:
        # No frontmatter — prepend block
        new_content = injection_block + "\n\n" + content

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    except Exception as e:
        print(f"  [error] Cannot write {filepath}: {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: inject_autocorrect.py <skills_dir>")
        sys.exit(1)

    skills_dir = sys.argv[1]
    if not os.path.isdir(skills_dir):
        print(f"Directory not found: {skills_dir}")
        sys.exit(1)

    injected = 0
    skipped = 0

    for root, dirs, files in os.walk(skills_dir):
        # Skip hidden dirs and the template folder
        dirs[:] = [d for d in dirs if not d.startswith(".") and d != "_template"]
        for file in files:
            if file == "SKILL.md":
                result = inject_to_skill(os.path.join(root, file))
                if result:
                    injected += 1
                    print(f"  [injected] {os.path.relpath(os.path.join(root, file), skills_dir)}")
                else:
                    skipped += 1

    print(f"\n  Auto-Correction injection: {injected} updated, {skipped} already up-to-date.")


if __name__ == "__main__":
    main()
