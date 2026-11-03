# Global exercise clarity regression review

Final pre-release implementation and verification report, 2026-11-03.

## Root cause

The previous renderer displayed a small sentence badge only when `question.sentenceType` existed. Only 43 written grammar questions had that property. Every choice/blank question, all vocabulary questions and all practical-English questions therefore bypassed the indicator. The original regression was never covered: **To Be exercise 2 is step `blank`, not the later written step `sentence`**. Its five negative-completion tasks had no sentence metadata, and the prior validator explicitly restricted that legacy field to written questions. Cleaner typography and checks of selected written tasks did not close that coverage gap.

## Exact mandatory fix

Route: `#/lesson/to-be/blank` (Lesson 1, exercise 2).

All five IDs have explicit task intent `action: fill, form: negative`:

- `negative-blank`
- `to-be-she-negative`
- `to-be-we-negative`
- `to-be-he-negative`
- `to-be-they-negative`

Before the instruction, source phrase and input, the learner now sees a prominent **✖️ Отрицание** heading and the short action **Вставь слова. Напиши только пропущенную часть.** The actual exercise asks for the missing negative form; requiring an entire sentence would contradict its accepted answers, so the UI makes that distinction explicit without changing the task.

This screen was opened and visually inspected in the actual application. Screenshots `mandatory-negative-{360,1280}-{light,dark}.jpg` show the four combinations. No answer or complete solved sentence is introduced by the indicator.

## Systematic implementation

- `src/content/questionTasks.ts` supplies explicit, audited question IDs grouped by identical action/form. All **480** IDs are assigned; the grouped representation avoids duplicating long metadata objects in the bundle. Duplicate authored IDs throw immediately.
- `src/lib/taskIndicators.ts` defines the action taxonomy and output-form labels, produces consistent presentation and validates completeness, allowed actions, compatible control types and agreement with legacy `sentenceType` where present.
- `src/content/course.ts` validates task coverage at startup. Missing intent fails with the lesson/step/question path rather than silently rendering an unmarked question. No text, punctuation or accepted-answer parsing is used at runtime.
- One `TaskIndicator` renders unconditionally inside every question fieldset, before supporting instructions and the prompt. The same component handles grammar, vocabulary, practical tasks and optional review of existing question IDs.
- The heading uses 1.15rem bold type, an icon, a neutral surface, an orange structural rule and consistent spacing. Form icons use SVG in the theme foreground color: native emoji checks/crosses were too dark on charcoal during visual review. Icon and short text always appear together.
- When a form is relevant, it is the primary heading and the concrete action/response length appears immediately underneath. Other tasks use their specific action as the primary heading. Article correction, pluralization, conversational fragments and idioms are not forced into an inappropriate sentence-form category.
- Supporting instructional context, templates and constraints remain unchanged. The learner need not find the primary action in that longer text. The new short action supplements rather than removes essential pedagogy.
- Indicators are included in each field's accessible description. They do not represent correctness and do not change on selection, typing, checking or correction.

All 21 lessons / 147 steps / 480 question definitions deep-equal the task-start catalog. Their IDs, instructions, prompts, alternatives, explanations, normalization and order are unchanged. The task metadata is deliberately separate from the educational data. The guarded storage, progress reducer, grader and question-state logic have unchanged hashes. No migration, new storage key, reset, unlocking change or batch behavior change.

## Full action taxonomy

| Metadata action | Visible action | Expected input/action | Questions |
| --- | --- | --- | ---: |
| `choose` | 👀 Выбери ответ | Отметь один вариант. | 45 |
| `choose-article` | 👀 Выбери артикль | Отметь один артикль. | 5 |
| `fill-article` | 🔤 Вставь артикль | Напиши только артикль. | 5 |
| `plural-word` | 🔤 Множественное число | Напиши слово во множественном числе. | 1 |
| `fill` | 🔤 Вставь слова | Напиши только пропущенную часть. | 44 |
| `build` | ✍️ Составь предложение | Напиши предложение целиком. | 33 |
| `short` | 💬 Коротко ответь | Напиши короткий ответ целиком. | 10 |
| `fix` | 🔄 Исправь ошибку | Напиши исправленную фразу целиком. | 3 |
| `article` | 🔤 Добавь артикль | Напиши нужное предложение целиком. | 2 |
| `plural` | ✍️ Множественное число | Измени фразу и напиши её целиком. | 2 |
| `choose-translation` | 🌐 Выбери перевод | Отметь значение слова или выражения. | 110 |
| `recall` | ✍️ Вспомни и напиши | Напиши слово или выражение по-английски. | 110 |
| `translate` | 🌐 Переведи | Напиши фразу целиком по-английски. | 69 |
| `greet` | 💬 Поздоровайся | Напиши реплику по-английски. | 3 |
| `react` | 💬 Отреагируй | Напиши короткую реплику по ситуации. | 4 |
| `farewell` | 💬 Попрощайся | Напиши реплику по-английски. | 6 |
| `ask` | ❔ Задай вопрос | Напиши вопрос целиком по-английски. | 9 |
| `request` | 💬 Вежливо попроси | Напиши просьбу целиком по-английски. | 7 |
| `order` | 💬 Сделай заказ | Напиши реплику для заказа. | 1 |
| `agree` | 💬 Согласись | Напиши короткую реплику по ситуации. | 4 |
| `thank` | 💬 Поблагодари | Напиши реплику по-английски. | 1 |
| `invite` | 💬 Предложи встречу | Напиши приглашение по-английски. | 2 |
| `respond` | 💬 Ответь в ситуации | Напиши реплику по-английски. | 4 |
The action counts sum to **480**. Form headings are **✔️ Утверждение**, **✖️ Отрицание**, **❔ Вопрос**, **✔️ Короткий ответ: да**, and **✖️ Короткий ответ: нет**. There are 39 authored combinations of action and optional form.

