#!/usr/bin/env python3
"""
merge_pitfalls.py — Merges locally learned Pitfalls into the remote SKILL.md before updating.
Usage:
  python3 merge_pitfalls.py <local_skill.md> <remote_skill.md>
"""

import sys
import os

def extract_pitfalls(content):
    lines = content.split('\n')
    in_pitfalls = False
    pitfalls_start_idx = -1
    pitfalls_end_idx = len(lines)
    pitfalls_content = []

    for i, line in enumerate(lines):
        if line.strip() == "## Pitfalls":
            in_pitfalls = True
            pitfalls_start_idx = i
            continue
        if in_pitfalls:
            if line.startswith("## "):
                pitfalls_end_idx = i
                break
            pitfalls_content.append(line)
            
    return pitfalls_start_idx, pitfalls_end_idx, pitfalls_content

def main():
    if len(sys.argv) < 3:
        print("Usage: merge_pitfalls.py <local_skill.md> <remote_skill.md>")
        sys.exit(1)

    local_path = sys.argv[1]
    remote_path = sys.argv[2]

    if not os.path.isfile(local_path) or not os.path.isfile(remote_path):
        sys.exit(0)

    with open(local_path, "r", encoding="utf-8") as f:
        local_content = f.read()

    with open(remote_path, "r", encoding="utf-8") as f:
        remote_content = f.read()

    l_start, l_end, l_pitfalls = extract_pitfalls(local_content)
    r_start, r_end, r_pitfalls = extract_pitfalls(remote_content)

    if l_start == -1 or r_start == -1:
        # Pitfalls section missing in one of them
        sys.exit(0)

    # Extract bullet points
    l_bullets = [line.strip() for line in l_pitfalls if line.strip().startswith("- ") or line.strip().startswith("* ")]
    r_bullets = [line.strip() for line in r_pitfalls if line.strip().startswith("- ") or line.strip().startswith("* ")]

    # Filter out empty placeholders like "- (Puste)" or "- **Puste**:"
    ignore_phrases = ["- (Puste)", "- **Puste**:", "- (Empty)"]
    l_bullets = [b for b in l_bullets if not any(b.startswith(p) for p in ignore_phrases)]

    # Find unique local bullets
    new_bullets = []
    for lb in l_bullets:
        if lb not in r_bullets:
            new_bullets.append(lb)

    if not new_bullets:
        print(f"  [pitfalls] No new local pitfalls found in {os.path.basename(os.path.dirname(local_path))}.")
        sys.exit(0)

    # We have new bullets to merge.
    # We will append them to the remote's pitfalls section.
    remote_lines = remote_content.split('\n')
    
    # Insert before r_end
    insert_lines = []
    if not r_bullets:
        # If remote had no real bullets, let's just add ours
        insert_lines.extend(new_bullets)
    else:
        insert_lines.extend(new_bullets)

    new_remote_lines = remote_lines[:r_end] + insert_lines + remote_lines[r_end:]
    
    with open(remote_path, "w", encoding="utf-8") as f:
        f.write("\n".join(new_remote_lines))

    print(f"  [pitfalls] Merged {len(new_bullets)} local pitfall(s) into the updated skill.")

if __name__ == "__main__":
    main()
