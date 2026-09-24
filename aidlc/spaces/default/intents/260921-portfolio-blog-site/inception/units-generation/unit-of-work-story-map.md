# Unit Story Map — Personal Portfolio & Blog Site

Which unit delivers which requirement.

**This map keys on functional requirements, not story IDs.** User Stories is SKIP
in this scope (`<record>/aidlc-state.md` → Stage Progress), so there are no
`USx.y` identifiers to map. The `FRx.y` IDs from
`inception/requirements-analysis/requirements.md` are the stable traceability
keys instead, and they are preserved exactly rather than renumbered.

## Sources

- [upstream] `inception/requirements-analysis/requirements.md` — the 34
  functional requirements mapped below, and the non-functional set that U5
  carries
- [upstream] `inception/domain-design/components.md` — the components each unit
  deepens, which is why several requirements are completed by one unit while
  being touched by another
- [upstream] `inception/domain-design/decisions.md` — ADR-005, the reason the
  publishing requirements land in U1
- [upstream] `ideation/scope-definition/intent-backlog.md` — the proto-Units
  these units correspond to
- [upstream] `inception/practices-discovery/team-practices.md` — the
  walking-skeleton conditions that shape what U1 must deliver
- [Q1]–[Q5] `units-generation-questions.md` — the first pass, which produced the
  mapping below.
- [Q6]–[Q8] `units-generation-questions.md` § Revision Pass — a reconciliation
  pass after Domain Design was revised. **No requirement moved unit**, so every
  row below is unchanged; the pass is recorded here only so a reader can tell
  that this map was checked against the revised design rather than left
  unexamined.

---

## U1 — Publishable site shell

`u1-publishable-site-shell` · 16 requirements

| ID | Requirement |
|---|---|
| FR1.1 | Publish a page when its source file is committed to `main` and pushed |
| FR1.2 | No publish button, dashboard, manual trigger, or any post-push step |
| FR1.3 | Exclude any content file marked as a draft from the built site |
| FR1.4 | Publish a draft with no change other than removing its draft mark |
| FR1.5 | Fail the build, naming file and field, on malformed content |
| FR1.6 | Exclude `aidlc/` and `.claude/` from the published output |
| FR1.7 | Keep the previously live site serving when a build does not complete |
| FR4.2 | Render the global shell on every page, marking the current page |
| FR4.3 | Render Home with an intro, recent posts and selected projects, both sections given equal treatment |
| FR4.4 | Serve a 404 page with the global shell, served by Pages for unmatched paths |
| FR4.5 | Keep every page no more than one click from Home |
| FR4.6 | Render Home legibly when neither posts nor projects exist |
| FR5.2 | Publish a `sitemap.xml` listing every published page |
| FR5.3 | Give every page a title and a description in its head |
| FR5.4 | Give every page Open Graph and Twitter-card tags |
| FR5.5 | Include no preview image in those tags for the first version |

**Order within the unit.** Build spine first (FR1.3 to FR1.6, then FR1.5's
fail-loudly contract), then the shell and its head metadata (FR4.2, FR5.3 to
FR5.5), then Home and 404 (FR4.3, FR4.4, FR4.5, FR4.6, FR5.2), then the
publishing route last (FR1.1, FR1.2, FR1.7) — because the last group is what
the skeleton's six pass/fail conditions are checked against, and checking them
requires everything before it to exist.

---

## U2 — Blog

`u2-blog` · 10 requirements

| ID | Requirement |
|---|---|
| FR2.1 | Writing page listing every published post with title, summary and date |
| FR2.2 | Order by declared front-matter date, newest first, never by file mtime |
| FR2.3 | Each list row a single link target covering title, summary and date |
| FR2.4 | A page per published post carrying title, summary, date and body |
| FR2.5 | Require title, summary and date on every post; fail the build when absent |
| FR2.6 | Render post bodies from Markdown with headings, links, lists, images with alt text, code blocks |
| FR2.7 | Apply syntax colouring at build time, never in the reader's browser |
| FR2.8 | "All posts" links at the top and the end of every post page |
| FR2.9 | Writing empty state: a plain sentence and a route to Projects |
| FR5.1 | Publish a feed containing every published post and no draft |

**Order within the unit.** The post model and its field rules (FR2.5), then the
post page (FR2.4, FR2.6, FR2.7, FR2.8), then the list and its ordering (FR2.1,
FR2.2, FR2.3), then the empty state and the feed (FR2.9, FR5.1). The feed comes
last because it is derived from a post set that must first be correct.

---

## U3 — Projects

`u3-projects` · 7 requirements

