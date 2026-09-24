# Requirements — Personal Portfolio & Blog Site

Every requirement below carries a stable ID. Those IDs are permanent
traceability keys: downstream stages preserve them exactly rather than
renumbering them or replacing them with prose references.

Each requirement has a **Verify** line giving its pass/fail criterion. A
requirement with no way to fail is not a requirement, and there are none here.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/intent-capture/intent-statement.md` — problem, audiences, success bar, and the deliberate absence of a measurable target
- [upstream] `ideation/scope-definition/scope-document.md` — the approved scope boundary, the three capabilities, the publishing rule, and the exclusions
- [upstream] `inception/practices-discovery/team-practices.md` — the affirmed check set, the content-field definitions, the deployment and code-style practices
- [upstream] `ideation/scope-definition/intent-backlog.md`, `ideation/rough-mockups/wireframes.md`, `ideation/rough-mockups/user-flow.md`, `ideation/approval-handoff/initiative-brief.md` — page structure, flows, build order, and the items handed to this stage
- [Q1]–[Q8] `requirements-analysis-questions.md`

Three upstream inputs this stage declares are **absent by design**: the
business overview, the architecture summary, and the code-structure summary are
all brownfield artifacts, and this project is greenfield
(`<record>/aidlc-state.md` → Project Type: Greenfield).

---

## Intent Analysis

**What is being achieved, not what is being built.** There is work worth
showing and nowhere good to point people at [upstream: intent-statement]. The
goal is to close that gap with a site that does two things of equal weight:
presents the work, and carries posts about what is currently being learned or
found interesting [desc]. Neither half serves the other.

Underneath that sit two goals that shape the requirements more than the feature
list does:

1. **Writing must stay cheap.** The reason publishing is specified as "write a
   file, commit it, push" [upstream: scope-document] is not convenience — it is
   that ceremony is what stops posts from happening. Every requirement that
   would add a step to publishing is therefore a requirement against the goal.
2. **Nothing about the reader is collected, and nothing about them leaks.**
   Analytics were excluded outright [upstream: scope-document], and the
   no-third-party-request rule is the technical form of the same decision
   [upstream: team-practices]. This constrains how the site is built, not just
   what it does.

The success bar is qualitative by explicit decision: the site exists and its
owner is satisfied with it [upstream: intent-statement]. That is why the
requirements below are verified by pass/fail criteria on the artifact rather
than by outcome metrics — there are none, deliberately.

**An audience gap this stage did not close.** Ideation handed over the question
of what recruiters and other developers currently fail to find. Asked directly,
the answer was that it cannot be confirmed [Q1]. It is recorded as closed-but-
unconfirmed rather than answered by invention, and the consequence is carried
into `## Assumptions` and `## Open Questions`: every requirement about
navigation and information hierarchy rests on a reasoned proposal, and later
stages must keep describing it that way.

---

## Functional Requirements

### FR1 — Publishing

The publishing path is the walking skeleton and the first thing everything else
depends on [upstream: intent-backlog].

| ID | Requirement | Verify |
|---|---|---|
| FR1.1 | The system shall publish a page when its source file is committed to `main` and pushed, with no further action by the author. | Commit and push a new post file; the post page is reachable at the live URL with nothing else done. |
| FR1.2 | The system shall require no publish button, dashboard, manual deploy trigger, or any other post-push step. | Inspect the publishing path end to end: exactly one trigger exists, a push to `main`. |
| FR1.3 | The system shall exclude any content file marked as a draft from the built site. | Build with a post marked as a draft present; no page, list entry, feed item, or sitemap entry for it exists anywhere in the output. |
| FR1.4 | The system shall publish a draft with no change other than removing its draft mark. | Remove the mark, commit, push; the post appears in the Writing list, on Home, in the feed, and in the sitemap. |
| FR1.5 | The build shall fail, naming the file and the missing field, when a content file is missing a required field or carries an unparseable date — rather than skipping the file. | Commit a post with no `date`; the build fails and its message names both the file and `date`. |
| FR1.6 | The system shall exclude the AI-DLC workspace (`aidlc/`) and the tooling directories (`.claude/`) from the published output, configured in the generator rather than left to the author. | Against the live URL, `GET /aidlc/` and `GET /aidlc/spaces/default/memory/project.md` both return 404. |
| FR1.7 | The system shall keep the previously live site serving when a build does not produce a complete site. | Break the build deliberately and push; the previous version is still served at the live URL. |

