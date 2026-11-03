# Localization, progress safety and persistent local QA review

Date: 2026-11-03 (Europe/Moscow). Scope: local maintenance only; no commit, push, deployment or GitHub settings change.

## Localization

Corrected **13 visible Russian references in 9 lesson files**, with grammatical case:

| File | Corrections |
| --- | --- |
| `src/content/a1/toBe.ts` | Two translations: `Я Григорий.` |
| `src/content/a1/presentSimple.ts` | `Григорий работает каждый день.` |
| `src/content/a1/doDoes.ts` | `Где работает Григорий?` |
| `src/content/a1/haveHas.ts` | Three possession references use `У Григория…`, including an exercise instruction |
| `src/content/a1/articles.ts` | `У Григория есть сумка…` |
| `src/content/a1/demonstratives.ts` | Speaker label `Григорий:` |
| `src/content/a1/canCant.ts` | Introduction and question instruction use `Григорий` |
| `src/content/a1/presentContinuous.ts` | `Григорий готовит.` |
| `src/content/a1/wasWere.ts` | `Григорий вчера был в школе.` |

Four occurrences require genitive `Григория`; nine use nominative `Григорий`. English `Gregory`, all question/lesson/step IDs, prompts and accepted English answers are unchanged. Natasha/Наташа and other names are unchanged. An exact before/after content comparison allows only these Russian-name substitutions. The course remains **10 lessons, 70 steps, 150 questions**. Original branding, AGENTS.md, SPEC.md, reference assets, lesson schema, grading and normal lesson progression rules were not changed.

## Audit findings: confirmed behavior versus incident hypotheses

### Confirmed from current code and Git history

- Normal learning uses `gps.progress.v1`, schema version 1. Each lesson stores completed steps and question attempts/retry state; top-level data stores completed lessons and last visited lesson/step. Scores are derived from answers. Theme uses `gps.theme.v1`.
- Git history from initial MVP commit `24cc606` through expansion commit `daa3c3b` shows no change to `src/lib/progress.ts` or the old `ProgressContext.tsx`. Expansion appended seven catalog entries without renaming the first three IDs or changing their questions/keys. The 3→10 expansion itself preserves valid old progress and unlocks Lesson 4, as verified by regression tests.
- The decoder deliberately rebuilds earned progress against the current catalog. Unknown IDs, inaccessible later steps, incompatible versions or malformed data may be excluded from the active result. This guards completion, but does not know how to migrate renamed IDs or undocumented legacy schemas.
- **Real destructive startup risk found:** the old provider always saved its initial decoded state in a mount effect. Thus unsupported/malformed/filtered records could be replaced with the normalized partial/empty result before the learner did anything. There was no copy of the raw original.
- **Real read-failure risk found:** if storage reading threw, loading returned empty memory state; the mount effect still attempted a write. If writing succeeded, it could replace valid data that had never been read. The historical unguarded load→save sequence was reproduced using disposable mock storage, including a valid three-lesson saved state. No real browser data was used for destructive tests.
- The old writer also lacked a stale-snapshot check between tabs. A stale tab could replace a newer state; no live cross-tab synchronization exists. This is a risk in the implementation, not proof it caused the reported incident.
- The root did not use React StrictMode. Repeated initialization with valid unchanged data did not intrinsically reset it, but the old unconditional effect made recovery/read failures destructive. No automatic `localStorage.clear()` or broad `removeItem()` operation exists in the application. The existing Reset Progress action requires inline confirmation.

### What is not confirmed

The cause of the user's actual missing progress is **not established**. This task did not read or modify the user's normal Chrome profile or its localStorage. Available earlier QA records describe in-app-browser runs on loopback origins; they are not evidence that a previous agent deleted Chrome progress. The maintenance browser checks also used only the isolated in-app browser, never Chrome.

Possible causes to distinguish during a user-led inspection include startup recovery/read failure, changed IDs/schema, an explicit reset, another tab, different browser profile/private session, cleared site data, or using a different origin. These are hypotheses for the incident, not findings about the user's browser.

LocalStorage is scoped to scheme + hostname + port: localhost versus 127.0.0.1, different ports, HTTP versus HTTPS or a new custom domain use different stores. Changing only a repository path on the same GitHub Pages origin does **not** create a separate localStorage store. Browser-local progress is not uploaded into the deployed site, so a deploy cannot reconstruct missing personal answers from its static files.

## Backward-compatible persistence fix

