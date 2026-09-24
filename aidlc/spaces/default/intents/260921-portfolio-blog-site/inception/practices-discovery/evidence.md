# Practices Discovery Evidence

> The integrated record for this stage: what each of the four participants
> inspected or inferred, what the human decided at the interview, and what is
> still open. The lead (`aidlc-pipeline-deploy-agent`) drafted; three support
> agents reviewed the draft independently and blind to each other; the human
> answered twelve questions and confirmed the consolidated summary.

## Sources

Read in full by the lead:

- `aidlc/spaces/default/intents/260921-portfolio-blog-site/aidlc-state.md`
- `aidlc/spaces/default/intents/260921-portfolio-blog-site/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260921-portfolio-blog-site/ideation/scope-definition/scope-document.md`
- `aidlc/spaces/default/intents/260921-portfolio-blog-site/ideation/scope-definition/intent-backlog.md`
- `aidlc/spaces/default/intents/260921-portfolio-blog-site/ideation/rough-mockups/user-flow.md`
- `aidlc/spaces/default/intents/260921-portfolio-blog-site/ideation/rough-mockups/wireframes.md` (targeted read: accessibility bar, screen states, error state)
- `aidlc/spaces/default/intents/260921-portfolio-blog-site/ideation/approval-handoff/initiative-brief.md`
- `aidlc/spaces/default/memory/org.md` — the five practice sections, read as suggested defaults
- `aidlc/spaces/default/memory/team.md` — read and confirmed empty
- `aidlc/spaces/default/memory/project.md` — read; the five practice sections empty, `## Corrections` carries twelve Ideation learnings
- `aidlc/spaces/default/memory/phases/inception.md`
- `.claude/aidlc-common/stages/inception/practices-discovery.md`
- `.claude/scopes/aidlc-feature.md` — for the `skeleton:` and `depth:` fields
- `.claude/knowledge/aidlc-shared/rules-reading.md`
- `.claude/knowledge/aidlc-pipeline-deploy-agent/branching-strategies.md`

Read at integration, in addition to the above:

- `contributions/aidlc-quality-agent.md`
- `contributions/aidlc-developer-agent.md`
- `contributions/aidlc-devsecops-agent.md`
- `practices-discovery-questions.md` — twelve questions, all answered, plus a `Looks correct` confirmation of the consolidated summary

Workspace inspected directly:

- `git log --oneline` — one commit, `dab7edf` ("Initize aidlc workflow")
- `git branch -a` — `main` only, tracking `origin/main`
- `git remote -v` — `git@github.com:Rue-Asha/Rue-Asha.github.io.git`
- `git ls-files` — 301 tracked files, all under `aidlc/` and `.claude/` (devsecops)
- repository root listing — `aidlc/`, `.claude/`, `.gitignore`, `.git`
- `.github/` — absent
- `package.json`, `Gemfile`, `_config.yml`, `.prettierrc*`, `.eslintrc*` — all absent

## What Each Participant Established

**Lead (`aidlc-pipeline-deploy-agent`) — the workspace carries no practice
evidence at all, and that is a finding rather than a gap in the search.**
Brownfield discovery would read git history for branching habits, CI
configuration for gates, and existing test and lint setup for conventions. None
exist here: one commit, one branch, no workflows directory, no build manifest, no
linter configuration, and `aidlc-state.md` records Languages, Frameworks, and
Build System all as `Unknown`. Every practice in `team-practices.md` is therefore
a decision taken at the interview, not an observation of existing behaviour — a
distinction that matters if anyone later reads `team.md` as a description of how
work has been done. The lead also established two things that did not need
inferring: the repository name fixes the deployment shape (a GitHub Pages *user*
site — one published site per account, served from this repository, with nowhere
for a staging tier to live), and the walking-skeleton stance was already settled
by two independent sources (`.claude/scopes/aidlc-feature.md` declares
`skeleton: on`; Scope Definition confirmed the heuristic with the human).

