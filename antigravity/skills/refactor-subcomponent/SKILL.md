---
name: refactor-subcomponent
description: Safely extracts logic and UI from a large React "God Component" into smaller, manageable sub-components.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# Skill: Refactor Subcomponent

This skill guides the agent through the process of extracting a section of a large React component (Function Component) into a separate, cleaner sub-component.

## Procedure

### 1. Analysis & Scoping
**Input:** Source file path, and a description of the section to extract (e.g., "The Phase 22 Preview logic" or "The Settings Modal").

1.  **View Source:** Read the entire source file to understand the context.
2.  **Identify Block:** Locate the JSX lines corresponding to the section.
3.  **Trace Dependencies:** Identify all variables, functions, and hooks used within that block.
    *   **Local State (`useState`):** Does the block *read* or *write* to this state?
    *   **Props:** which props of the parent are used here?
    *   **Context:** Does it use `useContext`?
    *   **Local Functions:** Are there handlers defined in the parent used only here?

### 2. Strategy Definition
Decide on the destination.
*   **Directory:** If the parent is `ProjectPhases.tsx`, and we extract "Phase 22", the best structure is usually a new directory: `src/components/ProjectPhases/Phase22/`.
*   **New File:** Name the file semantically, e.g., `Phase22Preview.tsx`.

### 3. Execution (Step-by-Step)

#### Step 3a: Create the New Component
Create the new file.
*   **Imports:** Copy necessary imports (React types, UI components, icons, utils) from the parent.
*   **Interface:** Define `interface Props` based on the *Dependencies* identified in Step 1.
    *   *Tip:* If too many props are needed (Prop Drilling), consider if the logic (hooks) should also move to the child, or if a Context is better. For now, strict extraction is safer.
*   **Component Body:** Paste the logic and JSX.
*   **Exports:** Export the component (default or named).

#### Step 3b: Updates Parent Component
*   **Import:** Import the new component in the parent file.
*   **Replace:** Replace the extracted JSX block with the new component tag.
*   **Pass Props:** Pass all identified variables as props.

#### Step 3c: Cleanup
*   **Remove Dead Code:** In the parent file, remove imports and variables that were *only* used in the extracted section.
*   **Lint:** Ensure no unused variables remain.

## Example Prompt for Agent
"Please refactor `frontend/src/pages/ProjectPhases.tsx`. Extract the entire render logic for 'Phase 22' into a new component named `Phase22Preview` located in `frontend/src/components/ProjectPhases/Phase22/`."

## Safety Checklist
- [ ] **Compilation:** Does the code compile after changes?
- [ ] **Hot Reload:** Does the specific feature still appear in the UI?
- [ ] **State Sync:** If the child updates state, does the parent reflect it (if passed via setter)?

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
