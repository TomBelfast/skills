import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tools import skill_curator


class SkillCuratorTests(unittest.TestCase):
    def test_scan_skills_reads_frontmatter_names(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            skill_dir = root / "skills" / "paid-ai-niche-discovery"
            skill_dir.mkdir(parents=True)
            (skill_dir / "SKILL.md").write_text(
                "---\n"
                "name: paid-ai-niche-discovery\n"
                "description: Use when researching paid AI niches.\n"
                "---\n"
                "\n"
                "# Paid AI Niche Discovery\n",
                encoding="utf-8",
            )

            skills = skill_curator.scan_skills(root / "skills")

            self.assertEqual([skill.name for skill in skills], ["paid-ai-niche-discovery"])
            self.assertEqual(skills[0].path, skill_dir)

    def test_pin_and_report_excludes_pinned_archive_candidates(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            skills_dir = root / "skills"
            stale_dir = skills_dir / "stale-skill"
            stale_dir.mkdir(parents=True)
            (stale_dir / "SKILL.md").write_text(
                "---\nname: stale-skill\ndescription: Use when stale.\n---\n",
                encoding="utf-8",
            )
            usage_path = root / ".skill-lab" / "curator" / "usage.json"
            usage = skill_curator.load_usage(usage_path)
            skill_curator.pin_skill(usage, "stale-skill", True)
            skill_curator.save_usage(usage_path, usage)

            report = skill_curator.build_report(
                skills=skill_curator.scan_skills(skills_dir),
                usage=skill_curator.load_usage(usage_path),
                stale_after_days=0,
                archive_after_days=0,
            )

            self.assertEqual(report["summary"]["pinned"], 1)
            self.assertEqual(report["archive_candidates"], [])
            self.assertEqual(report["skills"][0]["state"], "pinned")

    def test_write_report_creates_json_and_markdown(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            report = {
                "summary": {"total": 1, "pinned": 0, "stale_candidates": 1, "archive_candidates": 0},
                "skills": [{"name": "sample", "state": "stale", "reason": "unused"}],
                "stale_candidates": ["sample"],
                "archive_candidates": [],
            }

            run_dir = skill_curator.write_report(root, report)

            self.assertTrue((run_dir / "run.json").exists())
            self.assertTrue((run_dir / "REPORT.md").exists())
            parsed = json.loads((run_dir / "run.json").read_text(encoding="utf-8"))
            self.assertEqual(parsed["stale_candidates"], ["sample"])


if __name__ == "__main__":
    unittest.main()
