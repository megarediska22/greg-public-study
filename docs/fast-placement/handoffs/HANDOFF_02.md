# Stage 02 handoff · Fast Placement Interface

Base: verified Integration 3 develop d7a81299fc1588a6ca3fd644d5eb737880f6ae07.
Feature branch: feature/fast-placement-ui. This document and the pipeline status travel with the implementation commit. Direction 01 should verify its exact remote SHA before integration.

## Interface

The existing localhost-only `?adaptive=1` entry now uses `engine.fast` for start and diagnostic routes when a fast bank is installed. Checkpoints and ordinary lessons keep their existing paths. Home reads fast readiness, saved draft and form exhaustion, with the former course resume retained. An older R/P draft stays stored and is described as the previous format when opening the new introduction.

A task shows the engine's presented number and phase. It has no variable percentage, grading feedback or hints. Choice and tap-fill answers use option IDs. Ordered answers use unique token instance IDs. The learner adds and removes cards by tapping or keyboard activation and reorders them with individually labelled left/right buttons. Each edit goes through `select`, so reload restores the same token order. Explicit submission is required. The view reads the new cursor after every saved edit and delegates stale writes and conflicts to the existing host.

Pause, manual preliminary finish, neutral skip and unknown answers use the fast action API. Results state their provisional scope and distinguish insufficient, limited, disputed and directional observations. Counts include skips and unknown responses. The former resume is first, with the suggested lesson and elective A1/Pre-A1 choices alongside it. The selection is rechecked through `accept` and read back before navigation. Forms exhausted or unavailable retain course access. The selected words never establish independent writing knowledge.

## Verification

- TypeScript passed.
- Full suite: 648 passed, zero failed or skipped. Three UI regressions cover real fast-host entry, duplicate token instance controls and two-form exhaustion without ordinary progress writes or independent knowledge.
- Production subpath build passed. Existing verifier confirms local pilot and both banks are excluded; the previous bundle-size warning remains.
- Four isolated Chromium scenarios covered 360/1280px and both themes, keyboard card activation, removal/reordering before submission, draft restoration after reload, pause, skips, manual preliminary result, second-form early Pre-A1 result, exhaustion and keyboard return to the exact saved to-be/theory step. Ordinary progress bytes stayed unchanged through the diagnosis.
- Two additional real upper-route scenarios passed at 360px dark and 1280px light. Each completed forms A and B in 10 items through visible controls, including The/the card instances, and verified explicit single-lesson access and restoration. Literal identical-label tokens are separately covered in the component regression.
- Mobile screenshot inspected. No horizontal overflow on the exercised views. Controls use the current buttons, orange accent, surfaces and focus styles.

Runner: `scripts/test-fast-placement-ui.py --dev http://127.0.0.1:5198`, using the already installed Python Playwright environment and Chrome. `--only-upper` selects the additional upper-route checks. Browser results concern emulated viewports and isolated state, not physical devices or learner calibration.

## Integration and boundaries

02 changed the adaptive route consumer, home readiness and five scoped card styles, plus new fast UI components and tests. Engine source, authored banks, ordinary lessons, grading thresholds and storage contracts were not edited. The previous R/P fixture/browser tests still concern the prior diagnostic UI and should not be used to assert the new live fast route. Existing host errors handle failed writes, protected data and reread. A malformed fast-only partition remains read-only, with ordinary learning available; it needs engine-directed recovery before a new fast run.

The local pilot is running from this feature checkout on port 5198. Direction 01 owns Integration 4, consolidated acceptance and the final owner pilot URL. Empirical difficulty, fatigue and the 3–5 minute target remain learner-pilot questions.