Source: [upstream: scope-document] § Minimum Viable Scope; [upstream:
team-practices] §§ Deployment, Testing Posture; [Q3]; [Q4].

### FR2 — Blog

| ID | Requirement | Verify |
|---|---|---|
| FR2.1 | The system shall provide a Writing page listing every published post, each entry showing title, one-line summary, and date. | Load `/writing`; every non-draft post appears once with all three values. |
| FR2.2 | The system shall order the Writing list by each post's declared front-matter date, newest first, and never by file modification time. | Clone the repository fresh (which resets file timestamps) and rebuild; the order is unchanged. |
| FR2.3 | The system shall make each Writing list row a single link target covering title, summary, and date. | Click anywhere in a row, including the summary line; the post page opens. |
| FR2.4 | The system shall provide a page per published post carrying the title, one-line summary, date, and body. | Load any post URL; all four are present. |
| FR2.5 | The system shall require `title`, a one-line summary, and `date` on every post, and shall fail the build when any is absent (per FR1.5). | Covered by FR1.5's criterion, applied to each of the three fields. |
| FR2.6 | The system shall render post bodies from Markdown supporting headings, links, lists, images with alt text, and code blocks. | A post exercising all five renders each correctly. |
| FR2.7 | The system shall apply syntax colouring to code blocks at build time, never in the reader's browser. | Load a post with a code block with JavaScript disabled; the colouring is present. |
| FR2.8 | The system shall place an "All posts" link at both the top and the end of every post page. | Load a post; both links are present and both reach the Writing list. |
| FR2.9 | The system shall render the Writing page with a plain sentence and a route to Projects when no posts are published, rather than a bare heading. | Build with zero published posts; `/writing` shows the empty-state sentence and a Projects link. |

Source: [upstream: scope-document] § Minimum Viable Scope; [upstream:
wireframes] §§ Writing, Post; [upstream: team-practices] §§ Testing Posture,
Code Style; [Q7].

### FR3 — Projects

Settled at [Q2]: the first version needs **both** the list page and a
per-project write-up page. This closes the "one capability or two" item Ideation
handed over [upstream: initiative-brief] and is what Units Generation sizes
against.

| ID | Requirement | Verify |
|---|---|---|
| FR3.1 | The system shall provide a Projects page listing every project, each entry showing name, one-line summary, tools, and a repository link. | Load `/projects`; every project appears once with all four. |
| FR3.2 | The system shall provide a write-up page per project, carrying a metadata rail (year, type, tools, repository, live URL) beside a body of author-chosen structure and length. | Load any project URL; the rail carries its rows and the body renders. |
| FR3.3 | The system shall require `name`, a one-line summary, `year`, `type`, `tools`, and `repo` on every project, and shall fail the build when any is absent (per FR1.5). | Covered by FR1.5's criterion, applied to each of the six fields. |
| FR3.4 | The system shall omit the live-URL rail row entirely when a project declares no live URL, rather than rendering it empty. | Build a project without a live URL; the rail has no Live row and no blank row. |
| FR3.5 | The system shall make the project name and the repository link separately and visibly distinguishable targets in each Projects list row, with the repository link carrying the external-link affordance. | Inspect a row: two targets, visually separated, the repository one marked as outbound. |
| FR3.6 | The system shall give each repository link an accessible name identifying its project, not a bare "repo". | Read the page's link list with a screen reader or accessibility inspector; each repository link names its project. |
| FR3.7 | The system shall render the Projects page with a plain sentence and a route to Writing when no projects exist. | Build with zero projects; `/projects` shows the empty-state sentence and a Writing link. |

