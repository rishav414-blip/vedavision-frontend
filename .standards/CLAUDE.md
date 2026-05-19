# CLAUDE.md — Project Constitution & Standards
**Version: 1.0** | Last Updated: 2025

> **This is the highest priority file in the project.**
> All AI agents (Claude, Cursor, etc.) and human developers must read and strictly follow
> this file and the entire `.standards/` folder before starting ANY work.

---

## 1. Project Philosophy

- Build reliable, maintainable, and high-quality systems.
- Simplicity over cleverness — if it's hard to explain, it's wrong.
- Small, incremental, and reversible changes always.
- Quality > Speed in the long term.
- Every mistake becomes a permanent rule in SKILLS.md.
- Assume the next developer is a junior who knows nothing about context.

---

## 2. Required Reading Order

Before starting any task, read these files in order:

1. **This file** — CLAUDE.md (Project Constitution)
2. **WORKFLOW.md** — Mandatory development process
3. **EVALUATION.md** — CourtEval quality gate & rubric
4. **ARCHITECTURE-PRINCIPLES.md** — Coding and design standards
5. **SKILLS.md** — Reusable patterns and lessons learned

---

## 3. Core Non-Negotiable Rules

| Rule | Detail |
|------|--------|
| Read `.standards/` first | No exceptions. Every task. |
| Follow WORKFLOW.md | All 8 steps. Do not skip. |
| CourtEval ≥ 85/100 | All code, features, and documents. |
| Test coverage ≥ 80% | For all new code. Measured via `jest --coverage` or `pytest --cov`. |
| No failing lints | Run `eslint` / `flake8` / `ruff` before committing. |
| No skipping steps | If a step feels unnecessary, document why — don't just skip it. |

---

## 4. Architecture & Coding Principles

See **ARCHITECTURE-PRINCIPLES.md** for full details. Summary:

- Feature-based folder structure (not type-based).
- Functions and modules: small, focused, single responsibility.
- Explicit over implicit — name things clearly.
- Make code easy to understand AND easy to delete.
- Use adapters for all external services (AI, DB, Auth, APIs).

---

## 5. Forbidden Practices

These are hard bans. No exceptions without Emergency Override (see Section 7):

- ❌ Large monolithic changes in a single commit.
- ❌ Shipping code without tests + CourtEval.
- ❌ Ignoring security, error handling, or edge cases.
- ❌ Over-engineering simple tasks.
- ❌ Hardcoding secrets, credentials, or environment values.
- ❌ Skipping Human Review for high-impact changes.
- ❌ Using `any` type in TypeScript without justification.
- ❌ Swallowing errors silently (empty catch blocks).

---

## 6. Definition of Done

A task is DONE only when ALL of these are true:

- [ ] Code is written and passes all linting rules.
- [ ] Tests written (TDD preferred) with ≥ 80% coverage.
- [ ] CourtEval score ≥ 85/100.
- [ ] PR description filled with CourtEval score + lessons learned.
- [ ] SKILLS.md updated if a new pattern or lesson was discovered.
- [ ] Human review completed for high-impact changes.

---

## 7. Emergency Override Policy

> Use sparingly. Every override must be documented and reviewed post-incident.

**When allowed:**
- Production is down and a hotfix is needed immediately.
- A critical security patch must ship before the next sprint.
- External dependency forces an urgent update.

**Override Process:**
1. Get verbal/written approval from the project lead or senior developer.
2. Create a branch named `hotfix/brief-description`.
3. Add a comment at the top of the PR: `EMERGENCY OVERRIDE — Reason: [explain]`.
4. Ship the minimal fix. No feature additions during override.
5. Within 48 hours: write the tests, run CourtEval, and update SKILLS.md with lessons.
6. Log the override in `OVERRIDES.log` at the project root.

**What is NOT an emergency:** "We're behind schedule." Speed is never a valid reason.

---

## 8. AI Agent Instructions (Claude, Cursor, GPT, etc.)

If you are an AI agent reading this:

1. Read ALL files in `.standards/` before responding or writing any code.
2. Never propose changes that violate Section 5 (Forbidden Practices).
3. Always run CourtEval on your output before presenting it.
4. If requirements are unclear, ask — do not assume.
5. Prefer smaller, focused pull requests over large changes.
6. When in doubt: prioritize correctness → security → clarity → maintainability.

---

**When in doubt:** Stop. Re-read this file. Ask a human.
