# Foundation & Design final UX handoff to 01

Based on origin/develop at 082e4ce. Branch: feature/adaptive-ux-final.

## Scope

Resolved the two Foundation & Design findings in ADAPTIVE_FINAL_QA.md.

- Duplicate skill names in diagnostic results now include the evidence context (diagnosis or lesson practice) and the existing objective descriptions. Each criterion retains its own result, state, uncertainty and history. The same labels appear under “Что проверяли”. Unique group names keep their short labels.
- The home diagnostic action reads engine entry readiness. An available form offers the first diagnosis or retake. A saved draft offers continuation. After both forms are exhausted, plain text explains that the available variants have been completed and ordinary learning can continue. The primary ordinary learning action retains the saved step.

Changes are confined to the two UI presentations, a label formatter and targeted regression coverage. Diagnostic rules, bank, lessons and design tokens are unchanged.

## Verification

- TypeScript passed.
- Full suite passed: 595 tests, zero failures or skips.
- Production build passed at /greg-public-study/. The pilot and diagnostic bank isolation checks passed. The existing Vite size warning remains.
- Four real-bank browser scenarios passed in isolated Chromium contexts: 360 and 1280px, light and dark. Each finished both forms, checked distinct skill rows, inspected exhaustion after reload, activated the retake and ordinary continuation with the keyboard, and confirmed that the ordinary progress bytes were unchanged before continuing to the saved to-be/theory step. No horizontal overflow or uncaught page errors.
- git diff --check passed.

## Integration

Direction 01 can review and integrate this feature branch into develop through its normal acceptance process. This task performs no merge or deployment. Mobile coverage uses Chromium emulation.
