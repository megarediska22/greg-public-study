# Phase 2 review — Learning Engine

Date: 2026-11-03. Scope: Phase 2 only; Phase 3 has not started.

## State before the transport interruption

The lesson schema, three-question sample, deterministic grading, progression guards, shared React progress state, localStorage recovery, exercise forms, feedback/retries, mistake review, summaries and catalog integration were already implemented. The inline reset confirmation and the 25th unit test were saved before the interruption. Earlier verification had passed 24 tests, TypeScript and an earlier production build; the last UI refinements still needed final verification. README still described Phase 1, and schema documentation and this final report were missing.

## Work completed after resuming

- Re-read `AGENTS.md` and `SPEC.md`, inspected the existing engine/UI/test files and checked for stale preview imports and incomplete edits.
- Preserved the working source implementation. Re-ran TypeScript and the current 25-test suite successfully.
- Updated README and documented the lesson schema, extension process, completion decisions and storage recovery contract.
- Built the current production application with the GitHub Pages subpath and tested that exact build in the browser, including the latest reset controls and button labels.
- Saved desktop/light and mobile/dark verification screenshots. No dependencies were added.

## Implemented requirements

| Requirement | Implementation |
| --- | --- |
| Structured, reusable engine | Typed lesson/step/question unions; content separate from components; pure grading and progression modules |
| Sequential steps and lessons | All preceding steps/lessons must be complete; direct URLs and state mutations enforce prerequisites |
| Review access | Completed steps stay accessible; solved answers and earned completion cannot be downgraded by review |
| Multiple choice, blank, written | Native radio groups and labeled inputs; a section supports multiple questions |
| Deterministic grading | Explicit accepted strings; whitespace/case/apostrophe normalization; configurable terminal punctuation handling |
| Feedback and retries | Text status, explanation and reference answer; focus management; explicit retry; preserved attempt history |
| Section/summary/lesson completion | All answers correct; acknowledgement for reading/review; explicit Finish action on summary |
| localStorage persistence | Versioned schema, completed lessons/steps, answer outcomes/attempts, retry state and last location; existing theme key retained |
| Safe recovery | Replay validated attempts in prerequisite order; recalculate scores; retain valid earlier progress; reject corrupt/unearned later records |
| Real progress | Lesson/course bars and statuses derive from earned steps; score distinguishes mastery and first-try success |
| Keyboard and assistive feedback | Native controls, visible focus, polite status regions, focus after check/retry, noninteractive locked navigation |
| Automated tests | 25 dependency-free Node unit tests for grading, variants, unlocking, multiple questions, retry, review and persistence/recovery |
| Reset and local-only notice | Inline confirmation with Cancel/Escape; reset keeps theme; browser-local storage explanation |

## Sample and decisions

- Exactly one sample lesson, seven ordered steps and three questions: choose `am`, fill a negative form, and transform an assertion into a question.
- The sample is clearly labeled throughout. Completing it unlocks the second A1 catalog entry, which honestly shows that content is pending. It cannot award completion, so the third lesson remains locked. Synthetic test fixtures verify second-to-third unlocking without adding curriculum to the app.
- Reading/review completion requires acknowledgement, rather than inferring that scrolling or merely opening a page means completion.
- Correct responses are retained for review; retry is available for incorrect responses. This preserves earned completion.
- Scores are calculated from persisted answer outcomes and attempts, rather than storing redundant totals that could become stale.
- Theme remains in the established versioned key `gps.theme.v1` to preserve Phase 1 pre-render behavior. Progress has its own `gps.progress.v1` schema.
- Native reset confirmation was replaced by an inline, keyboard-accessible confirmation using the approved notice/button styles. A browser automation timeout on the native dialog did not affect the final control.

## Files created