Added `src/lib/progressStorage.ts` and switched the normal React provider to its guarded session. The existing key/schema, reducer, grading and prerequisite rules are unchanged.

1. Opening a session reads and validates only. Persisting the same initialized state is a no-op, so mount/repeated initialization does not rewrite stored bytes.
2. A failed initial read leaves that session memory-only, even if later writes would succeed. Existing unread data is never replaced by an empty or visited state.
3. Before writing changed recovered progress, archive the **exact original raw value** under a new `gps.progress.v1.backup.<timestamp>[.<suffix>]` key. Existing backups are not overwritten. If backup creation fails, replacement is blocked.
4. Compare the current main value with the session's expected raw value before saving a change. A detected stale-tab conflict blocks the write and asks the learner to reload.
5. Reject empty replacement of earned progress unless the existing explicit reset flow authorizes it. A confirmed reset also preserves the old raw value in a backup and leaves the theme intact.
6. Storage/backup/conflict failures are visible and leave new changes usable in memory. The low-level legacy load/save helpers remain for compatibility/tests; production startup now uses the guarded session.

This is optimistic write protection, not a transactional multi-tab database: tightly simultaneous cross-tab writes are not automatically merged. Normal sequential use and detected stale sessions are protected. Future ID/schema changes still require a deliberate migration; the backup protects the original evidence rather than guessing ID equivalence or awarding unearned completion.

## Recovery assessment and safe method

No actual lost user record was inspected, so recovery of the reported loss cannot be promised.

- If the valid original `gps.progress.v1` remains on the original origin/profile, normal loading with unchanged IDs restores it. Valid original three-lesson records still load into the ten-lesson course.
- New recovery/reset backups retain their raw value. Tests verified that records from temporarily omitted lessons can be decoded again once the original catalog is restored.
- If an update already replaced data with an empty/partial value **before this fix**, and no old raw value, backup, export or other surviving copy exists, there is no basis to recreate the missing answers. This fix is not retroactive recovery.

For a safe user-led check, open browser DevTools → Application → Local Storage on the **original public origin and browser profile**, then copy/export `gps.progress.v1` and any `gps.progress.v1.backup.*` values to files before further changes. Inspect the schema/version and lesson IDs in an isolated copy. Valid raw data can be checked using `decodeProgress(raw, lessons)` in an offline project script without touching browser storage. Restoring an identified backup into the main key is a separate deliberate operation after reviewing the export; this task does not run such a restore, reset or clear against the user's real profile. Do not assume localhost or the QA store contains public-site progress.

## Development-only QA mechanism

The normal entrypoint dynamically imports `src/dev/qa.tsx` only when **Vite DEV is true**, the hostname is a loopback host, and `?qa=1` is present. The production branch and normal engine do not offer an unlock-all control. The entire QA module tree and CSS are removed from production output; the build now verifies their absence.

QA keys are `gps.qa.progress.v1` and `gps.qa.theme.v1`. The QA provider does not mount the normal progress provider. The theme control receives its independent QA key. The unchanged generic pre-render theme script may read the normal theme value before the QA bootstrap restores the QA theme, but QA interactions never write the normal theme or progress keys.

Synthetic completion flags open every lesson and step while **all 150 questions initially have no answers**. The prominent banner says that completion marks are artificial. Actual test scores, retries and mistakes still run through the existing reducer/grader. QA initialization replays only its isolated test attempts; it never converts synthetic completion into normal saved progress. Clearing one QA lesson removes only its answers/history, returns to its introduction and keeps navigation open. The normal catalog/unlocking behavior is unchanged without QA mode.

### Manual inspection

Current working URL: **http://127.0.0.1:5175/?qa=1#/course/a1**

1. Open that exact URL. Port 5173 was already occupied by an existing production preview; it was left running. A separate Vite **development** server was started on 5175.
2. Use “Открыть урок” to choose any of the ten lessons; it opens the introduction. The catalog and step navigation also work. On mobile expand “Разделы урока”. Theory, every exercise, review and summary are available immediately.
3. Enter answers normally. Give an intentionally incorrect answer to populate mistake review; Retry works normally. Summary scores reflect the QA answers, although completion ticks remain synthetic.
4. To start an individual lesson again, choose it and click **“Очистить ответы этого урока”**. Only that lesson's disposable QA answers and mistakes are cleared; other QA lessons and real learning progress stay intact.
5. Reload retains QA access, test attempts and its selected theme. Test desktop/mobile using browser resizing; both themes are available through the normal theme button.
6. To restart later, run **`npm run qa`** in the project or double-click **`Start Local QA.command`**. The launcher prefers 5173, then 5175/5176, leaves unrelated servers alone and reuses the existing dev server. No browser is opened automatically and no Chrome profile is manipulated.

