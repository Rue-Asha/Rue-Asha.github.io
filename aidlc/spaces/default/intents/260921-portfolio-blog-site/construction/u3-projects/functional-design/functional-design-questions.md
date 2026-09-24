# Functional Design Questions — U3 Projects

One question. U3 is a `ui` unit, so it produces the behavioural specification,
its traceability, and its component breakdown; the `Project` entity and its rules
were authored once by U1 and are not redefined here.

## What was subtracted, and what settled it

| Topic | Settled by |
|---|---|
| The `Project` entity, its six required fields and their types | `construction/u1-publishable-site-shell/functional-design/entities.md` |
| That an absent live URL omits the rail row entirely rather than rendering it empty | U1 BR3.5; `requirements.md` FR3.4 |
| That a missing required field fails the build naming file and field | U1 BR3.1–BR3.4, BR4.2–BR4.4 |
| That `repo` is validated for shape but never for reachability | U1 BR3.4; `requirements.md` NFR11 |
| Project name and repository link as separately distinguishable row targets | `requirements.md` FR3.5 |
| Repository links carrying accessible names that identify their project | `requirements.md` FR3.6 |
| The Projects empty state and its route to Writing | `requirements.md` FR3.7; U1 BR5.5 |
| The metadata rail's contents and its phone-width stacking | `requirements.md` FR3.2, NFR6 |
| Where a project lives on disk and how its slug is derived | U1 BR1.2–BR1.4 ([Q2] of U1) |

---

## Q1 — What order does the Projects page list projects in?

`unit-of-work.md` § U3 flags this explicitly: "Project ordering is undefined and
this unit does not invent it. Functional Design or the author settles it." ADR-002
left it open on purpose, and `ProjectCatalog` carries no ordering rule.

Since then U1 defined one total order for the catalogue — `featured` first, then
`year` descending, then `slug` — but it defined it to serve **Home**, which shows
only the top three. Whether the full Projects page uses that same order is a
separate decision, and it is the one this question settles.

A. **The same order as Home**: featured first, then year descending, then slug.
   One ordering rule for the whole site; a project promoted to Home also moves to
   the top of the Projects page, which is probably what promoting it meant.
B. **Year descending, then slug — `featured` affects Home only.** The Projects
   page is a plain reverse-chronological record of the work; `featured` stays a
   Home-page concern and does not reorder the full list.
C. **Alphabetical by name.** Stable and predictable, and it says nothing about
   recency or importance — a reader scanning for a specific project finds it
   fastest.
D. **Grouped by `type`, year descending within each group.** Reads as a
   structured portfolio rather than a timeline; `type` is free text (U1), so the
   groups are whatever the author happens to have written.

[Answer]: A

X. Other (please specify)

---

## Consolidated Summary Confirmation

- **Q1 — Projects page ordering**: the same total order Home uses — `featured`
  first, then `year` descending, then `slug` ascending. One ordering rule for the
  whole site, so promoting a project to Home also moves it to the top of the
  Projects page.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
