# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Beredskap is a bilingual (English/Swedish) tabletop-exercise app for cyber crises: 35 staged
discussion scenarios, 17 branching "gamebook" scenarios and a slide builder. It is a single
static page: no backend, no build step, no dependencies, no network. Live at
https://jozeta.github.io/Beredskap/ (GitHub Pages from `main`, root folder).

## Commands

```sh
python3 -m http.server 8000      # then open http://localhost:8000/ (app) and /tests.html (tests)
bash tests/test.sh               # forbidden-API scan + headless tests.html over HTTP (what CI runs)
npx --yes eslint@9.39.5 .        # lint, incl. rules blocking innerHTML/outerHTML/insertAdjacentHTML/document.write
```

- `index.html` also works from `file://`, but run tests **over HTTP**: from `file://` three
  source-reading tests are skipped (209 pass over HTTP, 206 + 3 skipped from file://).
- Quick source scan for forbidden APIs:
  `grep -rnE "eval\(|new Function|innerHTML\s*=|fetch\(|XMLHttpRequest" js | grep -v "js/graphics/icons.js"`

## Architecture

- **Classic scripts, one namespace.** Every file is an IIFE attaching to `window.BK`. No ES
  modules (so `file://` works). Script order in `index.html` *is* the dependency order.
- **Template → instance → session.** Templates (`js/scenarios/*.js`) are authored content with
  `{{placeholders}}`; the generator turns template + wizard params + seed into a plain-JSON
  instance; a session is a live run. All session changes go through the pure function
  `BK.engine.session.apply(session, command, now)`.
- **Determinism.** `BK.rng` is mulberry32 seeded by an FNV hash, with *named forks* per concern.
  Same seed + params must give a deep-equal instance. Don't consume randomness from a shared
  fork in a new place, or unrelated choices reshuffle.
- **Confidentiality boundary.** The stage (audience screen) renders only `session.project()`.
  Facilitator notes, hidden facts and unreleased injects must never reach the stage DOM, not
  even hidden. Tests sweep every slide of every scenario to enforce this.
- **Sync** between presenter and stage windows: `localStorage` + `BroadcastChannel("beredskap")`
  via `BK.sync.open(...)` / `dispatch(command)`.
- Layout: `js/core` (namespace, store, rng, i18n, theme, dom), `js/data`, `js/engine`,
  `js/graphics`, `js/scenarios`, `js/io`, `js/ui`, `css/`, `tests/`, `docs/screenshots/`.

## Rules that tests enforce (don't break them)

- Build DOM only with `BK.dom.el()` / `textContent`. No `innerHTML` (sole exception:
  `js/graphics/icons.js`), no inline event handlers, no `eval`, `new Function` or string timers,
  no network APIs or external URLs. CSP is `default-src 'none'`, `connect-src 'none'`.
- Every human-readable field needs both `en` and `sv`. i18n keys must have EN/SV parity.
- Never hard-code a time, currency or product name in scenarios: use placeholders
  (`{{time.T+45|clock}}`, `{{num.ransom|currency}}`, `{{env.edrAlert|cap}}`, …).
- Storage keys are namespaced `beredskap:` (tests use `beredskap-test:`), values wrapped as
  `{ v, savedAt, data }`.
- All content is fictional: `*.example` domains, RFC 5737 IPs, invented threat actors.

## Adding a scenario

Follow README §7. In short: copy a similar scenario (`s01-ransomware-vpn.js` is the annotated
reference; others use `js/scenarios/_helpers.js`), register a unique category in
`js/data/options.js`, a hue in `js/graphics/artwork.js` and an emblem in `js/graphics/icons.js`,
then add the `<script>` tag to **both** `index.html` and `tests.html` in the same position (a test
checks the lists match). Open `tests.html` and fix whatever the validator reports.

## Local-only files

The root `_*.html` / `_*.js` dev pages and `js/scenarios/_*.js` are excluded via
`.git/info/exclude` patterns but some are tracked; check `git ls-files` before assuming a file
is or isn't committed. `SPEC.md` and `docs/superpowers/` are deliberately not published.

## Standards

Follows `~/Desktop/code/tools/standards/STANDARDS.md`; per-repo decisions are in `.claude-standards`
(`design=own`: Beredskap keeps its own look, not the Låda Glass family style).
