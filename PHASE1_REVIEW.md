# Phase 1 review

Date: 2026-11-03

## Delivered

- React 19, strict TypeScript, Vite, plain CSS; no routing/UI dependency.
- Branded home page, A1 course overview, three planned lesson cards, upcoming A2–B2 levels.
- Reusable lesson shell and seven preview sections: introduction, theory, choice, blank, sentence, mistake review, summary.
- Shared header, footer, buttons, icons, desktop step sidebar, mobile menu, native collapsible mobile step list.
- Exact light/dark specification tokens, visible theme switch, safe theme persistence, synchronous restoration before first render.
- Semantic controls, labeled inputs, 3px focus outlines, skip link, route focus management, reduced-motion support.
- Hash routing, browser history, configurable Vite base and static-hosting instructions.

The preview remains at zero completed steps. Lessons 2 and 3 are locked. No exercise checking, scores, learning progress storage, or unlocking logic is implemented.

## Created files

```text
.gitignore
index.html
package.json
package-lock.json
tsconfig.json
vite.config.ts
README.md
PHASE1_REVIEW.md
src/main.tsx
src/App.tsx
src/lib/router.ts
src/content/course.ts
src/content/lessonPreview.ts
src/styles/global.css
src/components/Icon.tsx
src/components/LinkButton.tsx
src/components/layout/Header.tsx
src/components/layout/Footer.tsx
src/components/lessons/StepNavigation.tsx
src/components/lessons/LessonContent.tsx
src/components/lessons/ExercisePreview.tsx
src/pages/HomePage.tsx
src/pages/CoursePage.tsx
src/pages/LessonPage.tsx
```

Generated locally: `node_modules/` and `dist/` (ignored).

No pre-existing source files were modified. `AGENTS.md`, `SPEC.md`, the official logo, and all six reference screenshots were left unchanged.

## Executed verification

- `npm install`: succeeded; package audit reported zero vulnerabilities.
- `npm run typecheck`: succeeded.
- `VITE_BASE_PATH=/greg-public-study/ npm run build`: succeeded, including TypeScript. Re-executed after visual/content organization changes, also succeeded.
- Production bundle served with `npm run preview -- --base=/greg-public-study/`.
- Browser: home → A1 → lesson, desktop step navigation, mobile menu, collapsible step list, Next navigation through all seven sections.
- Browser: theme toggle and dark theme restoration after reload; light and dark visual review.
- Browser: 360px home/course/all lesson sections; 640px home; 768px home/lesson; 1280px desktop visual review. No horizontal page overflow detected in those checks.
- Browser: radio selection, text input, disabled checking action; entered sample answer resets on reload as intended.
- Browser: direct lesson route reload under the repository subpath; browser Back navigation.
- Browser: keyboard Tab focus and Enter navigation; focused link had a solid 3px outline.
- Browser console error/warning log query returned no entries.

Two initial browser selectors timed out due to exact accessible-name matching; corrected selectors completed the checks. These were verification selector errors, not application failures.

## Limits and next step

No blocking issues found in the Phase 1 checks. This was a focused browser review, not a full accessibility audit or cross-browser/device test suite. Learning engine automated tests are deferred with that engine to Phase 2.

No commits, remote repository changes, authentication, pushes, or deployment were performed. Await approval before starting Phase 2.
