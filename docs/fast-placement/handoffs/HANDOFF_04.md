# Stage 04 handoff · Fast Placement Bank

Branch `feature/fast-placement-content` starts at integrated develop `c139b8ab63867ace48196ac227e40bb123406484`. Use the Integration 3 develop SHA for the next stage. [Engine contract](HANDOFF_03.md) · [Method](../METHODOLOGY.md) · [Status](../PIPELINE_STATUS.md)

## Bank

The localhost adaptive configuration provides `adaptivePilot.fastBank`, with version `fast-placement-bank-v1`. Forms `fast-live-a` and `fast-live-b` each have 22 slots and 24 items. Together they contain 32 choice items, 6 tap-to-fill items and 10 supported word-card items. Corresponding slots use the same R/S role in both forms. Every mandatory slot and all eight possible clarifiers are authored.

Four existing R items retain their content, stable IDs, family, stimulus and original item/key revisions. Form A uses `diag-a-grocery-after-class` and `diag-a-outside-draft`. Form B uses `diag-b-boat-carry-limit` and `diag-b-same-line-news`. Each reused slot has a separately authored fallback, so prior family or stimulus exposure still allows the upper route. The remaining 44 items start at item and key revision 1. The forms have disjoint source sets. GIST and MEDIATE transfer probes explain reading performance within their respective forms.

ASK cards require choosing the auxiliary and arranging a question. Incorrect sequences in these bounded tasks directly concern that operation. WRITE cards require selecting the relevant fact and request as well as arranging them. A wrong sequence may reflect either step and is marked ambiguous. Form A's map request accepts both “send me the new map” and “send the new map to me.” Repeated “the” cards retain separate instance IDs and can be exchanged where their words match. The authored display order does not contain an accepted key as a subsequence. R and S remain separate from independent P.

## Verified routes

The following presented counts and recommendations were observed against both real forms. These are scripted responses.

| Scenario | Presented | Result |
| --- | ---: | --- |
| Two attributable LAT errors | 2 | Elective `bp-pre-01` |
| Two attributable BE errors | 7 | `to-be` |
| Two attributable ASK errors | 8 | `do-does` |
| Late A1 anchors followed by skips | 8 | `hours-and-signs` |
| All responses neutral | 8 | Insufficient evidence, elective routes remain |
| Conflicting LAT followed by a supporting clarifier | 10 | `unit-042` |
| A2 entry profile, limited upper evidence | 10 | `unit-042` |
| Both constraints and WRITE supported | 10 | `unit-062` |
| Constraint and WRITE repaired by distinct clarifiers | 12 | `unit-062` |

Compatibility tests cover legacy exposure, persisted card draft, retake with fresh material, exhaustion, one explicit grant and no course completion from placement. The existing 15-item cap is verified in the engine suite. The longest observed real-bank acceptance route was 12.

## Checks and next stage

- 55 targeted tests and 645 full tests passed. TypeScript, generated adaptive catalog and the GitHub Pages subpath build passed.
- Course source files and stable identifiers match the baseline. The suite verifies 140 lessons, 1,011 steps and 2,267 questions, and passes the previous diagnostic key regressions.
- The production build excludes the local pilot and bank. Existing page and controller files remain the stage 02 responsibility.
- Stage 02 can use the host's `engine.fast` interface as specified in HANDOFF_03. Its local entry should start the fast route and retain old R/P drafts read-only. Browser, keyboard and responsive verification belong to that interface stage. Compare actual difficulty, fatigue and the 3–5 minute target in the learner pilot.
