# Phase 3 review — Complete A1 Lessons & Quality Assurance

Date: 2026-11-03 (Europe/Moscow). Scope: Phase 3 only.

## Delivered curriculum

The production catalog now contains three original, complete A1 lessons. All use the existing `Lesson`/`Question` contracts, `sample: false`, the Phase 2 exercise engine, deterministic grading and progress rules. The approved layout, CSS, transparent logos and original reference assets are preserved.

| Order | Lesson ID | Topic | Steps | Choice | Blank | Written | Questions |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | `to-be` | Pronouns, am/is/are, identity/location/age/feelings, negatives, contractions, inversion and short answers | 7 | 5 | 5 | 5 | 15 |
| 2 | `present-simple` | Routines, base forms, third-person -s/-es/-ies, do not/don't, does not/doesn't and base verb after doesn't | 7 | 5 | 5 | 5 | 15 |
| 3 | `do-does` | Do/does, word order, base forms after does, yes/no questions, short answers, where/what and comparison with to be | 7 | 5 | 5 | 5 | 15 |
| **Total** | **3 lessons** | | **21** | **15** | **15** | **15** | **45** |

Each lesson has exactly this order: introduction → theory → choice → blank → written → mistake review → summary. Theory includes Russian explanations, translated examples, a reference table, vocabulary support and common mistakes before practice. Summaries show saved results and lesson objectives; the third lesson explicitly finishes the three-lesson course rather than announcing another lesson.

## Complete file manifest

Created:

- `src/content/a1/toBe.ts` — full first lesson.
- `src/content/a1/presentSimple.ts` — full second lesson.
- `src/content/a1/doDoes.ts` — full third lesson.
- `tests/content.test.mjs` — 51 new structural, answer-key, variant, recovery and full-course tests.
- `tests/fixtures/sampleLesson.ts` — former Phase 2 sample moved to a test-only fixture; only its type-import path changed.
- `docs/qa/phase3-mobile-summary.png` — full-page final lesson summary at 360 × 800 viewport, light theme.
- `docs/qa/phase3-course-complete.png` — full-page completed catalog at the default 1053px desktop viewport, light theme, captured again after the final build.
- `PHASE3_REVIEW.md` — this report.

Modified:

- `src/content/course.ts` — connects all three lessons in the existing prerequisite order; first objective now describes the taught location content; explicit `.ts` imports allow catalog testing with Node's existing TypeScript support.
- `src/lib/validation.ts` — production seven-step/type order, minimum five questions per exercise, course-wide question-ID uniqueness, required explanations/translations/placeholders and distinct normalized alternatives.
- `src/lib/ProgressContext.tsx` — recovery notice describes current-curriculum revalidation without incorrectly labeling every content update as data corruption.
- `src/components/lessons/LessonContent.tsx` — theory paragraphs, unique table row keys when pronouns repeat, objective recap and correct final-course summary text. Scores still come from the same progress engine.
- `src/pages/HomePage.tsx` — A1 availability label now describes the complete course.
- `src/pages/CoursePage.tsx` — replaces the demo notice with curriculum totals and real course completion; removes obsolete Phase 3 pending copy; completed course invites review.
- `src/pages/LessonPage.tsx` — removes obsolete demo-only wording from the missing-content fallback.
- `tests/grading.test.mjs` — updates only the fixture import; all original tests retained.
- `tests/progress.test.mjs` — updates only the fixture import; all original tests retained.
- `docs/LESSON_SCHEMA.md` — production contract, validation rules, demo compatibility policy and authoring guidance.
- `README.md` — current scope, file organization, verification and aligned GitHub Pages build/preview instructions.

Removed from production source: `src/content/sampleLesson.ts` (moved to the test fixture above).

Generated build output in ignored `dist/`: `index.html`, `assets/index-CFwgnxme.js`, `assets/index-8LDRa9Xl.css`, `assets/Greg Public Study Logo-_87Tmq3c.png`, `assets/greg-public-study-logo-light-VqVH8rNI.png`.

