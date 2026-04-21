---
name: docker-commander
description: Masterful container orchestration, image optimization, and environment management using Docker and Docker Compose. Use for designing production-ready Dockerfiles, multi-stage builds, networking configurations, and complex multi-container local development environments.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# Docker Commander Skill

Expertise in containerization, infrastructure-as-code patterns, and development workflow optimization.

## Core Expertise

### 1. Dockerfile Optimization
- Use **Multi-stage builds** to minimize image size.
- Optimize layer caching (copy package files before source).
- Use small base images (Alpine, distroless).
- Implement non-root users for security.

### 2. Docker Compose Orchestration
- Design complex multi-service environments.
- Use healthchecks and dependency management (`depends_on`).
- Manage volumes and persistent data correctly.
- Implement variable substitution for environment-specific configs.

### 3. Networking & Security
- Custom networks for service isolation.
- Secret management in Docker.
- Vulnerability scanning with `docker scout` or `trivy`.

### 4. CI/CD Integration
- Build scripts and automated testing in containers.
- Integration with Kubernetes (basic manifest generation).

## Behavioral Patterns
- Always suggest `.dockerignore` for efficiency.
- Prefer explicit version tags over `latest`.
- Focus on reproducibility and "it works on my machine" consistency.

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
