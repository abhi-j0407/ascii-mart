# Setup & Operating Guide (Human)

This project is built by two AI agents you relay between by hand: an **orchestrator** and an **implementor**. This doc covers one-time setup and the day-to-day loop.

---

## 1. Prerequisites

- **Node.js** 20+ and npm.
- **git**.
- **GitHub CLI (`gh`)** — used by the orchestrator to open and squash-merge PRs. Install from <https://cli.github.com/>.
- A **GitHub Personal Access Token (PAT)** for your repo:
  - *Fine-grained* (recommended): scope it to this one repo, with **Contents: Read & write** and **Pull requests: Read & write**.
  - *Classic*: `repo` scope.

---

## 2. One-time bootstrap

The repo is already `git init`-ed locally with the `docs/` folder. Point it at your GitHub repo and push the docs as the first commit on `main`.

### 2a. Set the remote (token-in-URL, as requested)

Replace `OWNER`, `REPO`, and `TOKEN`:

```bash
git remote add origin https://TOKEN@github.com/OWNER/REPO.git
# equivalent alternate form:
# git remote add origin https://USERNAME:TOKEN@github.com/OWNER/REPO.git
```

> ⚠️ **Security note:** this writes your token in **plaintext** into `.git/config`. It is not committed (that file isn't tracked), but anyone with disk access can read it. Don't share your `.git/config`. To rotate/remove later: `git remote set-url origin <new-url>`.
>
> **Safer alternative** (recommended): skip the token in the URL and run `gh auth login` instead — it configures a git credential helper so plain `https://github.com/OWNER/REPO.git` works for both `git` and `gh`, with no token on disk in plaintext. If you go this route, set the remote without the token:
> ```bash
> git remote add origin https://github.com/OWNER/REPO.git
> ```

### 2b. Authenticate `gh` (needed for PR create/merge)

```bash
gh auth login        # interactive; pick GitHub.com → HTTPS → paste token
# or non-interactively:
# echo "TOKEN" | gh auth login --with-token
```

If you used the **token-in-URL** form in 2a, `git push` already works, but `gh` still needs its own auth — either `gh auth login` as above, or export the token for the orchestrator's session:
```bash
export GH_TOKEN=TOKEN
```

### 2c. Push the docs as the first commit

```bash
git add docs/
git commit -m "docs: orchestration system and implementation plan

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git branch -M main
git push -u origin main
```

### 2d. (Optional) Protect `main`

On GitHub: Settings → Branches → add a rule for `main` (require PRs, no force-push). The orchestrator's PR-based flow is compatible with this.

---

## 3. The relay loop (per phase)

You run two AI sessions and copy text between them. They share **the same local repo folder**, so only run one at a time.

```
┌─ ORCHESTRATOR session ──────────────────────────────────────────┐
│ Seed it with: docs/ORCHESTRATOR.md                               │
│ → It reads the plan, finds the next unchecked phase,             │
│   and prints an IMPLEMENTOR PROMPT.                              │
└──────────────────────────────────────────────────────────────────┘
                         │  copy the implementor prompt
                         ▼
┌─ IMPLEMENTOR session ───────────────────────────────────────────┐
│ Paste the prompt. It reads docs/IMPLEMENTOR.md + the plan,       │
│ creates branch phase-<n>-<slug>, builds the phase, runs checks,  │
│ commits (no push), and prints a HANDOFF PROMPT.                  │
└──────────────────────────────────────────────────────────────────┘
                         │  copy the handoff prompt
                         ▼
┌─ ORCHESTRATOR session ──────────────────────────────────────────┐
│ Paste the handoff. It diffs the branch, runs lint/typecheck/     │
│ test/build, checks scope & quality.                              │
│   • clean → pushes branch, opens PR, squash-merges, updates plan │
│   • issues → prints a FIX-UP PROMPT (back to implementor)        │
│ Then it asks whether to emit the next phase's prompt.            │
└──────────────────────────────────────────────────────────────────┘
```

**Tips**
- Keep the **orchestrator** as one long-lived session if you can — it accumulates project context. Spin up a **fresh implementor** per phase (or reuse one; the handoff makes either work).
- If you ever lose the orchestrator session, a new one rebuilds state from `docs/IMPLEMENTATION_PLAN.md` (§8 Status + §9 log) — that's what the log is for.
- The implementor never pushes or merges; the orchestrator owns the remote. If a phase needs rework, it stays on its branch until clean.

---

## 4. Document map

| File | Role |
|---|---|
| `docs/IMPLEMENTATION_PLAN.md` | Source of truth: decisions, tech stack, phases, status, handoff log. |
| `docs/ORCHESTRATOR.md` | Orchestrator agent's operating manual (prompt templates, review checklist, merge procedure). |
| `docs/IMPLEMENTOR.md` | Implementor agent's operating manual (scope rules, quality bar, handoff format). |
| `docs/SETUP.md` | This file — human setup + the relay loop. |
