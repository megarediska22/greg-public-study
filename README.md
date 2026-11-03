# Greg Public Study

Version 1.1: ten complete original A1 lessons on the approved design and existing learning engine. The public website is <https://megarediska22.github.io/greg-public-study/>. React + TypeScript + Vite, plain CSS, no router or testing dependency.

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

- Ten production lessons in order: to be; Present Simple affirmatives/negatives; do/does questions; have/has; articles; demonstratives; there is/are; can/can’t; Present Continuous; was/were. Each has seven sequential steps and 15 questions (five per exercise type): **70 steps and 150 questions total**, including seven new lessons and 105 questions over v1.0. The original three lesson files remain intact.
- Multiple choice, fill-in-the-blank and written answers with deterministic grading, configured variants, explanations, retries and preserved mistake history.
- Reading/review steps require acknowledgement; exercise sections require all answers correct; the summary requires an explicit Finish action.
- Completed steps remain accessible for review and cannot lose earned completion through retries.
- Versioned local progress stores completed lessons/steps, answer outcomes and attempts, retry state and last visited lesson/step. Scores are calculated from persisted answer outcomes.
- Malformed-data recovery, visible storage notices and a two-action reset confirmation that preserves the theme.
- Only Lesson 1 is initially available. Finishing each summary unlocks the next lesson, through Lesson 10. Users who completed the v1.0 course retain those three completions and can start Lesson 4 immediately. No reset or migration is needed. Summaries and catalog totals follow the actual ten-lesson catalog.
- Existing theme storage (`gps.theme.v1`) and pre-render restoration are preserved. Progress uses `gps.progress.v1`. Neither is uploaded.
- Complete light and dark themes are available; the selected theme is stored locally in the browser.
- Demo progress is revalidated against the full curriculum: compatible readings and answers are retained, but new questions must be solved before later steps or lessons unlock. No broad localStorage reset or schema migration is needed; the separate theme key is untouched. See `docs/LESSON_SCHEMA.md` for the exact policy.
- No authentication, backend, AI grading or new dependencies.

## MVP limitations

- The local v1.1 course is A1 with ten lessons; A2, B1 and B2 content is not included.
- Progress and theme preferences stay in the current browser and do not sync across devices.
- There is no account system, backend or AI tutor.
- The production site is static and requires no server-side services.

## Organization

- `src/pages`: home, course and generic lesson composition.
- `src/components/layout`: unchanged shared header/footer and branding.
- `src/components/lessons`: content renderer, navigation and reset confirmation.
- `src/components/exercises`: reusable accessible exercise form.
- `src/types/lesson.ts`: typed lesson, step and question schema.
- `src/content/course.ts` and `src/content/a1/`: ordered catalog and ten typed lessons, separate from UI.
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

See `docs/A1_EXPANSION_REVIEW.md` for the v1.1 curriculum, all 150 questions, preservation of existing progress, 188 passing automated tests, production build and complete ten-lesson browser journey. Earlier reports below describe historical scopes.


See `PHASE3_REVIEW.md` for the file manifest, question/grammar audit, demo-progress policy, 76 executed tests, subpath production build, complete browser journey and limitations. Browser evidence is in `docs/qa/`. Historical `PHASE1_REVIEW.md` and `PHASE2_REVIEW.md` describe their respective baselines.

The subsequent focused theory revision is documented in `docs/THEORY_REVISION_REVIEW.md`: shorter theory for all three lessons, backward-compatible rule blocks, 77 passing tests and visual checks of both themes at 360px and 1280px. Lesson objectives, questions and progress rules are preserved. Published in commit `38e3c02`.
