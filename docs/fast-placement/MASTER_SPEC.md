# Greg Public Study · Fast Adaptive Placement

This document records the original product brief for the fast placement pipeline. Use [PIPELINE_STATUS.md](PIPELINE_STATUS.md) for mutable state and [METHODOLOGY.md](METHODOLOGY.md) for the approved stage 05 contract. Starting develop and public main were both at 097295a0470e0ab3acd24d24e7c08bb6b8af25c8. The baseline has 140 lessons, 1,011 steps, 2,267 course questions and a local-only placement bank of 96 items in two forms.

## Product brief

Reduce fatigue, repetition, typing and the impression of stalled progress. Skipping because of fatigue must never be interpreted as lack of knowledge or automatically move a learner back to the first lesson. Give a useful starting suggestion in a short, dynamic phone and desktop flow. Target 10–15 items and 3–5 active minutes, with an earlier finish when the evidence permits. These are pilot targets.

Use answer or sentence choice, tap-to-fill, tap-to-order word cards and short everyday contexts. Placement requires zero typing. Cards can be added, removed and rearranged before explicit submission with touch and keyboard. Keep correct answers and teaching hints out of the active test. Display one item at a time and a clear indicator of progress. The method recommends an entry lesson for this course. Selected words can supply bounded evidence of ordering or form discrimination. They cannot establish independent written production or certify a CEFR level.

Keep the site's existing visual language, typography, orange accent, themes and course. Support optional entry, resume, skip, early result and exhausted forms. Keep existing progress, stable IDs, completion and access. Only an explicit choice can grant access to an offered placement lesson, one at a time. The system operates on the existing static site architecture without backend, paid APIs or external AI.

## Ownership and gates

Work in existing chats only, sequentially. Each stage starts from the exact integrated develop SHA, changes only its own files, runs appropriate checks, commits and pushes a feature branch, and records a handoff. 01 verifies scope and source, integrates with a fast-forward where possible, pushes develop and verifies the remote SHA before the next stage starts. The coordinator sends messages through the existing chats or records an actionable handoff when that transport is unavailable. Maintain decision history in the status document and handoffs. Allow at most three materially different attempts per blocker, fewer when progress stops. Escalate scope changes, progress-loss risks, unsafe integration or an unresolved blocker to the owner.

1. **05 · Curriculum & Assessment Research** defines the fast method, evidence limits, bank and interface contracts, acceptance and pilot. This stage is documentation.
2. **03 · Learning Engine** implements the bounded diagnostic route and evidence, storage compatibility and regression checks. It publishes the format contract and synthetic fixtures for 04 and 02, with no ordinary curriculum or design changes.
3. **04 · Lessons & QA** adapts the two independent forms, reuses effective stimuli, reviews American English, variants, cues, diversity and item/key revisions. It verifies the real bank against the engine contract.
4. **02 · Foundation & Design** integrates the developer-only UI, cards, entry, progress and result. It verifies 360 and 1280 CSS pixels, both themes, keyboard, reload and learning progress.
5. **01 · GitHub & Deployment** performs the intermediate integrations and the final develop acceptance. Run the full suite, type check, catalog checks, production build and production exclusion verifier. Exercise real diagnostic routes, cards, skip, early result, retake, responsive UI and saved progress in isolated browser storage. Start a local pilot, verify the actual server and URL, and report the commands, paths and SHA.
6. **Owner** personally tests the local pilot after the consolidated report. Public release requires separate approval.

Push permission covers feature branches and develop. Main, Git history, Pages deployment and the published course are protected. Keep unrelated worktree edits, private data and secrets out of every branch. The final report records READY or BLOCKED, the develop SHA, verified main baseline, each stage and handoff, test evidence, route lengths, input and card behavior, uncertainty and saved progress, limitations, and the live local pilot instructions with a short owner acceptance script.
