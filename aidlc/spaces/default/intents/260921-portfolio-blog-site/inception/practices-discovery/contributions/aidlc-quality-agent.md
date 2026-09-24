**Collaborator:** aidlc-quality-agent

## Contribution

Quality-engineering review of the Step 2 lead draft. Read in full:
`team-practices.md`, `discovered-rules.md`, `evidence.md`, and the approved
Ideation record (`aidlc-state.md`, `scope-document.md`, `wireframes.md`,
`user-flow.md`, `initiative-brief.md`).

The draft is honest about what it does not know, and that is the right instinct
for a workspace with one commit in it. My findings are mostly not "this is
wrong" — they are "this is deferred in a way that will not survive contact with
Build and Test." One finding is a genuine contradiction between two sections of
the draft, and it is the most important thing in this review.

---

### 1. Testing posture — the methodology is right, the `Ordering` sentence is not yet usable

**`test-after` is the correct methodology and the interview should not be
invited to reach for `custom`.** A static content site gives you almost nothing
to red-green against: you cannot write a failing test for a page layout in any
way that earns the ceremony, and the failures that will actually hurt this site
(§5 below) are not failures a test-first cadence would have caught earlier. The
methodology field is low-stakes here precisely because so little of the risk
lives in hand-written functions. Say that plainly rather than defending
`test-after` as though it were contested.

One trap worth pre-empting: the walking skeleton already has an agreed
done-criterion ("a committed file becomes a live page"), stated before the
skeleton exists. That is **not** a test-first cadence and must not be read as
one — it is how Scope Definition defined done, not a test written ahead of
code. If the interview drifts toward `custom` on those grounds, it is drifting
for a bad reason and `custom` would misinform Code Generation about write-order
for no gain.

**The `Ordering` sentence, however, is not self-sufficient, and that is a
defect Code Generation will feel.** `.claude/knowledge/aidlc-shared/rules-reading.md`
§2 is explicit: Code Generation resolves `Methodology` and `Ordering`
*independently* from coverage, tooling, and scope notes. The current sentence —
"Build each page, layout, or piece of site code first, then write and run that
layer's checks" — resolves only if the reader also consults the "Proposed check
set" bullet, which is exactly the note Code Generation is told to resolve
independently of. It also leaves two things unstated that an implementer has to
guess at: what counts as a "layer" on a site whose units are pages, and whether
the checks are written per page or per Bolt.

Suggested replacement, self-contained:

> - **Ordering**: Implement the page, template, or function first; then, before
>   that change is treated as done, write and run its checks — the automated
>   site checks for a page or template, and unit tests for a function — and
>   require them to pass.

That names the unit of work, names the two check kinds, names the moment
("before done"), and needs no other bullet to be actionable.

---

### 2. The 80% coverage floor — the refusal to weaken it is right; "satisfied vacuously" is not

Three separable claims are bundled in the draft's coverage bullet. They do not
all hold equally.

**Sound.** Line coverage is defined over instrumentable lines, so how much the
floor governs genuinely does depend on the stack. And the lead is right — and
should be commended rather than second-guessed — that a different floor is a
change to `org.md`, not something this stage can grant. Nothing in the draft
proposes lowering the number. This is not a quiet weakening, and I want that on
the record before the objection that follows.

**Not sound.** "If the site turns out to contain no hand-written executable
code, an 80% line-coverage floor ... is satisfied vacuously rather than by
exception." Zero instrumentable lines does not produce a passing measurement;
it produces no measurement. The distinction is not pedantry, because `org.md`
gives Build and Test a job: "Build and Test verifies defined coverage floors."
A verifier handed "satisfied vacuously" records a pass and moves on. A verifier
handed "not applicable, because this unit contains no instrumentable lines"
must record the reason, and that record is auditable and falsifiable the moment
a helper function does appear. The second is what the project's own affirmed
correction already requires of us elsewhere: *when a required state cannot occur
for this system, mark it not applicable with the reason rather than inventing
one to fill the slot* (`project.md` § Corrections, learned 2026-09-23).

**The deferral is the real risk, not the reading.** "Undetermined until the
stack is chosen" has no owner and no moment attached, and a floor deferred to
nobody in particular is how a floor erodes. Give it both:

> The 80% line-coverage floor is inherited from `org.md` by scope and is not
> ours to lower. Its applicability is **determined per unit at Build and Test**
> and recorded there: either the measured figure against the floor, or an
> explicit `N/A — no instrumentable lines in this unit` with that reason
> written down. It is never reported as passing without a measurement behind it.