Source: [upstream: scope-document] § Minimum Viable Scope; [upstream:
wireframes] §§ Projects, Project; [upstream: user-flow] Flow 1;
[upstream: team-practices] § Testing Posture; [Q2].

### FR4 — Site Structure

| ID | Requirement | Verify |
|---|---|---|
| FR4.1 | The system shall serve an About page at its own URL, carrying who the author is and contact or profile links. | Load `/about`; prose and links are present. |
| FR4.2 | The system shall render a global shell on every page: name on the left linking Home, navigation links on the right with the current page marked, and a footer. | Load each of the seven page types; the shell is present and the current page is marked on each. |
| FR4.3 | The system shall render Home with an intro, a recent-posts section, and a selected-projects section, giving both sections the same heading level, the same rule treatment, and the same "All X" affordance. | Inspect Home's markup: both sections use the same heading level and neither carries a treatment the other lacks. |
| FR4.4 | The system shall serve a 404 page carrying the global shell, a plain sentence, and links to Writing and Projects, and GitHub Pages shall serve it for unmatched paths. | `GET /definitely-not-a-page` against the live URL returns this page, not the platform default. |
| FR4.5 | The system shall keep every page no more than one click from Home. | Walk the navigation from Home; every page type is reachable in one step. |
| FR4.6 | The system shall render Home showing its intro and both empty states, without appearing broken, when neither posts nor projects exist. | Build with zero of both; Home renders legibly. |

FR4.1 closes the third item Ideation handed over — the wireframes say About is
drawn inline with Home and then give it its own frame [upstream: wireframes].
The approved scope boundary names About as "a page saying who you are, with
contact or profile links" [upstream: scope-document], so the page is the correct
side and the inline prose is the error. No question was spent on it; an approved
upstream artifact resolving a contradiction is a resolution, not an assumption.

Source: [upstream: scope-document]; [upstream: wireframes]; [upstream:
team-practices] § Walking Skeleton; [upstream: user-flow] Flow 4.

### FR5 — Discovery and Sharing

| ID | Requirement | Verify |
|---|---|---|
| FR5.1 | The system shall publish a feed (RSS or Atom) of posts, containing every published post and no draft. | Fetch the feed; it validates, lists every published post, and lists no draft. |
| FR5.2 | The system shall publish a `sitemap.xml` listing every published page. | Fetch the sitemap; it validates and every published page URL appears. |
| FR5.3 | The system shall give every page a title and a description in its head. | Inspect each page type's head; both are present and specific to that page. |
| FR5.4 | The system shall give every page Open Graph and Twitter-card tags so a shared link shows that page's title and summary. | Inspect a post's head for the tag set, and confirm the values match the post's own title and summary. |
| FR5.5 | The system shall include no preview image in those tags for the first version. | Inspect the head; no `og:image` or equivalent is emitted. |

A feed is a static file served from this site and collects nothing about
anyone, which is what separates FR5.1 from the excluded email newsletter and
from the excluded analytics [upstream: scope-document] § Out of Scope. Source:
[Q4]; [Q5]; [upstream: user-flow] Flow 2.

---

## Non-Functional Requirements

