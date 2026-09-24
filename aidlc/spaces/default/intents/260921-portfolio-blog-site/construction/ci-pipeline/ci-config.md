# CI Configuration

## What this pipeline is, and what it is not

One workflow, `.github/workflows/publish.yml`. It is both the CI pipeline and
the deployment route: a push to `main` runs the checks and, if they pass,
publishes the site. There is no separate CD pipeline, no environment tiers, no
artifact registry, and no version numbering.

That is a consequence of decisions taken upstream rather than a gap. `team.md`
§ Deployment settles it: "`main` is production. There is no staging." A GitHub
Pages user site publishes one site from one repository, so there is nowhere for
a staging tier to live without inventing infrastructure this initiative has no
reason to carry. The `aidlc-pipeline-deploy-agent` principle that every commit
is a release candidate holds here literally — every commit that passes the
gates is the live site.

The build output is uploaded as a Pages artifact by the deploy job and
discarded afterwards. Nothing is tagged, retained, or promoted, so the artifact
naming, versioning, registry and retention concerns the CI/CD patterns
knowledge covers have no subject on this project.

## Trigger

```yaml
on:
  push:
    branches: [main]
```

A push to `main` is the only thing that runs this workflow, and the only thing
that publishes the site (`FR1.1`, `FR1.2`, `BR7.1`). One path to the live site
means one path to audit.

**No pull-request or branch trigger**, decided at [Q2] answer C. Site code
takes the short-lived-branch path, so a branch carries no automated feedback
until it lands. The local pre-push check set is what covers that window. The
cost is stated plainly in `quality-gates.md` § What is not gated.

`pull_request_target` does not appear and must not be added — control 3 of the
four `team.md` § Deployment requires of any workflow in this repository.

## Jobs

### `check` — build and run every blocking check

Runs on `ubuntu-latest`. Steps in order:

| Step | Command | What it proves |
|---|---|---|
| Check out | `actions/checkout` | — |
| Set up Node | `actions/setup-node`, Node 22, npm cache | Matches `engines.node: ">=22"` |
| Install | `npm ci` | Exactly what the committed lockfile names, and nothing else |
| Three blocking checks | `npm run check` | The site builds; every content file produced a page; internal links resolve |
| Unit suite and coverage floor | `npm test` | 160 tests pass and line coverage clears 80% |
| Type check | `npm run typecheck` | `tsc --noEmit` clean |
| Lint | `npm run lint` | `eslint .` clean |
| Formatting | `npm run format:check` | Site code matches Prettier; `content/` is excluded |
| Configure Pages | `actions/configure-pages` | — |
| Upload | `actions/upload-pages-artifact`, path `dist` | — |

The last four command steps were added at [Q1] answer A. Before that, four of
the seven checks this project treats as blocking had no remote enforcement at
all: a push that skipped the local run could deploy a site whose tests failed.
`team.md` § Deployment anticipated precisely this — "The moment we want any
remote enforcement of the check set — a backstop for a push that skipped the
local checks — publishing must run through a workflow in this repository" — and
this is that backstop.

**Why `format:check` is safe on the publish path.** `team.md` § Code Style is
explicit that an opinion about quote style must never stop a post going live.
It cannot here: `.prettierignore` excludes `content/` outright, and
`.prettierrc.json` sets `proseWrap: "preserve"`. Verified rather than assumed —
see `quality-gates.md` § Verification of the content carve-out.

### `deploy` — publish to Pages

`needs: check`. If any step of `check` fails, this job never runs, nothing is
deployed, and the previously live site keeps serving (`FR1.7`, `BR7.3`,
`BR4.5`). That behaviour is not theoretical: it was exercised deliberately
during Build and Test, and the record is in
`construction/build-and-test/test-results.md` § Rollback rehearsal — check job
failed, deploy job skipped, live page hash unchanged throughout.

## The four mandated controls

`team.md` § Deployment requires exactly four of any workflow in this
repository, and only these four. All hold:

| # | Control | State |
|---|---|---|
| 1 | Permissions declared explicitly: top-level `contents: read`, with `pages: write` / `id-token: write` on the deploy job alone | Holds |
| 2 | Every third-party action pinned to a full commit SHA, never a version tag | Holds — 5 of 5 `uses:` entries, each with its release in a trailing comment |
| 3 | Nothing triggers on `pull_request_target` | Holds |
| 4 | Nothing fetched at build time that is not in the lockfile — no `curl \| sh`, no unpinned installer | Holds — `npm ci` is the only install |

Tags are mutable and have been retargeted to malicious commits in the wild,
which is why control 2 is a SHA rather than a version. Adding a step that uses
a new action means pinning it the same way.

## Concurrency

```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```

Never publish two commits at once, and never cancel a run that is mid-deploy.
An interrupted deploy is the one way this site could end up serving a partial
build, which is the failure mode the whole gate exists to prevent.

## Caching and speed

`actions/setup-node` with `cache: npm` is the only caching. The run completed
in 27-34 seconds before the four steps were added; the unit suite adds about a
second of test time plus its coverage pass. Nothing here needs parallelisation
or a build matrix: one Node version, one deployable, one platform.

## Dependency alerting

Not configured, decided at [Q3] answer C. There is no `.github/dependabot.yml`,
vulnerability alerts are not enabled, and automated security fixes are
disabled. This diverges from `team.md` § Deployment, which asks for
security-only alerts; the divergence and its resolution are recorded in
`quality-gates.md` § The dependency-alerting divergence.

`npm audit` is not a pipeline step. It reports against the advisory database at
the moment it runs, so a clean run proves nothing about tomorrow — which is the
argument for alerting rather than for a gate. Run it manually when dependencies
change; it reported 0 vulnerabilities at Build and Test.

## Changing this pipeline

Two rules, both inherited rather than invented here:

1. A new step that uses a third-party action pins it to a full commit SHA.
2. A new check that is meant to block adds itself to the `check` job, not to
   `deploy`. The gate is the job boundary; a check in `deploy` runs after the
   decision to publish has already been made.
