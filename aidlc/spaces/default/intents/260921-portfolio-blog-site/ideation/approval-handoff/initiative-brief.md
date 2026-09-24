# Initiative Brief — Personal Portfolio & Blog Site

One page for the go/no-go decision that closes Ideation. Everything below is
carried from an approved Ideation artifact or from this stage's answers;
nothing new is introduced.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/intent-capture/intent-statement.md`, `ideation/intent-capture/stakeholder-map.md`, `ideation/scope-definition/scope-document.md`, `ideation/scope-definition/intent-backlog.md`, `ideation/rough-mockups/wireframes.md`, `ideation/rough-mockups/user-flow.md`
- [Q1]–[Q4] `approval-handoff-questions.md`

---

## Intent and Problem

There is work worth showing and nowhere good to point people at. The intent is
a GitHub Pages site that both presents that work and carries posts about things
currently being learned or found interesting — the two halves weighted equally,
a portfolio and a blog side by side rather than one serving the other.
[upstream: intent-statement]

The trigger is the gap itself: accumulated work with no good place to present
it. No deadline, client commitment, or event drives the timing.
[upstream: intent-statement]

## Who It Is For, and Who Decides

Two reader groups matter equally: recruiters and hiring managers, and other
developers. The site owner is the only person involved — sole decision-maker,
no contributors, no reviewers, no progress updates owed to anyone.
[upstream: stakeholder-map]

The name that appears in the site header and on the home page is confirmed as
**Rue Asha**, settling the placeholder the wireframes flagged. [Q2]

## Market Validation

None was gathered, and none is claimed. Market Research is out of scope for
this workflow [scope], so no `competitive-analysis` artifact exists and the
brief makes no claim about market position, differentiation, or demand. For a
solo portfolio site with a named audience and no revenue hypothesis, the
absence is a scoping decision rather than a gap in evidence.
[upstream: intent-statement]

## Feasibility and Risk

Feasibility & Constraints was also out of scope [scope], so no
`feasibility-assessment` or `constraint-register` artifact exists. The risks
below are carried from approved artifacts rather than from a feasibility pass,
and each names where it is resolved.

| Risk | Severity | Where it is handled |
|---|---|---|
| The publishing path is the main unknown — "commit and it appears" is a stated requirement with no technology committed to it yet | Medium | Sequencing already answers this: the walking skeleton proves the live URL and the publishing path before anything depends on them [upstream: scope-document, intent-backlog] |
| The author gets no signal when publishing fails after a commit | Medium | Named as a Construction decision in the author flow; carried forward so it is not silently dropped [upstream: user-flow] |
| Reader pain is unconfirmed — what recruiters and developers currently fail to find has never been established, so the information hierarchy is a reasoned proposal, not a validated one | Medium | Inception closes it [Q1] |
| The visual style is unsettled — the wireframes deliberately carry no colour, type, or spacing | Low | Carried into Refined Mockups as a directive for that stage [Q3], [Q4] |
| No measurable success criterion exists, by explicit choice | Low | Accepted. There is no quantitative outcome later phases can verify against; any measurable target introduced downstream is a new decision [upstream: intent-statement] |

## Scope Boundary

The first published version delivers three capabilities, none optional: posts
(a list plus a readable page per post), projects (a section presenting what has
been built), and an about page with contact or profile links. It must also ship
with one or two posts and one or two projects so it does not look empty, and
publishing must be nothing more than committing a file.
[upstream: scope-document]

Excluded from the initiative entirely — not deferred, and not to be designed
around: comments, an email newsletter, visitor analytics or tracking of any
kind, and any CMS or admin interface. [upstream: scope-document]

Deferred but not ruled out: finding posts by topic (tags, categories, search).
It becomes worth building as posts accumulate. [upstream: scope-document]

## Build Order

Walking skeleton first, as confirmed at Scope Definition. The backlog carries
seven prioritized proto-Units; six are Must Have and one is deferred.
[upstream: intent-backlog]

1. Publishable site shell — live at the real URL, publishing path proven
2. Blog, then Projects — each half end to end
3. About page
4. Visual direction applied across what now exists
5. Launch content written into the finished shape

The visual direction sits after the structural work rather than before it
because applying a treatment to pages that already exist is cheaper than
designing pages that do not. It is not optional; it is sequenced.
[upstream: intent-backlog]

## Concept Visuals

Five page types, flat — nothing more than one click from home: Home, Writing,
Post, Projects, Project, plus About off the top bar. A global shell (name left,
three nav links right, footer) sits on every page, with WCAG 2.1 AA keyboard
and landmark behaviour specified per frame. Empty, error, and partial states
are drawn; a loading state is marked not applicable because pages are served
complete. [upstream: wireframes]

Four user flows are mapped, including the author's own publish flow — write a
file, commit, push, and the post appears — which is treated as a first-class
flow rather than an implementation note. [upstream: user-flow]

## Team Plan

Solo. Team Formation was out of scope [scope], so no `team-assessment` artifact
exists and no mob composition, staffing, or schedule applies. The site owner is
the only participant, which the stakeholder map already establishes.
[upstream: stakeholder-map]

## Open Items Handed to Inception

All three are handed over as work to close, not as notes to preserve. [Q1]

| Item | What closing it means |
|---|---|
| Reader pain | Establish what recruiters and other developers currently fail to find, so navigation and per-post context rest on something confirmed |
| Projects — one capability or two | The wireframes draw a projects list and a per-project detail page; the backlog sizes "Projects" as one proto-Unit. Units Generation needs the answer before it sizes the work |
| The About frame contradiction | The wireframes say About is drawn inline with Home, then give it its own frame. One of the two is wrong |

Carried separately as a directive rather than an open item: Refined Mockups
revisits the **visual style** — colour, type, spacing, overall feel. The page
layouts and the Mobbin patterns already chosen are not in question. [Q3], [Q4]

## Go / No-Go Recommendation

**Go.** Proceed to Inception.

The intent, the audiences, the decision-maker, the scope boundary, the build
order, and the page structure are all settled and approved. The one thing still
open in the design — the visual style — is the thing Refined Mockups exists to
settle, and that stage is in scope. The three handed-over items are ordinary
Inception work rather than blockers, and none of them can change the scope
boundary. No backward jump to Rough Mockups is needed. [Q1], [Q3], [Q4]

The honest qualifier: this initiative carries no measurable success target and
no validated evidence about reader pain, both by explicit decision. It will be
judged on whether the site exists and its owner is satisfied with it.
[upstream: intent-statement]

## Assumptions & Open Questions

- [assumption] The "Go" recommendation assumes the publishing path behaves as
  the scope document expects — commit, and the page appears. No technology
  decision has confirmed that yet; the walking skeleton is what proves it, and
  a failure there would reopen sequencing rather than scope.
  [upstream: scope-document]
- [assumption] The three handed-over items are treated as closable within
  Inception. Reader pain in particular may not be answerable from the site
  owner alone, since it concerns what other people fail to find; if it stays
  unconfirmed after Requirements Analysis, the information hierarchy remains a
  reasoned proposal and later phases should keep saying so. [Q1]
- [assumption] "Revisit the visual style" records that the wireframes' absence
  of colour, type, and spacing is not yet a decision. What the style should
  actually be is not stated here and is not derivable from any answer; Refined
  Mockups asks it. [Q4]
