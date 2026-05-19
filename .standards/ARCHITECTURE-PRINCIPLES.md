# ARCHITECTURE-PRINCIPLES.md — Core Architecture Standards
**Version: 1.0**

> These principles apply to all code in this project. When in doubt, re-read them.
> They exist to make the codebase survivable as it grows.

---

## 1. Simplicity First

The right solution is the simplest one that correctly solves the problem.

| ✅ Do | ❌ Don't |
|-------|---------|
| Write a 10-line function that does one thing | Write a 100-line "flexible, extensible" framework for a one-time task |
| Use the standard library when it fits | Import a 3rd-party library to do what 5 lines of code can |
| Name things clearly so comments aren't needed | Write clever, terse code and justify it with a long comment |

---

## 2. Separation of Concerns

Each layer should have one job. Layers should not know about each other's internals.

**Layered structure:**
```
routes/      → HTTP only (parse request, call service, return response)
services/    → Business logic only (no HTTP, no DB queries)
repositories/ → Data access only (no business logic, no HTTP)
models/      → Data shapes and validation only
utils/       → Pure functions with no side effects
```

| ✅ Do | ❌ Don't |
|-------|---------|
| Put DB queries in a repository function | Write `db.query(...)` directly inside a route handler |
| Put business rules in a service | Put `if (user.role === 'admin')` logic in the repository |
| Return plain objects from services | Return raw DB result objects to the route layer |

---

## 3. Make Code Easy to Delete

If we decide a feature was wrong, deleting it should be painless. Tight coupling makes deletion painful.

| ✅ Do | ❌ Don't |
|-------|---------|
| Keep a feature's code in one folder | Spread one feature across 10 different files in different folders |
| Use dependency injection | Hardcode dependencies so they can't be swapped |
| Write isolated modules with clear inputs/outputs | Create modules that secretly depend on global state |

---

## 4. Feature Folders Over Type Folders

Organize code by feature (what it does for the user), not by file type.

| ✅ Feature Folder | ❌ Type Folder |
|-----------------|--------------|
| `features/auth/` | `controllers/authController.js` |
| `features/auth/auth.service.ts` | `services/authService.js` |
| `features/auth/auth.routes.ts` | `routes/auth.js` |
| `features/auth/auth.test.ts` | `tests/auth.test.js` |

When a feature is deleted, you delete one folder. Nothing else changes.

---

## 5. Small, Focused Modules (Avoid God Files)

A function should do one thing. A module should own one concept.

| ✅ Do | ❌ Don't |
|-------|---------|
| Functions under 30 lines | Functions over 100 lines that do 5 different things |
| One export concept per file | `utils.js` with 40 unrelated helper functions |
| Name functions as verbs: `getUserById`, `sendWelcomeEmail` | Name functions `handleStuff` or `processData` |

**Flag for review:** Any function over 50 lines or any file over 300 lines.

---

## 6. Adapters for External Services

Never talk to external services (AI APIs, payment gateways, email providers, databases) directly from business logic. Always use an adapter.

**Pattern:**
```typescript
// ✅ Correct — adapter pattern
interface EmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

class SendGridAdapter implements EmailProvider {
  async sendEmail(to, subject, body) { /* SendGrid specific */ }
}

class MockEmailAdapter implements EmailProvider {
  async sendEmail(to, subject, body) { /* For testing */ }
}

// Business logic uses the interface, not SendGrid directly
class UserService {
  constructor(private email: EmailProvider) {}
  async sendWelcome(user: User) {
    await this.email.sendEmail(user.email, 'Welcome!', '...');
  }
}
```

| ✅ Do | ❌ Don't |
|-------|---------|
| Swap email providers by changing one line | Rewrite 12 files when switching from SendGrid to SES |
| Mock the adapter in tests | Make real API calls in unit tests |
| Define an interface for the adapter | Tie business logic to a specific vendor's SDK |

---

## 7. Strong Input Validation and Error Handling

Validate at the boundary. Handle errors with context. Never swallow exceptions.

```typescript
// ✅ Validate at entry point
function createUser(input: unknown) {
  const parsed = CreateUserSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid user input', parsed.error.issues);
  }
  // Now safe to use parsed.data
}

// ✅ Handle errors with context
try {
  await sendEmail(user.email);
} catch (err) {
  throw new Error(`Failed to send welcome email to ${user.id}: ${err.message}`);
}

// ❌ Never do this
try {
  await riskyOperation();
} catch (e) {
  // silently swallowed — nobody knows this failed
}
```

---

## 8. Design for Swappability

Any major dependency (database, auth provider, AI model, storage) should be replaceable without rewriting business logic.

| Component | Make Swappable Via |
|-----------|-------------------|
| Database | Repository interface |
| Auth provider | Auth adapter |
| AI model | AI client interface |
| Email provider | Email adapter |
| File storage | Storage adapter |

**Test:** Can you switch from PostgreSQL to MongoDB by changing only the repository layer? If yes — architecture is correct. If no — fix the coupling.

---

## 9. Explicit is Better than Implicit

Code should state its intent clearly. Avoid magic, hidden side effects, and clever shortcuts.

| ✅ Do | ❌ Don't |
|-------|---------|
| `const isAdmin = user.role === 'admin'` | Rely on middleware setting `req.isAdmin` with no documentation |
| `throw new NotFoundError('User not found')` | Return `null` and let callers guess why |
| `function getUserById(id: string): Promise<User \| null>` | Return different shapes depending on silent conditions |
| Pass dependencies explicitly via constructor | Use global singletons or module-level state |

---

## Checklist Before Every PR

- [ ] Does each function do exactly one thing?
- [ ] Is each layer (route/service/repo) doing only its job?
- [ ] Are all external services behind adapters?
- [ ] Is every input validated at the boundary?
- [ ] Are all errors caught and re-thrown with context?
- [ ] Is this feature contained in its own folder?
- [ ] Can this code be deleted without touching unrelated files?
