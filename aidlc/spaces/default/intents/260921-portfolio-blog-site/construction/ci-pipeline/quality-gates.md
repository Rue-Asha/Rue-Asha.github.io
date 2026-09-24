# Quality Gates

Every gate below is blocking and lives in the `check` job of
`.github/workflows/publish.yml`. The job boundary *is* the gate: `deploy` has
`needs: check`, so a single failing step means nothing is published and the
previously live site keeps serving.

## The gates

| # | Gate | Criteria | Command | Source |
|---|---|---|---|---|
| 1 | The site builds | Exit 0; a complete site written to `dist/` | `npm run check` (check 1) | `team.md` § Testing Posture; `NFR9` |
| 2 | Every content file produced a page | Every non-draft file in `content/` has a corresponding output page; drafts ignored entirely | `npm run check` (check 2) | `team.md` § Testing Posture; `NFR9`, `NFR10` |
| 3 | Internal links resolve | Every internal link resolves across the built output; external links not checked | `npm run check` (check 3) | `team.md` § Testing Posture; `NFR9`, `NFR11` |
| 4 | Unit suite passes | 100% pass rate across every `tests/**/*.test.ts` | `npm test` | `org.md` § Testing Posture; Testing Contract `strategy_volume` |
| 5 | Coverage floor | ≥ 80% line coverage over `src/**` | `npm test`, enforced by `vitest.config.ts` `thresholds.lines: 80` | `org.md` § Testing Posture scope floor; `NFR12` |
| 6 | Types | `tsc --noEmit` clean | `npm run typecheck` | `org.md` § Code Style |
| 7 | Lint | `eslint .` clean | `npm run lint` | `org.md` § Code Style |
| 8 | Formatting | Site code matches Prettier; `content/` excluded | `npm run format:check` | `team.md` § Code Style |

Gates 4 through 8 were added at [Q1] answer A. Gates 1 through 3 were already
enforced by the workflow u1-publishable-site-shell built.

**Why gate 5 is enforced by config rather than by reading a number.** The floor
lives in `vitest.config.ts` as `thresholds.lines: 80`, so the test command
itself exits non-zero below it. Nothing in the pipeline parses a coverage
report, which means nothing can misread one. It also means the floor cannot be
quietly lowered without that change appearing in a diff of a tracked file —
`org.md` is explicit that defined coverage floors "may not be weakened to make
a step pass".

Measured at Build and Test: 96.25% lines (540/561), every file clearing the
floor individually.

## Verification of the content carve-out

Gate 8 runs a formatter on the publish path, and `team.md` § Code Style is
categorical that this must never happen to prose: "An opinion about quote style
must never stop a post going live. That is the ceremony the scope forbids."

Checked rather than assumed, before the gate was added:

- `.prettierignore` line 9 is `content/`, excluding the whole content tree. It
  also excludes `tests/u1/fixtures/` and `tests/u2/fixtures/`, which are
  deliberately malformed content corpora.
- `.prettierrc.json` sets `proseWrap: "preserve"`, so even a file that reached
  the formatter would keep its author-chosen line breaks.
- `npx prettier --check "content/**/*.md"` reports no violations.

A post can therefore fail gates 1, 2 and 3 — which are structural and
correctness gates that `team.md` requires to be blocking — and cannot fail
gate 8.

## What is not gated

Recorded so an absence reads as a decision rather than an oversight.

| Not gated | Why | Decided at |
|---|---|---|
| Anything before a push to `main` | No `pull_request` or branch trigger. A short-lived branch carries no automated feedback until it lands; the local pre-push run covers that window. | [Q2] answer C |
| External links | A dead third-party URL is somebody else's outage. Failing the build on it means this site stops publishing because an unrelated website went down. | `team.md` § Testing Posture |
| Accessibility | The automated scan was offered and declined at practices-discovery [Q3]; the manual keyboard walkthrough was its affirmed substitute and was declined at Build and Test [Q1]. `NFR1` currently has no verification behind it at all. | practices-discovery [Q3]; build-and-test [Q1] |
| Dependency vulnerabilities | `npm audit` reports against the advisory database at the moment it runs, so a clean run proves nothing about tomorrow. That is an argument for alerting, not for a gate — and alerting is off. See below. | [Q3] answer C |
| SAST / DAST | No server, no request handling, no user input, and `script-src 'none'` with no client-side code. Neither scanner has a surface to test. | `construction/build-and-test/security-test-instructions.md` |
| Performance | `NFR5` states the site carries no numeric performance target and none may be introduced without a new decision. | `requirements.md` `NFR5` |

**The branch-feedback gap is real.** With gates 4-8 now running only on `main`,
a branch that breaks the suite is discovered at the moment it lands — and
because the deploy is gated, the consequence is that the site quietly does not
update. `team.md` § Deployment already names this residual: "A failure that
only manifests on the remote is invisible until someone looks." The mitigation
is behavioural and unchanged: after publishing, look at the live site.

## The dependency-alerting divergence

`team.md` § Deployment asks for security-only dependency alerts, "grouped or
monthly, never routine version-bump noise — an ignored bot is worse than no
bot". The repository has none: no `.github/dependabot.yml`, vulnerability
alerts return 404, automated security fixes report `enabled: false`.

[Q3] answer C leaves it that way. That contradicts an affirmed practice, and
an affirmed practice the project does not follow devalues the ones it does, so
[Q4] was asked to settle it. Its answer B chose to amend `team.md` through the
learnings step.

**That amendment was not made.** The learnings ritual at the end of this stage
offered the drafted wording and the author answered "Nothing to add", so
nothing was persisted. The outcome is therefore neither of the two clean ones:

- `team.md` § Deployment still reads "enable **security-only dependency
  alerts**".
- This project does not, and has no plan recorded to.

**The contradiction is open.** It is written here rather than smoothed over,
because the alternative is a record claiming a resolution that did not happen.
Closing it later takes one of three forms: enable the alerts, persist the
amendment through a learnings ritual on a future stage, or state the divergence
as permanently accepted. None of the three has been chosen.

**What the absence costs, stated plainly.** Nothing tells the author that a
dependency has a published vulnerability. There are four runtime dependencies
(`gray-matter`, `js-yaml`, `markdown-it`, `shiki`) and eleven development ones,
all pinned by a committed lockfile, and the site executes no code in a reader's
browser — so an exploited dependency would have to reach the reader through
generated markup rather than through the build. `npm audit` is the only
detection, and it only runs when somebody types it.

## Gate bypass

There is none, and there should not be one. The `deploy` job's `needs: check`
is the whole mechanism, and the only way past a failing gate is to fix the
failure or to change the workflow in a commit. `aidlc-pipeline-deploy-agent`
principle 4 applies: bypassing a gate is an incident, not a shortcut.

The one bypass that exists is upstream of the pipeline — a local `git push`
that skipped the pre-push checks. That is exactly what gates 4-8 now catch.