Examples of deliberate distinctions:

- A question-shaped source asking for a negative short answer gets the short-negative target, not a generic “Вопрос”.
- Choosing a translation does not ask the learner to build a sentence even when the English example contains a question.
- “No way!” asks for a surprised reaction; “No problem.” expresses agreement to help. Neither is classified as grammatical negation from the word “No”.
- A recalled collocation such as an infinitive is not labeled as an affirmative sentence merely because its contextual writing task uses an affirmative sentence.
- Greeting variants that include both fragments and complete forms are labeled by their shared communicative action, not a falsely exclusive sentence pattern.
- A missing plural noun has a plural-word label; article tasks explicitly distinguish choosing, inserting and correcting.

## Coverage accounting

**437 previously unmarked questions now have a task indicator. The existing 43 written-task indicators have been replaced by the same more prominent system. Total: 480/480.**

No question uses an exemption. No question has unresolved action classification. Contextual restrictions and configured wording remain explicit in the source instructions/prompts; the indicator does not imply unrestricted free translation.

| Lesson ID | Questions audited | Correctly rendered in all four combinations |
| --- | ---: | ---: |
| `to-be` | 15 | 15 / 15 |
| `people-feelings` | 30 | 30 / 30 |
| `present-simple` | 15 | 15 / 15 |
| `do-does` | 15 | 15 / 15 |
| `daily-routines` | 30 | 30 / 30 |
| `have-has` | 15 | 15 / 15 |
| `articles` | 15 | 15 / 15 |
| `family-objects` | 30 | 30 / 30 |
| `demonstratives` | 15 | 15 / 15 |
| `there-is-are` | 15 | 15 / 15 |
| `home-places` | 30 | 30 / 30 |
| `can-cant` | 15 | 15 / 15 |
| `hobbies-abilities` | 30 | 30 / 30 |
| `present-continuous` | 15 | 15 / 15 |
| `actions-time` | 30 | 30 / 30 |
| `was-were` | 15 | 15 / 15 |
| `greetings-reactions` | 30 | 30 / 30 |
| `everyday-combinations` | 30 | 30 / 30 |
| `help-and-cafe` | 30 | 30 / 30 |
| `simple-arrangements` | 30 | 30 / 30 |
| `small-talk-basics` | 30 | 30 / 30 |
Per-question accounting is in **`docs/EXERCISE_CLARITY_QUESTION_AUDIT.csv`**: lesson ID, question ID, exercise type, required action, final indicator, actual rendering result and remaining ambiguity. Machine-readable `docs/qa/exercise-clarity/question-audit.json` also contains each row's action/form metadata and its four successful layout/theme checks. No row was inferred to pass solely because a shared component exists.

## Browser verification actually executed

The existing development QA server was reused for the local display audit.

The server was reused without a stop/restart. Tests used the isolated in-app browser, not the user's normal Chrome profile. No localStorage was manually cleared or injected; no QA or production reset control was clicked.