| ID | Requirement | Verify |
|---|---|---|
| NFR1 | Every page shall meet WCAG 2.1 AA for keyboard operation and landmark structure: a skip-to-content link as the first focusable element, tab order following visual order, no focus trap, and a visible focus indicator on every focusable element. | The manual keyboard walkthrough on each of the seven page types, run when that page type is built and again after visual styling is applied [upstream: team-practices]. All four conditions hold on each. |
| NFR2 | Every page shall be served complete, with no loading state and no content assembled in the reader's browser. | Load any page with JavaScript disabled; no content is missing. |
| NFR3 | No page shall load any resource from a third-party server while a reader is viewing it — no fonts, icons, stylesheets, scripts, or embedded widgets. | Load each page type with the browser network panel open; every request goes to this site's own origin. |
| NFR4 | Every page shall carry a `<meta http-equiv="Content-Security-Policy">` tag enforcing NFR3, and the site shall work with it in place. | Inspect the head for the tag; load every page type and confirm no console CSP violation and no broken rendering. |
| NFR5 | The site shall carry no numeric performance target. Its performance requirement is NFR2 and NFR3, which are what get checked. | NFR2's and NFR3's criteria. No separate speed measurement is taken, and none may be introduced without a new decision. |
| NFR6 | Every page shall be usable at desktop and phone widths, the desktop layout being the resolved one and the phone layout its contraction: the Project metadata rail stacks above the body, list rows keep one hit target with the date moving beneath the title, and the top bar stays visible at every width with no hamburger. | Load each page type at a desktop width and at a phone width; each stated behaviour holds. |
| NFR7 | Every list row and interactive target shall meet a 44px minimum touch target at phone width. | Measure the Writing and Projects row hit areas at phone width. |
| NFR8 | A published URL slug shall never change once the page is live. File names are lowercase, kebab-case, ASCII only, and the file name is the URL. | Inspect content file names against the rule; diff published slugs across releases for any rename. |
| NFR9 | The three blocking checks — the site builds; every non-draft content file produced an output page; internal links resolve across the built output — shall pass on the author's machine before any push, for content commits as well as code commits. | Run the check set; all three pass. A failure blocks the push until fixed. |
| NFR10 | Check 2 of NFR9 shall cover every non-draft content file and ignore drafts entirely. | Build with drafts present; the check passes and does not report them. |
| NFR11 | External links shall never be build-blocking and shall not be checked on the publish path. | Introduce a dead external URL; the build and the check set still pass. |
| NFR12 | Where a unit contains instrumentable code, its line coverage shall be measured at Build and Test against the inherited 80% floor, or recorded as `N/A — no instrumentable lines in this unit` with that reason written down. Zero instrumentable lines produces no measurement, never a pass. | The Build and Test record for each unit carries either a measured figure against the floor or the explicit N/A with its reason. |

Source: [upstream: intent-statement] § Success Metrics; [upstream:
team-practices] §§ Testing Posture, Deployment, Code Style; [upstream:
wireframes] §§ Responsive Behaviour, accessibility notes; [upstream: user-flow]
§ Keyboard Flow; [Q6]; [Q8].

**On NFR5.** The intent statement records the absence of a measurable target as
an explicit decision rather than an omission [upstream: intent-statement], and
that decision was reaffirmed when the choice was put directly [Q6]. NFR5 is
written as a requirement rather than left silent so that a later stage cannot
read the silence as permission to invent a budget; introducing one would be a
new decision, not a restatement of this one.

---

## Constraints

Non-negotiable boundaries imposed from outside these requirements.

| ID | Constraint | Consequence |
|---|---|---|
| C1 | This is a GitHub Pages user site: one site, published from one repository, with `main` as production and no staging tier. | There is nowhere for a staging environment to live without inventing infrastructure this initiative has no reason to carry [upstream: team-practices]. |
| C2 | This repository is both the Pages publish root and the AI-DLC workspace. | FR1.6 is load-bearing rather than tidiness: several generators would otherwise serve or render `aidlc/` as pages under a real name. |
| C3 | GitHub's built-in Pages build runs a fixed Jekyll build with no user-defined steps. | Nothing of the check set can hang on it. Remote enforcement of NFR9 would require publishing to run through a workflow in this repository — which Construction may choose, but may not claim a gate it does not have [upstream: team-practices]. |
| C4 | GitHub Pages sets no HTTP response headers and offers no server-side redirects. | NFR4 must be a meta tag, not a header. NFR8 has no remedy but a stub page if broken. |
| C5 | One GitHub account is the site's entire access control, protected by a second factor; secret push protection is on. | A compromised account is the only realistic defacement path; no other control substitutes for it. |
| C6 | A stack that renders content in the reader's browser is disqualified. | This is a filter on the stack decision, not something to discover during Construction. NFR2 is its pass/fail test. |
| C7 | The visual direction is informed by Mobbin and is settled at Refined Mockups, not here. | No requirement above states a colour, type scale, or spacing value. |
| C8 | Construction chooses the site generator; no technology is committed by these requirements. | Every requirement above is written against observable site behaviour rather than a named tool. |

