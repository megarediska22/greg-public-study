# A1 expansion review — curriculum v1.1

Date: 2026-11-03 (Europe/Moscow). Status: local implementation complete; publication awaits approval.

## Complete curriculum and exact counts

| Order | Lesson ID | Topic | Steps | Choice | Blank | Written | Total |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | `to-be` | Verb to be — am/is/are | 7 | 5 | 5 | 5 | 15 |
| 2 | `present-simple` | Present Simple — affirmatives and negatives | 7 | 5 | 5 | 5 | 15 |
| 3 | `do-does` | Present Simple — do/does questions | 7 | 5 | 5 | 5 | 15 |
| 4 | `have-has` | Have/has — possession | 7 | 5 | 5 | 5 | 15 |
| 5 | `articles` | A/an/the — basic articles | 7 | 5 | 5 | 5 | 15 |
| 6 | `demonstratives` | This/that/these/those — demonstratives | 7 | 5 | 5 | 5 | 15 |
| 7 | `there-is-are` | There is/there are — describing places | 7 | 5 | 5 | 5 | 15 |
| 8 | `can-cant` | Can/can’t — abilities and possibilities | 7 | 5 | 5 | 5 | 15 |
| 9 | `present-continuous` | Present Continuous — actions happening now | 7 | 5 | 5 | 5 | 15 |
| 10 | `was-were` | Past Simple was/were — introduction to the past | 7 | 5 | 5 | 5 | 15 |
| **Total** | **10 lessons** | | **70** | **50** | **50** | **50** | **150** |

New content: **7 lessons, 49 steps and 105 questions**. Every production lesson has `sample: false`. Every lesson follows introduction → compact theory → choice → blank → written → mistake review → summary.

## Implementation and preservation

The seven new typed content files use the approved optional theory blocks, translated tables, bold formulas and short tips. Gregory and Natasha recur as fictional instructional examples. Content stays separate from React components. No schema extension, second exercise engine, new exercise type or dependency was needed.

The existing catalog now appends the seven new IDs in the requested order. Catalog question totals are calculated from content. Home/course labels show ten lessons and 150 questions, course copy covers the expanded curriculum, and card numbering now uses `padStart(2, '0')` so Lesson 10 is `10`, not `010`. The existing generic summary already derives the next lesson and course completion from the catalog; its code required no change.

An exact comparison against the pre-change course and SHA-256 checks confirmed that the original **three lesson files, their complete data and IDs, lesson schema, grading, progress reducer/loader/context, exercise renderer, summary renderer, CSS, package manifests, logos, reference assets, AGENTS.md and SPEC.md remain unchanged**. The first three catalog entries also remain identical.

The user's requested v1.1 expansion extends the historical three-lesson MVP scope without editing AGENTS.md or SPEC.md. No authentication, backend, hosting workflow, remote repository or GitHub setting was changed. No commit, push or deployment was performed. Pre-existing untracked theory-revision screenshots were left intact.

## Grammar and content audit

All **105 new questions** were individually reviewed for the intended grammar, natural American English, Russian instructions/explanations, answer scope and accepted alternatives. The complete sequence was checked against prerequisites from earlier lessons.

| New lesson | Concepts taught before practice | Audit |
| --- | --- | --- |
| Have/has | Person agreement; do/does with base have; full/contracted negatives; short answers; basic possession vocabulary and regular plurals | 15 reviewed |
| Articles | First mention/any one item versus a known item; a/an by sound; singular countable nouns; familiar-item context supplied in prompts | 15 reviewed |
| Demonstratives | Near/far and singular/plural; is/are agreement; regular plural forms and removal of a/an; inversion and negatives | 15 reviewed |
| There is/are | Singular/plural existence; in/on and room vocabulary; questions/negatives; short answers retaining there | 15 reviewed |
| Can/can’t | Same can for all persons; base verb without to/-s; cannot/can’t and accepted can not spelling; questions without do/does; short answers | 15 reviewed |
| Present Continuous | am/is/are + -ing; ordinary suffix, silent-e removal and the tested run/swim doubling; negatives/inversion; now versus daily routines | 15 reviewed |
| Was/were | Past locations/states, person agreement, yesterday/last night, negatives, questions and short answers; no unintroduced past action-verb test | 15 reviewed |

Written transformations constrain the subject, remaining vocabulary and required operation. Short-answer tasks specify pronoun and polarity. Article and demonstrative questions supply the context needed to distinguish the answer. Accepted answers explicitly list relevant full and contracted forms; short answers also permit omitted commas. Deterministic normalization continues to handle case, whitespace, curly apostrophes and terminal punctuation under the existing rules.

`tests/expansion.test.mjs` contains a separately authored canonical answer and a task-specific incorrect response for **each of the 105 new IDs**, plus checks of every configured alternative through the existing grader. The original 45-question answer audit remains. Some counterexamples are grammatically possible in another context but intentionally fail the stated task, such as changing a known orange back to an indefinite one or omitting the requested do/does construction.

Validation confirms **150 unique question IDs across the course**, seven ordered steps per lesson, three correctly typed exercise sections with five questions each, translated theory examples, nonempty Russian instructions/explanations and valid accepted-answer keys. Existing validation rules were preserved. The first test run caught two new explanations written only in English; both were corrected to Russian before the passing final runs.

## Progress compatibility

No reset or migration was introduced. Storage remains `gps.progress.v1`, with the independent `gps.theme.v1` theme key. The same prerequisite-ordered replay restores existing completion, attempts, retry state and accessible last-visited location.

