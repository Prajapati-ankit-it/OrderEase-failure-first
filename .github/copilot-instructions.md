# Copilot Instructions – OrderEase Architecture & Quality Guardrails

## 🧠 Role & Responsibility
You are acting as a **senior backend engineer** responsible for enforcing **Clean Architecture**, **LLD correctness**, and **production readiness** across the entire OrderEase codebase.

Your job is to **audit, verify, and refactor** code while preserving all existing behavior.

---

## 🏗️ Mandatory Architecture (STRICT)

### Layered Structure (Per Module)

src/modules/<module>/
├── <module>.controller.ts // HTTP only
├── <module>.service.ts // orchestration only
├── domain/
│ ├── <entity>.entity.ts
│ ├── <entity>.rules.ts
│ └── <entity>.errors.ts
├── infra/
│ ├── <module>.repo.ts // repository interface
│ └── prisma-<module>.repo.ts
├── dto/
└── index.ts



---

## 🔒 Layer Rules (NON-NEGOTIABLE)

### Controllers
✅ Allowed:
- HTTP request/response handling
- DTO validation
- Calling services

❌ Forbidden:
- Business logic
- Database access
- Calculations
- Transactions

---

### Services
✅ Allowed:
- Orchestration
- Transactions
- Calling domain + repositories

❌ Forbidden:
- Prisma access
- HTTP concerns
- Framework-specific decorators

---

### Domain Layer
✅ Allowed:
- Business rules
- Invariants
- Pure functions
- Domain errors

❌ Forbidden:
- NestJS imports
- Prisma imports
- Side effects
- I/O

Domain must be **framework-agnostic** and **fully unit-testable**.

---

### Repositories
✅ Allowed:
- Database access only
- Mapping persistence → domain

❌ Forbidden:
- Business rules
- Validation
- Calculations

---

## 🔁 Dependency Direction (CRITICAL)

Controller → Service → Domain → Repository Interface
↑
Infra implements interface


- No reverse dependencies
- No circular imports
- No framework leakage into domain

---

## 🧠 Memory Safety & Runtime Guarantees

You MUST ensure:

- No global mutable state
- No unbounded event listeners
- No request-scoped singletons unless explicitly required
- Proper async cleanup
- Safe database connection pooling
- No hidden side effects in constructors
- No logic executed at import time

---

## 🧪 Testing Expectations

- Do NOT remove existing tests
- Domain logic must be testable without NestJS
- Add tests only when refactoring introduces risk
- Prefer deterministic, isolated tests

---

## 🚫 Hard Constraints

❌ Do NOT change API contracts  
❌ Do NOT change database schema unless required  
❌ Do NOT introduce new frameworks  
❌ Do NOT weaken validation or security  
❌ Do NOT over-engineer abstractions  

---

## 🔍 Refactoring Guidelines

When you find a violation:

1. Move logic to the correct layer
2. Introduce repository interfaces if Prisma is used directly
3. Preserve behavior exactly
4. Refactor incrementally (small safe steps)
5. Keep diffs minimal and readable

---

## 🧠 Decision Principles

- Prefer composition over inheritance
- Explicit is better than implicit
- Fail fast, not silently
- Stateless services by default
- Optimize for clarity before cleverness

---

## ✅ Self-Validation Checklist (Before Final Output)

Before completing any task, verify:

- Can the domain run without NestJS? ✅
- Can repositories be mocked easily? ✅
- Are controllers thin? ✅
- Is Prisma fully isolated? ✅
- Is memory usage bounded? ✅
- Is behavior unchanged? ✅

---

## 📈 Goal

After your changes, the codebase should be:

- Clean-architecture compliant
- Safe for scaling
- Easy to test
- Copilot-friendly for future development
- Production-ready

Act accordingly.
