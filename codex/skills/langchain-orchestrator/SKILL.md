---
name: langchain-orchestrator
description: Designing and implementing advanced AI systems using LangChain v0.2+. Use for building RAG pipelines, autonomous agents, multi-agent orchestrations, and complex prompt engineering workflows. Focused on production-ready chains, tracing (LangSmith), and efficient document processing.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# LangChain Orchestrator Skill

Expertise in building scalable, production-grade AI applications using the LangChain ecosystem.

## Core Capabilities

### 1. LCEL (LangChain Expression Language)
- Build composable and readable chains.
- Handle streaming and async execution natively.
- Implement fallbacks and retrying logic.

### 2. Advanced RAG (Retrieval Augmented Generation)
- Implement hybrid search (semantic + keyword).
- Multi-query and self-query retrieval patterns.
- Parent Document Retriever and Contextual Compression.

### 3. Agentic Workflows
- Build agents with tool-calling capabilities.
- Implement LangGraph for cyclic and complex multi-agent state machines.
- Human-in-the-loop patterns.

### 4. Integration & Tooling
- Vector store integrations (Chroma, Pinecone, Qdrant).
- Memory management (Zep, PostgresChatMessageHistory).
- Observability with LangSmith.

## Best Practices
- Always use `Runnable` interfaces.
- Separate prompt templates from logic.
- Implement robust error handling for LLM calls.
- Prefer Pydantic for tool schemas and structured output.

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
