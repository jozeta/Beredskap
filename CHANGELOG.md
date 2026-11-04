# Changelog

All notable changes to Beredskap are listed here, newest first.

The project has no tagged releases yet, so changes are grouped by date. Entries before November 2026 were reconstructed from the commit history.

## Unreleased

- Nine new scenarios for three new sectors. Insurance: s36 "The Storm and the Broker Portal", s37 "The Model That Said No", b18 "Insured by Us, Hit by Them". News media: s38 "Protect the Source", s39 "Election Night", b19 "Published at 05:58". Government agency: s40 "Payday", s41 "The Fake Evacuation", b20 "Protected Identities"
- Scenario engagement pass: every discussion scenario now has Reconsider moments and consequences, where earlier decisions change later stages; weak "straw-man" options were rewritten so every option is defensible; every branching scenario gained a reversal choice that lets the room undo an earlier decision under pressure
- Money follows the language in every scenario: kronor in Swedish, euros in English (fixed exercise rate, 11 kr = €1), whatever the jurisdiction, in text and in figure tiles. Amounts are rolled in kronor and converted when shown, so switching language live shows the same amount. Fixes s34's payroll, which showed as a few kronor
- Reconsider: a stage can put an earlier decision back in front of the room under new pressure ("Do you stand by it, or reverse it?"); the presenter records keep / reverse / undecided with a reason, and the debrief, report and Markdown list every reconsidered decision
- Decision and choice options are shown in a seeded order, re-lettered A–D, so the strongest answer is no longer always the first and longest one
- Add ESLint (`eslint.config.js`) with rules blocking unsafe DOM sinks, dynamic code and string timers; CI runs it
- Add `tests/test.sh`: one command for the source scan and the headless test suite, used by CI
- Remove unused variables found by the linter

## 2026-11-02

- Add CI workflow, Dependabot config, security policy

## 2026-11-01

- Ignore macOS, Claude Code and secret files
- Add CLAUDE.md with project guidance for Claude Code

## 2026-10-23

- Content pass: fuller stories in all 35 exercises, epilogue endings, day-part fixes
- Briefing shows objective teasers; clear objectives and lessons learned for the facilitator
- Stage click starts the discussion countdown before leaving the slide
- Fix chart labels and hero art overlapping text; layout test checks collisions
- Forward keys start the discussion countdown before leaving the slide
- Polished message artefacts: chat window, phone, call screen, mail window, post
- 17 new exercises; history actions as icons with tooltips
- Improvement plan: tracked actions in the debrief and across sessions
- Pressure meters and a complication deck
- Add the custom exercise builder
- Debrief route map: decision tooltips and more vertical spread
- Add a Help menu item and an in-app guide
- Fix bugs found in a full-app audit
- Give the stage window its own presence id
- Add MIT licence, .gitignore, README with screenshots, and prepare for GitHub
- Stop tracking the internal design documents
- README: point the clone command at the published repository
- README: link the hosted app on GitHub Pages

## 2026-10-22

- Phase 7: hardening — complete tests.html, accessibility pass, confidentiality sweep, README
- Design: branching exercises, 15 new exercises, overflow fix, UI polish
- Part 1: stage layout sweep and overflow fixes
- Part 2 (engine): branching gamebook format, route map, presenter/wizard/library/editor/debrief support, first exercise b01
- Part 2 (content): nine more branching exercises b02–b10, README and design notes
- Part 3: five new discussion exercises s21–s25
- Part 4: calm, editorial UI polish

## 2026-10-21

- Phase 1: foundation — namespace, store, RNG, i18n, themes, safe DOM, router, dashboard/library/wizard/settings
- Phase 2: engine — entity graph, pools, environments, resolver, generator, validator, pacing, slide compiler, scenario s01
- Phase 3: stage + presenter — scaled 16:9 stage, all slide types, audience projection, synced presenter, keyboard/clicker, timers, inject release, autosave and recovery
- Phase 4: graphics — full icon set, 20 emblems, seeded title artwork, SVG charts, dependency and blast-radius diagrams, artefact mock-ups
- Phase 5: facilitation & debrief — decision log, observations, objectives, scorecard, debrief view, exports/import, print, editor
- Phase 6 (batch 1): scenarios s02–s10, authoring helpers, library-wide scenario tests
- Phase 6 (batch 2): scenarios 11–20