```text
src/types/lesson.ts
src/content/sampleLesson.ts
src/lib/grading.ts
src/lib/progress.ts
src/lib/validation.ts
src/lib/ProgressContext.tsx
src/components/exercises/ExerciseQuestion.tsx
src/components/lessons/ResetProgress.tsx
tests/grading.test.mjs
tests/progress.test.mjs
docs/LESSON_SCHEMA.md
PHASE2_REVIEW.md
verification/phase2-desktop-light.png
verification/phase2-mobile-dark.png
```

## Files modified

```text
package.json
README.md
src/main.tsx
src/App.tsx
src/content/course.ts
src/pages/HomePage.tsx
src/pages/CoursePage.tsx
src/pages/LessonPage.tsx
src/components/lessons/LessonContent.tsx
src/components/lessons/StepNavigation.tsx
src/styles/global.css
```

Replaced obsolete Phase 1 files (removed): `src/content/lessonPreview.ts` and `src/components/lessons/ExercisePreview.tsx`. Their sample data/rendering now live in the typed sample and functional engine components.

Generated locally: `dist/` (already ignored). `package-lock.json`, `AGENTS.md`, `SPEC.md`, all original assets, the shared header/footer, router, Vite configuration and theme initialization were left unchanged.

## Executed final verification

After resuming:

- `npm run typecheck`: **passed**, exit 0.
- `npm test`: **passed**, **25 tests, 25 passed, 0 failed, 0 skipped**.
- `VITE_BASE_PATH=/greg-public-study/ npm run build`: **passed**, exit 0, including TypeScript. Vite 7.3.7 transformed 50 modules and generated `dist/`.
- Tested the built output via Vite preview at `/greg-public-study/`, including direct hash-route refreshes.
- Browser: home → catalog → introduction → theory → choice → blank → written → mistake review → summary → explicit completion.
- Browser: incorrect choice, disabled Next, refresh preserving that error, retry focus on the radio, keyboard Space/Enter submission, correct retry and saved history.
- Browser: contracted blank with curly apostrophe, uppercase and repeated whitespace accepted; written answer with lowercase, repeated whitespace and different terminal punctuation accepted.
- Browser: actual final score **3/3**, **2/3 first try**, **4 attempts**; **7/7 steps** and completion retained after reload.
- Browser: direct link to a locked summary is blocked; completed step review keeps 7/7; lesson 2 unlocks with its pending-content message; direct route to lesson 3 stays blocked.
- Browser: reset opens with focus on Cancel; Escape preserves 1/7 and returns focus to the trigger; explicit confirmation resets to 0/7 after reload and preserves the theme.
- Browser: mobile step disclosure and navigation work. At 360px, measured document width equals viewport width on the blank exercise, final summary and course catalog (no horizontal overflow on those screens).
- Browser: light and dark theme rendering, dark persistence after reload and loaded logo checked. Desktop/light exercise and 360px/dark summary screenshots saved.
- Browser error/warning log query for the final session returned **no entries**.

One mobile test selector did not match the summary's exact text; the current accessibility element was used successfully. Initial pre-resume TypeScript narrowing errors had already been corrected. There are no unresolved build/test failures.

## Remaining limitations

- Full three-lesson content and 45 questions are deliberately absent. This is a functioning engine demonstration, not the completed MVP curriculum.
- Browser checks cover the sample learner journey and selected responsive states, not a full cross-browser or screen-reader audit. Storage corruption/denial/quota recovery was tested through the pure storage adapter, not by modifying a live browser profile.
- Draft text is saved only on submission. Correct answers are retained for review; a separate fresh practice mode is not included.
- Storage is local; there is no device or live cross-tab synchronization. Unsupported future storage versions recover safely; a real migration must be defined when introducing an incompatible version.
- Phase 3 must decide how demonstration progress should be reset or migrated when the full lesson content replaces the sample. Stable IDs preserve compatible records; new required questions block later completion until answered.
- The schema anticipates later CEFR levels, but only the A1 catalog is wired to the current interface.

No blockers remain for Phase 2 review. No commits, GitHub authentication, pushes, remote repository/settings changes or deployment were performed. Wait for approval before Phase 3.
