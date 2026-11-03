# Batch exercise validation

Date: 2026-11-03. Batch validation design and implementation notes for v1.1.

## Interaction

Each of the 30 existing exercise steps displays all five questions and a single **Проверить ответы** button below the group. There are no per-question check or retry buttons. The workflow is shared by multiple choice, blanks and written answers.

- Initially every unanswered control is editable. Typing/selecting an answer never grades it or exposes an answer key. The upper counter describes filled fields until a saved check exists.
- Submitting with an empty unresolved answer identifies the missing question numbers and marks those fields as required. The entire batch is withheld; no question consumes an attempt, and entered values remain intact.
- A complete submission checks every unresolved question together. Each question gets explicit check/error text, its explanation and reference answer. The bottom summary reports e.g. **3 из 5 правильно**.
- Correct answers are locked and retained. Incorrect answers remain editable with their submitted value intact. An edited answer is labeled as awaiting another check; it is not graded while typing.
- The same button checks only unresolved questions on subsequent submissions. Correct records do not receive extra attempts. Histories retain every submitted wrong answer.
- Only all-correct results complete the step and enable **Продолжить**. Checking never changes the route automatically. The next step opens only through the separate navigation action.
- Completed exercises retain the one check button in a disabled state and keep their saved results accessible for review.

The decision for incomplete submissions is atomic: do not grade even the filled fields until every unresolved field is filled. This enforces the requested answer-all-first interaction and prevents partial checks from revealing answers early.

## Engine changes

`ProgressAction` adds `check-exercise` with the lesson ID, step ID and a map of draft answers. `updateProgress` enforces existing lesson/step prerequisites, validates every unresolved payload value before recording any attempt, then grades the group using the unchanged deterministic grader. Invalid choice values and oversized inputs are also rejected atomically. Completion still requires every question correct.

The existing `answer` and `retry` actions remain for compatible saved-history replay and legacy tests. The browser interface uses only the batch action. A failed batch does not require a separate retry action before the next batch.

`src/lib/exercise.ts` describes editable/locked/feedback state using only saved outcomes, and identifies empty unresolved fields. It does not grade drafts.

## UI and mobile behavior

`ExerciseStep` owns the group's draft values, form, check action, summary and focus. `ExerciseQuestion` is a controlled renderer with no grading button or independent submission. Existing instructions, contextual answer labels and authored sentence-type indicators remain.

The approved layout, logos, typography and theme tokens are preserved. Question borders and text distinguish correct, incorrect and missing states; correctness is never conveyed by color alone. The mobile check button is full width in the normal document flow, with bottom safe-area padding. No sticky overlay is added over fields or navigation.

After an explicit check, focus and scroll move to the first missing/incorrect fieldset. Focusing a fieldset avoids reopening the virtual keyboard merely to show a result. All-correct checks focus the summary at the bottom. Editing does not trigger grading, scrolling or focus changes. Native required semantics remain, while the form's `noValidate` allows the custom missing-field explanation rather than browser popups. The aggregate summary is a polite live region; individual fields reference their instruction and feedback with `aria-describedby`.

QA retains synthetic completion flags and unrestricted lesson/step navigation. Its exercise Continue button now reflects real checked answers rather than those artificial flags. Users can still open any lesson or step from the QA toolbar/sidebar without completing earlier lessons.

## Progress compatibility and safety

- No storage key, schema version, question/lesson/step ID, accepted variant, explanation or curriculum data changed.
- `gps.progress.v1` remains version 1 with the same attempts and `retrying` shape. A new batch appends attempts only to unresolved questions and sets their retry state to false.
- Legacy correct answers stay locked and unchanged. Legacy wrong answers, including a pending old retry, restore their last submitted text and are immediately editable in the batch interface.
- Existing `progressStorage.ts` backup, read-only startup, stale-tab and accidental-empty-write protections are unchanged.
- QA still uses `gps.qa.progress.v1` and `gps.qa.theme.v1`. Its development guard and production exclusion mechanism are unchanged.
- Browser tests launched headless Chrome with Playwright temporary profiles and fresh nonpersistent contexts. No running user Chrome profile was opened, attached to, reset or modified. Destructive test data existed only in disposable contexts/mock adapters.
- A task-start SHA-256 snapshot of all 22 current instruction, asset and curriculum files was compared after implementation: **no changes**. This includes pre-existing uncommitted sentence-type metadata.

## Automated verification

