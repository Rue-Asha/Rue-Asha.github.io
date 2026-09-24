# Team Practices — Personal Portfolio & Blog Site

> These are the affirmed practices for this project, settled at the
> practices-discovery interview on 2026-09-23. "We" means Rue Asha, the only
> participant (`ideation/approval-handoff/initiative-brief.md` § Team Plan).
>
> The five sections below are promoted into
> `aidlc/spaces/default/memory/team.md`. Where a section departs from the
> `aidlc/spaces/default/memory/org.md` default, it says so and says why: this
> project has one person, one environment, and a publishing act that must be
> nothing more than committing a file.

## Way of Working

We use **trunk-based development**. `main` is the only branch that matters, and
nothing lives outside it for long.

**Two paths to `main`, split by what is being changed.**

| Kind of change | Path to `main` |
|---|---|
| Site code, layout, styling, build configuration | Short-lived branch, merged by the author, squash-merged to `main` |
| Content — a new post, a new project write-up, a typo fix | Committed straight to `main` and pushed |

This is a specialisation of trunk-based development, not a contradiction of it:
both paths land on `main`, and neither creates a long-lived branch. Content goes
direct because the approved scope requires that writing a post is "write a file,
commit it, and it appears; no further steps"
(`ideation/scope-definition/scope-document.md` § Minimum Viable Scope) — routing
a post through a branch and a merge adds exactly the ceremony that requirement
exists to forbid.

A commit that touches site code takes the branch path, even if it also carries
content. The split is by what the commit contains, not by what the author
intended it to be about.

**Checks run before the change reaches `main`, and they run on the author's
machine before the push.** This is the whole of how we satisfy `org.md`'s
"CI execution before merge" requirement, which we do not weaken. With one person
there is no reviewer and no pull request; what "before merge" actually buys is
that a broken change is in front of the author at the moment they would have
pushed it, rather than discovered on a live site afterwards. Running the check
set locally before the push delivers that directly, for both paths above.

**Content commits are exempt from branching, not from checking.** The direct-to-
`main` content path meets the same check set as the branch path — build, every
content file produced a page, internal links resolve — before the push. Writing
this down explicitly because the table above implies otherwise by omission, and a
content path that meets no check at all is the failure this practice exists to
prevent.

**During AI-DLC Construction, code work runs in worktrees**, which are branches
by construction: base `main`, target `main`, squash merge. Each Bolt becomes one
commit on `main`, named by the Bolt slug, with the full Bolt history preserved on
the source branch until the worktree is discarded. That regime is settled and
unaffected by the split above; the direct-to-`main` content path is what the
author uses afterwards, living with the site.

**"1-2 days" from `org.md` is a throughput expectation, not a rule we hold
ourselves to.** Nothing in this initiative is tied to a date
(`ideation/scope-definition/scope-document.md` § Sequencing). We keep the intent
of short-lived branches — land it or drop it, do not let it rot — without
adopting a duration we have no commitment behind.

## Walking Skeleton

We build the **walking skeleton first**. The active scope file
`.claude/scopes/aidlc-feature.md` declares `skeleton: on`, and Scope Definition
independently confirmed the same heuristic.

The skeleton is **PU-1 — the publishable site shell**, deliberately first because
publishing to a live GitHub Pages URL is the part most likely to behave
unexpectedly and the part everything else depends on.

**What "done" means for the skeleton.** All six, each pass/fail:

1. The site is live at its real public URL, with one post page and one project
   page.
2. A file committed to the repository becomes a live page with no further action
   by the author.
3. **Nothing the author did not intend to publish is reachable on the site.** The
   AI-DLC workspace and tooling directories are excluded from the build output,
   not merely ignored by the author. Acceptance: against the live URL,
   `GET /aidlc/` and `GET /aidlc/spaces/default/memory/project.md` both return
   404. This repository is the Pages publish root as well as the AI-DLC
   workspace, and several generators would otherwise serve or render that whole
   tree as pages under a real name.
