# Lesson engine contract

The integrated A1 catalog contains 16 production lessons: ten unchanged grammar lessons under `src/content/a1/` (150 questions) and six interleaved vocabulary lessons under `src/content/vocabulary/` (180 questions, 60 target words/expressions). Each lesson has seven steps: **112 steps / 330 questions**. The historical three-question Phase 2 sample remains test-only. The authoritative types are in `src/types/lesson.ts`. See `VOCABULARY_EXPANSION_REVIEW.md` for exact ordering and inventory.

## Lesson and catalog

`Lesson` contains `id`, `level` (`A1`, `A2`, `B1`, `B2`), `title`, `sample`, `objectives` and ordered `steps`. Optional `kind` is `grammar` (the legacy default) or `vocabulary`. Keep `sample: true` for demonstrations. Text is plain text, never executable HTML.

The ordered `CourseEntry[]` in `src/content/course.ts` supplies card metadata (`id`, `title`, `subtitle`, `objective`) and an optional `lesson`. The lesson ID must match its catalog ID. An entry without content can unlock, but cannot award completion. New learners must complete all preceding entries. Validated retained grammar access for returning learners is described below.

IDs are stable lowercase URL-safe slugs (`to-be`, `ready-question`), unique within their owner. Production question IDs must be unique across the course. Routes use `#/lesson/{lessonId}/{stepId}`; no component depends on particular lesson or step IDs. All sixteen production lessons use `sample: false`.

## Steps

Every step has `id`, `title`, `description`, `type` and `completion`.

| Type | Content | Completion |
| --- | --- | --- |
| `intro` | `heading`, `text`, `example`, `translation` | `acknowledge` |
| `vocabulary` | `heading`, `text`, `items`, `note` (vocabulary lessons only) | `acknowledge` |
| `theory` | `heading`, `text`, `tableCaption`, `rows`, optional `blocks`, `noteTitle`, `note` | `acknowledge` |
| `exercise` | Nonempty `questions` array | `all-correct` |
| `review` | Mistakes derived from saved attempts | `acknowledge` |
| `summary` | Scores derived from saved attempts | `acknowledge` |

Each theory row has `subject`, `form`, `example`, `translation`. Theory text is rendered as paragraphs separated by a blank line; no HTML is accepted. Production validation enforces exactly seven ordered steps: intro, theory (or vocabulary discovery), choice exercise, blank exercise, written exercise, review, summary. Each exercise must contain at least five questions of the specified type; all must be solved before that section completes. Translated introductory examples, theory table rows and common-mistake explanations are required.

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

Each exercise has one `Проверить ответы` button below all questions. Drafts remain editable and ungraded until submission. If any unresolved answer is empty, the entire batch is withheld: missing fields are identified and no attempts are recorded. Entered values remain intact.

The `check-exercise` action atomically validates all unresolved questions. Correct answers are marked and locked; incorrect answers retain their text and remain editable, with explanations and reference answers. The same button rechecks unresolved questions without an extra Retry action or automatic clearing. All attempts are kept; there is no configured attempt limit. The section completes only when every answer is correct. `Продолжить` then becomes enabled without automatic navigation. Per-question `answer`/`retry` actions remain available internally for existing stored-history replay and compatibility; the UI no longer submits individual questions.

## Progress and storage

`gps.progress.v1` contains this versioned shape:

