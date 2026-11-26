# Stage 06 adaptive interface

The adaptive interface uses the Stage 05 engine for placement, knowledge, grants, advice and checkpoint decisions. The published build uses the existing sequential route. The build verification rejects the adaptive pilot bundles and test fixture markers.

## Local review

- Run `npm run dev` in this checkout. Open `/?adaptive=1#/start` on the local server to preview the local course pilot with the reviewed diagnostic forms and available checkpoints.
- The test-only entry `/tests/fixtures/adaptive-ui.html#/start` exercises the same screens with the engine test bank. Use a disposable browser context or a separate local origin. Do not use the test entry with learner progress.
- `scripts/test-adaptive-ui.py` uses installed Python Playwright and Chromium. Pass `--dev` and `--production` for the development server and the build served at the configured base path.

## UI and storage

- Learners can choose ordinary A1, available preparation or an optional placement check. An existing saved step remains the primary path on return. Diagnostic screens show one prompt and a task number. Results separate demonstrated skills, practice areas and uncertain findings. Accepting the recommendation and continuing the former route are explicit actions.
- The pilot host opens validated legacy progress, reads the adaptive store and replays legacy progress with the verified grant set. That same set reaches live lesson admission and the ordinary exercise reducer. The host keeps the initial legacy entitlement frontier apart from in-session pilot changes. A configured readiness bridge requires an explicit checkpoint transition before the learner can complete its ordinary summary.
- Diagnostic submissions use one stable key per session and card. Opening or reloading a screen does not write diagnostic data. Submitted answers are resumable. Unsubmitted input stays in the current form.
- On conflict the UI stops writes and offers to reread. An unreadable or protected adaptive snapshot opens an ordinary read-only course session. Confirmed recovery uses the engine’s backup operation. Resetting both stores is sequential. A failed adaptive reset is reported separately after an explicitly authorized ordinary reset.
- The existing panels, buttons, answer fields, option styles and theme tokens carry the new screens. A checkpoint can report independent readiness and a supported transition where the engine offers one. Diagnostic pause and completion move focus to the new heading.

## Before release

The Stage 07 feature branch registers all 13 approved course checkpoints with live question IDs. Ordinary hints are captured by the existing assistance port. The checkpoint UI restores the latest attempt and resumes at the next unmarked item. A learner can still use the ordinary lesson practice to revisit the skill. Exposed materials never produce a new independent sign. CP-A2 reports separate text skills and offers review without awarding a level or a further transition.

The local pilot has two reviewed placement forms. The release validator checks metadata integrity. Learner calibration and an explicit release decision are pending. See the [diagnostic bank review](DIAGNOSTIC_BANK_REVIEW.md). The production build continues to use ordinary course progression. The browser checks use emulated mobile viewports and keyboard controls in Chromium.

## Verification

TypeScript, the 552-test suite and the production build at `/greg-public-study/` passed. The browser checks covered 360 and 1280 CSS pixels in both themes, including keyboard submission, pause and reload, explicit placement, a return to the former lesson, a retake, a replaced bank, protected bytes, tab conflict and reread, an unavailable bank, a supported checkpoint transition, and the disabled production entry. The independent reviewer found a loss of focus during pause or manual finish. Targeted browser assertions passed after moving focus to the new heading.
