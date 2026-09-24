# Requirements Analysis — Questions

Seven questions. Three close items that Ideation explicitly handed to this
stage; four fill gaps nothing decided so far has answered.

Everything already settled upstream is **not** re-asked here: the three
capabilities (posts, projects, about), the exclusions (comments, newsletter,
analytics, CMS), the publishing act (commit and it appears), the page
inventory and layouts, the WCAG 2.1 AA keyboard bar, the no-third-party-request
rule, the required front-matter fields for posts and projects, and post
ordering by declared date.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/intent-capture/intent-statement.md`, `ideation/scope-definition/scope-document.md`, `ideation/scope-definition/intent-backlog.md`, `ideation/rough-mockups/wireframes.md`, `ideation/rough-mockups/user-flow.md`, `ideation/approval-handoff/initiative-brief.md`, `inception/practices-discovery/team-practices.md`

---

## Q1 — What readers currently fail to find

Ideation handed this over as work to close
(`ideation/approval-handoff/initiative-brief.md` § Open Items Handed to
Inception). Both audiences are confirmed — recruiters and hiring managers, and
other developers — but nothing has established what they actually struggle with
on a site like this, so today's navigation and per-post context are a reasoned
proposal rather than something evidence-backed.

You have been on the reading side of other people's portfolio sites. When you
land on one, what most often stops you finding what you want?

A. You cannot tell quickly what the person actually built — projects are
   described vaguely, or buried a click down
B. You cannot tell what is current — nothing says when anything was made or
   whether it is still maintained
C. You cannot tell what the person's own contribution was — the project is
   described, their part in it is not
D. Nothing specific comes to mind; I cannot confirm this from my own
   experience, so record it as still unconfirmed
X. Other (please specify)

[Answer]: D

---

## Q2 — Projects: one page or two

Also handed over from Ideation, and Units Generation needs the answer before it
can size the work. The wireframes draw **two** things: a Projects list page
(name, one-line summary, tools, repo link per row) and a separate in-depth page
per project (metadata rail plus a write-up of whatever length that project
deserves). The backlog sizes "Projects" as a single piece of work, which does
not say which of the two it means.

What does the first published version need?

A. Both — the list page, and a per-project write-up page behind each name
B. The list page only — each row links straight out to the repository, with no
   per-project page on the site
C. Both, but the write-up page is optional per project — a project without a
   write-up links straight to its repository instead
X. Other (please specify)

[Answer]: A

---

## Q3 — Working on an unfinished post

The publishing rule is that committing a file is the whole act of publishing,
with no further step (`ideation/scope-definition/scope-document.md` § Minimum
Viable Scope). Nothing yet says how you work on a post that is not finished
yet — and on that rule as written, committing a half-written post puts it live.

How should an unfinished post behave?

A. Drafts live in the repository but are kept out of the built site — marked in
   the file (for example `draft: true`) or kept in a drafts folder — and appear
   only when you mark them ready
B. Same as A, and a draft is visible when you build the site locally so you can
   read it in place before publishing
C. No draft mechanism — a post file is only committed once it is finished
X. Other (please specify)

[Answer]: A

---

## Q4 — Feed and sitemap

Neither has been mentioned anywhere so far, and neither is excluded. A feed
(RSS or Atom) lets other developers follow new posts in a reader without you
running a mailing list — which is worth separating from the excluded email
newsletter, because a feed is a file on your site and collects nothing about
anyone. A `sitemap.xml` is a list of the site's pages for search engines.

What should the first version publish?

A. Both — a feed of posts, and a sitemap
B. A feed of posts only
C. A sitemap only
D. Neither in the first version
X. Other (please specify)

[Answer]: A

---

## Q5 — What a shared link shows

One of the two main reader journeys has someone arriving at a post directly
from a search result or a link somebody sent them
(`ideation/rough-mockups/user-flow.md` Flow 2). What that link looks like when
it is pasted into a chat or posted somewhere is decided by tags in the page
head. Any preview image would be a file in this repository, so this does not
break the no-third-party-request rule.

How much of that does the first version need?

A. Page title and description on every page, plus social preview tags
   (Open Graph and Twitter card) so a shared link shows the post title and
   summary
B. A, and additionally a preview image per post
C. Page title and description only — no social preview tags
D. Whatever the site generator does by default; not a requirement to state
X. Other (please specify)

[Answer]: A

---

## Q6 — Whether speed gets a number

This project deliberately carries no measurable success target
(`ideation/intent-capture/intent-statement.md` § Success Metrics), and
introducing one now would be a new decision rather than a restatement of an old
one. At the same time, a requirement with no pass/fail criterion cannot be
verified. Two of the choices below are honest answers; the third invents a
number, so it is offered last.

Should the first version carry a stated performance requirement?

A. No number. The performance story is the structural rules already agreed —
   pages served complete, nothing loaded from anyone else's server — and that
   is what gets checked
B. A page-weight budget you can check by looking: a page transfers under a
   stated size (excluding images inside a post body), failing loudly if it does
   not
C. A score floor from a browser audit tool, checked by hand before a release
X. Other (please specify)

[Answer]: A

---

## Q7 — What you can put in a post

The wireframes show post bodies containing headings, images, and code blocks,
and the agreed code-style practice says a presentation capability the layout
does not have becomes a named reusable include rather than markup pasted into
prose (`inception/practices-discovery/team-practices.md` § Code Style). What
has not been decided is how much of that exists at launch.

What must the writing format support in the first version?

A. Markdown with headings, links, lists, images, and code blocks with syntax
   colouring applied when the site is built
B. The same, but code blocks are plain monospaced text with no colouring
C. A, plus the first reusable includes — a callout box and a side-by-side image
   pair — ready to use from day one
X. Other (please specify)

[Answer]: A

---

## Q8 — Follow-up: drafts against the "every content file produced a page" check

Raised by the answer to Q3. Two agreed things now pull against each other and
the conflict has to be settled rather than carried forward.

One is blocking check 2 from the affirmed testing posture: **every content file
produced an output page** (`inception/practices-discovery/team-practices.md`
§ Testing Posture). It is the check that catches this site's most likely real
failure — a build that succeeds while silently dropping a post because of a bad
date or malformed front matter.

The other is the draft mechanism chosen at Q3: a draft is a content file that
is *supposed* to produce no page. Run against drafts unchanged, check 2 fails
every time a draft exists; told to ignore them, it stops catching the failure it
was written for whenever a real post is mistaken for a draft.

How should the check treat drafts?

A. The check covers every non-draft content file, and additionally fails if a
   file marked as a draft *did* produce a page — so an accidentally published
   draft is caught too, which on a public site is the worse of the two failures
B. The check covers every non-draft content file and ignores drafts entirely
C. Drafts live outside the content directory the check looks at, so the check
   needs no change at all
X. Other (please specify)

[Answer]: B

---

## Consolidated Summary Confirmation

- Reader pain stays **unconfirmed**. Nothing establishes what recruiters or
  other developers currently fail to find, so the site's navigation and
  per-post context remain a reasoned proposal and downstream stages must keep
  saying so. [Q1]
- Projects needs **both pages**: a Projects list page, and a per-project
  write-up page behind each project name. [Q2]
- Unfinished posts are **drafts kept out of the built site**, marked in the
  file or held in a drafts folder, appearing only when marked ready. [Q3]
- The site publishes **both a feed of posts and a sitemap**. A feed is a file
  on the site that collects nothing about anyone, so it does not reach the
  excluded newsletter or analytics. [Q4]
- Every page carries a **title, a description, and social preview tags**
  (Open Graph and Twitter card), so a shared post link shows its title and
  summary. **No preview image** per post. [Q5]
- **No numeric performance target.** The performance requirement is the
  structural rules already agreed — pages served complete, nothing fetched
  from anyone else's server — and those are what get checked. [Q6]
- Post and project bodies support **Markdown with headings, links, lists,
  images, and code blocks coloured at build time**. No reusable includes
  required at launch, and no client-side highlighting (it would break the
  serve-pages-complete rule). [Q7]
- The blocking "every content file produced an output page" check **covers
  every non-draft content file and ignores drafts entirely**. [Q8]
- The About page contradiction is closed without a question: the approved
  scope document names About as a page, so About gets its own URL and the
  wireframes' inline-with-Home prose is the side that was wrong.
  [upstream: scope-document]

Does this all look correct before I generate the requirements artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