**Quality agent — the draft's testing section carried a contradiction and a hole.**
Its highest-severity finding was that § Testing Posture quoted `org.md`'s "CI
execution before merge" and declared it unweakened while § Way of Working
proposed checks running on `main` after the merge, which `phases/inception.md`
forbids carrying forward; it showed three ways to satisfy before-merge without
inventing a reviewer. It established that the check set was missing the most
likely real failure on a content-driven static site — a build that succeeds while
silently dropping a post — and that neither the build check nor the internal-link
check would catch it, because the Writing list is generated from the same
collection and simply omits the missing post. It measured the proposed
accessibility scan against the four promises of the mandated WCAG rule and found
it verifies roughly one: tab order against rendered geometry and visible focus
indicators are not automatable at all. It established that the `Ordering`
sentence was not self-sufficient (it resolved only by reading a supporting bullet
that `rules-reading.md` §2 tells Code Generation to resolve independently of),
that "satisfied vacuously" claims a passing measurement where there is none, and
that gating the publish on a check set forecloses GitHub's built-in Pages branch
build, which runs no user-defined steps.

**Developer agent — the code-side detail the draft did not carry, plus one
publishing hazard nobody had flagged.** It established that `aidlc/` sits inside
the Pages publish root and would be served publicly under a default Jekyll
configuration (Jekyll processes every path not beginning with `_` or `.`), with
Eleventy at its default input directory going further and rendering every
Markdown file in the tree as a page. It mapped the site's four real error
boundaries and derived the front-matter schema from the approved wireframes,
giving "malformed content" a definition. It established that "linting is advisory
on content, blocking on code" conflates content *structure* with content *prose
style* and, read literally, licenses the silent-skip failure the same draft warns
about. It located "blocking" — with no PR and no reviewer, blocking can only mean
the commit or the publish, and a commit hook is the one a solo author bypasses
with `--no-verify` once and then believes is still running. It identified the one
naming decision with irreversible cost (published URL slugs, unrecoverable on a
platform with no server-side redirects and undetectable with analytics excluded),
and derived a pass/fail stack filter from the mandated no-loading-state rule:
load a page with JavaScript disabled; if content is missing, the rule is broken.

**DevSecOps agent — what is actually worth protecting, and what is not.** It
established that most of a normal security review has nothing to protect here:
no accounts, no sessions, no user input, no database, no server-side code, no
visitor data, no runtime secrets — so auth models, data classification,
encryption policy, rate limiting, WAF, IAM, container scanning, SBOM, and DAST
are all not applicable, and it declined to recommend any of them. Two things are:
the integrity of what the public sees (defacement under a real name linked from
job applications) and what lands permanently in a public repository. It drew the
trust boundary the draft had not — *anything that can push to `main`, and
anything that runs during the build, can change what the public sees* — with
three crossings, of which the account is by far the highest-impact and the
cheapest to close. It established that the publish-mechanism choice is a security
decision, not only a mechanism one (the built-in Pages build runs no code of the
author's; a workflow runs every `uses:` step at whatever a mutable tag points to
today), and named the four proportionate controls if a workflow is used. It
identified secret push protection as the one control worth insisting on, given
that posts about things being learned carry pasted terminal output. It corrected
the rollback claim (`git revert` is complete for site content, not for a leaked
credential — revert leaves the blob reachable, so revoke at the issuer first).
And it established that GitHub Pages gives no control over HTTP response headers,
so the only available form of the no-third-party control is a
`<meta http-equiv="Content-Security-Policy">` tag — which does work, and turns
the mandated no-tracking rule from something enforced by memory into something
enforced by the browser.

## Interview Decisions

Twelve questions, all answered, followed by `Looks correct` on the consolidated
summary.

