#!/usr/bin/env python3
"""Generate tool-specific skill packs from shared sources.

Source of truth:
- sources/personal-skills/
- sources/gstack-skills/

Generated outputs:
- claude/skills/
- claude/gstack-skills/
- cursor/skills/
- cursor/gstack-skills/
- codex/skills/
- gemini/skills/
- antigravity/skills/
"""

from __future__ import annotations

import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def source_dir(preferred: str, legacy: str) -> Path:
    preferred_path = ROOT / preferred
    if preferred_path.exists():
        return preferred_path
    legacy_path = ROOT / legacy
    if legacy_path.exists():
        return legacy_path
    raise FileNotFoundError(f"Missing source directory: {preferred} (or legacy {legacy})")


PERSONAL_SRC = source_dir("sources/personal-skills", "personal-skills")
GSTACK_SRC = source_dir("sources/gstack-skills", "gstack-skills")


GENERATED_DIRS = [
    ROOT / "claude" / "skills",
    ROOT / "claude" / "gstack-skills",
    ROOT / "cursor" / "skills",
    ROOT / "cursor" / "gstack-skills",
    ROOT / "codex" / "skills",
    ROOT / "gemini" / "skills",
    ROOT / "antigravity" / "skills",
]


def reset_dir(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def extract_frontmatter(text: str) -> tuple[str, str]:
    if text.startswith("---\n"):
        match = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.DOTALL)
        if match:
            return match.group(1), match.group(2)

    malformed = re.search(r"(?m)^name:\s*.+$", text)
    if malformed:
        closing = re.search(r"(?m)^---\s*$", text[malformed.start() :])
        if closing:
            fm_start = malformed.start()
            fm_end = malformed.start() + closing.start()
            body_start = malformed.start() + closing.end()
            frontmatter = text[fm_start:fm_end].strip("\n")
            prefix = text[:fm_start].rstrip("\n")
            suffix = text[body_start:].lstrip("\n")
            body = "\n\n".join(part for part in [prefix, suffix] if part)
            return frontmatter, body

    match = re.search(r"(?m)^---\s*$", text)
    if not match:
        return "", text

    second = re.search(r"(?m)^---\s*$", text[match.end() :])
    if not second:
        return "", text

    fm_start = match.end()
    fm_end = match.end() + second.start()
    body_start = match.end() + second.end()
    return text[fm_start:fm_end].strip("\n"), text[body_start:].lstrip("\n")


def parse_name(frontmatter: str, dirname: str) -> str:
    match = re.search(r"(?m)^name:\s*(.+?)\s*$", frontmatter)
    if not match:
        return dirname
    value = match.group(1).strip().strip("'\"")
    return value or dirname


def parse_description(frontmatter: str, body: str) -> str:
    lines = frontmatter.splitlines()
    for index, line in enumerate(lines):
        match = re.match(r"^description:\s*(.*)$", line)
        if not match:
            continue

        value = match.group(1).strip()
        if value and value not in {"|", ">", "|-", ">-"}:
            return normalize_description(value)

        indent_block = []
        for next_line in lines[index + 1 :]:
            if not next_line.strip():
                indent_block.append("")
                continue
            if re.match(r"^\S", next_line):
                break
            indent_block.append(next_line.strip())
        joined = " ".join(part for part in indent_block if part)
        if joined:
            return normalize_description(joined)

    paragraphs = [
        normalize_description(block)
        for block in re.split(r"\n\s*\n", body)
        if block.strip() and not block.lstrip().startswith("#")
    ]
    if paragraphs:
        return paragraphs[0]
    return "Reusable workflow instructions for this skill."


def normalize_description(value: str) -> str:
    value = value.strip().strip("'\"")
    value = re.sub(r"\s+", " ", value)
    return value


def build_normalized_skill_md(source_skill: Path) -> str:
    raw = source_skill.read_text(encoding="utf-8")
    frontmatter, body = extract_frontmatter(raw)
    name = parse_name(frontmatter, source_skill.parent.name)
    description = parse_description(frontmatter, body)
    return f"---\nname: {name}\ndescription: {description}\n---\n\n{body.lstrip()}"


