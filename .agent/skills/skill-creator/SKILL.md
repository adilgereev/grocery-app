---
name: skill-creator
description: Create new skills, modify and improve existing skills, and measure skill performance. Use when you want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, or optimize a skill's description for better triggering accuracy.
---
# Skill Creator: Meta-Skill for Antigravity

This skill provides a structured process for creating and iteratively improving other skills in the Grocery App project.

## Core Process
1. **Capture Intent**: Define the purpose of the skill. When should it trigger? What is the expected output?
2. **Draft the Skill**: Write the initial `SKILL.md` using project-specific templates.
3. **Evals and Testing**: Create test prompts in `evals/evals.json` and verify the assistant's performance.
4. **Refine and Improve**: Iteratively improve the skill based on testing results and user feedback.

## Skill Structure
```text
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description required)
│   └── Markdown instructions
├── templates/    - Skeletons for different domain types
└── evals/        - JSON test cases for verification
```

## Writing Guidelines
- **Description**: Be specific and slightly "pushy" in the description to ensure proper triggering.
- **Progressive Disclosure**: Keep instructions under 500 lines. Use external references if needed.
- **Principles**: Follow the UI standards (Emerald Minimalism) and code standards defined in the project rules.

## Using Templates
When creating a new skill, check `.agent/skills/skill-creator/templates/` for:
- `api-integration.md`: For all external API services.
- `ui-component.md`: For specialized UI logic or design systems.

## Evaluation (Testing)
Always define an `evals/evals.json` with at least 2-3 realistic test cases.
Format:
```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "Specific user request",
      "expected_outcome": "Description of the correct behavior"
    }
  ]
}
```
