---
name: ollama-claude
description: Provision Proxmox LXC containers with Claude Code and a centralized Ollama wrapper (OLLAMA_HOST=192.168.0.10:11434).
---

# Ollama-Claude Provisioning Skill

## Auto-Correction Rules

When you use this skill and find an error, outdated command, missing step,
or pitfall — FIX IT IMMEDIATELY. Do not wait or ask permission.

1. Read the current SKILL.md using your `view_file` tool (e.g., `view_file {AbsolutePath: "/root/.agents/skills/<skill-name>/SKILL.md"}`).
2. Edit it with your file editing tools (`replace_file_content` or `multi_replace_file_content`) to correct the mistake.
3. Add any discovered pitfalls to the `## Pitfalls` section.
4. Report what you fixed to the user.

If a command doesn't work, a path is wrong, or a step is missing — 
update the skill before finishing your current task.

## Pitfalls

- **yaml vs yml**: Be aware of `.yml` vs `.yaml` extensions in configuration files. If a file operation fails, always check both extensions.


This skill allows the agent to quickly set up any Proxmox LXC container for interaction with Claude Code using a centralized Ollama host and the `glm-5.1:cloud` model.

## Capabilities

- **Automatic Node.js Installation**: Installs Node.js 20.x if missing.
- **Global Claude Code Deployment**: Installs `@anthropic-ai/claude-code` via npm.
- **Centralized Wrapper**: Replaces `/usr/bin/ollama` with a wrapper that:
  - Injects `OLLAMA_HOST=http://192.168.0.10:11434`.
  - Sets `glm-5.1:cloud` as the default model.
  - Passes through other Ollama commands to a local `ollama-bin`.

## Usage

Run the following command on the Proxmox host to provision a container:

```bash
/root/scripts/setup-ollama-claude.sh <CTID>
```

### Supported Containers
The current active cluster includes:
- **135** (social-media)
- **1013** (AMA-Matrix)
- **257** (FILM)
- **1021** (Rekrutacja)
- **155** (Api-YouTube)
- **103** (rent)
- **1022** (Hermes)

## Manual Verification
After setup, verify in the container:
```bash
pct exec <CTID> -- ollama --version
pct exec <CTID> -- claude --version
```
