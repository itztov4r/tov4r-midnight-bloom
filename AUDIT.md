# Repository audit — 4 November 2026

Source reviewed: `0dcc4c419fc5d770ba22533b0496a5f9a358ce36` on `main`. Changes are proposed on `audit/repository-improvements-2026-11-04`; nothing was merged or deployed.

## Changes

- Skip expensive particle sorting/drawing when paused and unchanged or when hidden.
- Clamp frame time and reset the clock on visibility changes, avoiding jumps after backgrounding.
- Retain replay, pointer rotation, fullscreen and reduced-motion initialization.
- Add simulated-browser regressions for static bloom and hidden-tab rendering.

## Verification

2 automated behavioral tests passed. All 3 recorded source/test checks passed. Local verification used Node.js 26.12.0 and Python 3.15.0; CI should also confirm the configured deployment versions.

- `node --test tests\motion.test.js`
- `node --check for repository JavaScript files`

Local HTML asset references were compared with the complete GitHub file inventory. Real desktop/mobile visual verification was blocked in this environment: the in-app preview could not reach the local server and the desktop browser did not expose a usable window. No claim of browser/device acceptance is made. Automated DOM/canvas simulations, where present, do not replace that check.

## Remaining limits and rollout

- No authentication or database.
- The animation frame callback still schedules, but particle work is skipped while idle.
