#!/usr/bin/env python3
"""Install tool-specific skills directly from GitHub."""

from __future__ import annotations

import argparse
import json
import urllib.request
from pathlib import Path


REPO_OWNER = "TomBelfast"
REPO_NAME = "skills"
BRANCH = "main"

API_BASE = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents"


def get_json(url: str):
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode())


def download_file(file_url: str, dest_path: Path) -> None:
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(file_url) as response:
        dest_path.write_bytes(response.read())


def resolve_antigravity_target(home: Path) -> Path:
    global_skills = home / ".gemini" / "antigravity" / "global_skills"
    if global_skills.exists():
        return global_skills
    return home / ".gemini" / "antigravity" / "skills"


def tool_config(tool: str, home: Path) -> tuple[Path, str, str | None]:
    if tool == "claude":
        return home / ".claude" / "skills", "claude/skills", "claude/gstack-skills"
    if tool == "cursor":
        return home / ".cursor" / "skills", "cursor/skills", "cursor/gstack-skills"
    if tool == "codex":
        codex_home = home / ".codex"
        return codex_home / "skills", "codex/skills", None
    if tool == "gemini":
        return home / ".gemini" / "skills", "gemini/skills", None
    if tool == "antigravity":
        return resolve_antigravity_target(home), "antigravity/skills", None
    raise ValueError(f"Unsupported tool: {tool}")


def sync_remote_dir(source_path: str, target_root: Path) -> int:
    count = 0
    entries = get_json(f"{API_BASE}/{source_path}?ref={BRANCH}")
    for item in entries:
        if item["type"] != "dir":
            continue
        skill_name = item["name"]
        skill_root = target_root / skill_name
        skill_root.mkdir(parents=True, exist_ok=True)

        stack = [(item["url"], skill_root)]
        while stack:
            url, local_root = stack.pop()
            for child in get_json(url):
                if child["type"] == "dir":
                    stack.append((child["url"], local_root / child["name"]))
                elif child["type"] == "file":
                    download_file(child["download_url"], local_root / child["name"])
        count += 1
    return count


def copy_missing_brand_context(home: Path, skills_dir: Path) -> int:
    source = get_json(f"{API_BASE}/brand-context?ref={BRANCH}")
    brand_dir = skills_dir.parent / "brand-context"
    brand_dir.mkdir(parents=True, exist_ok=True)
    added = 0
    for item in source:
        if item["type"] != "file" or not item["name"].endswith(".md"):
            continue
        target = brand_dir / item["name"]
        if target.exists():
            continue
        download_file(item["download_url"], target)
        added += 1
    return added


def main() -> None:
    parser = argparse.ArgumentParser(description="Install tool-specific skills from GitHub")
    parser.add_argument("--tool", choices=["claude", "cursor", "codex", "gemini", "antigravity"], default="claude")
    parser.add_argument("--target", help="Override install target directory")
    parser.add_argument("--with-gstack", action="store_true", help="Also install mirrored gstack skills when available")
    args = parser.parse_args()

    home = Path.home()
    default_target, source_path, gstack_path = tool_config(args.tool, home)
    target_root = Path(args.target).expanduser() if args.target else default_target
    target_root.mkdir(parents=True, exist_ok=True)

    print(f"Tool:   {args.tool}")
    print(f"Target: {target_root}")
    print(f"Source: {source_path}")

    installed = sync_remote_dir(source_path, target_root)
    installed_gstack = 0
    if args.with_gstack and gstack_path:
        installed_gstack = sync_remote_dir(gstack_path, target_root)

    brand_added = copy_missing_brand_context(home, target_root)

    print("")
    print("=== Summary ===")
    print(f"Skills:           {installed}")
    print(f"Gstack mirror:    {installed_gstack}")
    print(f"Brand templates:  {brand_added}")


if __name__ == "__main__":
    main()
