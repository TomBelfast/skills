import argparse
import re
from collections import Counter
from dataclasses import dataclass
from datetime import date
from pathlib import Path


SECTION_ORDER = [
    "Non-Negotiable Rules",
    "Promotion Criteria",
    "Patterns Observed",
    "Promotion History",
]

TEMPLATE = """# Skill Learnings

## Non-Negotiable Rules

## Promotion Criteria
- Record each repeated correction as a pattern with a stable `pattern` key.
- Promote a pattern to `Non-Negotiable Rules` when it appears at least twice and the fix is still valid.
- Keep rules imperative, reusable, and focused on future behavior.

## Patterns Observed

## Promotion History
"""


@dataclass
class Observation:
    raw: str
    entry_date: str
    pattern: str
    skills: str
    source: str
    rule: str
    summary: str


@dataclass
class Promotion:
    raw: str
    entry_date: str
    pattern: str
    count: int
    rule: str


def ensure_file(path: Path) -> None:
    if not path.exists():
        path.write_text(TEMPLATE, encoding="utf-8")
        return

    content = path.read_text(encoding="utf-8")
    if content.strip():
        return

    path.write_text(TEMPLATE, encoding="utf-8")


def split_sections(content: str) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {name: [] for name in SECTION_ORDER}
    current = None

    for line in content.splitlines():
        if line.startswith("## "):
            current = line[3:].strip()
            if current not in sections:
                sections[current] = []
            continue
        if current is not None:
            sections[current].append(line)

    return sections


def render_sections(sections: dict[str, list[str]]) -> str:
    parts = ["# Skill Learnings", ""]
    for section in SECTION_ORDER:
        parts.append(f"## {section}")
        lines = normalize_lines(sections.get(section, []))
        if lines:
            parts.extend(lines)
        parts.append("")
    return "\n".join(parts).rstrip() + "\n"


def load_sections(path: Path) -> dict[str, list[str]]:
    ensure_file(path)
    content = path.read_text(encoding="utf-8")
    sections = split_sections(content)
    for section in SECTION_ORDER:
        sections.setdefault(section, [])
    return sections


def normalize_lines(lines: list[str]) -> list[str]:
    cleaned = [line.rstrip() for line in lines]

    while cleaned and not cleaned[0]:
        cleaned.pop(0)
    while cleaned and not cleaned[-1]:
        cleaned.pop()

    normalized: list[str] = []
    previous_blank = False
    for line in cleaned:
        is_blank = line == ""
        if is_blank and previous_blank:
            continue
        normalized.append(line)
        previous_blank = is_blank

    return normalized


def save_sections(path: Path, sections: dict[str, list[str]]) -> None:
    path.write_text(render_sections(sections), encoding="utf-8")


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "pattern"


def parse_observation(line: str) -> Observation | None:
    pattern = re.compile(
        r'^- \[(?P<entry_date>\d{4}-\d{2}-\d{2})\] '
        r'pattern=(?P<key>[a-z0-9-]+) '
        r'skills=(?P<skills>[^ ]+) '
        r'source=(?P<source>[a-z0-9-]+) '
        r'rule="(?P<rule>[^"]+)" :: '
        r'(?P<summary>.+)$'
    )
    match = pattern.match(line.strip())
    if not match:
        return None
    return Observation(
        raw=line,
        entry_date=match.group("entry_date"),
        pattern=match.group("key"),
        skills=match.group("skills"),
        source=match.group("source"),
        rule=match.group("rule"),
        summary=match.group("summary"),
    )


def parse_promotion(line: str) -> Promotion | None:
    pattern = re.compile(
        r'^- \[(?P<entry_date>\d{4}-\d{2}-\d{2})\] '
        r'pattern=(?P<key>[a-z0-9-]+) '
        r'count=(?P<count>\d+) '
        r'rule="(?P<rule>[^"]+)"$'
    )
    match = pattern.match(line.strip())
    if not match:
        return None
    return Promotion(
        raw=line,
        entry_date=match.group("entry_date"),
        pattern=match.group("key"),
        count=int(match.group("count")),
        rule=match.group("rule"),
    )


def quote_rule(rule: str) -> str:
    return rule.replace('"', "'")


def initialize_file(args: argparse.Namespace) -> int:
    path = Path(args.file).resolve()
    ensure_file(path)
    save_sections(path, load_sections(path))
    print(f"Initialized {path}")
    return 0