| Q | Area | Decision |
|---|---|---|
| Q1 | Way of Working | Site code, layout, and build configuration go on a short-lived branch the author merges; posts and project write-ups commit straight to `main` |
| Q2 | Walking Skeleton | The AI-DLC workspace stays in the repository, is excluded from the built website, and "nothing I did not intend to publish is reachable" becomes part of what the first piece of work must prove |
| Q3 | Testing Posture | Three checks: the site builds; every content file produced a page; no dead links between own pages. The automated accessibility scan was offered and **not** chosen |
| Q4 | Testing Posture | Any failed check stops the post going live until it is fixed |
| Q5 | Testing Posture | WCAG 2.1 AA keyboard and landmark behaviour verified by a keyboard walkthrough of each page type — once when its layout is built, again after the visual styling is applied |
| Q6 | Deployment | The author finds out about publishing problems by checking the live site. No automatic notification |
| Q7 | Deployment | One deliberate break-and-undo rehearsed as part of the first piece of work |
| Q8 | Code Style | A formatter runs automatically on save and the build checks it; site code only, never post text |
| Q9 | Security | The GitHub account already has a second factor |
| Q10 | Security | Secret push protection on now, and the cancel-at-the-issuer-first rule recorded |
| Q11 | Deployment | Nothing third-party at page load; fonts and assets copied into the repository, enforced by a content-security policy in the page head |
| Q12 | Contradiction follow-up | Keep the blocking from Q4, and run the checks on the author's machine **before** the push, so a failure is in front of them at the moment they would have pushed |

**Q12 resolved a real contradiction rather than deferring it.** Q4 (everything
blocks) plus Q6 (no signal) plus the mandated "commit and it appears" rule would
have produced exactly the silent publish failure the user flow and the initiative
brief each carried as a risk: a post with a dead link never appears and nothing
says so. The chosen resolution moves the enforcement point rather than softening
it — the blocking from Q4 stands in full, and no notification was added. This
also closes the before-merge / after-merge contradiction the quality review
flagged: checks now run before the change reaches `main` on both paths, which is
what `org.md`'s "CI execution before merge" requires, without inventing a
reviewer who does not exist. And it dissolves the devsecops objection that wiring
quality checks as publish gates recreates the invisible-blocked-publish failure —
a check that fires before the push cannot silently hold back a post, because the
post was never pushed.

**What the interview did not close.** Two support objections were resolved by the
author choosing differently than the reviewer recommended, and both are recorded
as costs rather than as settled arguments: the accessibility scan (Q3) and the
absence of a publish-failure signal (Q6). Both are carried below and in
`team-practices.md`.

## Security — What Was Established and What Closed It

The Step 2 evidence table had no security row at all, which is why the interview
as originally drafted would not have asked the two highest-impact questions. The
devsecops review supplied them and the interview closed them.

| Unknown | Closed by | Outcome |
|---|---|---|
| Is the account that can publish protected by more than a password? | Q9 | Yes — a second factor is already in place. This is the site's entire access control and the only realistic defacement path; recorded in `team-practices.md` § Deployment as a trust-boundary fact, not as a task |
| Is anything preventing a credential from reaching a public, permanent repository? | Q10 | Secret push protection switched on now, and the revoke-at-the-issuer-first rule recorded as a Mandated constraint |
| Does the site load anything from a third party while a reader is viewing it? | Q11 | Nothing third-party. Fonts and assets vendored into the repository; a content-security policy in the page head enforces it. This converts the existing no-tracking prohibition from memory-enforced to browser-enforced |
| Does the whole decision record get served as a public website? | Q2 | Excluded from the build output by generator configuration, with a pass/fail acceptance criterion in the walking skeleton |

Not applicable here, with the reason, so nobody later records them as unmet
controls: DAST (no request handling to test — the live-URL smoke check is the
correct substitute), SAST (no server-side code, no user input; becomes relevant
only if hand-written client-side JavaScript reads from the URL and writes into
the DOM), clickjacking protection (an attack on state-changing actions, of which
a read-only site has none), and HTTP security headers (not settable on GitHub
Pages at all).

## Assumptions & Open Questions

- [open] **Pre-push checks have a known erosion path.** The Q12 resolution puts
  the enforcement point on the author's machine. Whether that is a git hook, a
  command the author runs, or a remote backstop is a Construction decision, and
  it should be made knowing this: a solo author learns `--no-verify` exactly once
  and from then on believes a dead hook is still running. A hook that is bypassed
  is worse than no hook, because it is still on the org chart. The honest options
  are a hook the author accepts will occasionally be bypassed, an explicit
  command with no illusion of enforcement, or a remote workflow as a backstop —
  and the third requires the publishing route that can run one (see the next
  item).
