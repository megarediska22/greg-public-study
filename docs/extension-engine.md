# Course #27–121: engine and loading

## Authoring and refresh

Edit `src/content/extension/units/NNN.json` to change an extension lesson. The source schema is `AuthoredUnit` in `src/content/extension/adaptUnit.ts`. The stable lesson ID is `unit-NNN` and the stable question ID is `unit-NNN-${localSlug}`. Keep local slugs when correcting or reordering questions.

Each theory row contains an English pattern, a complete example and its Russian translation. Each choice tuple contains the local slug, Russian instruction, stimulus, options, zero-based answer index and Russian explanation. Blank and written tuples use a list of accepted answers in place of the options and index. The first answer supplies the model spelling. Constrain written prompts to the intended form and include valid alternative answers.

Run `npm run course:refresh` after each batch or correction. It validates the currently available JSON files and emits deterministic lightweight metadata, explicit lazy import maps, and individual compact replay modules under `src/content/extension/generated/`. It writes only changed generated files. The command also runs automatically before `npm run dev`, `npm test`, and `npm run build`. Refresh manually when authors add files to an already running dev server. A process importing modules directly should be restarted after refresh because Node caches imports.

No placeholders are created. Only the contiguous prefix starting at 027 appears in the learner catalog, so a missing prerequisite cannot be skipped. Other authored units remain available through the QA loader. Titles come from the actual approved plan rows in `research/curriculum/curriculum-100.md`, without anchor markup, English subtitles or level suffixes. Checkpoint topic titles are retained.

Final gate (after authors finish all units):

```sh
npm run course:check-final
npm test
npm run build
```

`course:check-final` requires exactly 95 authored files, numbered 027–121, each with seven steps and five choice/five blank/five written questions (1425 extension questions). It is deliberately separate from partial-batch checks. The complete catalog then has 121 lessons and 1980 questions, including the untouched historical 26 lessons / 555 questions. Holistic language/exit QA remains a separate responsibility.

## Runtime API

`src/content/course.ts` exports `lessons` (historical entries plus lightweight contiguous extension metadata), `historicalLessons`, `questionCount`, and the existing historical named groups. `entry.lesson` is absent for new units until loaded; use `stepCount`, `questionCount`, `level`, `band`, and catalog metadata for listings. Never assume every entry contains rich content.

`src/content/extension/registry.ts` exports:

- `availableUnitIds`: all currently authored unit IDs, including units beyond temporary gaps.
- `extensionEntries`: contiguous learner catalog entries.
- `loadLesson(id): Promise<Lesson>`: loads and validates exactly one rich lesson and caches it; historical IDs resolve existing definitions. Failures can be explicitly retried. It also attaches the lesson to its stable catalog entry.
- `getProgressCourse()`: current engine registry with rich lessons where loaded, otherwise prepared compact replay lessons. Compact lessons are engine-only and must never be rendered.
- `prepareProgressCourse(raw)`: loads compact replay modules only for extension IDs present in the saved lesson map and in the actual learner catalog, then returns the engine registry. It imports no rich units.
- `loadedUnitIds()` and `loadedReplayIds()`: diagnostic APIs for loading assertions.

`src/lib/courseSession.ts` exports `openCourseSession(storage)`: prepares exactly the snapshot read before async loading, opens the existing guarded storage session, and performs no startup write. A concurrent tab change is detected on persistence. An unavailable replay module rejects startup so new attempts are never discarded due to an asset-loading failure; the UI offers explicit retry. Denied storage permits in-memory learning and never causes blind persistence.

The reducer/grader/storage schema are unchanged. Old lesson/step URLs and `#/course/a1` remain valid; `#/course/a2` shows transition/A2 entries and preserves the same global prerequisites. A1 continues through #41; #42–61 have level A2 and band `A1 → A2 · Переход`; #62 onward are A2. Written instructions appear verbatim in new task indicators, without guessing sentence form from answer keys. Prompt/option language labels follow authored source text. Feedback, review instructions and summaries come from each authored unit.

## QA integration

`tests/fixtures/extensionCourse.mjs` exports `loadAuthoredCourse(ids?)` for eager test-only content enumeration, including batches beyond gaps. Use with the existing `createQaProgress(course)` for isolated synthetic access. Do not import this fixture into production or use its potentially noncontiguous course for real learners.

The existing `?qa=1` dev harness eagerly loads the contiguous catalog before creating synthetic flags, writes only QA storage keys, and is removed from production by Vite. A new holistic suite/browser runner can use the APIs above; it should refresh manifests before startup and not assume all entries have `.lesson` without awaiting `loadLesson`.

Existing historical suites use `src/content/historicalCourse.ts` with their original exact counts and hashes. The new engine suite additionally hashes all 26 historical lessons. Extension suites enumerate each current authored file, test 5/5/5 adaptation, stable IDs, authored explanations, task indicators, language labels, retries, live versus compact replay equivalence, saved attempt preservation and sequential completion. Startup tests cover malformed/denied storage, concurrent tabs, unknown future data, missing replay assets and selective loading. SSR tests render the adapted tasks and level discovery without opening listening sockets.

Production verification reads Vite's manifest, follows the static entry import graph, and asserts all authored JSON/replay modules remain dynamic entries. Untouched future units are never prefetched. The historical 26 are still eagerly available, preserving the existing integration; the initial JS warning is inherited predominantly from that rich historical content and React. New extension text and replay keys do not enter the initial graph.
