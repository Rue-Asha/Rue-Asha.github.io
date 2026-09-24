# Functional Design Questions — U1 Publishable Site Shell

Six questions. Construction questions are meant to be exceptional rather than
routine: by this point most decisions are made. Each question below names a gap
that no approved upstream artifact closes, and that this unit cannot be built
without.

## What was subtracted, and what settled it

These topics were considered and **not** asked, because an approved artifact
already decides them:

| Topic | Settled by |
|---|---|
| Whether to adopt a static-site generator | `inception/domain-design/decisions.md` ADR-001 — we write the build; no generator |
| The entity set and which component owns each one | `inception/domain-design/components.md` § Entity Ownership — ContentFile, Post, Project, BuildManifest, CheckReport |
| Required fields for posts and projects | `requirements.md` FR2.5, FR3.3; `team-practices.md` § Testing Posture |
| That a missing required field fails the build naming file and field, rather than skipping | `requirements.md` FR1.5; ADR-004 |
| That validation runs inside the build and cannot be bypassed | ADR-004 |
| Post ordering by declared date, newest first, never file mtime | `requirements.md` FR2.2; `components.md` PostCatalog |
| That the live-URL rail row is omitted, not rendered empty | `requirements.md` FR3.4 |
| Where publishing runs and its four required controls | ADR-005 |
| That external links are never build-blocking | `requirements.md` NFR11 |
| That `aidlc/` and `.claude/` are excluded by the content-directory boundary | `requirements.md` FR1.6; ADR-007 |

---

## Q1 — How is a draft marked?

