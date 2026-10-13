# GithubSpecKit

This repository uses **[GitHub Spec Kit](https://github.com/github/spec-kit)** to practice **Spec-Driven Development (SDD)** with AI coding agents.

## Project Structure

- `.specify/`: Spec Kit templates, bash automation scripts, and shared infrastructure.
  - `.specify/memory/constitution.md`: The living project constitution and engineering standards.
- `.agents/skills/`: Agent skills for Spec-Driven Development workflows.

## Spec-Driven Development Lifecycle

1. **Constitution** (`/speckit-constitution`): Establish and maintain project principles and non-negotiables.
2. **Specify** (`/speckit-specify <feature description>`): Define the requirements, user stories, and acceptance criteria.
3. **Plan** (`/speckit-plan`): Produce an architectural blueprint and technology design.
4. **Tasks** (`/speckit-tasks`): Generate an ordered, dependency-aware task breakdown.
5. **Implement** (`/speckit-implement`): Execute the implementation tasks systematically.
6. **Converge** (`/speckit-converge`): Verify implementation consistency against specifications.