4. **The undo path has been exercised once, deliberately.** Break the site on
   purpose, revert the commit, push, and confirm the live site returns to its
   previous state. A rollback nobody has ever run is a rollback we are guessing
   about.
5. The 404 page exists at the site root, carries the global shell, and is served
   by GitHub Pages for unmatched paths — `GET /definitely-not-a-page` returns
   our 404, not the platform's default.
6. The content-security policy (§ Deployment) is in place and the site works with
   it. A policy that is too tight breaks things for readers silently, so it
   belongs here, where the author is already checking the live URL, rather than
   bolted on later.

**Tooling lands in the skeleton Bolt, not "with the stack".** Formatter config,
linter config, and the first formatting run belong in PU-1, so that PU-2 through
PU-6 are written formatted from the first line. Retrofitting later produces one
enormous reformatting commit that buries the change that actually mattered.

Bolt 1 is solo and gated: we approve it explicitly before the remaining Bolts
run. After it ships, the framework asks how the remaining Bolts should run, and
that choice is recorded as `Construction Autonomy Mode`. No preference has been
stated in advance.

## Testing Posture

- **Methodology**: test-after
- **Ordering**: Implement the page, template, or function first; then, before that change is treated as done and before it is pushed, write and run its checks — the automated site checks (the build succeeds, every content file produced a page, internal links resolve) for a page or template, unit tests for a function, and a keyboard walkthrough for a page type whose layout or styling changed — and require them all to pass.

Supporting notes, which specialise the two fields above without replacing them.

**The affirmed check set is three checks, all blocking.**

| # | Check | When | Blocking |
|---|---|---|---|
| 1 | The site builds | On the author's machine, before the push | Yes |
| 2 | Every content file produced an output page | On the author's machine, before the push | Yes |
| 3 | Internal links resolve across the built output | On the author's machine, before the push | Yes |

Any failed check stops the change going live until it is fixed. Check 2 is the
one that catches this site's most likely real failure: a build that succeeds
while silently dropping a post — malformed front matter, an unparseable date, a
file in the wrong place. A generator that quietly omits such a file breaks the
project's only mandated publishing rule while reporting green, and neither of the
other two checks would see it.

**Checks run before the push, on the author's machine.** This resolves a real
contradiction rather than papering over it. Blocking checks that run after the
push would mean a post with a dead link never appears and nothing says so — the
silent publish failure the user flow and the initiative brief both carried as a
risk, arriving through a different door. Running them before the push puts the
failure in front of the author at the moment they would have pushed, which keeps
the blocking and removes the silence. It is also how we meet `org.md`'s
before-merge requirement (§ Way of Working).

**External links are never build-blocking.** A dead third-party URL is somebody
else's outage, and failing the build on it means this site stops publishing
because an unrelated website went down. Internal links are a defect in this
repository and block; external links are not checked on the publish path at all.
A scheduled weekly external-link check was recommended in review and is not part
of this version — the Projects list and the project rail do carry outbound repo
links, so it stays on the table as a later addition, never as a gate.

**"Malformed content" has a definition, so check 2 has a pass/fail criterion.**

| File kind | Required fields | Optional, with a stated behaviour when absent |
|---|---|---|
| Post | title, one-line summary, date | — |
| Project | name, one-line summary, year, type, tools, repo | live URL — the rail row is **omitted**, not rendered empty (`ideation/rough-mockups/wireframes.md` § Project) |

A missing required field is a build failure that names the file and the field. A
missing optional field takes the documented omit behaviour, silently and by
design. The build must fail loudly on malformed content rather than skip the
file — this is a stack-selection criterion, not a preference, and PU-1 should
prove it by committing a deliberately broken post and confirming the build fails
while the previously live site stays up.

**Accessibility: the automated scan was offered and declined.** Question 3 of the
interview offered a check set including an automated accessibility scan against
the WCAG 2.1 AA bar; the author chose the set without it. That is a deliberate
choice and it is recorded here with what it costs:

- The WCAG 2.1 AA keyboard and landmark bar remains a **mandated** rule in
  `project.md`. It now has **no automated verification behind it at all**.
