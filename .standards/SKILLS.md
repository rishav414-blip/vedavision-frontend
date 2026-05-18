# SKILLS.md — Reusable Skills & Patterns
**Version: 1.0**

> This file grows over time with proven patterns, lessons, and solutions from real work on this project.
> After every task, check if a new lesson belongs here. When in doubt — add it.

**Format for new entries:**
```
## [Pattern/Lesson Name]
**Date:** YYYY-MM-DD
**Task:** [What were you building?]
**Problem:** [What was tricky, went wrong, or needed solving?]
**Solution:** [How did you solve it?]
**Reusable Pattern:** [Code snippet or process]
**CourtEval Score:** XX/100
```

---

## Index

- [Pattern 1: Safe Database Queries — Parameterized Inputs](#pattern-1-safe-database-queries)
- [Pattern 2: Feature Folder Structure Template](#pattern-2-feature-folder-structure)
- [Pattern 3: CourtEval Iteration — How to Move from 70 to 88](#pattern-3-courteval-iteration)

---

## Pattern 1: Safe Database Queries

**Date:** 2025-01-01
**Task:** Fetch a user from PostgreSQL by ID.
**Problem:** Direct string interpolation in SQL queries creates SQL injection vulnerabilities (OWASP #1). This is easy to miss under deadline pressure.
**Solution:** Always use parameterized queries. Never interpolate user input into SQL strings.

**Reusable Pattern:**
```typescript
// ✅ Always do this
const result = await db.query(
  'SELECT id, name, email FROM users WHERE id = $1',
  [userId]  // Passed as parameter, never interpolated
);

// ❌ Never do this — SQL injection
const result = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

**Also applies to:** Search queries, filter inputs, any user-supplied value used in DB operations.
**CourtEval Score:** 91/100 (after fix)

---

## Pattern 2: Feature Folder Structure Template

**Date:** 2025-01-01
**Task:** Setting up a new feature from scratch.
**Problem:** Without a consistent structure, different features end up organized differently, making the codebase hard to navigate.
**Solution:** Use this folder template for every new feature.

**Reusable Pattern:**
```
features/
  [feature-name]/
    [feature-name].routes.ts     → Route definitions only
    [feature-name].service.ts    → Business logic
    [feature-name].repository.ts → DB queries
    [feature-name].schema.ts     → Zod/Joi input validation schemas
    [feature-name].types.ts      → TypeScript interfaces/types
    [feature-name].test.ts       → All tests for this feature
    index.ts                     → Public API of this feature (what it exports)
```

**Rule:** Nothing outside this folder should import from inside it, except via `index.ts`.
**CourtEval Score:** 89/100

---

## Pattern 3: CourtEval Iteration — How to Move from 70 to 88

**Date:** 2025-01-01
**Task:** First CourtEval run on a new feature.
**Problem:** First CourtEval attempts often score 65–75 because of missing edge case tests and inadequate error handling. It's tempting to argue with the Prosecutor instead of fixing the issues.
**Solution:** Follow this revision order for fastest score improvement:

**Reusable Pattern:**
```
Revision Priority Order (highest impact first):
1. Fix any Security issues first (20% weight — one SQL injection = -15 points)
2. Add missing tests for error paths and edge cases (Testing = 10%)
3. Add input validation at function boundaries (Correctness = 30%)
4. Add try/catch with meaningful error messages (Correctness + Maintainability)
5. Replace SELECT * with explicit columns (Maintainability)
6. Add JSDoc for public functions (Clarity)
7. Clean up naming and remove magic numbers (Clarity + Maintainability)
```

**Lesson:** Never argue with a valid Prosecutor point. If the Prosecutor is right, fix it — don't rebut it.
**CourtEval Score:** Went from 68 → 88 by following this order.

---

## Pattern 4: Anthropic Claude API with Prompt Caching for Chatbots

**Date:** 2026-05-18
**Task:** Migrate Jyoti chatbot from Groq/llama to Claude Haiku; upgrade system prompt quality.
**Problem:** The static system prompt was being re-sent in full on every API call, wasting tokens. Also, the Groq dependency conflicted with the project's mandate to use Claude.
**Solution:** Use Anthropic's `cache_control: ephemeral` on the system prompt block. The large static prompt (~4KB) is cached after the first call; subsequent calls within 5 minutes pay only for the dynamic chart context block.

**Reusable Pattern:**
```python
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

response = client.messages.create(
    model="claude-haiku-4-5-20251001",
    max_tokens=700,
    temperature=1.0,  # Anthropic's recommended value for non-extended-thinking
    system=[
        {
            "type": "text",
            "text": LARGE_STATIC_SYSTEM_PROMPT,
            "cache_control": {"type": "ephemeral"},  # Cache this — ~80% token savings on repeat calls
        },
        {
            "type": "text",
            "text": dynamic_per_request_context,     # Not cached — changes each call
        },
    ],
    messages=conversation_history,
)
reply = response.content[0].text
```

**Key lessons:**
- Import anthropic at module top level, not inside the request handler (avoids re-importing on every call).
- Separate static instructions from dynamic context into two system blocks — cache only the static one.
- `temperature=1.0` is Anthropic's recommended value; do not lower it thinking it improves quality (it doesn't for conversational models).
- Rename env var from `GROQ_API_KEY` → `ANTHROPIC_API_KEY` in the deployment platform (Render) dashboard.
**CourtEval Score:** 86/100 ✅ APPROVED

---

## Pattern 5: Chatbot System Prompt Architecture (Jyoti / Vedic Astrology)

**Date:** 2026-05-18
**Task:** Rewrite Jyoti system prompt to achieve highly skilled, on-policy chatbot responses.
**Problem:** The original system prompt had good conversation rules but was missing: few-shot FAQ examples, the reflection prompt library, the mental health crisis protocol, anti-patterns, and opening/closing conventions — all documented in chatbot_skill.md but not included.
**Solution:** Structured the system prompt following §11.1 of chatbot_skill.md: hard limits first (non-negotiable, early placement), then scope, then response architecture, then crisis protocol, then few-shot canonical FAQ examples, then tone guidance.

**Reusable Pattern (system prompt section order for constrained-persona chatbots):**
```
1. HARD LIMITS — non-negotiable rules, placed FIRST so the model sees them before anything else
2. IDENTITY & PERSONA — who the bot is and what it sounds like
3. SCOPE BOUNDARIES — what is in and out of scope, with graceful redirect language
4. RESPONSE ARCHITECTURE — length targets, structure model (acknowledge/illuminate/reflect/ground)
5. HUMAN-LIKE CONVERSATION RULES — emotional mirroring, opener variety, memory callbacks
6. CRISIS PROTOCOL — exact template response + do-not-do list
7. CANONICAL FAQ RESPONSES — few-shot examples that calibrate tone AND preserve policy
8. REFLECTION PROMPT LIBRARY — domain-specific prompts the model can choose from
9. ANTI-PATTERNS — explicit list of what NOT to do
10. OPENING/CLOSING CONVENTIONS
11. PERSONALISATION MANDATE — instruction to use injected context, not generic answers
```

**Key lesson:** Few-shot canonical responses are the single highest-value addition to a constrained chatbot prompt. They show the model exactly what correct behaviour looks like, far more reliably than rules alone.
**CourtEval Score:** 86/100 ✅ APPROVED

---

*Add new patterns below as the project grows. Aim for at least one entry per completed feature.*
