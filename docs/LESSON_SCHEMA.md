# Lesson engine contract

Phase 3 supplies `src/content/a1/toBe.ts`, `presentSimple.ts` and `doDoes.ts`: three production lessons with seven steps and 15 questions each. The historical three-question Phase 2 sample is a test-only fixture at `tests/fixtures/sampleLesson.ts`. It is never imported by the production catalog. The authoritative TypeScript types are in `src/types/lesson.ts`.

## Lesson and catalog

`Lesson` contains `id`, `level` (`A1`, `A2`, `B1`, `B2`), `title`, `sample`, `objectives` and ordered `steps`. Keep `sample: true` for demonstrations. Text is plain text, never executable HTML.

The ordered `CourseEntry[]` in `src/content/course.ts` supplies card metadata (`id`, `title`, `subtitle`, `objective`) and an optional `lesson`. The lesson ID must match its catalog ID. An entry without content can unlock, but cannot award completion. All preceding entries must be completed before a lesson opens.

IDs are stable lowercase URL-safe slugs (`to-be`, `ready-question`), unique within their owner. Production question IDs must be unique across the course. Routes use `#/lesson/{lessonId}/{stepId}`; no component depends on particular lesson or step IDs. All three production lessons use `sample: false`.

## Steps

Every step has `id`, `title`, `description`, `type` and `completion`.

| Type | Content | Completion |
| --- | --- | --- |
| `intro` | `heading`, `text`, `example`, `translation` | `acknowledge` |
| `theory` | `heading`, `text`, `tableCaption`, `rows`, optional `blocks`, `noteTitle`, `note` | `acknowledge` |
| `exercise` | Nonempty `questions` array | `all-correct` |
| `review` | Mistakes derived from saved attempts | `acknowledge` |
| `summary` | Scores derived from saved attempts | `acknowledge` |

Each theory row has `subject`, `form`, `example`, `translation`. Theory text is rendered as paragraphs separated by a blank line; no HTML is accepted. Production validation enforces exactly seven ordered steps: intro, theory, choice exercise, blank exercise, written exercise, review, summary. Each exercise must contain at least five questions of the specified type; all must be solved before that section completes. Translated introductory examples, theory table rows and common-mistake explanations are required.

### Compact theory presentation

The optional `blocks` array adds short concepts after the table and before the closing tip. Each block has a unique `title` and a short `text`; optional `formula` renders in bold. Optional `example` and `translation` must be supplied together and render as a separate example panel, with the English text marked `lang="en"`. Newlines may separate related examples. Table rows may also include `subjectTranslation` below the English subject. All fields remain plain text; no Markdown/HTML parsing or new dependency is introduced.

These additions are backward-compatible: existing lessons without `blocks` or `subjectTranslation` continue to validate and render. They do not change IDs, completion rules, questions, grading, routing or the storage schema. Keep each concept brief, use a few examples, and preserve rules needed by the existing exercises. Gregory and Natasha in the examples are fictional instructional characters.

Reading acknowledgement happens only through the explicit Next action. Opening a route never completes a step. Next cannot complete an exercise. Review acknowledgement unlocks the summary; explicitly finishing the summary completes the lesson and unlocks the next. Completed steps remain open, and correct answers remain visible with their explanations. Review does not clear or regrade an earned result.

## Questions and deterministic grading

All questions contain `id`, `type`, `instruction`, `prompt`, nonempty `acceptedAnswers`, `explanation` and optional `normalization`.

| Type | Additional fields | Grading |
| --- | --- | --- |
| `choice` | Unique `options`, exactly one accepted option | Exact configured option value |
| `blank` | `placeholder` | Configured accepted strings after normalization |
| `written` | `placeholder` | Configured accepted sentences after normalization |

Text normalization applies Unicode NFC, trims outer whitespace, collapses repeated whitespace and converts straight/curly apostrophes to a straight apostrophe. Case is ignored unless `normalization.caseSensitive` is `true`. Written answers ignore terminal `.`, `!`, `?` by default; blank answers do not. Override with `normalization.ignoreTerminalPunctuation`. Internal punctuation and word order remain meaningful.

Contractions and uncontracted equivalents must be explicitly listed in `acceptedAnswers`; normalization does not infer grammar or paraphrases. The first variant is displayed as the reference answer. Prompts must constrain the intended response. This engine is not a general English sentence grader. Text inputs have a 2,000-character limit.

