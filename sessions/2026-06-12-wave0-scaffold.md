# Session 2026-06-12 — kickoff & continuity setup
Device: desktop · Branch: main · Driver: setup

## Goal this session
- Stand up the build kit, architecture, and the context/memory/session system.

## What I did
- Added CLAUDE.md, ARCHITECTURE.md, PROMPTS.md and one SKILL.md per module.
- Added the continuity layer: docs/continuity.md, PROGRESS.md, docs/decisions, docs/assumptions.md,
  docs/glossary.md, sessions/, and .claude/commands.

## Decisions made (link ADRs)
- ADR-0001: hybrid architecture with a single SaudiConnector seam; build on mock, swap real later.

## Assumptions added / changed
- See docs/assumptions.md (Maqam shapes mocked; e-visa list config-driven; PKR gateway TBD).

## Tests / quality gate
- N/A — no code yet.

## State at end (mirror into PROGRESS.md)
- Wave / module: Wave 0, not started (scaffold next)
- Done: planning + skills + continuity system
- Not done: all code

## Handoff — START HERE NEXT TIME
1. Run /session-start.
2. Execute 00-getting-started to scaffold the monorepo; get CI green.
3. Build packages/contracts, then connector-mock.
