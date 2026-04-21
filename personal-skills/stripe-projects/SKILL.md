---
name: stripe-projects
description: >-
  Use when setting up a new app or local repo with Stripe Projects, provisioning
  a software stack, or bootstrapping the Projects CLI from a coding agent.

---


## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

Stripe Projects is a CLI for provisioning software stacks.

Docs are here: https://docs.stripe.com/projects.md

Download the Projects CLI and run `stripe projects init` to get started. You get access to more skills when you do that.

To install the Stripe CLI and Projects plugin, Homebrew users can run `brew install stripe/stripe-cli/stripe && stripe plugin install projects`. For other installation options, see https://docs.stripe.com/stripe-cli/install.md.

After `stripe projects init`, prefer the local project skills it creates.

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
