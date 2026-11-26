# Git workflow, backup and release

| Branch | Purpose |
| --- | --- |
| `main` | Approved and tested public release. The Pages environment accepts only this branch. |
| `develop` | Shared integration branch and backup for approved development milestones. |
| `feature/*`, `fix/*`, `docs/*` | Optional task branches for independent work and controlled integration to develop. |

## Start and work in parallel

1. Read [AGENTS.md](AGENTS.md) and [PROJECT_STATUS.md](PROJECT_STATUS.md). Check `git status --short --branch`, `git worktree list` and the intended scope.
2. Use `git ls-remote --heads origin` to inspect remote state without touching local checkout files, then `git fetch origin` to update remote refs when needed. Compare local and remote tips before editing.
3. Coordinate ownership and select a branch. Check whether a suitable existing worktree can be reused safely before creating one. Do not switch, stash or clean another agent's checkout.
4. Keep only the primary checkout at `~/Desktop/Greg Public Study`. Do not create temporary projects, technical folders or additional checkouts on the Desktop. Put every additional Git worktree under `~/Developer/Greg Public Study Worktrees/`. For example, to start an onboarding branch from the fetched baseline:

   ```sh
   mkdir -p "$HOME/Developer/Greg Public Study Worktrees"
   git worktree add -b docs/onboarding "$HOME/Developer/Greg Public Study Worktrees/onboarding" origin/develop
   ```

## Finish a milestone

1. Review status and diff. Run checks relevant to the changes. Update [project status](PROJECT_STATUS.md) when it materially changes.
2. Stage exact approved files and review `git diff --cached` and `git diff --cached --check`. Every public branch can expose its commits. Keep credentials, personal data, local browser state, private research, logs and unlicensed material out of commits.
3. Create a focused commit. Push to the authorized branch, for example `git push -u origin docs/onboarding`. Verify the remote hash with `git ls-remote origin refs/heads/docs/onboarding` and report it. Integrate task branches into develop after review and relevant checks.
4. An explicitly authorized WIP commit may back up incomplete work on its own branch. Mark it WIP and keep it out of stable releases.
5. Review whether the worktree is still needed. Check branch ancestry and remote refs, tracked changes, untracked and ignored files, and use by chats or local processes. Preserve unique commits, unfinished work and local materials. Remove completed worktrees promptly with `git worktree remove` after confirming their work is saved and the directory is idle. Keep copies with ongoing work in the technical directory and review them again when their tasks finish.

Use `git worktree move` to relocate a linked worktree. Coordinate with any chat or server using it, then verify Git registration and report the new path. If Git cannot move it safely, keep the copy intact and report the blocker. Remove temporary verification directories when they are no longer needed and their contents are safe to discard.

## Sync, recover and resolve conflicts

On another computer use [SETUP.md](SETUP.md). Fetch before switching to a shared branch in your own checkout. If clean and behind, fast-forward with `git merge --ff-only origin/develop` while on develop. If history diverges, compare both sides with `git log --left-right --oneline HEAD...origin/develop`. Keep both branches intact and coordinate a reviewed merge in an isolated worktree. Inspect conflicts with `git status`, resolve the intended result, stage only resolved files and rerun relevant checks before committing. If uncertain, abort your own merge in the isolated worktree with `git merge --abort` and report the conflict.

Inspect an old file with `git show <commit>:<path>`. Save a copy under a new name outside the checkout before deciding whether to replace it. Restore a tracked file only after checking for local edits, and record the restoration as a new commit. Undo an already shared change with a reviewed `git revert <commit>` on the agreed branch. Never force-push, rewrite shared history or run destructive clean/reset commands. If a secret enters history, report it without its value, revoke it and agree on remediation with the owner.

Remote Git backs up source and committed documentation. Keep important private material and any needed working copies on a separate access-controlled backup. Browser progress is local and independent of Git.

## Stage 5 handoff

After direction 03 confirms completion, agree on the exact commits and tests. The author should preserve the active checkout and commit only reviewed stage 5 files under a dedicated branch. Fetch the confirmed commits and integrate them into an isolated branch based on current develop, using a normal merge if the branch contains only the agreed work or cherry-picking the approved commits if needed. Review conflicts with direction 03, verify storage migration and compatibility, run the application checks and update status. Push the reviewed integration to develop. Obtain separate authorization for the release.

## Planned release

Identify the tested revision and review the exact diff against main. With owner approval, promote only the agreed changes to main, without rewriting history. A main push triggers Pages. A manual run for an approved stable commit must target main. Verify the Actions conclusion and public site. After verification and with release authorization, create an annotated version tag on the verified commit (`git tag -a <version> <commit> -m "Release <version>"`) and push that tag explicitly. The current Pages workflow has no tag or pull request trigger.