def record_feedback(args: argparse.Namespace) -> int:
    path = Path(args.file).resolve()
    sections = load_sections(path)

    today = args.date or str(date.today())
    summary = args.summary.strip()
    rule = quote_rule(args.rule.strip() if args.rule else summary)
    skills = ",".join(args.skills) if args.skills else "general"
    pattern = args.pattern or slugify(rule)

    entry = (
        f'- [{today}] pattern={pattern} skills={skills} '
        f'source={args.source} rule="{rule}" :: {summary}'
    )
    sections["Patterns Observed"].append(entry)
    save_sections(path, sections)

    print(f"Recorded pattern '{pattern}' in {path}")
    return 0


def promote_patterns(args: argparse.Namespace) -> int:
    path = Path(args.file).resolve()
    sections = load_sections(path)

    observations = [
        parsed
        for parsed in (
            parse_observation(line) for line in sections["Patterns Observed"] if line.strip()
        )
        if parsed is not None
    ]
    promotions = [
        parsed
        for parsed in (
            parse_promotion(line) for line in sections["Promotion History"] if line.strip()
        )
        if parsed is not None
    ]

    promoted_patterns = {promotion.pattern for promotion in promotions}
    counts = Counter(observation.pattern for observation in observations)
    made_changes = False
    today = args.date or str(date.today())

    for pattern_key, count in sorted(counts.items()):
        if count < args.threshold or pattern_key in promoted_patterns:
            continue

        pattern_observations = [obs for obs in observations if obs.pattern == pattern_key]
        rule_counter = Counter(obs.rule for obs in pattern_observations)
        rule, _ = rule_counter.most_common(1)[0]
        rule_line = f"- {rule} [pattern={pattern_key}; promoted={today}; count={count}]"
        history_line = (
            f'- [{today}] pattern={pattern_key} count={count} rule="{quote_rule(rule)}"'
        )

        if args.dry_run:
            print(f"Would promote: {rule_line}")
            continue

        sections["Non-Negotiable Rules"].append(rule_line)
        sections["Promotion History"].append(history_line)
        made_changes = True
        print(f"Promoted pattern '{pattern_key}'")

    if made_changes:
        save_sections(path, sections)
    elif not args.dry_run:
        print("No patterns qualified for promotion.")

    return 0


def show_status(args: argparse.Namespace) -> int:
    path = Path(args.file).resolve()
    sections = load_sections(path)

    observations = [
        parsed
        for parsed in (
            parse_observation(line) for line in sections["Patterns Observed"] if line.strip()
        )
        if parsed is not None
    ]
    promotions = [
        parsed
        for parsed in (
            parse_promotion(line) for line in sections["Promotion History"] if line.strip()
        )
        if parsed is not None
    ]

    counts = Counter(observation.pattern for observation in observations)
    print(f"Learning file: {path}")
    print(f"Rules: {len([line for line in sections['Non-Negotiable Rules'] if line.strip().startswith('- ')])}")
    print(f"Observations: {len(observations)}")
    print(f"Promotions: {len(promotions)}")
    for pattern_key, count in sorted(counts.items()):
        print(f"- {pattern_key}: {count}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Self-learning helper for skill authoring.")
    parser.add_argument(
        "--file",
        default="learnings.md",
        help="Path to the learning log markdown file.",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    init_parser = subparsers.add_parser("init", help="Create the learning file if missing.")
    init_parser.set_defaults(func=initialize_file)

    record_parser = subparsers.add_parser("record", help="Record a feedback observation.")
    record_parser.add_argument("--summary", required=True, help="Short summary of the correction.")
    record_parser.add_argument("--rule", help="Reusable rule to promote if the pattern repeats.")
    record_parser.add_argument("--pattern", help="Stable pattern key, for example description-triggers.")
    record_parser.add_argument(
        "--skills",
        nargs="*",
        default=[],
        help="Affected skills. Multiple values are allowed.",
    )
    record_parser.add_argument(
        "--source",
        default="manual",
        choices=["manual", "user", "test", "review"],
        help="Where the observation came from.",
    )
    record_parser.add_argument("--date", help="Override the entry date (YYYY-MM-DD).")
    record_parser.set_defaults(func=record_feedback)

    promote_parser = subparsers.add_parser("promote", help="Promote repeated patterns into rules.")
    promote_parser.add_argument(
        "--threshold",
        type=int,
        default=2,
        help="Minimum number of repeated observations required for promotion.",
    )
    promote_parser.add_argument("--date", help="Override the promotion date (YYYY-MM-DD).")
    promote_parser.add_argument("--dry-run", action="store_true", help="Show promotions without writing.")
    promote_parser.set_defaults(func=promote_patterns)

    status_parser = subparsers.add_parser("status", help="Show learning file status.")
    status_parser.set_defaults(func=show_status)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