| Check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm test` | **224 passed, 0 failed, 0 skipped**: 212 existing tests plus 12 batch tests |
| `VITE_BASE_PATH=/greg-public-study/ npm run build` | Passed; 63 modules; JS 362.94 kB / 100.41 kB gzip |
| Production isolation build check | Passed: all 3 HTML/JS/CSS outputs exclude QA keys, implementation and controls |
| All-section browser rendering | **120 checks**: 30 exercise routes × widths 360/1280 × light/dark; five questions, one batch button, no early correctness, no horizontal overflow |
| Browser correction cycles | **12 passed**: choice/blank/written × 2 widths × 2 themes |
| Legacy normal-progress browser journey | Passed: existing correct/wrong/pending-retry v1 records, correction, completion, refresh and next-step unlock |
| Production browser checks | Passed: `?qa=1` exposes no QA and cannot unlock lesson 10; normal five-answer batch completion restores after refresh |
| Uncaught JavaScript page errors | **0** during the automated browser suite |

Batch unit tests cover initially editable state and ungraded drafts across all 150 questions; missing fields/no attempts; atomic five-question checking; correct locks/incorrect edits; unresolved-only rechecks; repeated wrong submissions; prerequisite guards; all-correct completion without navigation; all 30 sections/150 keys; v1 persistence; legacy compatibility; and isolated QA replay. Existing independent grammar, content integrity, recovery/backup and QA tests also pass.

Browser correction cycles test empty submissions, value retention, first-error focus, three correct/two wrong results, correct locks, editable errors, no focus loss while filling missing text inputs, reload of the mixed result, empty corrections without attempts, unresolved-only correction to 5/5, disabled checking afterward, enabled Continue and explicit next-step navigation. QA tests assert that a sentinel normal progress value is byte-for-byte untouched.

One intermediate unit assertion incorrectly compared object identity across deserialization; it was corrected to compare preservation against the restored session object and equality against the legacy data. The final suite passes with no unresolved failures.

### Reproduce

```sh
npm run typecheck
npm test
VITE_BASE_PATH=/greg-public-study/ npm run build
```

The optional browser suite used an isolated Playwright context against the existing local servers and did not start or stop them. Its helper, temporary environment, result JSON and selected screenshots are local QA materials and are intentionally excluded from the release commit. The committed, repeatable checks are `npm run typecheck`, `npm test` and the production build above.

## Files

Created:

- `src/components/exercises/ExerciseStep.tsx`
- `src/lib/exercise.ts`
- `tests/batch-validation.test.mjs`
- `docs/BATCH_VALIDATION_REVIEW.md`

Modified:

- `src/components/exercises/ExerciseQuestion.tsx`
- `src/components/lessons/LessonContent.tsx`
- `src/pages/LessonPage.tsx`
- `src/lib/progress.ts`
- `src/styles/global.css`
- `docs/LESSON_SCHEMA.md`

Generated browser evidence and the optional local browser helper remain uncommitted. Other pre-existing modified/untracked files were retained. No application dependency or lockfile changed. Ignored `dist/` was rebuilt; temporary test environments/logs stay under ignored `.tmp/`.

## Local QA server

**http://127.0.0.1:5175/?qa=1#/course/a1**

The existing Vite development server on port 5175 remains active and serves the current source. Select any of the ten lessons using **Открыть урок**, then any exercise from the step list. Previous lessons do not have to be completed in QA mode. The existing preview server on port 5173 was also left running; no existing server was terminated or restarted.

## Known limits

- Drafts and unsubmitted corrections remain in component memory. A refresh restores the last checked values, not subsequent unsubmitted edits; submitted answers and all attempts persist.
- Required-field border styling is a missing-input indication, not an incorrect grading attempt. No correctness outcome is recorded for an incomplete batch.
- Mobile checks used a 360px browser viewport, not a physical iOS/Android keyboard. The action is in normal flow and result focus avoids opening a keyboard, but physical-device keyboard behavior and a full screen-reader audit remain manual checks.
- QA completion ticks remain deliberately synthetic; answer scores and the exercise Continue button reflect actual checks. Production retains normal sequential unlocking.
- Existing cross-tab conflict detection remains unchanged; concurrent writes are not automatically merged.

No blocker remains for local review. All ten lessons, 70 steps and 150 questions are preserved. No vocabulary lessons, redesign, authentication, commit, push or deployment were introduced. Publication requires separate user approval.