An incorrect answer shows its explanation and reference, then requires the Retry action before another submission. Retry clears the input, restores focus and keeps all attempts. There is no configured attempt limit. Correct answers are retained for review; restarting a correct question does not erase completion.

## Progress and storage

`gps.progress.v1` contains this versioned shape:

```ts
{
  version: 1,
  completedLessons: string[],
  lessons: {
    [lessonId]: {
      completedSteps: string[],
      answers: {
        [questionId]: {
          attempts: { answer: string; correct: boolean }[],
          retrying: boolean
        }
      }
    }
  },
  lastVisited: { lessonId: string; stepId: string } | null
}
```

Exercise and lesson scores are calculated from persisted outcomes: solved questions, first-try successes, total questions and number of submissions. Derived score numbers are not duplicated in storage. This prevents stale totals when content is extended. Draft input is not stored until submitted.

Loading rebuilds progress against current content in prerequisite order, validates every saved attempt and recalculates correctness. Invalid or unearned later completion is discarded while valid earlier progress is kept. Missing data starts fresh; invalid JSON or an unsupported schema version recovers safely with a visible notice. Unknown IDs are discarded. A future incompatible schema needs an explicit migration or recovery policy; do not silently reinterpret versions.

Append new lesson IDs only after approval, preserving existing order and progress. Preserve IDs and question meaning when editing content; changing IDs means those records can no longer be restored.

### Phase 2 demo compatibility policy

No blanket reset, content-version flag or new progress key is introduced. The existing replay/validation loader scopes recovery to each lesson and its accessible steps. The production `to-be` retains the same lesson/step IDs and the three unchanged question IDs: `choose-am`, `negative-blank`, `ready-question`.

For a completed three-question demo, `intro` and `theory` acknowledgement and the compatible `choose-am` answer remain. The four newly required choice questions keep that exercise incomplete. Consequently, later exercise attempts/acknowledgements are not replayed while those steps are locked; the old demo completion and any unearned later-lesson completion are discarded. Lesson 2 remains locked. The learner completes the full production practice, review and summary to earn completion. In other partially completed states, only valid, reachable records survive. Completed production lessons round-trip without resetting.

This is the existing schema-v1 recovery mechanism, not a one-time destructive migration: it is idempotent after the normalized state is saved. The UI explains that saved data was checked against the current program and new/unfinished tasks remain. Recovery neither enumerates nor clears unrelated storage; `gps.theme.v1` is not read or written by the progress adapter. A regression test covers a completed demo, normalization on the next load and preserved dark theme.

The separate existing `gps.theme.v1` key remains authoritative for theme selection and pre-render restoration. Reset clears learning progress after an inline confirmation, preserving the theme. Storage access/quota failures show a notice and leave the app usable in memory. Data is browser-local; no cross-device or live cross-tab synchronization is implemented.

## Adding content after approval

1. Create a typed lesson content file, with explanations before the relevant exercises and configured accepted alternatives.
2. Attach it to the appropriate entry in `src/content/course.ts`. Preserve the catalog order and stable IDs.
3. Follow the seven-step sequence. Add questions to the existing exercise arrays without changing UI components.
4. Run `npm run typecheck`, `npm test` and `npm run build`. `validateCourse` runs when the catalog loads and in content unit tests, reporting lesson/step/question paths for invalid IDs, keys, normalized duplicate alternatives, incomplete theory, incorrect step order/type or exercises with fewer than five questions. The content tests also enforce the approved three-lesson order and exactly 45 current questions, and check each question against an independently specified expected answer and a specific grammatical error.
5. Check the learner flow, error review, refresh, both themes and small screens.

The level union anticipates later levels without adding any content. A future level needs its own catalog/page and progress scope; only the A1 catalog is currently wired to the interface. Phase 3 does not create A2–B2 courses.

## Accessibility

Exercises use native forms, fieldsets/legends, labeled inputs and radio groups. Enter submits; radio controls retain native arrow/Space behavior. Feedback includes text and an icon rather than color alone, lives in a polite status region and receives focus after submission. Retry returns focus to the answer control. Locked navigation is non-interactive and explains its prerequisite. The inline reset confirmation focuses Cancel, supports Escape and returns focus to its trigger.