No changes to `AGENTS.md`, `SPEC.md`, `src/types/lesson.ts`, grading/progress engine logic, package manifests, dependencies, theme implementation, CSS or original assets. This workspace has no `.git` directory, so a Git diff/status is unavailable; this manifest records the local edits performed. No commits, authentication, remote repository operations, pushes or deployment were performed.

## Content and grammar audit

All 45 questions were individually reviewed during authoring for grammar, natural American English, Russian meaning/instructions, constrained answer scope, answer alternatives, explanation usefulness and prerequisite coverage. No translation exercise requires unrestricted paraphrasing. Transformations keep the supplied subject and vocabulary; short answers explicitly specify polarity and pronoun.

| Section | Audit focus | Result |
| --- | --- | --- |
| Lesson 1 choice | am/is/are with I/he/they/you/it; identity, location, age and weather | 5 checked |
| Lesson 1 blank | Correct negative forms for I/she/we/he/they; explicit constraints for contractions | 5 checked |
| Lesson 1 written | Inversion, negative sentences, all relevant full/contracted forms, positive short-answer restriction | 5 checked |
| Lesson 2 choice | -s, -es, consonant+y → -ies, retaining y in play → plays, go → goes | 5 checked |
| Lesson 2 blank | do/does agreement, base verb after doesn't, base form with we | 5 checked |
| Lesson 2 written | Negative transformations, base verb restoration and full/contracted variants | 5 checked |
| Lesson 3 choice | Do/does agreement with you/she/they/he/we | 5 checked |
| Lesson 3 blank | Base like, short answers, where + does word order, to-be distinction | 5 checked |
| Lesson 3 written | Question formation, removal of -es/-ies, positive/negative short answers | 5 checked |

For every question, `tests/content.test.mjs` supplies a separately specified canonical answer and a concrete incorrect grammatical form. Every configured accepted alternative is exercised through the existing grader. Text alternatives also test uppercase, repeated/outer whitespace, curly apostrophes, and optional terminal punctuation for written answers. Missing commas in the authored short-answer tasks are explicitly accepted; meaningful internal punctuation is otherwise preserved by the existing engine.

Theory and examples were checked for vocabulary and concept coverage before their exercises. Grammar tests verify authored expectations; they are not an independent linguist's certification or unrestricted language assessment.

## Demo progress compatibility

No one-time destructive reset or new storage schema was necessary. The unchanged schema-v1 loader replays earned progress against current questions in prerequisite order.

- Stable catalog and step IDs are retained. Original questions keep `choose-am`, `negative-blank` and `ready-question` with the same meaning and accepted forms.
- Loading a fully completed Phase 2 demo retains the compatible introduction/theory acknowledgements and the solved `choose-am` answer. The other four choice questions remain unsolved, so choice completion, later steps and demo lesson completion cannot survive as production completion.
- Later demo answers are not replayed while their prerequisite exercise is incomplete. Production practice, review and summary must be completed to unlock Lesson 2.
- The normalized state saves back to the same `gps.progress.v1` key and loads idempotently thereafter. Full production completion survives the same replay unchanged.
- Progress recovery never clears unrelated storage or changes `gps.theme.v1`. A regression test preserves the dark-theme value through demo recovery and the following storage round trip.

The UI explains current-program revalidation and the need to complete new/unfinished questions. This policy preserves compatible records rather than clearing the entire user's learning data. Details are also documented in `docs/LESSON_SCHEMA.md`.

## Executed automated checks

| Command / check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed (`tsc --noEmit`, strict TypeScript) |
| `npm test` | **76 passed, 0 failed, 0 skipped**: original 25 + 51 new |
| `VITE_BASE_PATH=/greg-public-study/ npm run build` | Passed; includes a fresh TypeScript check; Vite 7.3.7 transformed 52 modules |
| Production output | JS 295.49 kB / 87.82 kB gzip; CSS 21.88 kB / 5.10 kB gzip |
| Content validation | 3 production A1 lessons; 21 ordered steps; 45 unique question IDs; 9 sections with 5 questions each; all configured answer keys valid |
| Production progress simulation | All 3 lessons complete in order, each 15/15 and 7/7; storage replay and review preserve completion |
| Demo recovery regression | Demo cannot complete the production first lesson or unlock Lesson 2; compatible partial results and theme preserved |