- The manual keyboard walkthrough (below) covers tab order, visible focus, skip
  link behaviour, and focus traps — the two things no scanner can check, plus
  two it checks partially.
- Nothing now checks the things a scanner is genuinely good at: landmark
  structure, heading order and level-skipping, one `h1` per page, image alt text,
  link names, and colour contrast. Colour contrast in particular would have
  started firing only once the visual direction lands (PU-5); with no scan, it is
  a design-review responsibility and a walkthrough observation, or it is nobody's.
- A regression in any of those is invisible until a reader hits it.

This is the honest cost of the choice, not an argument to revisit it.

**The keyboard walkthrough is the verification of the mandated WCAG rule.** Tab
through each page type **when that page type is built, and again after the visual
styling is applied**. Seven page types: Home, Writing, Post, Projects, Project,
About, 404. Around five minutes each, a handful of times across the whole
initiative. Confirm on each: the skip-to-content link is first and becomes
visible on focus, tab order matches the visual order, every stop has a visible
focus outline, and no element swallows focus. A page type whose walkthrough has
not been done is not finished.

**The 80% line-coverage floor is inherited from `org.md` by scope and is not ours
to lower.** Its applicability is **determined per unit at Build and Test** and
recorded there: either the measured figure against the floor, or an explicit
`N/A — no instrumentable lines in this unit` with that reason written down. It is
never reported as passing without a measurement behind it — zero instrumentable
lines produces no measurement, not a pass. Unit tests are not part of the
three-check pre-push set above; where instrumentable code exists, its tests and
the floor are verified at Build and Test for that unit, before the unit is
treated as done.

**What counts as code that needs unit tests**, stated so a Construction agent can
act on it: a function that branches or transforms data — date formatting, excerpt
or summary derivation, post sorting, slug generation, feed or sitemap
construction. Template markup and configuration do not.

**A stack that renders content client-side is disqualified.** The mandated rule
"serve pages complete, with no loading state" has a one-line pass/fail test:
**load any page with JavaScript disabled; if content is missing, the rule is
broken.** This is a filter on the stack decision, not something to discover
during Construction.

**Test Strategy** is `Standard` (`<record>/aidlc-state.md`), which governs test
volume and types. Nothing in this section reduces it, and no check here may be
weakened to make a step pass.

## Deployment

**`main` is production. There is no staging.** A GitHub Pages user site publishes
one site from one repository; there is nowhere for a staging tier to live without
inventing infrastructure this initiative has no reason to carry. And a manual
approval gate whose approver is also the author is a button that always gets
pressed — it records nothing and prevents nothing. The act of pushing to `main`
is the approval, and it is already a deliberate human act. Both of these depart
from the `org.md` default deliberately.

**Who can publish.** One GitHub account can change what the public sees at this
URL, and nothing else can. That account is therefore the site's entire access
control, and it is protected by a second factor as well as a password — the
author confirmed this is already in place. A compromised account is the only
realistic way this site gets defaced; no other control on this list substitutes
for it. **Secret push protection is switched on** for this repository, so a push
carrying something that looks like a credential is rejected before it reaches the
remote — the only intervention that helps, since anything pushed to a public
repository is public immediately and stays reachable afterwards.

**Trigger.** A push to `main` publishes the site. Nothing else publishes it, and
no separate step is required of the author. There is exactly one path to the live
site, which means exactly one path to audit.

**Gate.** A build that did not produce a complete site publishes nothing, and the
previously live site stays up. The three-check set (§ Testing Posture) is
enforced before the push rather than on the publish side, so a failing check can
never silently hold a post back — the failure is in front of the author while
they are still at the keyboard.

**What this forecloses, and it is a real constraint.** GitHub's built-in Pages
build (Pages source: *branch*) runs a fixed Jekyll build with no user-defined
steps. There is nowhere to hang a check. As long as the check set runs only on
the author's machine, the built-in build remains viable and is the smallest
attack surface available — nothing of ours executes on every push. The moment we
want any remote enforcement of the check set — a backstop for a push that skipped
the local checks — publishing must run through a workflow in this repository,
because the built-in build cannot provide one. Construction chooses the
generator; it does not get to choose a publishing route and then claim a gate it
does not have.

