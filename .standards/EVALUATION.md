# EVALUATION.md — Quality Gate Standards
**Version: 1.0**

> All generated outputs — code, features, documents, plans — must pass the CourtEval process
> before being committed, shipped, or presented to a human reviewer.

---

## CourtEval Process (4 Steps)

### Step 1 — Grader (Judge)
- Review the output against all rubric dimensions below.
- Give an initial score (0–100) with a brief justification for each dimension.
- Be objective. Neither lenient nor harsh — just accurate.

### Step 2 — Prosecutor (Critic)
- Ruthlessly find every flaw, risk, edge case, and weakness.
- No politeness. No softening. Every issue must be named explicitly.
- Ask: "What could go wrong? What was missed? What is brittle?"
- Look specifically for: security holes, missing tests, unclear naming, hidden assumptions.

### Step 3 — Defender
- Rebut each of the Prosecutor's criticisms point by point.
- Acknowledge valid criticisms — do not defend what is genuinely wrong.
- Clarify design decisions that may have been misunderstood.
- The Defender's job is to find what the Prosecutor got wrong, not to deny all flaws.

### Step 4 — Final Grader
- Weigh Prosecutor vs. Defender arguments.
- Assign a final score (0–100).
- List: Top 3 Strengths, Top 3 Issues, Recommended Fixes.
- Issue one of two verdicts:
  - ✅ **APPROVED** — Score ≥ 85. Ready to commit.
  - 🔄 **NEEDS_REVISION** — Score < 85. Return to implementation with specific fixes.

---

## Evaluation Rubric (Weighted — Total: 100%)

### 1. Correctness & Accuracy — 30%
Does the output do exactly what it is supposed to do?

| Score | Criteria |
|-------|----------|
| 27–30 | Fully correct. Handles all edge cases. No logic errors. |
| 20–26 | Mostly correct. Minor edge cases missed. |
| 10–19 | Partially correct. Key scenarios fail or produce wrong results. |
| 0–9   | Fundamentally broken or incorrect. |

**Check for:** Off-by-one errors, null/undefined handling, type mismatches, incorrect business logic, missing return values.

---

### 2. Security & Safety — 20%
Is the output free from vulnerabilities and safe to run in production?

| Score | Criteria |
|-------|----------|
| 18–20 | No known vulnerabilities. All items in checklist below pass. |
| 13–17 | Minor issues. No critical vulnerabilities. |
| 7–12  | Moderate risks present. Should not ship without fixes. |
| 0–6   | Critical vulnerability present. Must not ship. |

**Security Checklist (all must pass for full marks):**
- [ ] No hardcoded secrets, API keys, passwords, or tokens.
- [ ] All user inputs are validated and sanitized before use.
- [ ] No SQL injection vectors (use parameterized queries / ORM).
- [ ] No XSS vectors (output is escaped before rendering in HTML).
- [ ] Authentication checks are present on all protected routes/functions.
- [ ] Authorization is enforced (user can only access their own data).
- [ ] Sensitive data is not logged or exposed in error messages.
- [ ] Dependencies have no known critical CVEs (run `npm audit` / `pip-audit`).
- [ ] File uploads are validated for type and size.
- [ ] Rate limiting exists on public-facing endpoints (or is noted as a known gap).

---

### 3. Maintainability — 15%
Can another developer understand, modify, and delete this code easily?

| Score | Criteria |
|-------|----------|
| 13–15 | Clean, readable, well-named. Easy to delete. No god objects. |
| 9–12  | Mostly clean. Some naming or structure issues. |
| 5–8   | Hard to follow in places. Requires context to understand. |
| 0–4   | Spaghetti. Would require full rewrite to change. |

**Check for:** Function length > 50 lines (flag it), unclear variable names, deeply nested conditionals (> 3 levels), no separation of concerns, missing comments on non-obvious logic.

---

### 4. Efficiency & Performance — 10%
Is the code performant enough for its expected load?

| Score | Criteria |
|-------|----------|
| 9–10  | No obvious inefficiencies. Scales appropriately. |
| 6–8   | Minor inefficiencies. Acceptable for expected load. |
| 3–5   | N+1 queries, unnecessary loops, or blocking operations present. |
| 0–2   | Would cause serious performance problems in production. |

**Check for:** N+1 database queries, missing indexes, synchronous blocking in async contexts, unbounded loops, large payloads being loaded into memory.

---

### 5. Testing & Edge Cases — 10%
Are the tests adequate and do they cover the important paths?

| Score | Criteria |
|-------|----------|
| 9–10  | ≥ 80% coverage. Happy path + error paths + edge cases all tested. |
| 6–8   | ≥ 60% coverage. Happy path tested. Some edge cases missing. |
| 3–5   | < 60% coverage. Only basic tests. |
| 0–2   | No tests or tests are meaningless (testing implementation, not behavior). |

**Check for:** Missing tests for null/empty inputs, missing tests for error states, tests that are tightly coupled to implementation (test behavior, not internals), no assertion in test body.

---

### 6. Clarity & Documentation — 8%
Is the code and its intent clear without needing to ask the author?

| Score | Criteria |
|-------|----------|
| 7–8   | Self-documenting code. Comments explain WHY, not WHAT. README updated if needed. |
| 5–6   | Mostly clear. Some functions need explanation. |
| 2–4   | Unclear intent. Requires significant context to understand. |
| 0–1   | Undocumented and confusing throughout. |

---

### 7. UX / Usability — 7%
If user-facing: is the experience intuitive, informative, and accessible?
If API/internal: are interfaces clean and predictable?

| Score | Criteria |
|-------|----------|
| 6–7   | Excellent UX. Error messages are helpful. Loading states handled. |
| 4–5   | Good UX with minor gaps. |
| 2–3   | Functional but unintuitive or missing important feedback. |
| 0–1   | Poor UX. Would confuse or frustrate users. |

---

## Score Interpretation

| Score | Verdict | Action |
|-------|---------|--------|
| 90–100 | ✅ APPROVED — Excellent | Commit and ship. |
| 85–89  | ✅ APPROVED — Good | Commit. Note minor issues for future cleanup. |
| 75–84  | 🔄 NEEDS_REVISION — Close | Address Prosecutor's top 2–3 issues, re-evaluate. |
| 60–74  | 🔄 NEEDS_REVISION — Significant gaps | Major revision required before re-evaluation. |
| 0–59   | ❌ REJECTED | Rethink approach. Do not patch — redesign. |

**Minimum to ship: 85/100. No exceptions without Emergency Override (see CLAUDE.md Section 7).**
