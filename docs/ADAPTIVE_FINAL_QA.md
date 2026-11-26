# Adaptive learning end-to-end acceptance

Tested the integrated course from `origin/develop` at `86110ecf4929657b6a607809d8f348c9056f2b9f` on `feature/adaptive-final-qa`. Implementation and test commit is `dcef70c31fdb7a5e46016bf50b2a904bd2f5eaca`. The report is the following commit on the branch. The ordinary catalogue contains 140 lessons and 2,267 questions. The local localhost-only pilot uses diagnostic bank v2, two forms, 13 registered checkpoints and 54 exercise mappings.

## Browser results

The tests navigate the real `index.html` entry and submit answers through the visible controls. The answer oracle reads the installed content. Browser storage is observed after UI actions. Disposable contexts seed only required prior history or access for migration, fault injection and selected late scenarios.

| # | Scenario | Result | Browser observation |
| --- | --- | --- | --- |
| 1 | First visit without saved progress | PASS | The pilot home opens the start choices. Both progress stores are initially empty. |
| 2 | Ordinary A1 without placement | PASS | “Сразу к A1” opens `bp-a1-01`. No diagnostic session is created. The public route also supports ordinary entry and lesson completion. |
| 3 | Voluntary diagnosis | PASS | Starting through the visible action loads a real v2 item. Submissions advance one slot. No hints, key or feedback appear during testing. |
| 4 | Early Pre-A1 exit | PASS | Two independent Latin-script errors lead to `bp-pre-01` after four items. The learner can still choose A1. |
| 5 | Early A1 recommendation | PASS | Entry literacy with no useful language evidence leads to `bp-a1-01`. |
| 6 | Late A1 recommendation | PASS | The partial profile leads to `hours-and-signs`. A separate stronger profile leads to `unit-042`, the A1-to-A2 transition. |
| 7 | A2 recommendation | PASS | The full profile leads to `unit-062`. The voluntary upper extension can reach the A2 final. |
| 8 | Specific do/does gap | PASS | Repeated independent ASK errors lead to `do-does` despite correct upper responses. |
| 9 | Contradictory answers | PASS | Recognition correct and production incorrect produce an ambiguous ASK result. No later entrance is granted. |
| 10 | Explicit acceptance | PASS | “Начать с этого урока” records acceptance and opens the visible recommendation. |
| 11 | Exactly one new lesson | PASS | Deep links are blocked before acceptance. The grant list gains only the selected target. Neighbouring and skipped lessons remain locked. The target does not become completed. |
| 12 | Earlier available lessons | PASS | The existing A1 route stays open after acceptance. A seeded earlier A2 grant and validated legacy access survive retesting. |
| 13 | Lesson grading and first attempt | PASS | A public lesson was completed through all required steps. Incorrect answers survived refresh and were corrected. The original attempts and completion were retained. |
| 14 | Independent, assisted, corrected | PASS | H0 gives the eligible sign. H1 and H2 are neutral. Correction retains the original attempt and adds no independent sign. On the exercised items neither hint contained the complete accepted answer. During an injected write failure the pilot did not show an unrecorded hint. |
| 15 | CP-A1 and CP-061 | PASS | Correct answers in CP-A1 were insufficient for full readiness on its own. The supported action opened only `unit-042`. Both fresh pairs in CP-061 supported the independent action, which opened only `unit-062`. |
| 16 | CP-A2 | PASS | Reached the final through the upper diagnostic and accepted recommendation. All five live checkpoint items were answered. The report shows text skills and offers no further level. |
| 17 | Pause and restoration | PASS | Refresh retained the submitted answer, form order and exact next slot. |
| 18 | Retake on second form | PASS | A real retake used form B after form A and presented disjoint observed families. |
| 19 | Form exhaustion | PASS | The new-session screen offers ordinary study after the two forms are exhausted. No third session starts. |
| 20 | Legacy progress | PASS | The public route retained a partial 21-lesson-era snapshot, including wrong answers. The pilot retained a completed 26-lesson-era snapshot across refresh and real diagnosis. Existing answers and completed IDs matched exactly. |
| 21 | Refresh across stages | PASS | Refresh worked on pause, in checkpoints, after grant acceptance, after a wrong attempt and after lesson completion. |
| 22 | Tab conflict, protected storage and failed saves | PASS | A stale tab stopped and resumed from the current cursor after reread. Corrupted data stayed protected until confirmation and recovery preserved exact bytes. With injected quota failure after completion, reread restored the missing successor grant. |
| 23 | Incompatible v1 diagnostic session | PASS | The real v2 UI presented “Задания обновились”. Explicit restart archived the old draft without applying evidence and started v2. |
| 24 | Withdrawn v1 keys and issued grants | PASS | Real v2 results did not show prior confirmation based on either revoked key. Earlier evidence records remained stored and the existing `unit-062` grant still admitted the lesson after refresh. |

