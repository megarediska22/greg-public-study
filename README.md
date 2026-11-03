# Greg Public Study

Greg Public Study provides **21 A1 lessons / 147 steps / 480 questions**, including the preserved 16-lesson foundation and five conversational units. The public website is <https://megarediska22.github.io/greg-public-study/>. React + TypeScript + Vite, plain CSS, no router or testing dependency.

## Local development

Use Node.js 22.18+ or 24+ and npm. Tests use Node's built-in TypeScript stripping and test runner; no test packages are installed.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run preview
```

## Scope

- Integrated course: **21 lessons, 147 steps, 480 questions**. The 16-lesson foundation keeps all 330 questions; five practical vocabulary lessons append 50 expressions and 150 questions. Ten grammar lessons remain, with a non-gating pronunciation/practice block added to demonstratives. See `docs/EXERCISE_CLARITY_REGRESSION_REVIEW.md` for the exercise-intent audit and verification details.
- Multiple choice, fill-in-the-blank and written answers with deterministic grading, configured variants, explanations, retries and preserved mistake history.
- Reading/review steps require acknowledgement; exercise sections require all answers correct; the summary requires an explicit Finish action.
- Completed steps remain accessible for review and cannot lose earned completion through retries.
- Versioned local progress stores completed lessons/steps, answer outcomes and attempts, retry state and last visited lesson/step. Scores are calculated from persisted answer outcomes.
- Malformed-data recovery, visible storage notices and a two-action reset confirmation that preserves the theme.
- New learners follow all 21 lessons sequentially. The five practical units append after the existing 16-entry prefix; this addition needs no new migration. Existing grammar completion, attempts and the previously unlocked grammar frontier are preserved through a validated read-only migration. New vocabulary is never automatically completed; it must be backfilled before progressing beyond that retained frontier. Storage keys remain unchanged, with exact raw backups before the first migrated write.
- Existing theme storage (`gps.theme.v1`) and pre-render restoration are preserved. Progress uses `gps.progress.v1`. Neither is uploaded.
- Complete light and dark themes are available; the selected theme is stored locally in the browser.
- Demo progress is revalidated against the full curriculum: compatible readings and answers are retained, but new questions must be solved before later steps or lessons unlock. A validated migration retains compatible progress; the separate theme key is untouched. See `docs/LESSON_SCHEMA.md` for the exact policy.
- No authentication, backend, AI grading or new dependencies.

## MVP limitations

- The integrated course is A1 with twenty-one lessons; A2, B1 and B2 content is not included.
- Progress and theme preferences stay in the current browser and do not sync across devices.
- There is no account system, backend or AI tutor.
- The production site is static and requires no server-side services.

## Organization

- `src/pages`: home, course and generic lesson composition.
- `src/components/layout`: unchanged shared header/footer and branding.
- `src/components/lessons`: content renderer, navigation and reset confirmation.
- `src/components/exercises`: reusable accessible exercise form.
- `src/types/lesson.ts`: typed lesson, step and question schema.
- `src/content/course.ts`, `src/content/a1/`, `src/content/vocabulary/` and `src/content/practical/`: integrated catalog, ten grammar lessons and eleven vocabulary/practical lessons, separate from UI.
- `src/lib/grading.ts`, `progress.ts`, `validation.ts`: framework-independent engine.
- `src/lib/ProgressContext.tsx`: shared React state and localStorage integration.
- `src/lib/router.ts`: unchanged hash routing with Back/Forward support.
- `src/styles/global.css`: approved theme tokens and responsive components with added learning states.
- `tests/`: dependency-free unit/content tests; the old demo lives only in `tests/fixtures/sampleLesson.ts` for engine and compatibility regression tests.
- `docs/LESSON_SCHEMA.md`: authoring, completion rules and persistence contract.
- `assets/brand`: official project logos. Development-only third-party reference screenshots remain local and are excluded from Git.

## GitHub Pages

The repository workflow at `.github/workflows/deploy.yml` runs on pushes to `main` and can also be started manually. It installs dependencies, runs type checks and tests, builds with the repository base path, and publishes only `dist/` to GitHub Pages. Hash routes work under the repository subpath without server rewrites.

The public URL is <https://megarediska22.github.io/greg-public-study/>.

The default Vite base remains `./` for portable static builds. To override it for a local production build, create `.env.production.local`:

```dotenv
VITE_BASE_PATH=/YOUR_REPOSITORY_NAME/
```

Run `npm run build`; output is `dist/`. The deployment workflow passes the same repository path directly as `VITE_BASE_PATH`.

For the verified repository subpath, use the same base configuration for the build and preview server:

```sh
VITE_BASE_PATH=/greg-public-study/ npm run build
VITE_BASE_PATH=/greg-public-study/ npm run preview -- --port 4173 --strictPort
```

Open `http://127.0.0.1:4173/greg-public-study/`. Direct hash routes and refreshes work under that path. Running preview with a different base can serve fallback HTML at asset URLs, so keep the values aligned. The `.env.production.local` method above also applies the same value to both commands.