That is strictly stronger than the current text, costs nothing while the site
has no code, and gives Build and Test an instruction instead of a standing
conditional.

---

### 3. The contradiction the draft carries and does not resolve

This is the finding I would hold up the stage for.

`org.md` binds **two** things to the `feature` scope, not one: "an 80%
line-coverage floor **and CI execution before merge**." The draft quotes that
clause verbatim in § Testing Posture and immediately writes "We do not weaken it
here."

§ Way of Working then proposes: "Bolt branches merge to `main` locally with no
PR, and **the checks run on `main` after the merge**."

Those two sentences cannot both stand. One section inherits an execution-before-merge
requirement and declares it unweakened; the other moves execution to after the
merge. `phases/inception.md` is unambiguous about what to do with that: "Never
carry forward unresolved contradictions between requirements; surface and
resolve them explicitly." Under the strict-additive model the after-merge
proposal is not an override — it is a narrower rule contradicting broader
policy, and it would be rejected at admission rather than affirmed.

**And it does not need to be a trade-off at all**, which is what makes leaving
it open indefensible. The draft treats "before merge" as though it implied a
pull request and therefore a reviewer who does not exist. It does not. Three
ways to satisfy it with one person:

| Path | How "before merge" is satisfied |
|---|---|
| Push the branch, let the checks run on the branch, merge when green | The workflow runs on branch push; no PR, no reviewer, no second person |
| Commit to `main`, checks run, publish only on green | The merge is not what matters — the *publish* is gated, and the site never serves an unchecked build |
| Run the checks locally before pushing | Weakest; nothing enforces it, and for a solo author "remembering" is the failure mode the draft itself identifies in § Code Style |

The second row also stitches together two sections the draft left unconnected.
§ Deployment already proposes "the build must succeed before anything is
published. Build and publish are separate steps: a failed build publishes
nothing." Extend that gate from *build succeeds* to *the check set passes* and
the content-commits-straight-to-`main` path — which otherwise never meets a
check at all — is covered by the same mechanism, at no extra cost. Content
commits are exempt from **branching**, not from **checking**. That sentence is
worth writing into § Way of Working verbatim, because the current split table
implies otherwise by omission.

---

### 4. CI quality gates: what runs, when, and the one mechanism choice this forecloses

Nothing exists yet (`.github/` absent, no build manifest), so the practice has
to be stated stack-neutrally. Gate *placement* can be settled now even though
gate *implementation* cannot.

**Two moments matter, and they collapse into one for this project.**

1. **Before the change lands** — the inherited requirement from §3.
2. **Before the site is served** — the gate that actually protects readers.

For a site where `main` is production, these are the same moment, and that is a
simplification worth stating out loud rather than treating as two gates.

**The mechanism claim in § Deployment is not true as written.** The draft says
"The practice above holds either way; the mechanism does not exist yet." That
holds for the trigger and for rollback. It does **not** hold for the build gate.
GitHub Pages' built-in build (Pages source: *branch*) runs a fixed Jekyll build
with no user-defined steps — there is nowhere to hang a check, and the site
publishes whether or not anything passed. Gating the publish on a check set
requires the Pages source to be **GitHub Actions**, with the workflow running
the checks and the deploy step conditional on them.

That is a practice decision constraining a Construction decision, and it should
be recorded as such rather than discovered in Bolt 1:

> If checks are to gate publishing, publishing must run through a workflow in
> the repository rather than the platform's built-in build. Construction chooses
> the generator; it does not get to choose a publishing route that has no gate.

**Feedback time is a quality property here, not a nicety.** Every check sits
between `git push` and the post appearing, on a site whose entire scope
requirement is that publishing has no ceremony. A suite that takes five minutes
on a typo fix is a suite that gets bypassed, and a bypassed gate is worse than
no gate because it is still on the org chart. I would put a stated budget in the
practice — under two minutes for the full set on a content commit — and treat
exceeding it as a defect in the check set rather than something to endure.

---

### 5. The check set: what to keep, what is missing, what would be over-built

The draft's four proposed checks are the right instinct and the right size. Two
need scoping, one over-claims what it buys, and one critical check is missing —
the one covering the project's only mandated publishing rule.

#### Keep, with scoping notes

