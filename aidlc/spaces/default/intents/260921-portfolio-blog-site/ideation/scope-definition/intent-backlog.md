# Intent Backlog — Personal Portfolio & Blog Site

Prioritized proto-Units. These are candidate slices of work, not the final
Units of Work — Units Generation refines them once the domain design exists.
Priority uses MoSCoW, chosen because this is an MVP-style scope boundary with
an explicit "won't have this time" list.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/intent-capture/intent-statement.md`, `ideation/scope-definition/scope-document.md`

---

## Prioritized Backlog

| ID | Proto-Unit | Priority | Why this priority | Depends on | Source |
|---|---|---|---|---|---|
| PU-1 | Publishable site shell — the site is reachable at its public URL and a committed file becomes a live page with no further steps | Must Have | Skeleton-first sequencing puts the publishing path before everything else, because it is the main unknown and everything else depends on it | — | [Q7], [Q8] |
| PU-2 | Blog — a list of posts and a readable individual page per post | Must Have | Half of what the site is for; the first version is not done without it | PU-1 | [Q1], [Q2] |
| PU-3 | Projects — a section presenting what you have built | Must Have | The other half; weighted equally with the blog | PU-1 | [Q1], [Q2], [upstream] |
| PU-4 | About page — who you are, with contact or profile links | Must Have | Named as a must-have capability for the first version | PU-1 | [Q2] |
| PU-5 | Visual direction — a UX/UI treatment informed by Mobbin, applied across the site | Must Have | The initial description names it as a direction for the site rather than a later enhancement | PU-1 | [desc] |
| PU-6 | Launch content — one or two posts and one or two projects written up | Must Have | The first version is "done" only with enough content not to look empty | PU-2, PU-3 | [Q6] |
| PU-7 | Topic navigation — finding posts by tag, category, or search | Won't Have (this time) | Not selected for the first version, and explicitly not excluded; it becomes worth building as posts accumulate | PU-2 | [Q2] |

No Should Have or Could Have items were identified: every capability the
answers named for the first version is required for it, and the one remaining
capability was deferred outright. [Q1], [Q2]

## Explicitly Not in the Backlog

These are excluded from the initiative rather than deprioritized, so they do
not appear as proto-Units at any priority. [Q3]

- Comments on posts
- An email newsletter or subscriber list
- Visitor analytics or tracking of any kind
- A CMS or admin interface

## Build Order

Following the confirmed walking-skeleton heuristic. [Q8]

1. **PU-1** — bare site live at the real URL, publishing path proven
2. **PU-2**, then **PU-3** — the blog half end to end, then the projects half
3. **PU-4** — the about page
4. **PU-5** — the visual direction applied across what now exists
5. **PU-6** — real content written into the finished shape

PU-5 is placed after the structural work rather than before it because
applying a visual direction to pages that already exist is cheaper than
designing pages that do not. It is not optional; it is sequenced. [desc], [Q8]

No item is tied to a date. [Q5]

## Assumptions & Open Questions

- [assumption] The dependency of PU-2 through PU-5 on PU-1 assumes the
  publishing path is shared across all page types. That holds for a single
  site built from one repository, which the initial description implies
  [desc], but no technology decision has been made to confirm it.
- [assumption] Treating the visual direction (PU-5) as one proto-Unit assumes
  a single consistent treatment across posts, projects, and the about page
  rather than per-section designs. Nothing in the answers settles this; the
  mockup stages will.
- [assumption] The carried-forward reader pain from the intent statement
  remains unconfirmed [upstream], so no proto-Unit here is justified by a
  specific reader difficulty — each traces to a capability the user named
  directly.
