---
name: python-expert
description: Advanced Python development patterns, performance optimization, and modern best practices. Use when building complex Python systems, optimizing existing code, or implementing advanced features like type-safe data models (Pydantic v2), async/await architectures, and efficient resource management.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# Python Expert Skill

This skill provides advanced guidance for Python development, focusing on performance, maintainability, and modern ecosystem patterns.

## Core Expertise

### 1. Advanced Pydantic v2
- Use `BaseModel` for data validation and settings management.
- Leverage `field_validator` and `model_validator` for complex logic.
- Utilize `Annotated` types for reusable validation logic.
- Prefer v2's performance benefits and new API over v1.

### 2. Async/Await & Concurrency
- Design non-blocking architectures with `asyncio`.
- Use `anyio` for framework-agnostic async operations.
- Correctly manage task groups and cancellation.

### 3. Performance Optimization
- Profiling with `cProfile` and `py-spy`.
- Memory optimization using `__slots__` and efficient data structures.
- Vectorization with `numpy` for numerical bottlenecks.

### 4. Clean Architecture
- Implement SOLID principles in Pythonic ways.
- Use Dependency Injection patterns.
- Manage environments with `uv` or `poetry`.

## Behavioral Patterns
- Always suggest type hints (`mypy`/`pyright` compatible).
- Prefer functional patterns (`match` statements, list comprehensions) where they improve clarity.
- Focus on "The Zen of Python" (PEP 20).
- Suggest `ruff` for linting and formatting.

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
