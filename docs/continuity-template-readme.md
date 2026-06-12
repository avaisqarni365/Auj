# Project template — context, memory & sessions layer

Drop these into your repo root alongside the code. They give Claude Code durable memory across
sessions and devices. Read `docs/continuity.md` for the full protocol; the short version:

- CONTEXT (stable): CLAUDE.md, ARCHITECTURE.md, docs/glossary.md — loaded every session.
- MEMORY (durable): docs/decisions/ (ADRs), docs/assumptions.md — the "why" and open questions.
- SESSIONS (live): PROGRESS.md + sessions/ — where we are and the next handoff.

Loop: `/session-start` → work → `/session-end`. Everything is committed to git; pull at start,
push at end. PROGRESS.md is the single source of truth on state.
