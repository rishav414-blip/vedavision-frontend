# WORKFLOW.md — Standard Development Process
**Version: 1.0**

> **Every single task — no matter how small — must follow this workflow.**
> Skipping steps is a forbidden practice per CLAUDE.md.

---

## The 8-Step Workflow

### Step 1 — Preparation
- Read ALL files in `.standards/` folder.
- Review SKILLS.md for any existing patterns that apply to this task.
- Check if similar work has been done in the codebase before starting.

**Output:** Confirm you understand the full standards before proceeding.

---

### Step 2 — Specification
Write a short spec before touching any code. Answer these:

```
Task: [One sentence description]
Requirements:
  - [Requirement 1]
  - [Requirement 2]
Edge Cases:
  - [What happens when input is empty/null/invalid?]
  - [What happens under load or concurrent access?]
Success Criteria:
  - [How do we know this is done correctly?]
Out of Scope:
  - [What this task explicitly does NOT do]
```

---

### Step 3 — Planning
- Break the task into small, independently reviewable increments.
- Each increment should be < 200 lines of changed code where possible.
- Identify which existing modules/files will be touched.
- Flag any high-impact changes that require Human Review (Step 8).

---

### Step 4 — Implementation (TDD Preferred)

**Order of operations:**
1. Write failing tests first (define the contract).
2. Write the minimum code to make tests pass.
3. Refactor for clarity and maintainability.
4. Repeat for each increment.

**During implementation:**
- Follow ARCHITECTURE-PRINCIPLES.md strictly.
- Keep commits small and descriptive.
- Comment non-obvious logic — not what it does, but WHY.
- No hardcoded secrets or environment values.

---

### Step 5 — Quality Gate

Run all checks in this order. Do NOT skip any.

#### Linting
```bash
# JavaScript / TypeScript
npx eslint . --fix

# Python
ruff check . --fix
# or
flake8 .
```

#### Tests + Coverage
```bash
# JavaScript / TypeScript (Jest)
npx jest --coverage --coverageThreshold='{"global":{"lines":80}}'

# Python (pytest)
pytest --cov=. --cov-report=term-missing --cov-fail-under=80
```

Coverage must be ≥ 80% for new code. If below threshold, the pipeline fails.

#### CourtEval
- Use the template in **COURTEVAL-PROMPT.md**.
- Paste your output into Claude or your preferred LLM.
- Record the score.
- **Minimum score to proceed: 85/100.**

---

### Step 6 — Revision

If CourtEval score < 85 OR tests fail OR linting fails:

1. Read the Prosecutor's specific criticisms carefully.
2. Address each issue. Do not argue with the rubric.
3. Re-run the full Quality Gate (Step 5).
4. Repeat until score ≥ 85.

Do NOT commit code that is in revision state.

---

### Step 7 — Reflection

After passing the Quality Gate, document lessons in **SKILLS.md**:

```markdown
## [Pattern/Lesson Name]
**Date:** YYYY-MM-DD
**Task:** [Brief description of what you were building]
**Problem:** [What went wrong or what was tricky]
**Solution:** [How you solved it]
**Reusable Pattern:**
  [Code snippet or process description]
**CourtEval Score:** XX/100
```

Only skip this step if the task was trivial and no new patterns emerged. When in doubt, document.

---

### Step 8 — Human Review

Required for:
- Any change to authentication or authorization logic.
- Database schema changes or migrations.
- Changes to `.standards/` files themselves.
- Any change affecting > 3 files or > 300 lines.
- New external service integrations.
- Anything that modifies payment, billing, or PII data.

**Process:**
- Open a PR using the template in `.github/PULL_REQUEST_TEMPLATE.md`.
- Assign at least one human reviewer.
- Do not merge without approval.

---

## Quick Reference Checklist

```
[ ] Step 1 — Read .standards/ folder
[ ] Step 2 — Wrote spec (requirements, edge cases, success criteria)
[ ] Step 3 — Broke task into small increments
[ ] Step 4 — Wrote tests first, then implementation
[ ] Step 5 — Linting PASSED
[ ] Step 5 — Test coverage ≥ 80% PASSED
[ ] Step 5 — CourtEval ≥ 85/100 PASSED
[ ] Step 6 — Revised if needed (repeat until passing)
[ ] Step 7 — SKILLS.md updated with lessons learned
[ ] Step 8 — Human review completed (if required)
```

Only commit and push after every box above is checked.
