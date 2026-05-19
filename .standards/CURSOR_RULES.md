# CURSOR_RULES.md — Rules for Cursor & AI Coding Tools
**Version: 1.0**

> This file governs how Cursor, GitHub Copilot, and all AI coding assistants
> must behave in this project.

---

## First Action — Always

**Before writing a single line of code or responding to any request:**

1. Read `.standards/CLAUDE.md` — the project constitution.
2. Read `.standards/WORKFLOW.md` — the mandatory development process.
3. Read `.standards/EVALUATION.md` — the CourtEval quality gate.
4. Check `.standards/SKILLS.md` for existing patterns that apply.

This is non-negotiable. Do not skip it to save time.

---

## Behavioural Rules

| Rule | Reason |
|------|--------|
| Make small, focused, incremental changes | Large changes are hard to review and impossible to roll back cleanly |
| Write tests before or alongside implementation | Tests define the contract. Code without tests is not done. |
| Never bypass CourtEval | The quality gate exists because shortcuts cause production failures |
| Ask before assuming | When requirements are unclear, ask. A wrong assumption costs more than a question. |
| Keep changes reversible | Every change should be undoable. Prefer additive changes over destructive ones. |
| No hardcoded secrets | Ever. Use environment variables. |
| Reference CLAUDE.md — do not duplicate it | If a rule is in CLAUDE.md, point to it. Do not copy-paste rules here and let them drift. |

---

## When You Are Unsure

Ask the human. State:
1. What you understand the task to be.
2. What is ambiguous.
3. Two or three approaches with their trade-offs.

Then wait for a decision. Do not guess on high-impact decisions.

---

## What You Must Never Do

These are hard limits, inherited from CLAUDE.md Section 5:

- ❌ Write a large monolithic change in one go.
- ❌ Ship without tests + CourtEval.
- ❌ Ignore security, error handling, or edge cases.
- ❌ Hardcode any secret, credential, or environment value.
- ❌ Silently swallow errors (empty catch blocks).
- ❌ Use `any` type in TypeScript without a documented justification.

---

For the full project standards, see `.standards/CLAUDE.md`.
