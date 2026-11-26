# Stage 05 verification

## Baseline and final checks

The starting revision was `645018fcb5b6bb7c18adbe2170a25282807a90e8` on `main`. The initial Git inventory recorded 66 tracked/untracked status entries, including the separate exercise presentation edits. Stage 05 preserved those changes. Baseline TypeScript and the GitHub Pages subpath build succeeded and all 503 baseline tests passed.

| Final check | Observed result |
| --- | --- |
| `npm test` | 554 passed, 0 failed, 0 skipped. The new suites contain 37 domain/integration cases and 14 storage cases. |
| `npm run typecheck` | Passed. |
| `VITE_BASE_PATH=/greg-public-study/ npm run build` | Passed. The verifier checked 195 HTML/JS/CSS assets for development QA and confirmed 190 deferred lesson/replay chunks. The disabled pilot and test-only fixture bank were absent from production JavaScript. |
| Catalogue regeneration check and `git diff --check` | Passed. The derived source contains 38 groups, 159 objectives, 140 ordered entries and 13 checkpoints. |
| Isolated production Chromium | Four scenarios passed, with zero page errors. Both themes were checked at 360 and 1280 CSS pixels. Each verified the 121-lesson catalogue, locked late route, existing first lesson, two levels of hints, batch correction feedback persisted after refresh, and no adaptive storage writes. |

The domain test file cites [S01–S26](../assessment/ACCEPTANCE_SCENARIOS.md) and uses small, synthetic test material. It checks early stop, contradiction, upper refusal, the 28-slot budget, incomplete coverage, pause/resume, fresh retake material, addressed gaps, one-item grants, no automatic completion of skipped content, both readiness bridges, old route replay with optional grants, key withdrawal, and dismissal. The storage suite verifies exact-byte recovery, duplicate operations, protected snapshots, simulated races, quota failures, and idempotence.

## Independent review and corrections

The storage work was performed by `gpt-6.1-sol / high`. The assigned snapshot, legacy projection, tests and migration contract were delivered after targeted verification. Independent QA by `gpt-6.2-sol / medium` inspected the requirements and code, reproduced the late placement defect, checked all 121 catalogue mappings, and ran 26 targeted storage/batch tests. The reviewer returned findings without changing sources. The primary agent used `gpt-6.2-sol` and corrected the verified findings before the final run.

The corrected issues were NOW/PAST incorrectly taking placement priority, incomplete validation of pinned slots on resume, the displayed count dropping on pause, family/stimulus identity collisions, stale in-memory hints after reset, and valid issued grants becoming hidden on a bank error. A temporary TypeScript inference error was corrected. Regression tests exercise these paths.

## Release scope

The core is ready for the interface and content teams. Foundation & Design must connect the pilot host, verified legacy entitlements and grants, storage notices, voluntary entry, resume, and checkpoint UI. Lessons & QA must supply reviewed banks, authorised item metadata and explicit checkpoint criteria. Branch thresholds require pilot calibration. Browser coverage concerns the existing production route in desktop Chromium with virtual viewports. Web Locks serialize cooperating engine writers when supported. On platforms without Web Locks the safe persistence checks are optimistic and cannot provide atomic cross-tab compare-and-swap.

No remote deployment or push took place.
