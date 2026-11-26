# PK-01 implementation and QA

Base: develop at `46d8da7`, with Stage 06 integrated. Scope: PK-01 from the approved sequence, lesson specifications, coverage matrix, change list and adaptive contracts.

| Activity | Focus | Questions |
| --- | --- | ---: |
| `bp-pre-01` | Latin letters, visual contrasts and name capitalization | 10 |
| `bp-pre-02` | Printed numbers, age and exact telephone entry | 11 |
| `bp-pre-03` | Greetings, leaving and a first self-introduction | 8 |
| `bp-pre-04` | Requests to repeat and independent printed-data tasks | 10 |
| `bp-a1-01` | Introduction, missing details and word meaning | 12 |
| `to-be` | Two self-introduction profiles, a state question and recognition | 4 |
| `greetings-reactions` | Neutral first contact and a familiar register | 2 |
| `help-and-cafe` | Repeat options, ask about size and order tea | 3 |

51 questions in five lessons, plus nine supplemental questions. The installed catalogue contains 126 lessons, 885 steps and 2,040 questions. The four Pre-A1 lessons form a voluntary route. The core starts with `bp-a1-01` and then `to-be`. The three supplements are independent exercises accessible after review, including for learners who already completed the lesson. They use the ordinary batch checker and store attempts separately from required scores.

The same assembled catalogue supplies rendering, compact replay and QA. All former IDs, question content and keys are retained. The curriculum marker changes to version 3 within `gps.progress.v1`. The decoder preserves the formerly available core through a waiver for the new first prerequisite. Earlier locks and earned attempts are replayed normally. Initial restore is read-only. The existing guarded write stores the old raw bytes before an upgrade. Completing a supplemental step after the summary uses canonical step order and remains stable on reload.

## Adaptive connection

Eight designated observations map to the approved printed Latin and number criteria (K-P-LAT, K-P-NUM) and explicit in-lesson criteria for personal fields (K-P-FORM) and repair (K-A1-SOCIAL). The item revision and key revision are both 1. Each observation names its live question, role, stimulus and family. Wrong attribution is conservative because a miss may reflect spelling, field selection or another concurrent demand. Closely related case-conversion tasks and multiple printed-number decoding examples remain instructional practice instead of independent pairs.

CP-PRE uses the separate letter-discrimination and printed bus-number items on the fourth preparation lesson. The development pilot offers it after the theory and before the normal practice can expose those items. It reports which print skills to revisit, and the learner may enter A1 at any result. A prior ordinary attempt makes the same item ineligible for independent checkpoint evidence. Hint exposure and retries remain neutral. The bank is empty and the release validator requires two complete independent forms. Production keeps the ordinary course route.

## Independent review

- **Pedagogy, GPT-6.1 Sol / High.** Tightened or expanded answer keys in the surname, greeting and café tasks. Removed a pair of quotation variants that normalize identically. Added the second independent self-introduction profile. Revised the repair instructions and reduced evidence mappings where a new name or context alone would not create an independent family.
- **Integration, GPT-6.1 Sol / Medium.** Confirmed that a supplemental step completed after the summary could replay in a different order and trigger a false recovery warning. Canonicalized step completion order and added a regression test, including core completion before elective preparation.

## Verification

- TypeScript and production build passed with the GitHub Pages base path. The verifier found 190 deferred unit/replay chunks and no local QA implementation in production. Vite reported its chunk-size warning for the 684 kB initial JavaScript.
- Full automated suite: 559 passed, zero failures or skips. All 60 new questions checked against an independent answer list, all live question IDs validated, historical answers compared and compact replay verified.
- Generated adaptive catalogue freshness, graph and live-reference validation. The installed sequence equals the ready subset of the 140 planned entries. Diagnostic release validation is intentionally blocked by the absent forms.
- 152 route render checks, covering all 35 new lesson steps and three supplemental steps at 360 and 1280 CSS pixels in light and dark themes. No horizontal overflow. New questions showed two levels of help on request and delayed feedback until checking.
- Isolated browser flow through all five new lessons and `to-be`. Started A1 before Pre-A1, verified empty-field handling, retry after refresh, locked correct answers, review and preserved completion, then returned to A1 after the elective route. Completed the `to-be` supplement after the summary and reloaded without a recovery notice.
- Local CP-PRE exercise in the development pilot. Correct responses alone did not confirm readiness where no earlier eligible evidence was recorded. The completion screen offered review and a direct A1 link. Existing progress fixtures and the isolated in-app browser were used for verification.

## Remaining packets

PK-02 covers early A1 transfer and extensions to the designated earlier lessons. PK-03 adds orientation, event sequences and the A1–A2 bridge. PK-04 adds complete messages, connected reading and its listed corrections. PK-05 adds delayed transfer and end-of-A2 tasks. The diagnostic forms belong to a separate bank task.