def copy_tree(source: Path, destination: Path) -> None:
    if source.is_dir():
        shutil.copytree(source, destination, dirs_exist_ok=True)
    else:
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def generate_shared_pack(target_root: Path) -> int:
    count = 0
    for skill_dir in sorted(PERSONAL_SRC.iterdir()):
        if not skill_dir.is_dir():
            continue
        target_dir = target_root / skill_dir.name
        shutil.copytree(skill_dir, target_dir, dirs_exist_ok=True)
        write_file(target_dir / "SKILL.md", build_normalized_skill_md(skill_dir / "SKILL.md"))
        count += 1
    return count


def generate_claude_pack(target_root: Path) -> int:
    count = 0
    for skill_dir in sorted(PERSONAL_SRC.iterdir()):
        if not skill_dir.is_dir():
            continue
        shutil.copytree(skill_dir, target_root / skill_dir.name, dirs_exist_ok=True)
        count += 1
    return count


def rewrite_gstack_for_cursor(text: str) -> str:
    replacements = {
        "~/.claude/skills/gstack": "~/.cursor/skills/gstack",
        ".claude/skills/gstack": ".cursor/skills/gstack",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def generate_cursor_gstack(target_root: Path) -> int:
    count = 0
    for skill_dir in sorted(GSTACK_SRC.iterdir()):
        if not skill_dir.is_dir():
            continue
        target_dir = target_root / skill_dir.name
        shutil.copytree(skill_dir, target_dir, dirs_exist_ok=True)
        raw = (skill_dir / "SKILL.md").read_text(encoding="utf-8")
        write_file(target_dir / "SKILL.md", rewrite_gstack_for_cursor(raw))
        count += 1
    return count


def generate_claude_gstack(target_root: Path) -> int:
    count = 0
    for skill_dir in sorted(GSTACK_SRC.iterdir()):
        if not skill_dir.is_dir():
            continue
        shutil.copytree(skill_dir, target_root / skill_dir.name, dirs_exist_ok=True)
        count += 1
    return count


def copy_antigravity_support(source_dir: Path, target_dir: Path) -> None:
    for entry in source_dir.iterdir():
        if entry.name == "SKILL.md":
            continue
        if entry.name == "scripts":
            copy_tree(entry, target_dir / "scripts")
            continue
        if entry.name == "references":
            if entry.is_dir():
                for nested in entry.iterdir():
                    copy_tree(nested, target_dir / "resources" / nested.name)
            else:
                copy_tree(entry, target_dir / "resources" / entry.name)
            continue
        if entry.name in {"example", "examples"}:
            copy_tree(entry, target_dir / "examples" / entry.name if entry.name == "example" else target_dir / "examples")
            continue
        if entry.is_file() and "example" in entry.stem.lower():
            copy_tree(entry, target_dir / "examples" / entry.name)
            continue
        copy_tree(entry, target_dir / entry.name)


def rewrite_for_antigravity(text: str) -> str:
    return text.replace("references/", "resources/")


def generate_antigravity_pack(target_root: Path) -> int:
    count = 0
    for skill_dir in sorted(PERSONAL_SRC.iterdir()):
        if not skill_dir.is_dir():
            continue
        target_dir = target_root / skill_dir.name
        target_dir.mkdir(parents=True, exist_ok=True)
        write_file(
            target_dir / "SKILL.md",
            rewrite_for_antigravity(build_normalized_skill_md(skill_dir / "SKILL.md")),
        )
        copy_antigravity_support(skill_dir, target_dir)
        count += 1
    return count


def main() -> None:
    for generated in GENERATED_DIRS:
        reset_dir(generated)

    stats = {
        "claude_skills": generate_claude_pack(ROOT / "claude" / "skills"),
        "claude_gstack": generate_claude_gstack(ROOT / "claude" / "gstack-skills"),
        "cursor_skills": generate_shared_pack(ROOT / "cursor" / "skills"),
        "cursor_gstack": generate_cursor_gstack(ROOT / "cursor" / "gstack-skills"),
        "codex_skills": generate_shared_pack(ROOT / "codex" / "skills"),
        "gemini_skills": generate_shared_pack(ROOT / "gemini" / "skills"),
        "antigravity_skills": generate_antigravity_pack(ROOT / "antigravity" / "skills"),
    }

    print("Generated tool packs:")
    for key, value in stats.items():
        print(f"- {key}: {value}")


if __name__ == "__main__":
    main()