### Server lifetime

The launcher starts the installed Vite CLI with detached process/session handling, disconnected stdin and file-backed output, then exits. The server continues after the launcher returns, and rerunning `npm run qa` reuses a matching running server. Runtime state and logs stay in the Git-ignored `.local-qa/` directory.

The process is independent of the launcher/terminal; closing that terminal does not send it a stop command. It is intentionally left running at task completion. Closing the actual Codex application/chat was not tested, because that would interrupt delivery; process detachment is verified, not a promise against external process cleanup. Logout, reboot, explicit process termination or a host supervisor stopping it can require a restart with the launcher. No launchd/login service or other OS configuration was installed.

## Verification actually executed

| Check | Result |
| --- | --- |
| Localization across all ten lessons | Passed: 13 corrected references; no inappropriate Russian transliteration remains in educational data |
| Course integrity | Passed: 10 lessons, 70 steps, 150 questions, same order/IDs/English keys |
| `npm run typecheck` | Passed |
| `npm test` | **209 passed, 0 failed, 0 skipped** (188 existing + 21 maintenance tests) |
| Production build with `/greg-public-study/` | Passed; 60 modules; JS 357.82 kB / 99.20 kB gzip; unchanged CSS 22.98 kB / 5.29 kB gzip |
| `npm run verify:production` | Passed: all 3 HTML/JS/CSS outputs lack QA keys, entrypoints, toolbar and controls |
| Production `?qa=1` browser check | Passed: no QA toolbar; direct Lesson 10 summary stayed locked |
| `zsh -n 'Start Local QA.command'` | Passed |
| Detached server/reuse check | Passed; live response and same server reused |

Maintenance tests cover read-only/repeated startup, rejection of accidental empty saves, original 3→10 compatibility and Lesson 4 unlock, reload, appended lessons, unknown/renamed records, exact recovery backups, malformed/unsupported data, read denial, quota/backup failure, stale-tab conflict, explicit reset backup, isolated QA access/retry/reload/restart and unchanged normal storage/theme. The historical failure reproduction uses disposable mock adapters only.

Browser checks used only in-app-browser storage on local origins:

- Normal development mode: submitted one correct answer, refreshed and retained **1/5**, preserving normal sequential locks.
- QA mode: jumped directly to Lesson 10 written practice with **0/5**; submitted an incorrect answer, refreshed, retried correctly and saw the original error in review.
- Cleared only the QA lesson and obtained **0/5** again. Reloaded normal mode and retained its original **1/5**. QA dark theme persisted while normal mode stayed light.
- Opened all ten theory routes at **360 × 800**, alternating light/dark, and confirmed document width **360px** each time. Review and summary were accessible without completing all questions. QA's empty summary showed 0/15 with explicitly artificial completion marks.
- Saved selected mobile screenshots and desktop QA controls; production query-parameter rejection and error logs were checked separately. These are focused maintenance checks, not a new 150-question browser run or a Safari/Firefox/screen-reader audit.

Evidence is in `docs/qa/localization-progress/`. The original profile was not reset, cleared, exported or overwritten by these tests. Browser checks did not use Chrome.

## File manifest

Modified: the nine lesson files listed above; `src/lib/ProgressContext.tsx`, `src/main.tsx`, `src/App.tsx`, `src/components/layout/Header.tsx`, `package.json`, `.gitignore`, `README.md`, `docs/LESSON_SCHEMA.md`.

Created: `src/lib/progressStorage.ts`; `src/dev/qaState.ts`, `src/dev/qa.tsx`, `src/dev/qa.css`; `tests/progress-storage.test.mjs`, `tests/local-qa.test.mjs`; `scripts/start-local-qa.mjs`, `scripts/verify-production.mjs`; `Start Local QA.command`; this report and QA evidence. Ignored `.local-qa/` contains the server log/status and ignored `dist/` was regenerated. Existing untracked screenshots from earlier work were left intact. No dependency or skill was installed.

No known blocker remains for local manual QA. The actual historical user-progress loss and recoverability remain unconfirmed without a surviving record from the original origin/profile. The safety fix and localization corrections are local and are not active on the public deployment until separately approved and published. The development server is left running.