## Confirmed defects and fixes

| Defect reproduced on the integrated baseline | Fix and regression |
| --- | --- |
| After ordinary grading, an immediate refresh could leave the stored first attempt without its adaptive observation. The corrected answer then appeared as the only adaptive practice event. | Save a small versioned receipt on the actual accepted attempt for mapped items. It pins assistance, order and checkpoint context. The pilot replays receipts from validated course progress. Event deduplication makes restarts idempotent. Historic answers have no receipt and yield no retroactive evidence. |
| With the adaptive write temporarily denied, completion of a directly granted lesson persisted in ordinary progress. Its successor remained locked even after reread. | Reconcile an already completed granted lesson with the same ordinary access rules after reread. This restores one valid successor and preserves explicit checkpoint gates. |
| The same two-store recovery edge also applies to help, because a hint shown after an unconfirmed write may be forgotten on reload. | In the mapped pilot path, show the hint only after its level is recorded. The existing storage error remains visible if the write fails. Public hints retain the ordinary behaviour. The injected failure browser case verifies the result. |

The older synthetic browser run also had stale assumptions about Pre-A1, the first A1 route, the installed bank and the new catalogue count. Its assertions now reflect the integrated application. The production guard explicitly checks the v2 marker and adaptive storage key in addition to the existing manifest and item checks.

## Foundation & Design (02)

- Result sections can repeat an indistinguishable skill label from different criteria. To reproduce, finish a four-item Pre-A1 exit and inspect “Пока мало данных”. For example, “Вопрос о привычном действии” appears twice. The saved criteria remain distinct. Clarifying labels or grouping belongs to the result presentation.
- After using forms A and B, return to the pilot home. “Пройти диагностику снова” still appears and takes the learner to the unavailable screen. The engine correctly rejects a third attempt. The home action could reflect current form availability sooner.

## Lessons & QA (04) and remaining boundaries

No pedagogical defect requiring a handoff was found in the exercised prompts or hints. This run did not repeat the editorial review of all 96 diagnostic items, all course hints, or every checkpoint. It verified the named live checkpoints and both corrected v1 withdrawal cases. The legacy and failure cases use disposable saved-state fixtures. Chromium mobile coverage uses emulation. This technical result does not replace learner calibration. The existing Vite size warning remains.

## Checks and tools

| Verification | Result |
| --- | --- |
| Targeted Node regression | 25 passed. Includes UI host, storage and diagnostic review fixes. |
| Full `npm test` | 594 passed, 0 failed, 0 skipped. |
| TypeScript and catalogue checks | Passed `npm run typecheck`, generator `--check` and `npm run course:check-final`. |
| Production build | Passed at `/greg-public-study/`. Manifest and strings exclude pilot and bank v2. Checked 193 HTML/JS/CSS files and 190 deferred course chunks. Direct public adaptive navigation falls back to the ordinary site. |
| Actual browser | 25 Playwright cases passed with no uncaught page errors. Chromium, isolated storage, 360/1280 widths, light/dark. The supplementary fixture browser suite passed 11 cases. |
| Shallow checkout | One commit, no parent history. Node 22.18.0, matching the workflow runtime. TypeScript, full suite and production build passed locally. |
| Git hygiene | Only the feature worktree and branch were changed. No merge, main/develop mutation, or site deployment. |

Use `scripts/test-adaptive-final.py` with the existing Python Playwright environment, the Vite dev server and a production preview at the repository subpath. `--case` narrows the run. The default JSON output is under ignored `.tmp/`. The diagnostics, exercise bank and learner-facing curriculum were left untouched.
