# Online Beta · Foundation & Design handoff

Source engine branch feature/online-beta-engine at 049030b0ab110915c3f0a0a1c8553586d1cfc23a.
UI branch feature/online-beta-ui contains only the landing presentation, two scoped style rules and regression checks.

## Presentation

The Beta build uses the supplied __ONLINE_BETA__ flag. The first screen retains the established heading, typography, palette and buttons. The existing small pill includes “Beta”. Immediately below the heading, a first-time visitor sees “Подобрать учебный старт” linking to #/diagnostic and “Начать обучение без диагностики” linking to the normal catalogue.

The exact notice is shown next to the actions:

> Экспериментальная версия. Диагностика помогает подобрать подходящий урок, но не является официальным определением уровня английского

For a returning learner, “Продолжить обучение” is the first primary action and links to the saved step. Diagnosis is secondary. Existing resume, incompatible-draft and exhausted-form states retain their readiness logic. The ordinary non-Beta home uses its previous presentation.

## Verification

- TypeScript passed.
- Full suite passed: 653 tests, zero failures or skips. The new rendering regression checks Beta copy, voluntary choices and the priority of saved continuation.
- Both the Stable subpath build and build:beta passed, including their respective artifact and storage-marker isolation guards. Existing Vite size warnings remain.
- The built Beta preview was opened directly at /greg-public-study/beta/ without query parameters, at 360 and 1280px in light and dark themes.
- Browser checks cover first-screen action visibility, exact notice, focus and keyboard activation of the diagnostic link, the existing “Начать диагностику” button, zero typing on its first task, starting ordinary A1 without creating a diagnostic session, and returning to the saved theory step after refresh.
- No engine, bank, storage, lesson or deployment files changed. The tests use disposable Chromium profiles.

## Direction 01

Review the UI commit on top of the confirmed engine SHA, then pin the complete immutable Beta source in the deployment work. The output remains dist-beta with base /greg-public-study/beta/ as supplied by 03. Direction 01 owns the combined Pages artifact, online acceptance and publication. Browser widths were emulated in Chromium.