Source: [upstream: team-practices] §§ Deployment, Testing Posture; [upstream:
scope-document]; [desc]; [upstream: initiative-brief].

---

## Assumptions

Believed-true and not validated. Each names what would invalidate it.

| ID | Assumption | Invalidated by |
|---|---|---|
| A1 | The information hierarchy — both sections on Home, a flat one-click structure, the metadata rail on project pages — serves the two audiences well. It is reasoned from the confirmed audiences, not from evidence about what they struggle to find [Q1]. | Any evidence about actual reader difficulty. None will arrive through the site itself, since analytics are excluded. |
| A2 | The site is served from the default `rue-asha.github.io` user-site URL. No answer establishes a custom domain, and none is required by any requirement above. | A decision to use a custom domain, which changes DNS and Pages configuration but no requirement here. |
| A3 | Launch content volume — one or two posts and one or two projects [upstream: scope-document] — keeps a flat Writing list usable without topic navigation. | Post volume growing to where a flat list stops being scannable, which is when the deferred topic navigation becomes worth building. |
| A4 | A single visual treatment applies across posts, projects, and About rather than per-section designs. Nothing settles this; Refined Mockups does. | A Refined Mockups decision to differentiate sections. |
| A5 | Build-time syntax colouring (FR2.7) can be provided without a client-side script and without a third-party request. This follows from how static generators normally do it, but no generator has been chosen. | A stack whose only highlighting option runs in the browser, which would put FR2.7 against NFR2 and NFR3 and force a plain-code-block fallback. |
| A6 | Drafts (FR1.3) can be excluded by a front-matter mark or a folder convention in whichever generator is chosen. | A generator with no draft concept, which would make FR1.3 custom build work rather than configuration. |

---

## Out of Scope

Excluded from this initiative entirely, not deferred. Later stages must not
design around these or leave hooks, extension points, placeholder
configuration, or commented-out scaffolding for them [upstream:
scope-document] § Out of Scope.

- Comments on posts.
- An email newsletter or subscriber list.
- Visitor analytics or tracking of any kind.
- A CMS, an admin interface, or any authoring path beyond editing files
  directly.

**Deferred, not excluded.** Finding posts by topic — tags, categories, or
search — was not selected for the first version and was not ruled out
[upstream: scope-document] § Deferred. It becomes worth building as posts
accumulate. It is not a requirement here and nothing above is shaped around it.

**Not in the first version, and not excluded.** A per-post social preview image
(FR5.5), reusable presentation includes such as a callout box or a side-by-side
image pair [Q7], the contents rail for long project write-ups [upstream:
wireframes], and a scheduled external-link check [upstream: team-practices]. The
reusable-include rule still applies the first time a post needs a capability the
layout lacks — the rule is agreed, only its pre-emptive implementation is not
required at launch.

---

## Open Questions

Carried forward as named work rather than resolved by assumption.

| ID | Question | Who closes it, and what closing it means |
|---|---|---|
| OQ1 | What do recruiters and other developers actually fail to find on a site like this? | Asked directly and answered "cannot confirm" [Q1]. It is not closable from inside this initiative. Consequence: A1 stands, and every later stage describing the information hierarchy states it as a reasoned proposal rather than a validated one. |
| OQ2 | How does the author learn that publishing failed after a push? | Construction. The only failure detection agreed today is the author's own smoke check of the live URL [upstream: team-practices], and the residual gap — a remote-only failure that leaves the old site quietly serving — is real. Closing it means either accepting the behavioural mitigation explicitly or adding a signal. Carried from [upstream: user-flow] Flow 3 and [upstream: initiative-brief]. |
| OQ3 | Which generator, and does it satisfy C6, A5, and A6? | Domain Design and Code Generation. Closing it means a generator chosen against the stated filters, not discovered to conflict with them during Construction. |
| OQ4 | What is the visual style — colour, type, spacing, overall feel? | Refined Mockups, which is the next stage and exists to settle it. The page layouts and Mobbin patterns already chosen are not in question [upstream: initiative-brief]. |