`requirements.md` FR1.3 excludes drafts from the built site, and FR1.4 requires
that publishing a draft needs **no change other than removing its draft mark**.
Assumption A6 left the mechanism open ("a front-matter mark or a folder
convention"), and ADR-001 says only that "the draft mark is whatever we say it
is". Nothing has chosen. The choice decides an attribute on `ContentFile` and
whether FR1.4's "no other change" holds literally.

A. A front-matter field on the file — `draft: true`. Publishing deletes that one
   line. The file never moves, so its path and therefore its URL are fixed from
   the day it is created.
B. A folder convention — drafts live in a `_drafts/` directory and publishing
   moves the file out of it. Nothing is edited, but the file's path changes.
C. A file-name prefix — `_my-post.md` is a draft, `my-post.md` is published.
   Publishing renames the file.
D. A front-matter field with an explicit `published: true` opt-in instead — a
   file with no such field is treated as a draft.

[Answer]: A

X. Other (please specify)

---

## Q2 — Where does content live, and how does the build tell a post from a project?

`components.md` gives `ContentFile` a `kind` attribute and has `ContentSource`
supply "content files of kind post" and "of kind project" to the two catalogues,
but nothing says how `kind` is derived. Separately there is a real tension to
resolve: `requirements.md` NFR8 says **the file name is the URL**, while
`team-practices.md` § Code Style recommends **one directory per post with its
images inside it**. Those two cannot both be literally true — if a post is a
directory containing `index.md`, the slug comes from the directory name, not the
file name.

A. Directory-per-kind, flat files: `content/posts/my-post.md` and
   `content/projects/my-project.md`. `kind` comes from the parent directory;
   the slug is the file's base name. Images live in one shared `content/images/`
   directory. Simplest; gives up the delete-a-post-deletes-its-images property.
B. Directory-per-kind, directory-per-item:
   `content/posts/my-post/index.md` with that post's images beside it. `kind`
   comes from the top directory; **the slug is the item's directory name**, and
   NFR8 is read as "the name you choose is the URL" rather than "the `.md` file's
   own name". Keeps images with their post.
C. Hybrid: a post may be either a flat `.md` file or a directory containing
   `index.md`, and the slug is the base name of whichever it is. Author picks per
   post depending on whether it has images.
D. Flat single directory with `kind` declared in front matter — every content
   file sits in `content/` and carries `kind: post` or `kind: project`.

[Answer]: B

X. Other (please specify)

---

## Q3 — What counts as an unparseable date?

`requirements.md` FR1.5 makes "an unparseable date" a build failure, and its
verify line is "commit a post with no `date`; the build fails and its message
names both the file and `date`". For that to be a pass/fail rule the build can
apply, the accepted form has to be written down — and post ordering (FR2.2)
depends on comparing these values, so ties and precision matter.

A. Date only, ISO 8601 (`2026-09-23`), and nothing else. Anything a strict parse
   rejects is a build failure. Two posts on the same day tie; the tie is broken
   by slug so the order is at least stable across rebuilds.
B. Date only, ISO 8601, with an optional time and offset
   (`2026-09-23T14:30:00Z`). Same-day posts can be ordered deliberately when it
   matters; a bare date is treated as midnight UTC.
C. Any date a general-purpose date parser accepts (`Sept 23, 2026`,
   `23/09/2026`, ISO). Forgiving to write; ambiguous between day-first and
   month-first, and the failure it causes is silent misordering rather than a
   loud error.
D. ISO 8601 date only, and same-day ties are a **build failure** — the author
   must disambiguate by adding a time.

[Answer]: A

X. Other (please specify)

---

## Q4 — What does Home show, and how are its projects chosen?

`requirements.md` FR4.3 requires Home to carry "a recent-posts section and a
selected-projects section" with equal treatment. The mockup draws two rows in
each (`refined-mockups/mockups.md` § Home) but does not state a rule. "Recent
posts" is well-defined once ordering exists; **"selected projects" is not** —
`ProjectCatalog` deliberately carries no ordering rule at all (ADR-002), so
there is nothing for Home to take the top of.

A. Home shows the 3 most recent posts, and projects are selected by a
   `featured: true` front-matter field, shown in the order they appear in the
   content directory. An explicit choice, and a project can be promoted without
   touching Home.
B. Home shows the 3 most recent posts and the 3 most recent projects by `year`,
   newest first. No new field; "selected" becomes "most recent", and Home needs
   no maintenance. Ties within a year are broken by slug.
C. Home shows the 2 most recent posts and a hand-ordered project list declared
   in one site configuration file. Total control; one more place to update when a
   project is added.
D. Home shows the 3 most recent posts and **all** projects. Honest while the
   project count is small, and it stops being right silently once there are more
   than a handful.

[Answer]: A

X. Other (please specify)

---

## Q5 — Where does a page description come from when the page has no summary?

`requirements.md` FR5.3 requires every page to carry a title and a description
in its head, and FR5.4 requires Open Graph and Twitter-card tags whose values
match that page's title and summary. Posts and projects have a one-line summary
to use. **Home, Writing, Projects, About and 404 do not** — nothing upstream
gives them one.

A. Each of the five page types carries a hard-coded description written into its
   template, alongside a site-wide fallback used if one is ever missing.
B. One site-level description (declared once in site configuration) is used for
   all five, with the page title distinguishing them.
C. The five descriptions live in the same site configuration file as the site
   title and author, one entry per page type, so all the head metadata is in one
   place rather than spread across templates.
D. Derive each from the page's own first paragraph of prose, falling back to a
   site-level description when the page has none.

[Answer]: A

X. Other (please specify)

---

## Q6 — How strict is the content-security-policy meta tag?

`requirements.md` NFR4 requires a `<meta http-equiv="Content-Security-Policy">`
tag on every page enforcing that nothing is loaded from a third party, and
`team-practices.md` § Walking Skeleton makes "the policy is in place and the site
works with it" one of the six conditions U1 must pass. The policy value itself
is undecided, and it is the kind of rule that breaks the site quietly if it is
wrong. U5 later adds a stylesheet and a self-hosted font under whatever this
unit sets.

A. `default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:;
   script-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`.
   The strictest form that still serves this site: no scripts at all, inline
   styles forbidden, data-URI images allowed.
B. The same, but with `style-src 'self' 'unsafe-inline'` so an inline `style`
   attribute or `<style>` block does not break a page. Safer against silent
   breakage, weaker as a control.
C. `default-src 'self'` alone, and nothing more. Shortest to write and read; it
   covers the third-party case, and leaves the narrower directives unset.
D. Start with option A, and additionally verify the policy during the build
   rather than trusting the template — the build fails if any emitted page
   references an off-origin URL.

[Answer]: A

---

## Q7 (follow-up to Q4) — What happens when no project is marked `featured`?

Q4 chose an explicit `featured: true` field on projects. That leaves one case
the answer does not cover, and it is the launch-day case: U6 writes one or two
projects, and if neither carries the field, Home's Projects section shows its
"Nothing here yet." empty state **while `/projects` lists them**. The site would
look broken to the first visitor and nothing would say so — the same class of
silent failure `requirements.md` FR1.5 and the three blocking checks exist to
prevent.

A. Fall back to the 3 most recent projects by `year` when no project is
   featured. Home is never wrong; the fallback is invisible, so an author who
   meant to feature something may not notice they didn't.
B. Fail the build, naming the rule, when projects exist but none is featured.
   Consistent with the fail-loudly contract; one more way a content commit can
   be blocked.
C. Show the empty state as written. Home says "Nothing here yet." until the
   author marks a project. Simple and literal; the launch-day trap stays open.
D. Treat `featured` as *ordering* rather than selection: featured projects come
   first, then the rest by `year`, and Home takes the top 3 of that list. No
   empty-state case exists, and marking a project still promotes it.

[Answer]: D

X. Other (please specify)

---

## Consolidated Summary Confirmation

- **Q1 — Draft mark**: a `draft: true` front-matter field. Publishing deletes
  that one line; the file never moves, so its URL is fixed from creation.
- **Q2 — Content layout**: directory per item —
  `content/posts/<slug>/index.md` and `content/projects/<slug>/index.md`, with
  that item's images beside it. `kind` comes from the top directory and the slug
  is the item's directory name; NFR8's "the file name is the URL" is read as
  "the name you choose is the URL".
- **Q3 — Dates**: ISO 8601 date only (`2026-09-23`). A strict parse failure is a
  build failure naming the file and the field. Same-day posts tie and are broken
  by slug, so the order is stable across rebuilds.
- **Q4 — Home**: the 3 most recent posts, and projects promoted by a
  `featured: true` front-matter field.
- **Q7 — Featured semantics**: `featured` orders rather than selects. Featured
  projects sort first, then the rest by `year` descending; Home takes the top 3
  of that single list. Home can never show its empty state while projects exist.
- **Q5 — Page descriptions**: each of Home, Writing, Projects, About and 404
  carries its own hard-coded description in its template, with a site-wide
  fallback if one is ever missing.
- **Q6 — Content-security policy**: the strict set —
  `default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:;
  script-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct

X. Other (please specify)
