# A1 theory revision review

Date: 2026-11-03 (Europe/Moscow). Scope: local theory-content and presentation revision only; no commit, push or deployment.

## Changes by lesson

| Lesson | Before | After | Reduction | Presentation |
| --- | ---: | ---: | ---: | --- |
| To be | 486 words | 275 words | 43% | Three-row pronoun table; short blocks for contractions, negatives, inversion and short answers; closing age/article reminder |
| Present Simple statements/negatives | 499 words | 236 words | 53% | Two-row work/works table; compact spelling rules; one negative formula/example; essential vocabulary and a doesn't reminder |
| Present Simple questions | 547 words | 218 words | 60% | Two-row do/does table; word-order formula; short answers; where/what; explicit comparison with to be |

Counts use whitespace-separated tokens across each theory's visible authored fields: heading, introductory explanation, table caption/cells, rule blocks and closing tip. They include English examples and Russian translations. Table column labels and the shared interface are excluded consistently from both versions. The material was shortened by removing repetition; essential content is not collapsed, hidden or made smaller.

All lessons now open with one brief explanation and separate distinct concepts with headings. Important formulas are bold. English examples and Russian translations are grouped on the existing secondary surface. Gregory and Natasha recur occasionally as fictional instructional characters; the examples make no claims about real people. Local reference screenshots informed density and hierarchy only; their wording and design were not copied.

## Schema and component

`LessonStep` retains all existing fields. The theory variant adds only optional `blocks` and table-row `subjectTranslation`. A block contains `title`, `text`, optional `formula`, and an optional paired `example`/`translation`. The renderer uses semantic headings, plain text and `lang="en"` for examples; no HTML parser or dependency was added. Existing lessons without the optional fields still validate and render through the same branch.

CSS changes are scoped to `.theory-content`, using the established theme tokens and typography. Mobile tables use fixed column proportions so “Форма” and the English forms do not get squeezed into individual letters. The body font remains .95rem; table text is .9rem, larger than the old mobile table. All concepts remain visible in normal reading order.

Validation checks optional blocks for unique/nonempty headings, nonempty formulas and paired translations. One new automated test covers malformed blocks and legacy lesson compatibility.

## Educational and scope review

- To be: all pronoun groups and forms; identity/location/feelings; age and a with student/professions; affirmative contractions; negative full/contracted alternatives including she's not; inversion; short answers and the restriction on positive final contractions.
- Present Simple: I/you/we/they base forms, he/she/it and names, -s/-es/-ies, vowel+y, go → goes and do → does, do not/don't and does not/doesn't, and base verbs after doesn't. Practice vocabulary remains available.
- Questions: do/does agreement, word order, base verbs after does, yes/no short answers with both negative variants, you → I when answering about oneself, where/what and to-be questions without do/does.

The sequence was reviewed against all 45 existing exercises and their accepted alternatives. An exact before/after comparison confirmed that every objective and every non-theory step, question, option, accepted answer and exercise explanation remains unchanged. Counts remain **3 lessons, 21 steps, 45 questions**; lesson and step IDs are unchanged.

SHA-256 comparisons confirmed no change to AGENTS.md, SPEC.md, catalog metadata, grading, progress logic/context, homepage, course cards, lesson navigation, header/footer, package manifests, logos or original reference screenshots. A fully completed course generated with the previous content was decoded against the revised content and restored identically with `recovered: false`. No progress reset or migration was introduced.

## Executed verification

| Check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm test` | **77 passed, 0 failed, 0 skipped** (76 existing + 1 schema compatibility test) |
| `VITE_BASE_PATH=/greg-public-study/ npm run build` | Passed, including a fresh strict TypeScript check; 52 modules transformed |
| Final bundle | JS 290.57 kB / 87.03 kB gzip; CSS 22.98 kB / 5.29 kB gzip |
| Previous-content completed progress restoration | Exact match; no reset or recovery notice needed |
| Protected files and non-theory data comparison | Unchanged |

The final tests/build ran after the final wording change to generalize to-be short answers. The final production assets are `dist/assets/index-DYHn54XA.js` and `dist/assets/index-CYlOG7dx.css`. `dist/` is generated local output, not a deployed release.

## Browser inspection

Used the available in-app browser against the local production preview at `http://127.0.0.1:4173/greg-public-study/`. Visually inspected all three theory sections in light and dark themes, at **360 × 800** and **1280 × 900**: **12 combinations**. Tables, formulas, translations and tips were visible and readable; document width equaled viewport width in all 12 measurements. The first mobile table proportions were adjusted after visual review, without reducing text size.

Screenshots and measured widths/heights are saved under `docs/qa/theory-revision/`: `{to-be,present-simple,do-does}-{mobile,desktop}-{light,dark}.png` and `checks.json`. The first lesson's four screenshots were refreshed after the last short-answer wording change. Browser console warning/error queries returned **no entries**. Existing **7/7** completion remained after refreshing the revised theory. The temporary viewport override was reset after testing.

This was a focused visual/content check in one browser, not a new full-course browser run, cross-browser/device matrix, or screen-reader audit. All existing automated course-completion and grammar-key tests passed. No known issues remain within the requested scope. The live website has not been changed by this local revision.

## Files

Modified: `src/content/a1/toBe.ts`, `src/content/a1/presentSimple.ts`, `src/content/a1/doDoes.ts`, `src/types/lesson.ts`, `src/components/lessons/LessonContent.tsx`, `src/styles/global.css`, `src/lib/validation.ts`, `tests/content.test.mjs`, `docs/LESSON_SCHEMA.md`, `README.md`.

Created: this report, the 12 theory screenshots and `docs/qa/theory-revision/checks.json`. Regenerated the ignored production output under `dist/`. No dependencies were installed. Work stops here pending approval of this revision.
