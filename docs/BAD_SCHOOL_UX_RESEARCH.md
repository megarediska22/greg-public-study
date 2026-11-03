# BAD School UX research and Greg Public Study improvements

Date: 2026-11-03. Research notes supporting the published v1.1 UX improvements.

## Access and evidence

The existing authenticated Google Chrome tab at **https://bad.school/bad_marafon/lk/** was accessible through supported CUA browser controls. The dashboard exposed six completed lessons. All six were inspected through their visible navigation, without bypassing access restrictions, submitting new answers, restarting lessons, or changing stored results. Paid PLUS links were not opened. No credentials, private account exports, or protected source code were collected.

Screenshots are local reference evidence in `docs/qa/ux-research/`; they are not imported or shipped by the application. The desktop reference screenshot includes the account display name, so review before sharing it outside the project. The account email was not included in saved screenshots.

## Lessons actually inspected: 6

| Exact URL | Observed screens and interactions |
| --- | --- |
| https://bad.school/bad_marafon/lk/1-1/ | Video introduction poster; concise theory and grouped forms; rule choices; pronoun/translation matching; form selection; negative transformations; question transformations; completion totals and section links. All eight sidebar steps opened. |
| https://bad.school/bad_marafon/lk/1-2/ | Video poster; word-order summary; sentence construction with selectable word buttons, a composed-answer area and reset control; translation text fields; completion. All five steps opened. |
| https://bad.school/bad_marafon/lk/2-1/ | Video poster; compact theory table; rule recognition; verb-form choices; sentence construction; saved correct feedback, section totals, retry controls and completion. All six steps opened. |
| https://bad.school/bad_marafon/lk/2-2/ | Video poster; negative/question theory; auxiliary choices; mixed transformations with a per-item negative/question symbol; word construction; saved correct answers and completion. All six steps opened. |
| https://bad.school/bad_marafon/lk/3-1/ | Video poster; brief written introduction; translation matching with removable chips and a shared translation bank; missing-letter spelling with translations; completion. All five steps opened. |
| https://bad.school/bad_marafon/lk/3-2/ | Theory reviewing three sentence patterns; contextual vocabulary blanks; word-button sentence construction; translation into English; final course summary and section totals. All five steps opened. |

The screenshots and DOM showed drag-and-drop instructions alongside click alternatives. They do not establish that dragging works on every device. New submissions, actual drag gestures, fresh incorrect feedback, retry execution and reset behavior were deliberately not tested on the user's completed account. Video playback was not studied. The report does not infer instructional content hidden in those videos.

## Observed UX patterns

- Desktop separates ordered steps from a central exercise panel. Short section labels and numeric totals aid orientation; Back/Next remain predictable.
- Theory uses a small table and brief examples rather than long uninterrupted text. Vocabulary support sits near the task.
- Each transformation can communicate its target with a symbol beside the sentence. A section-wide instruction alone requires repeated reading when targets vary.
- Choice, translation matching, spelling, sentence assembly and independent writing form a visible range from recognition to production.
- Existing correct feedback uses both text and visual styling. Completed sections and final totals are revisitable. Retry/restart controls exist, but their destructive effects were not exercised.
- At 360px, the final vocabulary assembly screen has a horizontal step strip and a fixed bottom Back/Next bar. The main card fits the viewport. The lower bar reduces travel but occupies reading space; this is a tradeoff, not a pattern to copy automatically.
- Vocabulary matching uses a shared bank, an active target and removable choices. Instructions explain a click alternative to dragging. The spelling task offers translated clues and accepts either missing letters or a whole word according to its visible placeholder.

## Transferable principles and independent decisions

| Principle | Greg Public Study decision |
| --- | --- |
| Put the requested action beside each item | Explicit authored sentence-type metadata and an icon plus Russian label. No punctuation or instruction-text guessing at runtime. |
| Separate instruction from material to transform | Short numbered legend, neutral intent marker, readable instruction, English prompt, then a labeled answer field. |
| Recognition should not require remembering an icon legend | Labels accompany every icon; symbols do not use success/error colors and do not represent grading. |
| Make a small-screen action easy to reach | Full-width check/retry buttons at mobile widths; retain native fields and keyboard Enter submission. |
| Show remaining work without implying earned completion | A solved/total count sits above the exercise. Existing sequential unlocking and QA's explicit artificial-completion banner remain. |
| Keep feedback and correction local | Preserve per-question feedback, unlimited retries, focus transfer and mistake history. Add an explicit incorrect icon/text. |
| Avoid copying a whole navigation system for one useful idea | Preserve the approved sidebar and collapsible mobile step navigation; do not add a competing horizontal strip or fixed overlay. |

These are local design decisions, not claims that BAD School implements our exact accessibility, persistence or grading behavior.

## Audit of all 150 current questions

Read the current catalog, schema, generic exercise and lesson renderers, progress provider/storage guard, validation, navigation, QA modules and QA documentation. Enumerated every question ID, instruction, type and prompt across ten lessons. Existing independent answer-oracle tests cover all 150 canonical answers and specific grammatical errors.

