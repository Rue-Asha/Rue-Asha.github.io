# Scope Document — Personal Portfolio & Blog Site

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/intent-capture/intent-statement.md`

---

## Scope Statement

A GitHub Pages site that presents your projects and carries blog posts, with
both halves weighted equally. [upstream] The first published version is
"done" when both halves work: projects are presented and posts are readable.
[Q1]

## Minimum Viable Scope

The first published version must deliver all three of these. Nothing here is
optional; removing any one of them means the version is not done. [Q1], [Q2]

| Capability | What it means | Source |
|---|---|---|
| Posts | A list of posts, and an individual readable page per post | [Q2] |
| Projects | A section presenting what you have built | [Q2] |
| About | A page saying who you are, with contact or profile links | [Q2] |

Supporting conditions the first version must also satisfy:

| Condition | Value | Source |
|---|---|---|
| Content at launch | One or two posts and one or two projects — enough not to look empty | [Q6] |
| Publishing workflow | Write a file, commit it, and it appears; no further steps | [Q7] |
| Visual direction | UX/UI informed by Mobbin | [desc] |

## In Scope

- The three capabilities above, live at the site's public URL. [Q1], [Q2]
- A publishing path where committing a file is the whole act of publishing —
  no separate build step the author has to remember. [Q7]
- Whatever design work is needed for the site to present projects and posts
  credibly to recruiters and other developers, following the Mobbin direction.
  [desc], [upstream]

## Out of Scope

These are excluded from this initiative entirely, not deferred. Later stages
must not design around them or leave hooks for them. [Q3]

| Excluded | Source |
|---|---|
| Comments on posts | [Q3] |
| An email newsletter or subscriber list | [Q3] |
| Visitor analytics or tracking of any kind | [Q3] |
| A CMS or admin interface — anything beyond editing files directly | [Q3] |

The exclusion of analytics is consistent with the intent statement's success
bar, which treats no visitor figure as a success signal. [upstream]

## Deferred — Later, Not Excluded

Finding posts by topic — tags, categories, or search — was not selected for
the first version but was not ruled out either. [Q2] It is a legitimate
follow-on once there are enough posts for it to matter, and the design may
leave room for it without building it.

## Value Stream

How each in-scope capability reaches the reader it is for. [Q2], [upstream]

| Capability | Reader | Outcome for that reader |
|---|---|---|
| Projects section | Recruiters and hiring managers | Can see what you have actually built without asking for it | 
| Posts list and post pages | Other developers | Can read through something you learned or worked out |
| About page with links | Both groups | Can tell who wrote this and how to reach you |
| Commit-to-publish workflow | You | Writing a post has no ceremony attached, so posts keep happening |

## Sequencing

No sequencing preference was stated; the decision was delegated and then
confirmed. [Q4], [Q8]

**Chosen heuristic: walking skeleton first.** Get a bare site live at the real
public URL with one post page and one project page, then fill in the About
page, the real content, and the design polish. [Q8]

Rationale: publishing to a live GitHub Pages URL is the step most likely to
behave unexpectedly, and it is cheapest to hit before anything depends on it.
Value-first would build the projects showcase properly before anything is
publishable; risk-first reduces to the same answer here, because publishing is
the main unknown. [Q8]

No part of this work is tied to a date. [Q5]

## Assumptions & Open Questions

- [assumption] The reader pain carried forward from the intent statement is
  still unconfirmed — what recruiters and other developers currently fail to
  find has not been established. [upstream] It does not block this scope
  boundary, but it will shape navigation and per-post context in requirements.
- [assumption] "Commit and it appears" [Q7] implies the publishing step runs
  without author intervention. Whether that is GitHub Pages' own build, a
  workflow in the repository, or something else is a Construction decision, not
  a scope decision; no technology is committed here.
- [assumption] Deferring topic navigation [Q2] assumes post volume stays low
  enough that a flat list remains usable at launch, which the launch content
  answer supports [Q6] but which stops holding as posts accumulate.
