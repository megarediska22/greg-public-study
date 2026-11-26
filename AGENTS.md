# Greg Public Study — Agent Instructions

Greg Public Study is a free American English course for Russian-speaking learners. Read [PROJECT_STATUS.md](PROJECT_STATUS.md) and the relevant sections of [SPEC.md](SPEC.md) before work. The specification governs product and technical behavior.

## Architecture and quality

- Use React, TypeScript and Vite. Keep lesson data separate from rendering and keep dependencies small.
- Preserve stable lesson, step and question IDs and existing browser progress. Review compatibility and recovery before changing storage or migrations. Keep QA storage isolated.
- Support mobile and desktop layouts, light and dark themes, and static GitHub Pages with hash routing. Use approved project assets. Do not copy BAD School branding or proprietary content.
- Work only on the assigned phase. Run checks appropriate to the diff and report actual results. For application changes, use the type check, tests and production build described in [SETUP.md](SETUP.md).

## Responsibilities

- 00 Project Manager coordinates scope, approvals and handoffs.
- 01 GitHub & Deployment owns repository workflow, backups and authorized releases.
- 02 Foundation & Design owns the interface, responsive layout and design.
- 03 Learning Engine owns grading, adaptation, state and progress compatibility.
- 04 Lessons & QA owns lesson authoring and learning-flow verification.
- 05 Curriculum & Assessment Research owns curriculum and assessment methodology.

## Git and parallel work

- Check branch, status and remote state before starting. Coordinate file ownership and preserve other agents' edits. Use a separate worktree for concurrent changes.
- Start development from current `develop`. Keep public `main` stable. Use task branches when useful and stage explicit paths after reviewing changes.
- At each completed milestone, run relevant checks, update status when it materially changes, commit and push to the authorized development branch. Verify the remote hash and report it. An authorized, clearly labeled WIP commit on its own branch may back up incomplete work.
- Treat this repository as public on every branch. Exclude secrets, local browser data, private research, temporary files and materials without redistribution rights.
- Obtain owner authorization before remote changes or publication. Never force-push, rewrite shared history, run destructive recovery commands or automatically merge to `main`. See [GIT_WORKFLOW.md](GIT_WORKFLOW.md).
- Use subagents only when authorized for the specific task. Do not initiate GitHub authentication without approval or install unrelated tools. If the same operation fails twice for the same reason, report the blocker.

## Communication

Write to the user in Russian. Keep identifiers and technical documentation in English and website interface text in Russian.