```ts
{
  version: 1,
  curriculumVersion?: 2,
  legacyUnlockedLessons?: string[],
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

The production React provider now opens a read-only session through `src/lib/progressStorage.ts`. It never writes the normalized initial state merely because the application mounted. Only subsequent changes are persisted. If initial storage reading fails, that session stays memory-only. Before persisting a recovered state, the exact original raw value is archived under a new `gps.progress.v1.backup.<timestamp>[.<suffix>]` key; failure to archive blocks replacement. Existing backup keys are not overwritten. A stale tab whose expected raw value has changed is blocked from overwriting the new value. Replacing earned progress with an empty state requires the existing explicit reset confirmation and also retains a backup. Unknown records are filtered out of active validated progress, but their original bytes remain available rather than being silently destroyed.

The legacy pure `loadProgress`/`saveProgress` helpers remain for compatibility and low-level tests; application startup must use the guarded session. A future ID/schema change still needs a deliberate migration: backups preserve evidence, but do not infer mappings between unrelated IDs.

Add or interleave lesson IDs only after approval and explicit progress compatibility tests; preserve existing IDs and earned progress. Preserve IDs and question meaning when editing content; changing IDs means those records can no longer be restored.

### v1.0 → v1.1 course expansion

The original three lessons and all existing lesson/step/question IDs stay intact. New lesson IDs are appended: `have-has`, `articles`, `demonstratives`, `there-is-are`, `can-cant`, `present-continuous`, `was-were`. The existing progress replay preserves completed and partial old lessons, attempts and the last visited accessible step. Completing `do-does` unlocks `have-has`; it does not automatically complete any new content. No reset, storage-key change, content-version flag or migration is introduced. Theme remains in its independent key. The end-of-course summary now belongs to `was-were`; the unchanged generic summary renderer derives the next action from the catalog.

### Phase 2 demo compatibility policy

The historical demo compatibility policy introduces no blanket reset or new progress key. The existing replay/validation loader scopes recovery to each lesson and its accessible steps. The production `to-be` retains the same lesson/step IDs and the three unchanged question IDs: `choose-am`, `negative-blank`, `ready-question`.

For a completed three-question demo, `intro` and `theory` acknowledgement and the compatible `choose-am` answer remain. The four newly required choice questions keep that exercise incomplete. Consequently, later exercise attempts/acknowledgements are not replayed while those steps are locked; the old demo completion and any unearned later-lesson completion are discarded. Lesson 2 remains locked. The learner completes the full production practice, review and summary to earn completion. In other partially completed states, only valid, reachable records survive. Completed production lessons round-trip without resetting.

This is the existing schema-v1 recovery mechanism, not a one-time destructive migration: it is idempotent after the normalized state is saved. The UI explains that saved data was checked against the current program and new/unfinished tasks remain. Recovery neither enumerates nor clears unrelated storage; `gps.theme.v1` is not read or written by the progress adapter. A regression test covers a completed demo, normalization on the next load and preserved dark theme.

The separate existing `gps.theme.v1` key remains authoritative for theme selection and pre-render restoration. Reset clears learning progress after an inline confirmation, preserving the theme. Storage access/quota failures show a notice and leave the app usable in memory. Data is browser-local; no cross-device or live cross-tab synchronization is implemented.

## Local development QA

Run `npm run qa` and open the printed loopback URL with `?qa=1`. The development entrypoint imports `src/dev/qa.tsx` only when Vite's `import.meta.env.DEV` is true and the hostname is localhost/loopback. That entire module tree, CSS and QA keys are absent from production output; every `npm run build` verifies this.

QA uses only `gps.qa.progress.v1` for synthetic lesson/step completion flags and test attempts, plus `gps.qa.theme.v1` for its theme. All lessons/steps open immediately while all questions initially remain unanswered. Test answers go through the production batch reducer and unchanged grader. Synthetic access remains open, while each exercise’s Continue button still requires its real answers to be correct. Completion marks in this mode are explicitly artificial; scores reflect actual test attempts. The QA toolbar opens any lesson and clears just its disposable answers/history to start at introduction again, retaining access to all steps. Normal learning keys and behavior are unaffected.

## Adding content after approval

1. Create a typed lesson content file, with explanations before the relevant exercises and configured accepted alternatives.
2. Attach it to the appropriate entry in `src/content/course.ts`. Preserve the catalog order and stable IDs.
3. Follow the seven-step sequence. Add questions to the existing exercise arrays without changing UI components.
4. Run `npm run typecheck`, `npm test` and `npm run build`. `validateCourse` runs when the catalog loads and in content unit tests, reporting lesson/step/question paths for invalid IDs, keys, normalized duplicate alternatives, incomplete theory, incorrect step order/type or exercises with fewer than five questions. Grammar regression tests retain the original ten-lesson/150-question oracle. Integrated tests independently enforce the 16-lesson order, 330 questions, 60 vocabulary entries, all 180 new keys, full progression and legacy migration.
5. Check the learner flow, error review, refresh, both themes and small screens.

The level union anticipates later levels without adding any content. A future level needs its own catalog/page and progress scope; only the A1 catalog is currently wired to the interface. Phase 3 does not create A2–B2 courses.

## Accessibility

Each exercise uses one native form with labeled fieldsets/inputs and radio groups. Enter submits the group; radio controls retain native arrow/Space behavior. The aggregate summary is a polite status region. Feedback includes text and an icon rather than color alone. Explicit checking focuses and scrolls to the first missing/incorrect fieldset, without reopening a mobile keyboard; all-correct checking focuses the summary at the bottom. Editing never triggers grading, scrolling or focus changes. Locked navigation is non-interactive and explains its prerequisite. The inline reset confirmation focuses Cancel, supports Escape and returns focus to its trigger.

## Authored sentence intent (UX extension)

Written questions may supply optional `sentenceType`: `affirmative`, `negative`, `question`, `short-affirmative` or `short-negative`. It describes the **requested output**, including short answers whose source prompt is a question. The renderer shows a neutral icon and Russian label before the instruction and prompt. Do not derive this value from text patterns or use it as a grading flag. Leave it absent for article corrections, plural transformations and other tasks where a sentence-form badge would obscure the teaching goal. Validation rejects unsupported values and metadata on non-written questions. Legacy questions without this field remain valid. IDs, grading, answers, progression and storage are unchanged.


## Integrated vocabulary schema

A vocabulary lesson has `kind: 'vocabulary'` and the same seven-step structure, replacing theory with `type: 'vocabulary'`. Discovery has 6–12 validated cards; the current lessons have 10 each. Every `VocabularyItem` supplies stable lesson-local `id`, `term`, Russian `partOfSpeech`, `meaningRu`, `example`, `exampleTranslation`, and optional `usage`. All fields are plain text. Cards support individual keyboard-operated translation reveals and show/hide all. There is no audio control without a checked local recording; this expansion ships no audio.

Existing `choice`, `blank`, and `written` question types remain unchanged. Optional `vocabularyId` references a discovery card and is mandatory in vocabulary practice. Optional `promptLanguage` and choice-only `optionsLanguage` are `en` or `ru`; omitted values default to English. Recognition options are Russian; recall and contextual clues are Russian. Reference answers and spelling tips stay out of practice until checking. Recall asks for the complete taught expression, not guessed missing letters. Written prompts constrain the target word, subject, frame and time-word placement; configured full forms and contractions are accepted. No automatic translation or general paraphrase grader is used.

Vocabulary review derives the unique words associated with actual incorrect attempts. An optional extra drill reuses the existing recall questions and `ExerciseStep` batch UI in a disposable nested progress context. Its temporary subset is never registered as a new course section or written to storage. It preserves original scores and mistakes; leaving/reloading restarts this optional drill. All required mistakes were already corrected in the normal practice before review unlocks. Summary lists target words and separate recognition/recall/contextual scores; it makes no long-term mastery claim.

## Grammar-only → integrated curriculum migration

`gps.progress.v1` and `version: 1` remain stable. Newly initialized normal progress includes `curriculumVersion: 2`. For an older record without this field, the decoder first replays its attempts against the grammar-only view, applying the existing grading and prerequisite guards. That validated result defines `legacyUnlockedLessons`: completed grammar lessons and the next formerly unlocked grammar lesson, identified by stable IDs. This retained frontier does not expand as new work is completed. Stored completion flags alone do not grant access.

The decoder then replays the full integrated catalog with these retained grammar entitlements. Earlier grammar prerequisites still apply; only newly inserted vocabulary prerequisites are waived for the retained grammar IDs. All original completion, valid answers, wrong-attempt history, pending retry and accessible last location survive. New vocabulary is not marked complete. For example, someone who completed `to-be`, `present-simple` and `do-does` retains access to `have-has`; they must complete `people-feelings` and `daily-routines` before progressing beyond that frontier to `articles`. Someone who completed all ten grammar lessons retains all ten; the course shows 10/16 until the six vocabulary lessons are completed in order. A fresh user must complete all sixteen in the integrated order.

On subsequent loads, version-2 curriculum metadata preserves only known grammar IDs; the decoder does not infer new legacy rights from current progress. Explicit reset drops the entitlements and creates a fresh integrated learner. New completions are stored in catalog order so backfilling vocabulary round-trips deterministically. Object-key insertion order does not falsely signal recovery; invalid/unknown data still does.

Migration is in memory and read-only at startup. The unchanged guarded storage session preserves exact original bytes before the first migrated write, blocks that write if backup fails, and retains stale-tab/read-failure/explicit-reset protections. Theme keys are unchanged. Old releases do not understand the retained-access metadata: do not use an older build to write the same origin after adopting this expansion; keep the raw backup for deliberate rollback. No user Chrome profile was used for migration tests.
