# Online Beta · Learning Engine handoff

Source develop `c8a99ae1d03e8a3ed51653f700d14a3a0cfc4ba0`. Work branch `feature/online-beta-engine`.

## Build contract

| Edition | Command | Output | Vite base |
| --- | --- | --- | --- |
| Stable | `VITE_BASE_PATH=/greg-public-study/ npm run build` | `dist/` | `/greg-public-study/` |
| Online Beta | `npm run build:beta` | `dist-beta/` | `/greg-public-study/beta/` |

The Beta build fixes its own base and leaves the Stable artifact separate. A CI packaging job can copy `dist-beta/` into the `beta/` directory of a combined Pages artifact. Vite sets the compile-time constant `__ONLINE_BETA__` in mode `beta`. The Beta entry opens the adaptive host and Fast Placement on its own URL without a query parameter. The normal build excludes both banks and the adaptive pilot. The localhost QA harness and old R/P diagnostic entry are disabled in Beta. A build-time projection keeps reviewed Fast Placement items and their original lineage without bundling the full R/P bank. Checkpoint and ordinary course recommendations still use their existing evidence.

The Beta link, public copy and deployment workflow belong to the following stages.

## Local storage contract

| Record | Physical Beta key |
| --- | --- |
| Ordinary course progress | `gps.beta.progress.v1` |
| Progress backup | `gps.beta.progress.v1.backup.<timestamp>[.<suffix>]` |
| Adaptive state, including Fast Placement | `gps.beta.adaptive.v1` |
| Adaptive recovery | `gps.beta.adaptive.v1.recovery.latest` or `gps.beta.adaptive.v1.recovery.<timestamp>[.<suffix>]` |
| Theme, including early HTML restoration | `gps.beta.theme.v1` |

Beta opens a fresh profile for users with only Stable or localhost QA data. Reads, writes and backup lookups use physical Beta keys. The three main keys are also the Web Lock names for their write streams. The guarded stores compare the expected snapshot and verify Beta writes. A browser without Web Locks still performs optimistic snapshot checks. Two-key reset remains sequential, with a stale adaptive preflight before the progress write and confirmation for the adaptive write. A write failure between the two commits can leave a partial Beta reset, with scoped backups and the existing error feedback. Reset preserves the Beta theme.

## Verified

On Node 22.18.0, four targeted regressions and all 652 tests passed. TypeScript, catalogue checks, both production builds and their artifact exclusion checks passed. The same-origin Chromium test exercised early theme restoration with React blocked, Beta bootstrap both with and without query parameters, Fast Placement resume, per-key locks, stale tabs, reset, exact-byte recovery and Stable untouched in both directions. It observed no Stable or QA access by Beta during those operations. Reproduce with both builds and `python3 scripts/test-online-beta.py` using the existing Python Playwright environment. The Vite size warning remains. Real Pages deployment and the Beta navigation link were outside this stage.
