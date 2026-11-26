# Setup and recovery

Use macOS (Intel or Apple Silicon), Windows 10/11, or Linux (including Arch). Install Git using the operating system package manager or [Git downloads](https://git-scm.com/downloads). On Windows use [Git for Windows](https://gitforwindows.org/) and PowerShell or Git Bash. On macOS, `xcode-select --install` supplies Git. On Arch, install Git with `sudo pacman -S git` and use a Node version manager if the distribution's Node version differs from CI.

Use Node.js **22.18.0** to match the current CI configuration and its bundled npm 10.x. Use official [Node.js downloads](https://nodejs.org/en/download) or an existing version manager that supports your OS. Check `git --version`, `node --version` and `npm --version`. Keep `package-lock.json` tracked and install with `npm ci`. Read access is public. To push, use your authorized GitHub account and an existing SSH or HTTPS credential setup.

## Clone and run

```sh
git clone --branch develop https://github.com/megarediska22/greg-public-study.git
cd greg-public-study
npm ci
npm run dev
```

Open the URL printed by Vite. Read [agent instructions](AGENTS.md) and [project status](PROJECT_STATUS.md) before editing. To verify application changes:

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Build output is in `dist/`. For a local Pages subpath preview, put `VITE_BASE_PATH=/greg-public-study/` in an ignored `.env.production.local` before building and previewing. This works without inline shell variable assignment on Windows. Use `npm run dev` for normal development. The detached QA launcher is optional; its platform support is separate from the core development workflow.

## Move to another computer

Commit and push the authorized branch before leaving a device. Verify the commit hash remotely. On the next device, clone or run `git fetch origin` and check `git status --short --branch`. If the branch is clean and only behind its upstream, use `git merge --ff-only @{upstream}` (quote `'@{upstream}'` in PowerShell). If there is divergence, follow the [conflict procedure](GIT_WORKFLOW.md). After a change to the lockfile, rerun `npm ci`.

After losing a local copy, clone again and check out the last pushed development or task branch. Remote Git backs up pushed commits, including tracked lesson data, tests and documentation. Local edits, ignored files and browser progress are separate. Keep any required private backups in access-controlled storage.

Keep import and filename casing exact. Avoid committing platform files or machine-specific paths. See [Git workflow](GIT_WORKFLOW.md) for committing and pushing.
