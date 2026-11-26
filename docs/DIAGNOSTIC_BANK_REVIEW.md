# A1–A2 diagnostic bank review

The bank runs in the localhost adaptive pilot. The 140 ordinary lessons, 1,011 steps, 2,267 course questions, 13 checkpoints and 54 practice observations retain their previous content and identifiers. The published website keeps the linear route. Base develop commit `da24ed31be62cbdba1eb540461b71f843e5a7cae`.

- Implementation commit `3356d90fce338c5b3b9b0706952cd1872cdf7fa7`
- [Working branch](https://github.com/megarediska22/greg-public-study/tree/feature/diagnostic-bank)

## Inventory and coverage

**96 diagnostic questions in two complete independent forms.** Each form contains 48 slots with one separately versioned item per slot. Each group in each block has one recognition item (R) and one production item (P). Form A has 24 choice, 13 blank and 11 written items. Form B has 24 choice, 10 blank and 14 written items. The bank is versioned as `diagnostic-bank-v1`. Item and key revisions start at 1. Criteria use their existing approved `pilot-v1` versions.

| Block | Knowledge groups | Per form | Across forms |
| --- | --- | ---: | ---: |
| D0 | LAT, NUM | 4 | 8 |
| D0R | LAT | 2 | 4 |
| D1 | BE, ASK, ORIENT, NOTE | 8 | 16 |
| D2-BASE | BE, ASK, ORIENT, NOTE | 8 | 16 |
| D2-UP | NOW, PAST, CONSTRAINT, WRITE | 8 | 16 |
| D3 | NUM, BE, ASK, ORIENT, NOTE, CONSTRAINT, WRITE, GIST, MEDIATE | 18 | 36 |

| Approved group ID | Items across both forms |
| --- | ---: |
| `K-P-LAT`, `K-P-NUM` | 8 each |
| `K-A1-BE`, `K-A1-ASK`, `K-A1-ORIENT`, `K-A1-NOTE` | 12 each |
| `K-A1-NOW`, `K-A1-PAST` | 4 each |
| `K-A2-CONSTRAINT`, `K-A2-WRITE` | 8 each |
| `K-A2-GIST`, `K-A2-MEDIATE` | 4 each |

A session uses a subset of its form. The verified early routes end after 4 or 6 items. Main routes cover 20–28, including D2-BASE or D2-UP, up to three clarification pairs and the optional upper check. A missing or withdrawn pair may end a session earlier and preserve the usable evidence. The 8–12 minute estimate is a pilot hypothesis. The code does not use speed in scoring.

## Independence and retakes

- Each authored item has its own source and family, with a scope set by the approved criterion. An R–P pair uses separate materials. Shared grammar and vocabulary are intentional. The editorial review compares the reasoning paths as well as their metadata, especially where a task could be reproduced by changing only a name or number.
- Choice has one key and three options. There are eight correct answers in each position per form. P uses an input with no selectable answer list. Instructions state whether case, a clock format, a contraction or a fixed phrase matters.
- Only eligible unaided first answers enter the existing evidence rules. Multi-part written tasks with ambiguous error attribution can provide a positive sign. An uncertain negative remains neutral. Skip, “I don’t know,” drafts and previous lesson attempts supply no independent sign. The active screen exposes no key or feedback. The result explains skills and uncertainty.
- The engine pins the form and slot revisions. Resuming restores the next unanswered item. Starting a genuinely new attempt selects the other form once a D0 family is exposed. After two started forms, the bank can run out of fresh entry material even if one session ended early. The course remains available. Additional retakes require additional independent entry materials and verification.
- Only the previously approved `bp-pre-01` LAT skip profile is attached. Explicit acceptance grants one ready lesson. Skips leave completion and earned history unchanged.

## Verified recommendations

| Simulated profile | Result |
| --- | --- |
| Independent errors on both Latin items in D0 | Early exit and optional preparation at `bp-pre-01`, with A1 still available |
| Uncertain Latin after D0R | Preparation option and insufficient evidence |
| Print skills only, or unresolved contradictory ASK answers | Safe first lesson `bp-a1-01` |
| Print entry, be and action questions independently confirmed | `hours-and-signs` |
| Strong A1 and no sufficient A2 pair | `unit-042` |
| Strong results with a specific ASK gap | Targeted `do-does` |
| Sufficient profile, optional upper check declined | `unit-062` |
| Upper profile and both optional pairs confirmed | Final text self-check `bp-a2-07` |
| Previously available lesson, new results insufficient to advance | Existing course resume remains available |

A recommendation, access, actual completion and diagnostic confirmation stay separate. A complete text result does not award a CEFR qualification.

## Independent review and fixes

The pedagogical editor reviewed all 96 items and rechecked corrected items. Changes removed visible be options and answer cues in GIST and service writing. Repeat-like tasks were replaced with different source operations, including a schedule exception, correcting a printed number discrepancy and correcting an inaccurate past report. A be item with negation was replaced by a task inside the approved affirmative slice. Keys and instructions were reconciled for time notation, contractions, and allowed wording. The alternative forms cover the same skills. Actual difficulty and the effect of different amounts of typing still need learner data.

Technical QA independently exercised both real forms with the existing host and verified branch coverage, both versions of a repeat, old-progress retention and late-lesson access. Its targeted suite passed 73 checks at that point. Fault cases covered an empty or disabled bank, missing slots or items, a visible key and reused families. No blocker requiring an engine or UI change was reproduced. The production verifier now checks diagnostic paths, IDs and bank markers in addition to the existing pilot checks.

## Verification

- **587 automated tests passed, zero failures or skips.** Twenty new bank tests validate IDs, families, stimulus metadata, all primary and variant keys, distractors, and the actual fixed letter and clock rules. Both forms ran 13 learner strategies and all nine D3 groups. The checks include an exhausted bank, a withdrawn future pair, a paused cursor, a neutral manual finish, genuine form B retake and exact preservation of prior course bytes before an explicit learning action.
- TypeScript, generated adaptive catalogue and the historical extension verifier passed. Production build for `/greg-public-study/` passed.
- In isolated Chromium, four layout and flow runs covered 360 and 1280 CSS pixels in light and dark. Each run checked 37 render states, including active choice and input, pause, reload, optional upper check, result, retake and bank exhaustion. In those runs, the first form took 24 submissions and the second took six with neutral answers. A fifth run at 360 pixels in dark mode took the first form through a neutral six-item exit and completed the second form in 24 submissions. Across all 185 checked states, no horizontal overflow was detected. The desktop tests also checked the saved course entry.
- The release verifier inspected 193 HTML, JS and CSS files. None had the bank, local pilot entry or QA markers. The production preview showed the ordinary 140-lesson catalogue. The diagnostic URL stayed unavailable even with the local flag. The initial JavaScript remains 847.49 kB minified (223.36 kB gzip estimate), with the existing Vite chunk-size warning. The 190 lesson and replay chunks remain deferred.

## Pilot and handoff

Two agents handled independent review. The main session used GPT-6.2 Sol / High. The pedagogy and technical agents both used GPT-6.1 Sol / High. The engine, UI and course content were preserved.

Before release, use volunteer learners on phones and computers, including learners unsure about Latin print, beginners, uneven skill profiles, and returning users. Measure active time by route, hesitation, misunderstanding of instructions, unexpected valid wording, and recommendation quality against the first proposed learning task. Counterbalance A/B and review difficulty, typing load, missed target answers and unsuitable early or late placement. Compare first placement and retake without treating either as a general English level. Record only anonymous study codes and outcomes. Physical devices and assistive technology were outside the current browser check.

Direction 03 can review observed false negatives, insufficient fresh families and retake coverage after the pilot. Direction 02 can verify focus, reading order, zoom and mobile keyboard behavior with learners using real devices and assistive technology. There is no currently confirmed blocker assigned to either direction. Direction 01 owns integration. Public activation requires pilot evidence and a separate release decision.
