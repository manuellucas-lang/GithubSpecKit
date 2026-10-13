<!--
SYNC IMPACT REPORT
==================
- Version change: Unversioned draft -> 1.0.0
- List of modified principles:
  * [PRINCIPLE_1_NAME] -> I. Spec-First & Library-First Architecture
  * [PRINCIPLE_2_NAME] -> II. Test-First Quality Assurance (TDD Mandatory)
  * [PRINCIPLE_3_NAME] -> III. CLI-First & Text Protocol Interfaces
  * [PRINCIPLE_4_NAME] -> IV. Continuous Integration & Observability
  * [PRINCIPLE_5_NAME] -> V. Simplicity & YAGNI Principle
- Added sections:
  * Technical & Quality Standards
  * Development Workflow & Review Process
- Removed sections: None
- Follow-up TODOs: None
-->

# GithubSpecKit Constitution

## Core Principles

### I. Spec-First & Library-First Architecture
No feature, major refactoring, or capability may be implemented without an approved specification and technical blueprint. All components MUST be designed as modular, self-contained libraries with distinct public contracts before integration into higher-level workflows.

### II. Test-First Quality Assurance (TDD Mandatory)
Test-Driven Development is strictly non-negotiable across the codebase. Unit and contract test suites MUST be authored and confirmed failing prior to writing functional code. Every change MUST complete the Red-Green-Refactor cycle and maintain comprehensive automated test coverage.

### III. CLI-First & Text Protocol Interfaces
All core capabilities MUST be accessible and scriptable through command-line interfaces. Tooling must conform to standard I/O conventions (arguments and stdin as input, stdout for standard payload, stderr for diagnostics and error logging), supporting structured JSON alongside human-readable outputs.

### IV. Continuous Integration & Observability
All proposed changes MUST satisfy automated verification gates, including linting, static analysis, type checking, and automated tests, prior to merge. Structured logging and diagnostic observability hooks MUST be integrated into all executable paths.

### V. Simplicity & YAGNI Principle
Systems MUST favor the simplest viable architecture that satisfies declared specifications. Premature abstraction, speculative feature development, and unneeded dependencies are prohibited. Any introduced architectural complexity MUST be explicitly justified in the technical plan.

## Technical & Quality Standards
- All code MUST adhere strictly to repository language formatting and linting rules.
- Secrets, credentials, private access keys, and confidential tokens MUST NEVER be committed to version control.
- Breaking public contract changes require a major semantic version increment and an explicit migration plan.

## Development Workflow & Review Process
- Features follow the Spec-Driven Development (SDD) sequence: Specification (`/speckit-specify`) -> Plan (`/speckit-plan`) -> Tasks (`/speckit-tasks`) -> Implementation (`/speckit-implement`) -> Convergence (`/speckit-converge`).
- Every pull request MUST map to an approved specification and tracked tasks.
- Pull requests require passing continuous integration pipelines and peer approval before merging to the `main` branch.

## Governance
This Constitution supersedes all ad-hoc conventions and represents the non-negotiable source of truth for repository engineering standards. Amendments require documented justification, semantic version updates, and explicit maintainer ratification. All reviews and contributions MUST be audited against these constitutional principles.

**Version**: 1.0.0 | **Ratified**: 2026-10-13 | **Last Amended**: 2026-10-13
