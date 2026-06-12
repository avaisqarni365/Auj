# Continuity protocol — context, memory & sessions

This repo is built across many sessions and devices by Claude Code. Three layers keep it coherent.
Each has a different lifespan; don't mix them.

## 1. CONTEXT — stable, rarely changes (the brain)
Files: `CLAUDE.md`, `ARCHITECTURE.md`, `docs/glossary.md`.
Loaded at the start of EVERY session. `CLAUDE.md` is the entry point and `@imports` the rest.
Change only when the project's shape or rules genuinely change.

## 2. MEMORY — durable, append-mostly (the "why" and "what we learned")
Files: `docs/decisions/*` (ADRs), `docs/assumptions.md`, `docs/glossary.md`.
- Every non-trivial decision becomes a numbered ADR (copy `0000-template.md`). ADRs are append-only;
  to change one, add a new ADR that supersedes it.
- Every time you assume something you couldn't verify (e.g. a mocked Maqam payload), log it in
  `assumptions.md` with how/when to verify. This is what stops silent drift.

## 3. SESSIONS — the live pointer (where are we right now)
Files: `PROGRESS.md` (single source of truth) + `sessions/YYYY-MM-DD-*.md` (handoffs).
`PROGRESS.md` always reflects the current wave, what's done, what's next, and blockers.
Each session writes a dated handoff so the next session (or another device) can resume instantly.

## The loop (run it every session)

### Session start  →  `/session-start`
1. Read `CLAUDE.md`, `ARCHITECTURE.md`, `PROGRESS.md`, and the newest file in `sessions/`.
2. Summarize: where we are, next 3 actions, blockers, open assumptions.
3. Propose this session's plan; wait for go-ahead.

### During the session
- Make a decision → write an ADR. Make an assumption → add it to `assumptions.md`.
- Keep changes inside the module/skill you're working on (see `CLAUDE.md` golden rules).

### Session end  →  `/session-end`
1. Update `PROGRESS.md` (now building, checkboxes, in-progress, next up, blockers).
2. Add/needed ADRs and assumptions.
3. Write `sessions/YYYY-MM-DD-[topic].md` from `_TEMPLATE.md`, incl. a "start here next time" handoff.
4. Stage, show the diff summary, commit. Push only on confirmation.

## Multi-device rule
Everything above lives in git. **Pull at session start, push at session end.** `PROGRESS.md` is the
authority on state — if two devices disagree, the latest committed `PROGRESS.md` wins. Never keep
state only in your head or a local file; if it isn't committed, it doesn't exist for the next session.
