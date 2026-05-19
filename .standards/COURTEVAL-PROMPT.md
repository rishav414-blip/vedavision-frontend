# COURTEVAL-PROMPT.md — Official CourtEval Prompt Template
**Version: 1.0**

---

## How to Use

1. Copy the template below.
2. Fill in **Project Context** from CLAUDE.md and **Output to Evaluate** with your code/output.
3. Paste into Claude (claude.ai) or your preferred LLM.
4. Record the Final Score and Verdict.
5. If NEEDS_REVISION → fix and repeat until ≥ 85.

---

## The Prompt Template

```
You are running a CourtEval quality assessment. Follow all 4 steps exactly.

---

PROJECT CONTEXT:
[Paste the relevant section from CLAUDE.md — philosophy, rules, architecture principles]

OUTPUT TO EVALUATE:
[Paste the code, document, plan, or feature output here]

---

EVALUATION RUBRIC (Weighted):
- Correctness & Accuracy: 30%
- Security & Safety: 20%
- Maintainability: 15%
- Efficiency & Performance: 10%
- Testing & Edge Cases: 10%
- Clarity & Documentation: 8%
- UX / Usability: 7%

---

Follow these 4 steps in order. Do not skip any step.

STEP 1 — GRADER (Judge):
Score each rubric dimension (0 to max points for that dimension).
Give a brief justification for each score.
Calculate and state the initial total score.

STEP 2 — PROSECUTOR (Critic):
Ruthlessly identify every flaw, risk, missing edge case, and weakness.
Be explicit. Name specific lines, functions, or decisions that are problematic.
Do not soften criticism. The goal is to find what will break in production.

STEP 3 — DEFENDER:
Respond to each Prosecutor criticism point by point.
Acknowledge which criticisms are valid.
Explain and defend design decisions that were intentional and justified.

STEP 4 — FINAL GRADER:
Weigh Prosecutor vs Defender arguments.
Assign a Final Score (0-100).
List:
  - Top 3 Strengths
  - Top 3 Issues
  - Specific Recommended Fixes
  - Verdict: APPROVED (≥85) or NEEDS_REVISION (<85)
```

---

## Annotated Example Run

This example shows what a real CourtEval looks like so you can calibrate your own evaluations.

### Context
> A Node.js function to fetch a user by ID from a PostgreSQL database.

### Output Being Evaluated
```javascript
async function getUser(userId) {
  const result = await db.query(`SELECT * FROM users WHERE id = ${userId}`);
  return result.rows[0];
}
```

---

### STEP 1 — GRADER (Initial Score)

| Dimension | Max | Score | Justification |
|-----------|-----|-------|---------------|
| Correctness & Accuracy | 30 | 22 | Function returns correct data when input is valid. Does not handle the case where the user is not found (returns undefined silently). |
| Security & Safety | 20 | 2 | **Critical failure.** String interpolation directly in SQL query creates a SQL injection vulnerability. Any unsanitized userId can drop tables or expose data. |
| Maintainability | 15 | 10 | Simple and short. But `SELECT *` is a maintainability smell — schema changes will silently affect callers. |
| Efficiency & Performance | 10 | 7 | Single query, no N+1. No index assumption. Acceptable. |
| Testing & Edge Cases | 10 | 3 | No tests provided. Not handling null userId, non-existent user, or DB errors. |
| Clarity & Documentation | 8 | 5 | Function name is clear. No JSDoc. No comment explaining expected input format. |
| UX / Usability | 7 | 5 | N/A for internal function. Interface is predictable. |

**Initial Score: 54/100**

---

### STEP 2 — PROSECUTOR (Critic)

1. **SQL Injection — Critical.** `${userId}` is directly interpolated into the SQL string. An attacker can pass `1 OR 1=1` and get all users, or `1; DROP TABLE users; --` and destroy data. This is OWASP Top 1 and makes this function completely unsafe.

2. **Silent failure on missing user.** If no user is found, `result.rows[0]` returns `undefined`. Callers will get a silent undefined with no indication of whether the user doesn't exist or the DB call failed. This will cause confusing downstream `TypeError: Cannot read property 'x' of undefined` errors.

3. **No error handling.** If the DB connection drops, this function throws an unhandled exception that will crash the caller with no context about what failed.

4. **`SELECT *` is a maintainability trap.** If a column is added or removed from the `users` table, every caller of this function is silently affected. This makes refactoring dangerous.

5. **No input validation.** Nothing checks that `userId` is a valid integer before passing it to the query. A null, undefined, or string value will either cause a DB error or (worse) a SQL injection.

---

### STEP 3 — DEFENDER

1. **SQL Injection** — Conceded. This is a genuine critical vulnerability. No defense. Must be fixed with parameterized queries.

2. **Silent failure** — Valid criticism. The function should throw a `NotFoundError` or return `null` explicitly with documentation. Conceded.

3. **Error handling** — Valid. A try/catch with a meaningful error message should be added.

4. **`SELECT *`** — Valid for long-term maintainability. However, for a prototype or internal service this is a common starting point. Partially conceded — should be fixed before production.

5. **Input validation** — Partially conceded. The function assumes the caller validates, but defensive programming here would be better. Worth adding a guard.

---

### STEP 4 — FINAL GRADER

**Final Score: 48/100** — NEEDS_REVISION

**Top 3 Strengths:**
- Function is simple and focused (single responsibility).
- Correct data is returned for happy-path scenarios.
- Async/await used correctly.

**Top 3 Issues:**
- SQL injection vulnerability (critical — must fix before anything else).
- No error handling or meaningful failure modes.
- No tests covering edge cases.

**Recommended Fixes:**
```javascript
// Fixed version
async function getUser(userId) {
  if (!userId || typeof userId !== 'number') {
    throw new Error(`Invalid userId: ${userId}`);
  }

  try {
    // Parameterized query — prevents SQL injection
    const result = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null; // Explicit — caller can handle "not found"
    }

    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to fetch user ${userId}: ${err.message}`);
  }
}
```

**Verdict: 🔄 NEEDS_REVISION** — Re-evaluate after applying fixes above.

---

## Tips for Effective CourtEval

- **Prosecutor** should always check the Security Checklist in EVALUATION.md.
- **Defender** should never defend a SQL injection, hardcoded secret, or missing test.
- If you're evaluating your own output, ask Claude to play all 4 roles — it removes bias.
- Record every score in your PR description. Trend your scores over time.