| Lesson | Questions reviewed | Written-task marker decision |
| --- | --- | --- |
| to-be | 15 | 2 questions, 2 negatives, 1 positive short answer |
| present-simple | 15 | 5 negatives |
| do-does | 15 | 3 questions, 1 negative short answer, 1 positive short answer |
| have-has | 15 | 2 negatives, 2 questions, 1 positive short answer |
| articles | 15 | No sentence-form marker: these tasks correct/select an article |
| demonstratives | 15 | 1 question, 2 negatives; 2 plural transformations remain unmarked |
| there-is-are | 15 | 1 negative, 2 questions, 2 short answers |
| can-cant | 15 | 1 negative, 2 questions, 2 short answers |
| present-continuous | 15 | 2 negatives, 2 questions, 1 affirmative transformation |
| was-were | 15 | 1 negative, 2 questions, 2 short answers |

Found: target forms were buried in long legends; mixed tasks were hard to scan; the label “Ваш ответ” did not explain response length; successful completion was only summarized below five questions; mobile action buttons had small content-based widths. Short answers must be distinguished from full questions even when the source prompt itself is interrogative. Article corrections and plural transformations must not be mislabeled as ordinary affirmative tasks.

## Implemented

- Optional `sentenceType` union, validated as authored metadata for written questions.
- 43 explicit annotations: 16 questions, 16 negatives, 6 positive short answers, 4 negative short answers, 1 affirmative. No annotations for the other 107 questions.
- Shared `SentenceTypeBadge` with icon and text; neutral theme tokens, no color-only meaning.
- Separated instruction and prompt hierarchy across all 150 questions. Instructions are programmatically associated with fields/fieldsets.
- Contextual field labels distinguish omitted words, whole sentences and short answers; mobile keyboard submission hint.
- Exercise count above the questions, explicit incorrect status, mobile full-width check/retry controls and separation between question actions.
- Existing focus handling, retry reducer, accepted alternatives, grading, storage sessions, unlocking, summaries and mistake review retained.

A before/after deep comparison of the entire catalog confirmed equality after removing only `sentenceType`. A regression digest records this constraint. No wording, accepted answer, ID, ordering, normalization option, theory or curriculum changed. No storage key/schema/migration changed. The original logo and brand/theme tokens are unchanged.

## Files changed in this task

Modified: `src/components/exercises/ExerciseQuestion.tsx`, `src/components/lessons/LessonContent.tsx`, `src/styles/global.css`, `src/types/lesson.ts`, `src/lib/validation.ts`; nine files under `src/content/a1/` (all except `articles.ts`); `docs/LESSON_SCHEMA.md`.

Created: `src/components/exercises/SentenceTypeBadge.tsx`, `tests/exercise-ux.test.mjs`, this report, `docs/VOCABULARY_IMPLEMENTATION_HANDOFF.md`, and `docs/qa/ux-research/` evidence (`browser-results.json`, reference and local screenshots).

Pre-existing untracked QA evidence directories were left intact. No dependency installed. No engine rewrite, new lesson, commit, push or deployment.

## Executed verification

- `npm run typecheck`: passed. The first intermediate run failed because an annotation script did not support the compact formatting of the original three lesson files; corrected the script and added the missing type. The subsequent check passed.
- `npm test`: **212 passed, 0 failed, 0 skipped**. Includes the existing independent 150-question answer tests, progression, progress replay/backup protection, expansion compatibility and QA isolation. Three new tests cover catalog integrity, representative semantic intent, and invalid/legacy metadata.
- `VITE_BASE_PATH=/greg-public-study/ npm run build`: passed, including TypeScript and production QA exclusion checks. Final JS 360.29 kB / 99.60 kB gzip. All three built HTML/JS/CSS files passed isolation verification.
- Browser QA: 30 exercise routes × 2 widths (360/1280) × 2 themes = **120 rendered checks**. Each showed five questions; no document overflow. This verifies rendering of all 150 questions, not 150 manual browser submissions. Evidence in `browser-results.json`.
- Browser interaction: submitted an intentionally wrong first written answer, reloaded with feedback intact, retried with an empty focused input, submitted correctly through Enter, saw the corrected count and retained original mistake in review. Cleared only that disposable QA lesson afterward; unanswered state had zero feedback panels. Confirmed the final short-answer label and 360px layout after the last accessibility-label change.
- Normal Chrome learning progress was not reset, cleared or used for destructive testing. Local exercise tests used the separate in-app browser and `?qa=1`; production progress keys were not changed by this implementation.

## Local manual QA

**http://127.0.0.1:5175/?qa=1#/course/a1**

`npm run qa` reused the existing development server; no server was terminated. The development server reflects edits through Vite. All ten lessons and steps are accessible; use the QA lesson selector, then the step navigation. “Очистить ответы этого урока” clears only disposable QA answers. Incorrect answers, retry, review, both themes and resizing can be tested. Existing normal learning keys remain separate.

The server is already running through the existing detached launcher. External process cleanup, logout or restart can still stop it; rerun `npm run qa` or `Start Local QA.command` if needed. No OS startup service was installed.

## Limits

No fresh incorrect/retry sequence or video/audio content was tested on BAD School; saved correct states and control affordances were observed. No dedicated flashcard flip UI, per-word pronunciation button or spaced-repetition scheduler was visible on the inspected written screens; their existence elsewhere is unknown. No access to PLUS-only materials was attempted. No Safari/Firefox, physical-phone keyboard, screen-reader or comprehensive accessibility conformance audit was run. Normal progression/persistence compatibility is covered by automated tests, not by modifying the user's production profile. Vocabulary handoff below is a proposal, not implemented content.
