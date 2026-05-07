from __future__ import annotations

import argparse
import json
import os
import shutil
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


STATE_ACTIVE = "active"
STATE_STALE = "stale"
STATE_ARCHIVED = "archived"
STATE_PINNED = "pinned"


@dataclass(frozen=True)
class Skill:
    name: str
    path: Path
    skill_md: Path
    description: str
    modified_at: str


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def parse_iso(value: Any) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value))
    except (TypeError, ValueError):
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def parse_frontmatter(skill_md: Path) -> dict[str, str]:
    try:
        lines = skill_md.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return {}
    if not lines or lines[0].strip() != "---":
        return {}

    data: dict[str, str] = {}
    for line in lines[1:]:
        stripped = line.strip()
        if stripped == "---":
            break
        if ":" not in stripped:
            continue
        key, value = stripped.split(":", 1)
        data[key.strip()] = value.strip().strip("\"'")
    return data


def scan_skills(skills_dir: Path) -> list[Skill]:
    if not skills_dir.exists():
        return []

    skills: list[Skill] = []
    for skill_md in sorted(skills_dir.glob("*/SKILL.md")):
        if any(part.startswith(".") for part in skill_md.relative_to(skills_dir).parts):
            continue
        frontmatter = parse_frontmatter(skill_md)
        name = frontmatter.get("name") or skill_md.parent.name
        description = frontmatter.get("description") or ""
        modified_at = datetime.fromtimestamp(skill_md.stat().st_mtime, timezone.utc).isoformat()
        skills.append(
            Skill(
                name=name,
                path=skill_md.parent,
                skill_md=skill_md,
                description=description,
                modified_at=modified_at,
            )
        )
    return skills


def load_usage(path: Path) -> dict[str, dict[str, Any]]:
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    if not isinstance(data, dict):
        return {}
    return {str(key): value for key, value in data.items() if isinstance(value, dict)}