**(1) Build succeeds.** Necessary, cheap, blocking. No change.

**(2) Internal links resolve.** Keep, and keep it **internal-only** — the draft
already scoped it that way and the rationale should be written down so nobody
"improves" it later. External link checking is flaky (rate limits, transient
failures, bot blocking), and a flaky check on the publish path trains the author
to ignore red. But dead external links do matter on this site: the Projects list
and the project rail both carry outbound repo links, and a dead repo link is
seen by exactly the recruiter audience the site exists for. Resolution: check
external links **on a schedule (weekly), never as a publish gate**. Different
check, different place, both justified.

**(3) Automated accessibility scan.** Keep it — but the draft over-claims what
it verifies, and the over-claim matters because `discovered-rules.md` promotes
the WCAG bar to `project.md` § Mandated where it binds every later stage.

Automated scanners find only a minority of WCAG issues (published estimates
range from about a third to about half). More specifically, measure the scan
against the four things the mandated rule actually promises:

| Mandated promise | Does an automated scan verify it? |
|---|---|
| A working skip-to-content link | Partially — a scanner can confirm the target exists, only with best-practice rules enabled; it cannot confirm the link becomes visible on focus |
| Tab order following visual order | **No.** No scanner compares DOM order against rendered geometry. A positive-`tabindex` rule is a weak proxy, nothing more |
| No focus trap | Not statically checkable — and vacuously true here, since `user-flow.md` records that no page uses a modal, dropdown, or other focus-capturing component |
| A visible focus indicator on every focusable element | **No.** WCAG 2.4.7 is not automatable |

So the scan verifies roughly one of four, and the draft's own standard —
"a mandated bar with no check is a stated intention" — indicts the check it
proposes. The scan still earns its place, but for different work than the draft
credits it with: landmarks, heading order and level-skipping, one-`h1`-per-page,
image alt text, and link names are all scanner rules, and they map directly onto
the structural commitments the wireframes made per frame. Credit it for that.

Two operational notes the lead should carry:

- **The scan will be quiet, then suddenly noisy.** Colour contrast (WCAG 1.4.3)
  is among the highest-value automated rules and cannot fire until there is
  colour. The build order puts the visual direction at step 4, after the
  structural work. Expect the accessibility gate to go from silent to loud in
  that Bolt, and expect that to be correct rather than a broken check.
- **The 44px touch-target figure in the wireframes is not part of the WCAG 2.1
  AA bar** (2.5.5 Target Size is AAA; the 24px AA minimum arrives in WCAG 2.2).
  It is a design commitment, it is not automatically checkable, and nobody
  should later claim the scan covers it.