The final tests/build were rerun after the last catalog objective and completed-course notice changes. No test packages or dependencies were installed.

## Executed browser verification

Tested the actual production build at `http://127.0.0.1:4173/greg-public-study/`, served by `VITE_BASE_PATH=/greg-public-study/ npm run preview -- --port 4173 --strictPort`. Browser testing used the available Codex in-app browser and its Playwright controls. Python Playwright is not installed, so the skill's Python path was unavailable; no installation was necessary.

Executed through real UI controls:

1. Fresh local test state: home → A1 catalog → Lesson 1 intro. Only Lesson 1 initially available; Lessons 2 and 3 locked.
2. Read introduction/theory and submitted an incorrect `is` for `I ___ ready`. Next stayed disabled. Refresh restored the incorrect answer and attempt count.
3. Retry returned focus to the radio group. Keyboard Space/Enter submitted `am`; both attempts remained in history.
4. Answered **all 45 production questions** through the existing forms, across all nine exercise sections. No progress seeding or grading bypass was used.
5. Tested contractions with curly apostrophes, uppercase/repeated whitespace and written punctuation variants. All were accepted as configured.
6. Lesson 1 review displayed the incorrect `is` answer with explanation. Summary showed **15/15, 14 first try, 16 attempts**. Explicit finish awarded **7/7** and survived refresh.
7. Lesson 2 unlocked only after Lesson 1. A direct Lesson 3 route was still blocked. Lesson 2 completed with **15/15, 15 first try, 15 attempts**, then opened Lesson 3.
8. Lesson 3 completed with **15/15, 15 first try, 15 attempts**. Its final summary correctly showed **3/3 course lessons completed**, with no nonexistent next lesson. Refresh retained completion.
9. Catalog displayed all three lessons completed. Returning home offered Continue Learning. Reopening completed theory retained **7/7**; review did not downgrade completion.
10. Light and dark themes rendered correctly; dark theme survived refresh. Loaded logo width was 2172 pixels in both themes.
11. At **360 CSS pixels**, checked mobile step disclosure/navigation, mobile header menu, Lesson 1 blank/written exercises, Lesson 2 and 3 theory tables, Lesson 3 choice, final summary and catalog. Measured document width was **360px** on these checked screens, with no horizontal overflow. Both themes were used on mobile. Default desktop width was 1053px and also had no overflow.
12. Browser warning/error log queries returned **no entries**. Two final screenshots are saved under `docs/qa/`. Temporary viewport override was reset after mobile testing.
13. After the final small UI/copy changes, reloaded the rebuilt catalog, verified **3/3**, the completed-course review message, loaded logo and zero console warnings/errors; recaptured the desktop evidence.

Verification corrections during work: the first TypeScript check caught unescaped apostrophes in authored content strings; data strings were corrected and subsequent checks passed. The first preview was launched without the matching base environment and returned fallback HTML for subpath assets; restarting preview with the build's base fixed it, and README documents the requirement. A pointer activation immediately after resetting the test viewport did not navigate; a fresh DOM check and keyboard activation succeeded. These were diagnosed individually, with no repeated unresolved operation failure.

## Limitations and stop point

No known blockers remain for the requested Phase 3 scope. Browser checks cover one available browser at the tested desktop/mobile sizes; they are not a Safari/Firefox matrix, real-device test, screen-reader audit or complete WCAG conformance assessment. Browser storage denial/corruption/quota and demo recovery are covered by automated storage-adapter tests, not a live user-profile corruption exercise. Educational review was performed during implementation, without an external teacher review. Production static files were verified locally under the GitHub Pages path; no public hosting/deployment was attempted.

Phase 3 is complete. No additional phase, content level, backend, authentication, AI grading, repository change or deployment has been started.
