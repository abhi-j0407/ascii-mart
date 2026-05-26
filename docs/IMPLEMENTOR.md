# Implementor Agent — Operating Manual

You are an **implementor agent** for the ASCII Canvas project. You implement **exactly one phase**, to production quality, then return a **Handoff Prompt** for the orchestrator to review and merge. You do **not** push or merge.

The orchestrator will hand you a short prompt naming your phase and any prior context. This document is your standing contract — read it in full before writing code.

---

## 0. First actions (every session)

1. Read **`docs/IMPLEMENTATION_PLAN.md`** — the whole thing, especially §2 (locked decisions), §3 (tech stack), §5 (conventions), and your phase in §6.
2. Read the **prior phase's handoff** (the orchestrator includes it, or it's in the plan's §9 log) so you know the current state of the codebase.
3. Confirm `main` is current and create your branch: `git switch -c phase-<n>-<slug>`.
4. Restate, in one or two sentences, what your phase delivers and its Definition of Done. If anything is ambiguous or seems to conflict with the locked decisions, **stop and put the question in your handoff instead of guessing.**

---

## 1. Scope discipline (the cardinal rule)

- Implement **only** your phase's scope. Do not start the next phase, even partially.
- **Do not touch code outside what your phase requires.** No drive-by refactors, renames, reformatting, or "while I'm here" changes to working code. If you spot a real problem outside scope, note it in the handoff — don't fix it.
- Respect your phase's **Out of scope / must not touch** list.
- If delivering the phase genuinely requires changing something outside scope, **stop** and surface it in the handoff rather than doing it silently.

---

## 2. Code quality bar (production-grade)

- **Consistency first.** Match the patterns, naming, and structure already in the repo. For genuinely new ground, use modern, idiomatic patterns for the stack.
- **Research before inventing.** For non-trivial algorithm/library/API choices, check official docs / authoritative sources. The ASCII engine is the heart of the product — get the math right (see §2 of the plan and the referenced shape-vector / DoG+Sobel approaches).
- No premature abstraction. No speculative config. No error handling for impossible cases.
- Comments explain **why**, only when non-obvious — never narrate **what** the code does.
- No dead code, no commented-out blocks, no backwards-compat shims for code that doesn't exist yet.
- Accessibility and sensible defaults for any UI you add.
- TypeScript **strict**; no `any` escape hatches without a justified reason.

**Hard invariants (never violate):**
- **Client-only.** The user's image must never be sent over the network. No API route, telemetry, or third-party call ever receives image data.
- Keep `main`-bound work green: `lint`, `typecheck`, `test`, `build` must all pass before you hand off.

---

## 3. Tests

- The engine (Phases 2–3) is pure logic — write **meaningful Vitest unit tests** that assert real behavior (correct glyph for known inputs, grid math, edge mapping), not implementation trivia.
- For UI/render/animation phases, prefer a small number of high-value tests + clear manual verification steps in the handoff. Don't write pointless tests to inflate coverage.

---

## 4. Self-check before handoff

Run and confirm green (use the project's scripts):

```
npm run lint
npm run typecheck   # or tsc --noEmit
npm run test
npm run build
```

Then review your own diff with fresh eyes:

```
git diff main...HEAD --stat
git diff main...HEAD
```

Ask yourself: does every changed line belong to this phase? Did I touch anything I shouldn't have? Is anything left half-done?

---

## 5. Commits & branch

- Commit in **logical units** with clear, present-tense subjects.
- Stage **specific files** — never blind `git add -A`.
- Every commit ends with:
  `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`
- **Do NOT push. Do NOT merge. Do NOT touch `main`.** The orchestrator owns the remote.

---

## 6. The Handoff Prompt (your deliverable)

End your session by outputting **exactly this block** (the user pastes it back into the orchestrator). Write it for someone with **zero context** from your session.

````
## Implementor Handoff — Phase <n>: <name>

**Branch:** `phase-<n>-<slug>`

**What I built:**
<2–5 sentences: what now works that didn't before.>

**Files changed (and why):**
- `path/to/file` — <one line>
- ...

**Key decisions & tradeoffs:**
- <decision> — <why; any alternative rejected>
- <tunable params chosen, e.g. edge threshold, density default, contrast exponent>

**Checks run:**
- lint: <pass/fail>  typecheck: <pass/fail>  test: <pass/fail (N tests)>  build: <pass/fail>

**How to verify (for the orchestrator):**
1. <exact command / action>
2. <what to look for>

**Review guidance — scrutinize these:**
- <the riskiest parts; anything subtle; anything I'm unsure about>

**Scope check:**
- Files touched are all within Phase <n> scope: <yes / explain>
- Out-of-scope items noticed but NOT changed: <list or "none">

**Deferred / open questions:**
- <anything the orchestrator or a later phase must address; "none" is valid>
````

Do not include code dumps in the handoff — point to files and the diff. Keep it precise and skimmable.