**(4) Unit tests for hand-written logic.** Keep, but "any hand-written logic
that is genuinely logic" has no pass/fail criterion, and
`phases/inception.md` forbids exactly that ("Requirements must be testable and
verifiable — each requirement must have a clear pass/fail criterion. Avoid
ambiguous language"). A Code Generation agent cannot act on "genuinely."
Testable formulation:

> A function that branches or transforms data gets unit tests — date
> formatting, excerpt or summary derivation, post sorting, slug generation,
> feed or sitemap construction. Template markup and configuration do not.

#### Missing — and this is the important one

**(5) Assert that every content file produced a page.** Nothing in the proposed
set catches the single most likely real failure on a content-driven static site:
**a build that succeeds while silently dropping a post.** Malformed front
matter, a wrong or future-dated `date`, a stray `draft: true`, a file in the
wrong directory — Jekyll and most generators skip such files *without failing
the build*. Check (1) passes. Check (2) passes, because the Writing list is
generated from the same collection and simply omits the missing post, so there
is no dead link to find. Checks (3) and (4) never see it.

The draft names this failure mode in its own prose — "a post is published with
broken front-matter and does not appear" — and then does not put a check in the
list that catches it. That is a hole in the coverage of the project's *only*
mandated publishing rule (`ALWAYS keep publishing to a single act ... and the
page is live`).

The check is cheap and stack-neutral to state:

> After the build, assert that every content source file produced a
> corresponding output page, and that the 404 page was generated. A build that
> silently drops a file fails this check.

This is also the check that gives Build and Test something executable to verify
the mandated rule against, instead of verifying it by reading the rule.

**(6) Manual keyboard walkthrough, per page type.** Per the table above, this is
the only thing that verifies two of the four mandated keyboard promises. Scope
it so it is actually done: tab through a page type **when that page type is
built or its layout changes**, not on every commit. Six page types plus the 404
(Home, Writing, Post, Projects, Project, About, 404). Five minutes each, a
handful of times across the whole initiative. Confirm: skip link first and
visible on focus, tab order matches the visual order, a visible outline on every
stop, no element swallows focus.

#### Over-built — recommend against

- **Visual regression testing.** On a solo portfolio whose visual direction is
  explicitly unsettled until Refined Mockups, snapshot diffing fires on every
  intentional design change and trains the author to approve diffs unread. The
  maintenance tax exceeds the defect it catches. Do not propose it.
- **A separate HTML-validity gate.** Substantially redundant with the
  accessibility scan for the things that matter here (landmarks, heading order,
  alt text). One gate, not two.
- **Exercising the empty states in CI.** They require fixture builds with the
  content removed. Not worth a gate; verify them once in the manual walkthrough.
- **Anything for a feed, sitemap, or search.** Not in scope and not mentioned in
  the approved record. Do not invent checks for capabilities nobody asked for.

#### Proposed set, assembled

| # | Check | When | Blocking |
|---|---|---|---|
| 1 | Build succeeds | Every push, before publish | Yes |
| 2 | Every content file produced a page; 404 exists | Every push, before publish | Yes |
| 3 | Internal links resolve across built output | Every push, before publish | Yes |
| 4 | Accessibility scan over every built page type, WCAG 2.1 AA | Every push, before publish | Yes |
| 5 | Unit tests + coverage floor, where instrumentable code exists | Every push, before publish | Yes, or `N/A` with recorded reason |
| 6 | Live URL smoke: home returns 200, newly published page returns 200 | After publish | Cannot block — must notify |
| 7 | Keyboard walkthrough | When a page type is built or restyled | Yes, for that change |
| 8 | External links resolve | Weekly, scheduled | No, never on the publish path |

Five automated gates, one post-deploy alarm, one per-page-type manual pass, one
scheduled job. That is proportionate to a `Standard` test strategy on a static
site, and every row traces to a failure the approved record either mandates
against or names as a risk.

---

### 6. Gaps the Step 4 interview must resolve

Written to be asked of a solo developer who is not a QA specialist. No process
nouns, no framework vocabulary. Each fits four options plus `X. Other (please
specify)`, per `project.md` § Corrections. Ranked — the first three are
essential; the last three can be folded or dropped if the interview is running
long.

**Q-A (essential — resolves §3).** *When should the checks run: before the
change goes live, or after?* Frame every option as a way of checking **before
the site changes**, because that is inherited and is not on the table:

- A. Push the branch, wait for the checks, then merge when they are green.
- B. Commit straight to `main`; the checks run, and the site only updates if
  they pass.
- C. Run the checks on your own machine before pushing.

Note for whoever writes the options: "the checks only warn, nothing blocks" is
**not** an affirmable option for the build or the coverage floor — `org.md`
binds both and says floors may not be weakened to make a step pass. Advisory
treatment is available only for checks *beyond* that floor. Offering an
unaffirmable option and then walking it back is worse than not offering it.

**Q-B (essential — reframes the lead's row).** The draft's evidence table asks
"whether an automated accessibility check is wanted, given that WCAG 2.1 AA is
already mandated." That framing invites a "no" that would leave a promoted
mandated rule with nothing verifying it. Ask the real question instead:

*Automatic tools catch a minority of accessibility problems. Two of the four
promises this site makes — that the tab order matches what you see, and that
everything you tab to shows a visible outline — cannot be checked by any tool.
Verifying them means tabbing through a page yourself, about five minutes.*

- A. Yes — do it when a page type is built and again when it is restyled.
- B. Yes, but once before launch only.
- C. No — accept that two of the four promises go unverified.

Option C is the honest cost, stated as a cost. Do not dress it up as narrowing
the rule; the rule came from the human and stands either way.

**Q-C (essential — the publish-failure signal, carried unresolved since
Ideation).** The draft proposes "the platform's own build-failure notification"
and asks whether the author will read it. Sharpen it — the question is not how
it is surfaced but *where it will be seen within a day*:

*If publishing fails after you push, the site quietly stays on the old version.
Where would you actually notice that?*

- A. GitHub emails you when a run fails, and you read that inbox.
- B. Somewhere else you check daily — say so and we will route it there.
- C. You would check the repository yourself after publishing a post.

**Q-D (fold if short — the coverage floor).** *The framework attaches an 80%
line-coverage floor to work of this size. If the site ends up with hand-written
functions, 80% of their lines need tests. If it ends up as templates and
Markdown with no functions, there is nothing to measure. This is not ours to
lower — we are confirming you know it is there.*

- A. Understood — it applies if and when there is code.
- B. Understood, and it is a reason to prefer a stack with as little code as
  possible.
- C. I want a stricter bar than that.

Option B is worth offering because the answer is a genuine signal for Domain
Design, not just an acknowledgement.

**Q-E (fold if short — the budget that decides whether any of this survives).**
*Every check runs between you pushing a post and the post appearing. How long
is too long?*

- A. Under a minute, or I will start skipping them.
- B. Two or three minutes is fine.
- C. It runs in the background; I do not wait for it.

Nobody else has asked this, and it is the single best predictor of whether these
gates are still switched on in six months.

**Q-F (fold if short — blocking scope).** *Suppose you publish a post and the
accessibility scan fails on an image you forgot alt text for. Should the post
refuse to go live, or go live with a warning?*

- A. Nothing publishes while any check is red.
- B. A broken build blocks everything; a failed check on a content commit warns
  but still publishes.
- C. Site code changes are blocked; content is only ever warned about.

Same caveat as Q-A: B and C are available for the link and accessibility checks
and **not** for the build or the coverage floor.

---

### Two smaller notes for the lead

- **The check set is currently labelled "to be confirmed once the stack is
  chosen."** Checks 1, 2, 3 and 6 above are stack-neutral and can be affirmed
  now; only the tooling names are stack-dependent. Deferring the whole set
  because part of it is undecided hands Construction a blank space where it
  should have a contract.
- **`discovered-rules.md` is correctly restrained** and I would not add to it.
  The coverage floor is inherited rather than human-stated and does not belong
  there; the check set is a practice, not a hard constraint. The admission
  discipline in that file is the best thing in the draft.

## Positions

- AGREE: `test-after` is the right methodology, and the interview should not be
  steered toward `custom` — the skeleton's pre-agreed done-criterion is a
  definition of done, not a test-first cadence.
- AGREE: the draft does not weaken the 80% floor and correctly routes any change
  to it back to `org.md` rather than granting it here.
- AGREE: the coverage floor is kept out of `discovered-rules.md` — it is
  inherited by scope, not human-stated, and promoting it would misrepresent its
  origin.
- AGREE: `main` is production, there is no staging, and a machine-performable
  build gate is the honest replacement for an approval gate whose approver is
  the author.
- AGREE: the post-deploy smoke check against the live URL, and `git revert` plus
  push as the whole rollback — with the draft's own caveat that it should be
  rehearsed once rather than assumed.
- AGREE: the publish-failure signal is carried forward as unresolved rather than
  answered by assumption, consistent with the project's affirmed correction
  about handing unresolved items on as named work.
- AGREE: internal-link checking rather than external on the publish path — a
  flaky gate trains the author to ignore red.
- OBJECT: § Way of Working ("checks run on `main` after the merge") contradicts
  the "CI execution before merge" clause § Testing Posture quotes and declares
  unweakened; `phases/inception.md` forbids carrying that contradiction forward,
  and it is resolvable without inventing a reviewer.
- OBJECT: "satisfied vacuously" claims a passing measurement where there is no
  measurement; it should be a per-unit not-applicable determination recorded at
  Build and Test with its reason.
- OBJECT: the `Ordering` sentence is not self-sufficient — it depends on a
  supporting bullet that `rules-reading.md` §2 tells Code Generation to resolve
  independently of.
- OBJECT: the proposed accessibility scan verifies roughly one of the four
  promises the mandated WCAG rule makes; without a manual keyboard pass, a rule
  promoted to `project.md` § Mandated has no verification behind it.
- OBJECT: the check set has no check for a build that succeeds while silently
  dropping a content file — the most likely real failure, and the only mandated
  publishing rule is what it would break.
- OBJECT: "unit tests for any hand-written logic that is genuinely logic" has no
  pass/fail criterion and is unactionable for Code Generation under
  `phases/inception.md` § Requirements Quality.
- OBJECT: § Deployment's claim that the practice "holds either way" regardless
  of publishing mechanism is false for the build gate — the platform's built-in
  build cannot gate on checks, so choosing a gate forecloses that route.