- [open] **The publish mechanism is now constrained, and the constraint is
  one-directional.** GitHub's built-in Pages branch build runs no user-defined
  steps, so it can enforce nothing beyond "the generator ran". It remains viable
  — and is the smallest attack surface — as long as the check set runs only
  pre-push. Any remote enforcement requires a workflow in this repository, with
  the four controls named in `team-practices.md` § Deployment. Construction
  chooses; it does not get to claim a gate the chosen route cannot provide.
- [open] **The 80% line-coverage floor has no determined scope of application**,
  because no stack is chosen and it is unknown whether the site will contain
  hand-written executable code at all. The floor is inherited from `org.md` by
  scope and is not this stage's to lower. Its applicability is determined **per
  unit at Build and Test** and recorded there — either the measured figure
  against the floor, or an explicit `N/A — no instrumentable lines in this unit`
  with the reason written down. Zero instrumentable lines produces no
  measurement, not a pass; the Step 2 draft's "satisfied vacuously" wording was
  wrong and has been replaced.
- [open] **The WCAG 2.1 AA bar now has no automated verification.** Q3 declined
  the automated accessibility scan. The manual keyboard walkthrough (Q5) covers
  tab order and visible focus, which no scanner can check anyway, but nothing now
  checks landmark structure, heading order, one `h1` per page, image alt text,
  link names, or colour contrast. Colour contrast is the notable loss: it cannot
  fire until the visual direction lands at PU-5, and with no scan it becomes a
  design-review and walkthrough responsibility or nobody's. A regression in any
  of these is invisible until a reader hits it. Recorded as the author's explicit
  choice with its cost, not as something to relitigate.
- [open] **The publish-failure signal remains manual by choice.** Q6: the author
  checks the live site; there is no email, badge, or notification. Pre-push
  checking removes most of what would otherwise go unnoticed, but a failure that
  only manifests on the remote — a remote build that fails where the local one
  did not, a Pages configuration change, a push that skipped the local checks —
  leaves the site quietly on its old version with nothing saying so. Carried as a
  named residual risk in `team-practices.md` § Deployment rather than resolved.
- [open] **The Way of Working split is drawn on file kind, and a mixed commit is
  the case it handles least gracefully.** The developer review argued for
  splitting by blast radius instead ("can this break a page other than the one I
  am editing?"), which absorbs the common case of a post plus the small layout
  tweak it needs. That axis was offered as option D at Q1 and the author chose
  option B. The practice therefore reads the split literally: a commit that
  touches site code takes the branch path. If that friction shows up in practice —
  most likely on a cosmetic one-page tweak that ships with a post — it is a
  candidate for a later correction, not something this stage reopens.
- [open] **External link rot is unchecked.** Internal links are a blocking check;
  external links are deliberately not on the publish path, because a flaky gate
  trains the author to ignore red. The quality review's scheduled weekly external
  check was not adopted in this version. The Projects list and the project rail
  carry outbound repository links, and a dead one is seen by exactly the audience
  the site exists for.
- [assumption] Every practice in `team-practices.md` is a decision taken at this
  interview rather than a confirmation of observed behaviour, because the
  workspace contains no code, no CI configuration, and a single commit. They
  become this team's practices by decision.
- [assumption] `git revert` plus a push is the complete rollback for site content
  on the grounds that a static site has no database, no migrations, and no state
  outside the repository. That holds for a site built from files in this
  repository and would stop holding if a later decision introduced state outside
  it; nothing in scope does. It is explicitly *not* the rollback for a leaked
  credential, and Q7 requires it be rehearsed once rather than assumed.
- [assumption] The front-matter schema recorded in `team-practices.md` § Testing
  Posture is derived from the approved wireframes rather than stated directly by
  the author. It gives the "every content file produced a page" check a pass/fail
  criterion; if a field on it turns out to be something the author resents typing
  every time, that is a cheap correction now and an expensive workaround later.
- [assumption] The three-check set is stated stack-neutrally and assumes this
  site's failure modes are build-and-content failures rather than logic failures.
  That follows from it being a static content site, but no stack decision
  confirms it, and a stack with meaningful client-side behaviour would change the
  answer — while also failing the JavaScript-disabled filter derived from the
  mandated no-loading-state rule.