**If publishing does run through a workflow in this repository**, four controls
make it proportionate and they are the only four we ask for:

1. Declare permissions explicitly: top-level `permissions: contents: read`, with
   `pages: write` / `id-token: write` granted on the deploy job alone.
2. Pin every third-party action to a full commit SHA, never a version tag. Tags
   are mutable and have been retargeted to malicious commits in the wild.
3. Nothing triggers on `pull_request_target`.
4. The build fetches nothing at build time that is not in the lockfile — no
   `curl | sh`, no unpinned installer script.

Alongside those, if any package manager is used: **commit the lockfile**, and
enable **security-only dependency alerts** (grouped or monthly, never routine
version-bump noise — an ignored bot is worse than no bot). Note honestly what the
alerts buy: with no second reviewer, the same person who merges the fix would
have written it, so the value is *awareness* that a known vulnerability exists,
not safe application of the patch.

**Nothing at page load comes from someone else's server.** Fonts, icons,
stylesheets, and scripts are copied into this repository and served from it, and
a `<meta http-equiv="Content-Security-Policy">` tag in the page head enforces it.
This is the technical form of the already-mandated decision to have no tracking:
a third-party webfont or CDN stylesheet sends every reader's IP address and
referring page to a company we never chose, which is the substance of the
tracking that was excluded — arriving through the back door, usually inside a
theme. With the policy in place, a snippet that quietly adds a third-party
request breaks visibly instead of leaking silently. HTTP response headers are not
settable on GitHub Pages at all, so the meta-tag form is the only version of this
control available; `frame-ancestors`, `report-uri`, and `sandbox` are ignored in
meta form, which is fine — none of them matter for a read-only site.

**Failure signal: there is none, by choice.** The author finds out about a
publishing problem by checking the live site. There is no email, no badge, no
notification. Said plainly:

- Pre-push checking is what makes this acceptable rather than reckless. The
  failures that would otherwise go unnoticed for weeks — a broken build, a
  dropped post, a dead link — are caught before the push, in front of the author.
- **The residual gap is real and is not papered over.** A failure that only
  manifests on the remote is invisible until someone looks: the remote build
  failing for a reason the local build did not reproduce, a Pages configuration
  change, or a push that bypassed the local checks. In those cases the site
  quietly stays on its old version and nothing says so.
- The practical mitigation is behavioural and follows from the smoke check below:
  after publishing a post, look at the live site.

**Smoke check.** A deployment is not done when the deploy step reports success;
it is done when the live URL serves the expected page. The minimum, performed by
the author after publishing: the home page returns 200 at the public URL, and the
page just published is reachable. Given the paragraph above, this is not optional
politeness — it is the only failure detection this site has.

**Rollback.** `git revert` the offending commit on `main` and push; the site
rebuilds from the reverted state and the previous version is live again. This is
the complete rollback **for site content**, and it is cheap precisely because the
site is static with no database, no migrations, and no state outside the
repository. Two qualifications:

- **It is rehearsed once, deliberately, as part of the first piece of work** —
  see § Walking Skeleton. Not assumed.
- **It is not a rollback for a leaked credential.** A revert leaves the old blob
  reachable in history, and rewriting history does not unpublish anything already
  fetched, forked, or archived. The credential rule in `project.md` § Mandated
  governs that case, and the order of operations is what matters: revoke at the
  issuer first, clean history second, never the second step alone.

## Code Style

There is no formatter or linter configuration to defer to yet: no language is
chosen, `aidlc-state.md` records Languages, Frameworks, and Build System all as
`Unknown`, and the repository at commit `dab7edf` contains only `aidlc/`,
`.claude/`, and `.gitignore`. What follows is therefore the shape the tooling
must take when the stack decision lands.