Additional lessons/levels and later phases require separate approval.

## Verification

The current vocabulary expansion, 304 passing tests and browser verification are documented in `docs/VOCABULARY_EXPANSION_REVIEW.md`.

The earlier v1.1 localization/persistence maintenance is documented in `docs/LOCALIZATION_PROGRESS_REVIEW.md`: correct Russian Григорий/Григория translations, guarded startup persistence with raw-data backups, 209 passing tests and an isolated development-only QA mode.

See `docs/A1_EXPANSION_REVIEW.md` for the v1.1 curriculum, all 150 questions, preservation of existing progress, 188 passing automated tests, production build and complete ten-lesson browser journey. Earlier reports below describe historical scopes.


See `PHASE3_REVIEW.md` for the file manifest, question/grammar audit, demo-progress policy, 76 executed tests, subpath production build, complete browser journey and limitations. Browser evidence is in `docs/qa/`. Historical `PHASE1_REVIEW.md` and `PHASE2_REVIEW.md` describe their respective baselines.

The subsequent focused theory revision is documented in `docs/THEORY_REVISION_REVIEW.md`: shorter theory for all three lessons, backward-compatible rule blocks, 77 passing tests and visual checks of both themes at 360px and 1280px. Lesson objectives, questions and progress rules are preserved. Published in commit `38e3c02`.

## Persistent local QA

```sh
npm run qa
```

Alternatively double-click `Start Local QA.command`. The launcher starts the installed Vite **development** server as a detached process with output in ignored `.local-qa/vite.log`. It reuses its running dev server on subsequent launches. Ports already occupied by another server are left untouched: it prefers 5173, then 5175/5176. Use the exact URL printed by the launcher. During the practical expansion check it is `http://127.0.0.1:5173/?qa=1#/course/a1`; the earlier 5175 server was no longer running.

All twenty-one lessons and seven steps per lesson are open immediately. Use the toolbar's lesson selector, the catalog or the step navigation (expand it on mobile). Questions are unanswered and feedback works normally. To repeat a lesson from scratch, click “Очистить ответы этого урока”; this clears only that lesson's QA answers/history and opens its introduction. Completion ticks are synthetic access flags, not earned results. Give an intentionally incorrect answer to populate mistake review. The QA data and theme survive refresh in separate keys and never replace normal learning progress.

The launcher exits while the detached server continues running; closing its terminal does not issue a stop command. Restart after logout/reboot or external process termination with the same command/launcher. No system startup service is installed. Production builds ignore `?qa=1`; `npm run verify:production` checks the built files for QA code/keys.

## Release verification

The final exercise clarity review and per-question audit are documented in `docs/EXERCISE_CLARITY_REGRESSION_REVIEW.md` and `docs/EXERCISE_CLARITY_QUESTION_AUDIT.csv`. Research notes and local QA evidence are not part of the release.
