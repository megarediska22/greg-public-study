# Greg Public Study

Phase 3: three complete original A1 lessons on the approved Phase 1 design and Phase 2 learning engine. React + TypeScript + Vite, plain CSS, no router or testing dependency.

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

- Three production lessons in order: to be; Present Simple affirmatives/negatives; Present Simple questions with do/does. Each has seven sequential steps and 15 questions (five per exercise type): 21 steps and 45 questions total.
- Multiple choice, fill-in-the-blank and written answers with deterministic grading, configured variants, explanations, retries and preserved mistake history.
- Reading/review steps require acknowledgement; exercise sections require all answers correct; the summary requires an explicit Finish action.
- Completed steps remain accessible for review and cannot lose earned completion through retries.
- Versioned local progress stores completed lessons/steps, answer outcomes and attempts, retry state and last visited lesson/step. Scores are calculated from persisted answer outcomes.
- Malformed-data recovery, visible storage notices and a two-action reset confirmation that preserves the theme.
- Only Lesson 1 is initially available. Finishing its summary unlocks Lesson 2; finishing Lesson 2 unlocks Lesson 3. The final summary and catalog reflect actual completion of the three-lesson course.
- Existing theme storage (`gps.theme.v1`) and pre-render restoration are preserved. Progress uses `gps.progress.v1`. Neither is uploaded.
- Demo progress is revalidated against the full curriculum: compatible readings and answers are retained, but new questions must be solved before later steps or lessons unlock. No broad localStorage reset or schema migration is needed; the separate theme key is untouched. See `docs/LESSON_SCHEMA.md` for the exact policy.
- No authentication, backend, AI grading or new dependencies.

## MVP limitations

- The available course is A1 with these three lessons; A2, B1 and B2 content is not included.
- Progress and theme preferences stay in the current browser and do not sync across devices.
- There is no account system, backend or AI tutor.
- The site has not been deployed.

## Organization

- `src/pages`: home, course and generic lesson composition.
- `src/components/layout`: unchanged shared header/footer and branding.
- `src/components/lessons`: content renderer, navigation and reset confirmation.
- `src/components/exercises`: reusable accessible exercise form.
- `src/types/lesson.ts`: typed lesson, step and question schema.
- `src/content/course.ts` and `src/content/a1/`: ordered catalog and the three typed lessons, separate from UI.
- `src/lib/grading.ts`, `progress.ts`, `validation.ts`: framework-independent engine.
- `src/lib/ProgressContext.tsx`: shared React state and localStorage integration.
- `src/lib/router.ts`: unchanged hash routing with Back/Forward support.
- `src/styles/global.css`: approved theme tokens and responsive components with added learning states.
- `tests/`: dependency-free unit/content tests; the old demo lives only in `tests/fixtures/sampleLesson.ts` for engine and compatibility regression tests.
- `docs/LESSON_SCHEMA.md`: authoring, completion rules and persistence contract.
- `assets/brand`: official project logos. Development-only third-party reference screenshots remain local and are excluded from Git.

## Static hosting / GitHub Pages

Hash routes work without server rewrites, including direct refreshes under repository subpaths. Default Vite base is `./` for portable static assets. To configure an explicit repository path, create `.env.production.local`:

```dotenv
VITE_BASE_PATH=/YOUR_REPOSITORY_NAME/
```

Run `npm run build`; output is `dist/`. A future approved Pages deployment can upload that directory as the Pages artifact. No publishing workflow or remote changes are performed in Phase 3.

For the verified repository subpath, use the same base configuration for the build and preview server:

```sh
VITE_BASE_PATH=/greg-public-study/ npm run build
VITE_BASE_PATH=/greg-public-study/ npm run preview -- --port 4173 --strictPort
```

Open `http://127.0.0.1:4173/greg-public-study/`. Direct hash routes and refreshes work under that path. Running preview with a different base can serve fallback HTML at asset URLs, so keep the values aligned. The `.env.production.local` method above also applies the same value to both commands.

Publishing, remote repository changes, additional lessons/levels and later phases require separate approval.

## Verification

See `PHASE3_REVIEW.md` for the file manifest, question/grammar audit, demo-progress policy, 76 executed tests, subpath production build, complete browser journey and limitations. Browser evidence is in `docs/qa/`. Historical `PHASE1_REVIEW.md` and `PHASE2_REVIEW.md` describe their respective baselines.