def save_usage(path: Path, usage: dict[str, dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=".usage_", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(usage, handle, indent=2, sort_keys=True)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def ensure_record(usage: dict[str, dict[str, Any]], skill_name: str) -> dict[str, Any]:
    record = usage.setdefault(
        skill_name,
        {
            "created_at": now_iso(),
            "use_count": 0,
            "view_count": 0,
            "patch_count": 0,
            "last_used_at": None,
            "last_viewed_at": None,
            "last_patched_at": None,
            "state": STATE_ACTIVE,
            "pinned": False,
        },
    )
    record.setdefault("use_count", 0)
    record.setdefault("view_count", 0)
    record.setdefault("patch_count", 0)
    record.setdefault("state", STATE_ACTIVE)
    record.setdefault("pinned", False)
    return record


def pin_skill(usage: dict[str, dict[str, Any]], skill_name: str, pinned: bool) -> None:
    record = ensure_record(usage, skill_name)
    record["pinned"] = bool(pinned)
    if pinned:
        record["state"] = STATE_ACTIVE


def mark_used(usage: dict[str, dict[str, Any]], skill_name: str) -> None:
    record = ensure_record(usage, skill_name)
    record["use_count"] = int(record.get("use_count") or 0) + 1
    record["last_used_at"] = now_iso()
    if record.get("state") == STATE_STALE:
        record["state"] = STATE_ACTIVE


def latest_activity(skill: Skill, record: dict[str, Any]) -> datetime:
    dates = [
        parse_iso(record.get("last_used_at")),
        parse_iso(record.get("last_viewed_at")),
        parse_iso(record.get("last_patched_at")),
        parse_iso(record.get("created_at")),
        parse_iso(skill.modified_at),
    ]
    return max(date for date in dates if date is not None)


def age_days(activity_at: datetime, now: datetime) -> float:
    return max(0.0, (now - activity_at).total_seconds() / 86400)


def classify_skill(
    skill: Skill,
    record: dict[str, Any],
    stale_after_days: int,
    archive_after_days: int,
    now: datetime,
) -> tuple[str, str]:
    if record.get("pinned"):
        return STATE_PINNED, "pinned skills are excluded from curator transitions"

    activity_at = latest_activity(skill, record)
    age = age_days(activity_at, now)

    if age >= archive_after_days:
        return STATE_ARCHIVED, f"no recorded activity for {age:.1f} days"
    if age >= stale_after_days:
        return STATE_STALE, f"no recorded activity for {age:.1f} days"
    return STATE_ACTIVE, f"recent activity {age:.1f} days ago"


def build_report(
    skills: list[Skill],
    usage: dict[str, dict[str, Any]],
    stale_after_days: int = 30,
    archive_after_days: int = 90,
    now: datetime | None = None,
) -> dict[str, Any]:
    current = now or datetime.now(timezone.utc)
    rows: list[dict[str, Any]] = []
    stale_candidates: list[str] = []
    archive_candidates: list[str] = []

    for skill in sorted(skills, key=lambda item: item.name):
        record = ensure_record(usage, skill.name)
        state, reason = classify_skill(
            skill=skill,
            record=record,
            stale_after_days=stale_after_days,
            archive_after_days=archive_after_days,
            now=current,
        )
        if state == STATE_STALE:
            stale_candidates.append(skill.name)
        if state == STATE_ARCHIVED:
            archive_candidates.append(skill.name)
        rows.append(
            {
                "name": skill.name,
                "path": str(skill.path),
                "description": skill.description,
                "state": state,
                "reason": reason,
                "pinned": bool(record.get("pinned")),
                "use_count": int(record.get("use_count") or 0),
                "view_count": int(record.get("view_count") or 0),
                "patch_count": int(record.get("patch_count") or 0),
            }
        )

    return {
        "generated_at": current.isoformat(),
        "summary": {
            "total": len(rows),
            "pinned": sum(1 for row in rows if row["pinned"]),
            "stale_candidates": len(stale_candidates),
            "archive_candidates": len(archive_candidates),
        },
        "skills": rows,
        "stale_candidates": stale_candidates,
        "archive_candidates": archive_candidates,
    }


def write_report(base_dir: Path, report: dict[str, Any]) -> Path:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S-%f")
    run_dir = base_dir / "reports" / timestamp
    run_dir.mkdir(parents=True, exist_ok=False)
    (run_dir / "run.json").write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (run_dir / "REPORT.md").write_text(render_markdown_report(report), encoding="utf-8")
    return run_dir


def render_markdown_report(report: dict[str, Any]) -> str:
    summary = report.get("summary", {})
    lines = [
        f"# Skill Curator Report - {report.get('generated_at', '')}",
        "",
        f"- Total skills: {summary.get('total', 0)}",
        f"- Pinned: {summary.get('pinned', 0)}",
        f"- Stale candidates: {summary.get('stale_candidates', 0)}",
        f"- Archive candidates: {summary.get('archive_candidates', 0)}",
        "",
        "| Skill | State | Reason | Uses | Views | Patches |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for row in report.get("skills", []):
        lines.append(
            "| {name} | {state} | {reason} | {use_count} | {view_count} | {patch_count} |".format(
                name=row.get("name", ""),
                state=row.get("state", ""),
                reason=row.get("reason", ""),
                use_count=row.get("use_count", 0),
                view_count=row.get("view_count", 0),
                patch_count=row.get("patch_count", 0),
            )
        )
    lines.append("")
    return "\n".join(lines)


def snapshot_skills(root: Path, curator_dir: Path) -> Path:
    backup_dir = curator_dir / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S-%f")
    archive_base = backup_dir / f"skills-{stamp}"
    shutil.make_archive(str(archive_base), "zip", root / "skills")
    return archive_base.with_suffix(".zip")


def archive_skill(root: Path, curator_dir: Path, skill_name: str) -> Path:
    source = root / "skills" / skill_name
    if not source.exists():
        raise FileNotFoundError(f"Skill not found: {skill_name}")
    archive_root = curator_dir / "archive"
    archive_root.mkdir(parents=True, exist_ok=True)
    destination = archive_root / skill_name
    if destination.exists():
        suffix = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
        destination = archive_root / f"{skill_name}-{suffix}"
    shutil.move(str(source), str(destination))
    return destination


def curator_dir(root: Path) -> Path:
    return root / ".skill-lab" / "curator"


def usage_path(root: Path) -> Path:
    return curator_dir(root) / "usage.json"


def cmd_status(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    usage = load_usage(usage_path(root))
    report = build_report(
        scan_skills(root / "skills"),
        usage,
        stale_after_days=args.stale_after_days,
        archive_after_days=args.archive_after_days,
    )
    print(render_markdown_report(report))
    return 0


def cmd_run(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    usage_file = usage_path(root)
    usage = load_usage(usage_file)
    report = build_report(
        scan_skills(root / "skills"),
        usage,
        stale_after_days=args.stale_after_days,
        archive_after_days=args.archive_after_days,
    )
    save_usage(usage_file, usage)
    run_dir = write_report(curator_dir(root), report)
    print(f"Report written: {run_dir}")

    if not args.apply:
        print("Dry run only. No skills were archived.")
        return 0

    if not report["archive_candidates"]:
        print("No archive candidates.")
        return 0

    backup = snapshot_skills(root, curator_dir(root))
    print(f"Backup written: {backup}")
    for skill_name in report["archive_candidates"]:
        record = ensure_record(usage, skill_name)
        if record.get("pinned"):
            continue
        destination = archive_skill(root, curator_dir(root), skill_name)
        record["state"] = STATE_ARCHIVED
        record["archived_at"] = now_iso()
        print(f"Archived {skill_name} -> {destination}")
    save_usage(usage_file, usage)
    return 0


def cmd_pin(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    usage_file = usage_path(root)
    usage = load_usage(usage_file)
    pin_skill(usage, args.skill, pinned=True)
    save_usage(usage_file, usage)
    print(f"Pinned {args.skill}")
    return 0


def cmd_unpin(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    usage_file = usage_path(root)
    usage = load_usage(usage_file)
    pin_skill(usage, args.skill, pinned=False)
    save_usage(usage_file, usage)
    print(f"Unpinned {args.skill}")
    return 0


def cmd_mark_used(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    usage_file = usage_path(root)
    usage = load_usage(usage_file)
    mark_used(usage, args.skill)
    save_usage(usage_file, usage)
    print(f"Marked used: {args.skill}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Local skill lifecycle curator.")
    parser.add_argument("--root", default=".", help="Repository root.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    def add_age_args(command: argparse.ArgumentParser) -> None:
        command.add_argument("--stale-after-days", type=int, default=30)
        command.add_argument("--archive-after-days", type=int, default=90)

    status = subparsers.add_parser("status", help="Print current curator status.")
    add_age_args(status)
    status.set_defaults(func=cmd_status)

    run = subparsers.add_parser("run", help="Write a curator report and optionally archive candidates.")
    add_age_args(run)
    run.add_argument("--apply", action="store_true", help="Archive unpinned archive candidates after writing a backup.")
    run.set_defaults(func=cmd_run)

    pin = subparsers.add_parser("pin", help="Exclude a skill from curator transitions.")
    pin.add_argument("skill")
    pin.set_defaults(func=cmd_pin)

    unpin = subparsers.add_parser("unpin", help="Allow a skill to be curated again.")
    unpin.add_argument("skill")
    unpin.set_defaults(func=cmd_unpin)

    mark_used_parser = subparsers.add_parser("mark-used", help="Record local usage for a skill.")
    mark_used_parser.add_argument("skill")
    mark_used_parser.set_defaults(func=cmd_mark_used)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