- **252 exercise-route checks**: all 63 practice sections × widths 360/1280 × light/dark.
- **1920 question-level checks**, covering all 480 distinct questions in each combination. Each actual rendered label, symbol, detail, action and form was compared to its audited metadata. Every heading was at least 18 CSS pixels, had layout/visibility, preceded its prompt and stayed within its fieldset. No page horizontal overflow.
- Every practice section retained **one bottom batch-check button**, with **zero per-question buttons**.
- Mandatory To Be exercise 2, mixed To Be written targets, affirmative construction, vocabulary translation, recall/spelling, practical conversation and article choice received representative screenshots in all four combinations (28 screenshots). The full route matrix also covered every question in all five new practical lessons, rather than only those photographed.
- Visually inspected representative mobile negative/affirmative and desktop negative screens. Corrected dark form-icon contrast and repeated the full 1920-question rendering comparison after that change.
- Three fresh correction cycles on the separate `localhost:5173` QA origin: choice at 360/light, blank at 1280/dark and written at 360/dark. Empty submission marked five missing answers without feedback/attempts; mixed checking locked four correct answers; the wrong answer and feedback survived reload; rechecking corrected only the unresolved answer; Continue became available. Labels remained unchanged through the cycle. Existing attempts were checked before testing, and no reset was performed.
- Browser warning/error log query returned no entries in the interaction tab.

Evidence: `docs/qa/exercise-clarity/rendered-coverage.json`, `batch-checks.json`, `question-audit.json`, plus named screenshots. Original 127.0.0.1 QA exercise answers were left untouched during the display audit; new test submissions are confined to a separate isolated QA store.

## Automated checks actually executed

| Check | Result |
| --- | --- |
| TypeScript validation | Passed |
| Full `npm test` | **372 passed, 0 failed, 0 skipped**: 362 existing plus 10 new task-indicator tests |
| `VITE_BASE_PATH=/greg-public-study/ npm run build` | Passed; final JS 490.79 kB / 126.56 kB gzip; CSS 26.31 kB / 5.93 kB gzip |
| Production QA exclusion, included in build | Passed: all three HTML/JS/CSS outputs exclude QA implementation and keys |
| Catalog equality | Complete 21-lesson catalog exact, not only answer counts |
| Protected engine/storage/source hashes | Unchanged |
| `git diff --check` | Passed |

New regression tests render actual controlled React question components through the installed Vite SSR loader without opening a listening port. They cover the five mandatory negative blanks, affirmative/interrogative/mixed targets, translation/recall/conversation mappings, idioms, missing/unknown/incompatible/conflicting intent, unchanged saved correct states, all 480 indicators before submission and the complete historical catalog digest. They also assert that questions do not introduce independent submit controls. Existing batch, 480-answer audits, legacy progress, recovery/backups, QA, completion and sequential-unlocking tests continue to pass.

Intermediate verification issues were resolved: Node imports needed explicit `.ts` extensions; the read-only browser evaluator did not expose global `parseFloat`, so CSS font strings were parsed outside that evaluator. A first metadata encoding crossed Vite's 500 kB warning threshold; grouping identical explicit intents reduced the final bundle below it, with no missing IDs and no warning in the final build. These did not require engine, dependency or content changes.

## Files changed in this task

Created:

- `src/content/questionTasks.ts`
- `src/lib/taskIndicators.ts`
- `src/components/exercises/TaskIndicator.tsx`
- `tests/task-indicators.test.mjs`
- This report and `docs/EXERCISE_CLARITY_QUESTION_AUDIT.csv`. Generated browser screenshots and JSON under `docs/qa/` remain local and are excluded from the release.

Modified:

- `src/components/exercises/ExerciseQuestion.tsx` — unconditional indicator and accessible association.
- `src/content/course.ts` — task coverage validation, leaving catalog values unchanged.
- `src/styles/global.css` — shared prominent task presentation replaces the old badge rules.
- `docs/LESSON_SCHEMA.md` — document the separate mandatory task catalog for new authors.

Removed: obsolete `src/components/exercises/SentenceTypeBadge.tsx`. Its historical `sentenceType` content fields remain intact for compatibility and consistency validation. Pre-existing modified/untracked work and QA evidence were preserved; the file list above is scoped to this request.

## Remaining limits and handoff

The target of understanding within about one second informed prominence and concise labels, but no timed learner study was conducted. A human usability study, physical mobile keyboards and a complete screen-reader/Safari/Firefox audit remain unperformed. This is not a claim to assess arbitrary English paraphrases or to eliminate the need to read essential context. Full instructions are intentionally retained.

No ambiguous classification remains outstanding among the current 480 questions. Future/renamed questions require explicit metadata and regression updates before the production catalog can load. Keep the current question IDs and answer definitions stable; metadata is not persisted in progress.

The detached localhost QA server remains running. External logout/reboot/process cleanup may stop it; `npm run qa` reuses or starts the existing launcher. No server was terminated. The audit and source are included in the release. Generated screenshots and JSON browser evidence under `docs/qa/` remain local and are excluded from the commit.