| ID | Requirement |
|---|---|
| FR3.1 | Projects page listing every project with name, summary, tools and repository link |
| FR3.2 | A write-up page per project, with a metadata rail beside the body |
| FR3.3 | Require name, summary, year, type, tools and repo; fail the build when absent |
| FR3.4 | Omit the live-URL rail row entirely when a project declares none |
| FR3.5 | Project name and repository link as separately distinguishable targets in each row |
| FR3.6 | Repository links with accessible names identifying their project |
| FR3.7 | Projects empty state: a plain sentence and a route to Writing |

**Order within the unit.** The project model and its field rules (FR3.3), then
the write-up page and its rail (FR3.2, FR3.4), then the list rows and their two
targets (FR3.1, FR3.5, FR3.6), then the empty state (FR3.7).

---

## U4 — About page

`u4-about-page` · 1 requirement

| ID | Requirement |
|---|---|
| FR4.1 | Serve an About page at its own URL, carrying who the author is and contact or profile links |

---

## U5 — Visual direction

`u5-visual-direction` · 0 functional requirements

**Stated plainly rather than padded.** U5 delivers no functional requirement,
because applying a visual treatment changes how the site looks and behaves
rather than what it contains. Mapping a token FR to it would make this document
look tidier and be less true.

What it does deliver is most of the non-functional set, which is why it is a
Must Have rather than a polish pass:

| ID | Requirement |
|---|---|
| NFR1 | WCAG 2.1 AA keyboard operation and landmark structure — the visible focus indicator on every focusable element is this unit's, and the walkthrough re-runs on all seven page types after it |
| NFR3 | No page loads any resource from a third-party server — the fonts this unit adds are the most likely place for that rule to be broken |
| NFR4 | The content-security-policy meta tag continues to hold with the stylesheet and font in place |
| NFR6 | Desktop and phone layouts, the phone layout being the contraction of the desktop one |
| NFR7 | Every list row and interactive target clearing 44px at phone width |

---

## U6 — Launch content

`u6-launch-content` · 0 functional requirements

U6 delivers no functional requirement and no non-functional one. Its deliverable
is content: one or two posts and one or two projects, written.

This is recorded rather than smoothed over. A unit with no requirement behind it
would normally be a sign of a boundary drawn wrong; here it is a Must Have from
the approved backlog whose value — a site that does not look empty at launch —
was never expressed as a requirement, because it is not a property of the
software. The alternative considered at [Q2] was dropping it from the unit
breakdown, and that was rejected precisely because a Must Have with no owner in
any plan is how a launch arrives with an empty site.

The blocking check set still applies to its files: the build succeeds, each
content file produces a page, internal links resolve.

---

## Coverage verification

**Every requirement is assigned.** All 34 functional requirements (FR1.1 through
FR5.5) appear exactly once above: 16 in U1, 10 in U2, 7 in U3, 1 in U4. None is
unassigned and none is assigned twice. `traceability.json` carries the
machine-readable form.

**Not every unit has requirements, and that is deliberate.** U5 carries
non-functional requirements instead; U6 carries content. Both are recorded above
with the reason rather than given a token mapping.

---

## Cross-cutting concerns

Requirements completed by one unit but touched by another. In each case the
owning unit is the one that *completes* the requirement, and the earlier unit
does the minimum the walking skeleton needs.

| ID | Owner | Also touched by | What the earlier unit does |
|---|---|---|---|
| FR2.4 | U2 | U1 | The skeleton must serve one post page for its first pass/fail condition, so a minimal post template exists in U1 and U2 completes it. |
| FR3.2 | U3 | U1 | The same, for one project page and its rail. |
| FR4.3 | U1 | U2, U3 | U1 builds Home's structure and both sections with their equal treatment; U2 and U3 fill the recent-posts and selected-projects sections with real entries. U1's Functional Design introduced `Project.featured` to choose the selected-projects subset; the ordering rule that consumes it is U3's (`unit-of-work.md` U3 § Implementation notes, `decisions.md` ADR-008). |
| FR2.6, FR2.7 | U2 | U1 | Markdown rendering and build-time colouring exist minimally in U1's skeleton post page; U2 completes the full element set and the four-token theme. |
| NFR1 | U5 | U1, U2, U3, U4 | Each page-type unit runs the keyboard walkthrough when it builds its pages; U5 triggers the second walkthrough across all seven after styling. |
| NFR9, NFR10, NFR11 | U1 | every unit | U1 builds the one check runner; every later unit's work must pass it before a push. |

These overlaps follow from the walking-skeleton answer at [Q5] rather than from
untidy boundaries: a skeleton that reaches all the way through necessarily
touches requirements that later units complete. `components.md` remains the
answer to which component owns a given file.
