# Local verification of the 121-lesson course

Branch `codex/curriculum-100-pilot`. The original 21 lessons, five approved pilots and 95 newly integrated units give **121 lessons, 847 steps and 1,980 questions**. The continuation follows the [approved program](curriculum-100.md), including ten checkpoints. Each of the 95 units adds five choice questions, five blanks and five controlled written responses.

| Check | Observed result |
| --- | --- |
| Curriculum script and final catalog validator | 100 continuation topics in order, 95 complete new source files (#27–121), 1,425 new questions |
| Independent content review | All 95 decisions accepted. SHA-256 checksums in the [ten batch reviews](qa/extension/) match the final source files. The reviews cover answers, distractors, explanations, variants and checkpoint tasks. |
| TypeScript | Passed |
| Full automated suite | 497 passed, 0 failed, 0 skipped. Includes all accepted answers, duplicate tasks, journey through #121, wrong attempts, recovery, refresh and protected historical fixtures. |
| Production build at `/greg-public-study/` | Passed. 193 emitted HTML, CSS and JavaScript files checked for development QA markers. All 190 extension content and replay modules stayed outside the initial JavaScript graph. |
| Isolated Chromium browser | 25 checks passed, 0 page errors. Representative lessons in both themes at 360 and 1280 CSS pixels, deep links, retries, preserved local saves, full QA selector and final lesson access. Detailed browser JSON and screenshots remain local QA artifacts and are excluded from the release. |

The production network check fetched zero rich extension lessons on the home and historical routes. A returning learner who had finished the first 26 fetched exactly #27 on opening it. Local progress regression fixtures include the old partial and completed saves and a completed 121-lesson save. The serialized first 26 lesson definitions match the fixed pre-expansion hash.

GPT-6.1 Sol (Medium) authored and integrated the new units, and GPT-6.2 Sol (Medium) independently reviewed the content. GPT-6.2 Astra (Extra High) coordinated and accepted the work. Structural checks ran as scripts. The original curriculum and methodology were reused.

The initial JavaScript is 632,743 bytes before compression and still triggers Vite’s size warning. The historical course and framework remain in the initial bundle. Responsive checks used virtual viewports in desktop Chromium. The public deployment was outside this local verification and is reported separately.