Automated verification completed the old three-entry catalog, saved its state with a dark theme and last location, and loaded it against the ten-entry catalog. The progress object restored **identically**, with `recovered: false`; the theme was unchanged. Lesson 4 was available, Lesson 5 remained locked, and no new completion was awarded automatically.

Browser verification also loaded a genuinely pre-existing local v1.0 profile on port 4173: all three old lessons remained **7/7**, the catalog showed **3/10**, Lesson 4 was available, and Lessons 5–10 were locked. This profile was not reset or used for the fresh full-course run.

## Executed automated checks

| Check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm test` | **188 passed, 0 failed, 0 skipped**: 77 existing tests + 111 expansion tests |
| `VITE_BASE_PATH=/greg-public-study/ npm run build` | Passed, including a fresh strict TypeScript check; Vite 7.3.7 transformed 59 modules |
| Production JS | 356.21 kB / 98.57 kB gzip (`index-CRBaN5P6.js`) |
| Production CSS | Unchanged 22.98 kB / 5.29 kB gzip (`index-CYlOG7dx.css`) |
| Full ten-lesson reducer/storage progression | Passed, 15/15 and 7/7 per lesson, 70 completed steps total |
| All future lessons locked until explicit summary finish | Passed for every position in the ten-lesson catalog |
| Wrong answer/retry/refresh/history/revisit | Passed for every one of the 21 new exercise sections |
| Old progress and protected-file integrity | Passed |
| `git diff --check` | Passed |

The final tests and build were rerun after shortening the new can/can’t table labels for mobile readability. Existing content tests now assert the exact ten-lesson order and 150 unique IDs, retain the original 45-question audit, and validate all ten lessons. The independent three-entry engine fixture tests remain useful and unchanged.

## Browser verification

Used the available in-app browser and its Playwright controls against the actual production preview. A separate local origin, `http://127.0.0.1:4174/greg-public-study/`, provided fresh learning progress without clearing the older port-4173 profile. No browser storage seeding or grading bypass was used.

Executed:

1. Home displays “Посмотреть 10 уроков”; catalog displays **10 уроков · 150 вопросов** and card numbers **01–10**. A new learner sees only Lesson 1 available.
2. Followed the full UI journey from Lesson 1 through Lesson 10: read each introduction/theory, submitted **all 150 answers**, acknowledged each mistake-review step, and explicitly finished each summary.
3. After Lesson 3, refresh preserved its completion and opened Lesson 4. A direct Lesson 5 route was still blocked. Lesson 3's summary correctly offered the next lesson rather than declaring the expanded course finished.
4. In Lesson 4 submitted incorrect `has` for `I ___ a book`. Next remained disabled. Refresh retained the mistake; Retry focused the radio group; correcting to `have` succeeded. Mistake review retained the incorrect response and explanation. Final result: **15/15, 14 first try, 16 attempts**. Other lessons finished **15/15, 15 first try, 15 attempts**.
5. The tenth lesson reached **7/7** and the final message **“Все уроки курса A1 завершены: 10 из 10.”** Refresh retained completion. No nonexistent next lesson was offered. Reopening completed theory through mobile step navigation preserved 7/7.
6. On **360px**, visually inspected every new theory section and completed every new exercise section. Both themes were used; have/has, can/can’t and was/were received additional checks in both themes. Fixed the can table's cramped long labels by using short can/can’t labels; the full forms remain in the rule below, with no CSS/font changes.
7. On confirmed **1280 × 900**, checked all seven new theory routes in both themes and saved representative full-page desktop screenshots. A browser viewport override initially applied to another active test tab; the affected desktop captures/measurements were discarded and replaced using an active dedicated desktop tab with an explicit `innerWidth === 1280` assertion.
8. Final catalog inspected in light/dark at both **360 × 800** and **1280 × 900**, with all ten cards completed. Final summaries captured in desktop light/dark and mobile dark. Across **59 saved screen measurements**, document width equaled viewport width. The temporary viewport override was reset afterward.
9. Browser warning/error log queries returned **no entries**. Dark theme survived refresh. The old-profile 3/10 compatibility check also passed, as described above.

Evidence is under `docs/qa/a1-expansion/`: new-theory screenshots, final catalog/summary captures, `legacy-progress-3-of-10.png` and `browser-results.json`. The JSON labels per-lesson score captures as `summaryBeforeExplicitFinish`; the separately verified final catalog statuses show all ten completed lessons.

## Files and limitations

Created content: `src/content/a1/haveHas.ts`, `articles.ts`, `demonstratives.ts`, `thereIsAre.ts`, `canCant.ts`, `presentContinuous.ts`, `wasWere.ts`.

Created tests/report/evidence: `tests/expansion.test.mjs`, this report, and files under `docs/qa/a1-expansion/`.

Modified: `src/content/course.ts`, `src/pages/CoursePage.tsx`, `src/pages/HomePage.tsx`, `tests/content.test.mjs`, `docs/LESSON_SCHEMA.md`, `README.md`. Local ignored `dist/` was regenerated. No dependencies or skills were installed.

No known blockers remain within the requested scope. Browser checks cover the available in-app browser and tested viewport sizes, not Safari/Firefox, physical devices or a full screen-reader audit. The grammar/content review was performed during implementation without an external teacher review. The public website and GitHub hosting were not changed; publication still requires approval. Work stops after this local v1.1 implementation.