**The formatter runs automatically on save, and the build checks it.** For a solo
author, a style rule that requires remembering is a style rule that erodes. The
on-save run is the habit that means the check never fires; the check in the build
is the backstop for a file edited on another machine or outside the editor. We do
**not** put the formatter in a commit hook: a pre-commit hook adds latency to
every commit and fails on things unrelated to the change, a solo author learns
`--no-verify` exactly once, and from then on the hook is worse than nothing
because it is believed to be running.

**The formatter formats site code only. It never touches the text of a post.**
Automatic tidying rewrites line breaks, and where the author chose to break a
line in a post is usually deliberate; after it runs once, the diff of the next
real edit is unreadable. A formatter rewriting a post's front matter can also
break how the post is parsed and published, which turns an ergonomic complaint
into a correctness one. Operationally this is a path-scoped exclusion of the
content tree — if Prettier is chosen, `proseWrap: "preserve"` plus a
`.prettierignore` entry for the content directory.

**Three treatments, not two.** "Advisory on content, blocking on code" is too
coarse: content has structure *and* prose, and they need opposite treatment.

| What is being checked | Treatment | Why |
|---|---|---|
| Content **structure** — front matter present, required fields, date parses, internal links resolve | **Blocking** | Not style. A post that fails these does not appear, and nothing tells the author. |
| Content **prose style** — line length, heading case, punctuation, trailing whitespace | **Off, or advisory-only** | An opinion about quote style must never stop a post going live. That is the ceremony the scope forbids. |
| **Site code** — templates, styles, build configuration | **Blocking** | It can break pages other than the one being edited. |

These are two different tools. A Markdown prose linter knows nothing about
whether `date:` is present; front-matter validation is the generator's job or a
small schema check. If markdownlint is adopted, disable MD013 (line length)
outright for post content and do not treat its output as a gate. "Blocking" here
means the pre-push check set and the build — never the commit.

**Published URL slugs never change.** This is the one naming decision on this
project with an irreversible cost: a renamed slug breaks every search result and
every link anyone shared, and with analytics excluded from scope the author would
never learn it had happened. GitHub Pages has no server-side redirects, so the
only remedies are a stub page or a redirect plugin — remedies that exist solely
because the rule was broken. File names are lowercase, kebab-case, ASCII only:
the file name is the URL.

**Post ordering reads the declared date in front matter, never the file's
modification time.** Git does not preserve mtimes, so a fresh clone or a CI
checkout gives every file the same timestamp and the Writing list silently
reorders. Cheap mistake to make, invisible to have made.

**When a post needs a presentation capability the layout does not have** — a
side-by-side image pair, a callout, a diagram wrapper — it becomes a named
reusable include, used by name from the post, never one-off inline markup pasted
into prose. The first time costs ten minutes more; without the rule, by post ten
the presentation of the site lives in ten prose files and cannot be changed in
one place. Recommended file organisation follows from the same reasoning: one
directory per post with its images inside it, so deleting a post deletes its
images and orphans nothing.

**Naming otherwise follows the language's own idiom.** No project-wide rename
rules.

**Formatter and linter are chosen at the same time as the stack**, with their
defaults accepted rather than tuned. A personal site is not where a formatting
configuration earns its keep, and a config nobody tuned is a config nobody argues
with. They land in PU-1 (§ Walking Skeleton).

**What linting is and is not, here.** On this system linting is a quality tool,
not a security control. Formatting has no security value whatsoever, and no
security framing should be used to justify it. Linting has exactly one narrow
future security case: if hand-written client-side JavaScript ever reads from the
URL or page environment (`location.hash`, `location.search`, `document.referrer`,
`postMessage`) and writes into the DOM, that is the one genuine vulnerability
class a static site can have, and the proportionate response is one lint rule set
(`eslint-plugin-no-unsanitized` or its equivalent), not a scanning platform.
Topic search is deferred rather than excluded, so this is a live future trigger
rather than a theoretical one. **The automated checks in this repository that
actually protect something are not linters** — they are secret push protection, a
committed lockfile, and SHA-pinned actions, and they live in § Deployment.
