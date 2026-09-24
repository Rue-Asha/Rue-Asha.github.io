# Decision Log — Ideation

Every decision made during the Ideation phase, in the order it was made, with
the artifact it landed in. Answers are recorded as chosen, not summarised into
conclusions. Where an answer was free text, it is carried verbatim.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/intent-capture/intent-statement.md`, `ideation/intent-capture/stakeholder-map.md`, `ideation/scope-definition/scope-document.md`, `ideation/scope-definition/intent-backlog.md`, `ideation/rough-mockups/wireframes.md`, `ideation/rough-mockups/user-flow.md`
- Question files: `intent-capture-questions.md`, `scope-definition-questions.md`, `rough-mockups-questions.md`, `approval-handoff-questions.md`

---

## Stage 1.1 — Intent Capture & Framing

Landed in `intent-statement.md` and `stakeholder-map.md`.

| # | Decision | Chosen |
|---|---|---|
| Q1 | The main job the site has to do | Both equally — the site is a portfolio and a blog side by side |
| Q2 | Who reads this site | Free text: "recruiters and other devs equally" — both audiences, weighted equally |
| Q3 | What would tell you the site is working | Someone reaches out because of something they read, and nothing measurable — resolved at Q9 |
| Q4 | Why build this now | I have work worth showing and nowhere good to point people at |
| Q5 | Anyone else involved | Just me — I'm the only person involved |
| Q6 | Who decides what gets built and in what order | Me alone — I decide scope and priority |
| Q7 | Does anyone need to be kept informed | None — no one needs updates |
| Q8 | Does the `feature` scope match the product boundary | Yes — confirm the `feature` scope; build the whole site end to end |
| Q9 | How "someone reaches out" and "nothing measurable" sit together | The only real bar is that the site exists and I'm happy with it; someone reaching out is a welcome bonus, not a target |

Also recorded at this stage: the assumptions carried forward were accepted
rather than converted into follow-up questions.

**Consequence.** The success bar is qualitative by explicit choice, so this
initiative carries no numeric outcome target for any later phase to verify
against. [upstream: intent-statement]

**Gate.** Approved.

## Stage 1.2 — Market Research

Not run. Out of scope for this workflow [scope], so no competitive analysis
exists and the initiative brief makes no market claim.

## Stage 1.3 — Feasibility & Constraints

Not run. Out of scope [scope]. No feasibility assessment or constraint register
exists; the risks in the initiative brief are carried from approved artifacts
instead.

## Stage 1.4 — Scope Definition

Landed in `scope-document.md` and `intent-backlog.md`.

| # | Decision | Chosen |
|---|---|---|
| Q1 | What makes the first published version "done" | Both halves work — projects are presented and posts are readable |
| Q2 | Capabilities in the first version | Posts, Projects, About. Topic navigation was not selected — deferred to later work, explicitly not excluded |
| Q3 | Explicitly out of scope | All four: comments, newsletter, visitor analytics, CMS or admin interface |
| Q4 | What drives build order | No preference — pick a sensible order and say what it is |
| Q5 | Anything tied to a date | No — nothing is date-bound |
| Q6 | Content on launch day | One or two posts and one or two projects — enough to not look empty |
| Q7 | What publishing should feel like | Write a file, commit it, and it appears — no other steps |
| Q8 | Build order recommendation, to confirm | Confirm skeleton first |

**Consequences.**

- Topic navigation became the backlog's single "Won't Have (this time)" item —
  visible rather than silently dropped. [upstream: intent-backlog]
- The visual direction was sequenced after the structural work rather than
  before it, while staying a Must Have. [upstream: intent-backlog]

**Gate.** Approved.

## Stage 1.5 — Team Formation

Not run. Out of scope [scope]. Solo project; no team assessment exists.

## Stage 1.6 — Rough Mockups

Landed in `wireframes.md` and `user-flow.md`.

| # | Decision | Chosen |
|---|---|---|
| Q1 | What a first-time visitor lands on | A short intro, then recent posts and selected projects together on one page |
| Q2 | How posts are listed | Typographic list — title, date, one-line summary, no images |
| Q3 | Navigation shape | Minimal top bar — name on the left, two or three links on the right |
| Q4 | Screen size resolved for first | Desktop first — design for the wide screen, contract to phone |
| Q5 | Accessibility bar | WCAG 2.1 AA — contrast, keyboard, landmarks, alt text, focus indicators |
| Q6 | What one project entry shows | Free text: "When talking abou the full entry a short sumary, as well as a link ot the repo and tools, but also in edpth documentation about the project how I see fit" — the list shows summary, tools, and repo link; each project also gets its own in-depth page whose content the author decides per project |
| Q7 | What sits alongside a post while reading | No preference — recommendation recorded and confirmed at Q8 |
| Q8 | Post page recommendation, to confirm | Confirm — the post plus a way back to the list |

**Consequences.**

- The free-text answer at Q6 introduced a per-project detail page that the
  backlog does not separately size. That gap is handed to Inception below.
- Mobbin was searched for real reference patterns before the questions were
  written, and again for the project page type the Q6 answer introduced.
  [upstream: wireframes]
- Screen states that cannot occur on a statically served site were marked not
  applicable with the reason rather than invented. [upstream: wireframes]

**Gate.** Approved.

## Stage 1.7 — Approval & Handoff

This stage.

| # | Decision | Chosen |
|---|---|---|
| Q1 | Which open items Inception should actively close | All three: the reader pain, whether Projects is one capability or two, and the About frame contradiction |
| Q2 | Name in the site header and on the home page | Rue Asha — as the wireframes show |
| Q3 | Anything else from Ideation still unsettled | The design direction |
| Q4 | What about the design direction | The visual style — colour, type, spacing, overall feel |

**Consequences.**

- The wireframes' unconfirmed name placeholder is now a confirmed decision.
- The design revisit is a directive for Refined Mockups, not a redraw of the
  wireframes. Page layouts and the Mobbin patterns already chosen stand, so no
  backward jump to Rough Mockups is needed and the phase closes on the
  artifacts as approved.
- The intent and the scope boundary were not reopened.

## Decisions Explicitly Deferred

| Deferred | To where | Source |
|---|---|---|
| Finding posts by topic — tags, categories, search | Later work; not excluded | [upstream: scope-document, intent-backlog] |
| What the visual style should actually be | Refined Mockups | [Q4] |
| How a failed publish is surfaced to the author | Construction | [upstream: user-flow] |
| Which technology provides the commit-to-publish path | Construction | [upstream: scope-document] |
| A contents rail for long project write-ups | After launch; noted so the layout need not be redrawn | [upstream: wireframes] |

## Assumptions Carried Into Inception

Recorded so nothing downstream restates them as fact.

| Assumption | Origin |
|---|---|
| What recruiters and developers currently fail to find is unestablished, so the information hierarchy is a reasoned proposal rather than a validated one | [upstream: intent-statement, wireframes, user-flow] |
| No quantitative outcome exists for later phases to verify against; any measurable target introduced downstream is a new decision | [upstream: intent-statement] |
| "Commit and it appears" implies the publish step runs without author intervention, but no technology is committed | [upstream: scope-document] |
| Deferring topic navigation assumes post volume stays low enough for a flat list to remain usable | [upstream: scope-document] |
| One consistent visual treatment across posts, projects, and about — rather than per-section designs | [upstream: intent-backlog] |
| The per-project in-depth page is an elaboration of the approved scope rather than an addition to it | [upstream: wireframes] |
| "Loading state not applicable" holds only while pages are served as complete documents | [upstream: wireframes] |
| Whether the site would ever accept contributions from anyone else is unaddressed; today's answer establishes only that no one else is involved now | [upstream: stakeholder-map] |
