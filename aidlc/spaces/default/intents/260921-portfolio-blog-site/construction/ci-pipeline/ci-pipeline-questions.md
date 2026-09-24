# CI Pipeline — Questions

**Stage**: ci-pipeline
**Depth**: Standard (target range ~5-8 questions)
**Questions asked**: 3

## Why only three

The stage file's four reference questions are already answered by approved
upstream artifacts, so asking them would be re-opening settled decisions:

| Reference question | What already answers it |
|---|---|
| Which CI tool? | GitHub Actions. `team.md` § Deployment establishes that any remote enforcement must run through a workflow in this repository, because GitHub's built-in Pages build has nowhere to hang a check. `.github/workflows/publish.yml` exists and has been exercised. |
| What branch strategy? | `team.md` § Way of Working — trunk-based, two paths to `main`: short-lived branches for site code, direct commits for content. |
| Which artifact repositories? | None. There is no container registry, no package publication, no versioned artifact. The build output is a static site uploaded as a Pages artifact by the deploy job and discarded after. |
| What quality gates before merge? | Partly settled — `team.md` § Testing Posture fixes the three blocking checks and the 80% coverage floor. What is **not** settled is which of them run remotely, which is Q1 below. |

## What the pipeline does today

`.github/workflows/publish.yml`, built by u1-publishable-site-shell and
verified live during the Build and Test rollback rehearsal:

- Triggers on `push` to `main` only.
- Job `check`: `npm ci`, then `npm run check` — the three blocking site checks.
- Job `deploy`: runs only if `check` succeeded; uploads `dist/` and deploys to
  Pages.
- All four mandated controls hold: top-level `permissions: contents: read` with
  `pages: write` / `id-token: write` on the deploy job alone, all five actions
  pinned to full commit SHAs, no `pull_request_target`, and no build-time fetch
  outside the committed lockfile.

**What it does not run:** `npm test` (the 160-test suite and the 80% coverage
floor), `npm run typecheck`, `npm run lint`, `npm run format:check`. Four of
the seven checks this project treats as blocking have no remote enforcement at
all.

## Q1 — Should the publish workflow enforce the full check set?

`team.md` § Testing Posture makes the three site checks blocking and inherits
an 80% line-coverage floor from `org.md` with "CI execution before merge". The
workflow currently enforces the first three and none of the rest.

`team.md` § Deployment anticipated exactly this: "The moment we want any remote
enforcement of the check set — a backstop for a push that skipped the local
checks — publishing must run through a workflow in this repository." It now
does. The question is whether to use it for the rest of the set.

The cost either way is small: the suite runs in about a second, and the whole
job is currently 27-34 seconds.

- A. Add all four — `npm test` (suite plus the coverage floor), `npm run typecheck`, `npm run lint`, `npm run format:check` — as blocking steps before the deploy job
- B. Add the suite and coverage floor only; leave typecheck, lint and format as local-only concerns
- C. Leave the workflow as it is; the local pre-push run remains the whole of the enforcement
- X. Other (please specify)

[Answer]: A

## Q2 — Should anything run before `main`?

The workflow triggers on `push` to `main` and nothing else. Site code takes the
short-lived-branch path (`team.md` § Way of Working), so a branch can be worked
on with no automated feedback at all until it lands on `main` — at which point
a failure means the site silently does not update.

Adding `pull_request` and/or `push` on other branches would give that feedback
before the merge. It costs nothing and changes no permission: the check job is
already read-only, and the deploy job would stay gated on `main`.

Note that `pull_request_target` is forbidden by `team.md` § Deployment and is
not on offer here; `pull_request` is the safe trigger.

- A. Run the check job on pull requests as well as pushes to `main`
- B. Run the check job on every push to any branch, and on pull requests
- C. Leave it triggering on `main` only
- X. Other (please specify)

[Answer]: C

## Q3 — Dependency alerting

`team.md` § Deployment asks for this directly: "enable **security-only
dependency alerts** (grouped or monthly, never routine version-bump noise — an
ignored bot is worse than no bot)".

It is currently not in place. Checked against the repository: no
`.github/dependabot.yml`, vulnerability alerts return 404 (not enabled), and
automated security fixes report `enabled: false`. This is a gap against an
affirmed practice rather than an open design choice.

`team.md` is also honest about what it buys: with no second reviewer, the same
person who merges the fix would have written it, so the value is *awareness*
that a known vulnerability exists, not safe application of the patch.

Enabling alerts is a repository setting I can change with your GitHub CLI
credentials. The grouping and schedule are configured by a committed
`.github/dependabot.yml`.

- A. Enable vulnerability alerts and commit a security-only, monthly, grouped `dependabot.yml`
- B. Enable vulnerability alerts only; no `dependabot.yml`, no automated pull requests
- C. Leave it off and record the divergence from `team.md` § Deployment with its reason
- X. Other (please specify)

[Answer]: C

## Q4 — Follow-up: settling the Q3 contradiction

Q3's answer C leaves dependency alerting off, which contradicts an affirmed
practice: `team.md` § Deployment states "enable **security-only dependency
alerts**". An affirmed practice the project does not follow devalues the ones
it does, so this is settled here rather than carried forward.

- A. A deferral — `team.md` stands and the gap is recorded as open
- B. Amend `team.md` through the learnings step, with the wording approved first
- C. A permanent divergence — `team.md` keeps the rule, the CI record documents that this project does not follow it
- X. Other (please specify)

[Answer]: B

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
