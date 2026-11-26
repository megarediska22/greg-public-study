# Fast placement final acceptance

**READY for owner local pilot.** Public release requires separate authorization. The final develop SHA is the integration commit containing this report, verified after push by 01. UI source 5f153b7efb53ee2e417a6f55c783660d4ad000d6; integration base d7a81299fc1588a6ca3fd644d5eb737880f6ae07; public main 097295a0470e0ab3acd24d24e7c08bb6b8af25c8.

## Results

Methodology dd86456, engine 497fb77, bank ca3a33d and UI 5f153b7 are preserved in history. See [gate records](PIPELINE_STATUS.md) and handoffs.

- npm ci, TypeScript and all 648 npm tests passed. Python catalogue --check and npm run course:check-final passed.
- Production build passed with VITE_BASE_PATH=/greg-public-study/. Verifier checked 193 HTML/JS/CSS files and 190 deferred chunks. Fast placement, local pilot and diagnostic banks are excluded. Initial JS 848451 bytes retains the Vite size warning.
- Ordinary course source identity against main verified. Content tests confirm 140 lessons, 1011 steps and 2267 questions. R/S stay separate from independent P.
- Supplied browser runner passed six isolated Chromium scenarios across 360/1280 and light/dark. Cards, keyboard activation, removal/reordering, saved selection, pause/reload, skip, manual early result, retake, exhaustion and exact to-be/theory resume passed. Prior course bytes stayed identical during diagnosis.
- The two upper scenarios each exercised both forms in 10 presentations with an explicit single grant and restored access.
- Five additional browser checks passed: BE at 7, ASK at 8, fatigue retaining late A1 at 8, upper clarifications at 12 and production exclusion. Supplied checks also cover LAT exit at 2. Automated engine tests verify the cap of 15.
- Preview at http://127.0.0.1:4207/greg-public-study/?adaptive=1#/diagnostic rejected diagnosis, created no adaptive storage and displayed 140 course entries.
- Main and deployment configuration were preserved. Other worktrees and local acceptance notes were preserved.

## Running owner pilot

Dedicated worktree: Greg Public Study - fast placement pilot. The exact final code is the verified acceptance commit reported by 01. Commands from that worktree:

    npm ci
    npm run dev -- --host 127.0.0.1 --port 5207 --strictPort

Actual URL: http://127.0.0.1:5207/?adaptive=1#/diagnostic

The command was started detached and is left running. The real browser verified the fast engine route with the 48-item bank on this origin. HTTP availability is checked separately. Preview on 4207 is a separate process.

## Owner acceptance

1. Start a run and select answers without typing.
2. Add, remove and reorder word cards with arrows and keyboard. Reload before submitting and resume the same selection.
3. Skip several later tasks, finish early and inspect the provisional explanation and previous resume.
4. Try the other form and verify course access after exhaustion.
5. Inspect both themes and phone-sized layout, then explicitly accept a suggested lesson.

## Limits

The 3–5 minute target, fatigue, form difficulty and recommendation quality require learner observation. Chromium widths are emulated. Physical devices, assistive technology and Safari were not tested here. Two exposed forms limit retakes. Results are provisional course advice, not independent writing evidence or CEFR certification. Browser progress remains local.
