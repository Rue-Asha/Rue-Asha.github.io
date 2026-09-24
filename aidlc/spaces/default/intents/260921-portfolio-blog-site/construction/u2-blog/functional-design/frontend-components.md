# Frontend Components — U2 Blog

The post-facing templates and fragments, deepened from the versions U1 left at
skeleton depth. Build-time markup structure, not a client-side component tree:
nothing on this site executes while a reader is on the page.

## Sources

- [upstream] `inception/units-generation/unit-of-work.md` § U2 — the boundary:
  the Writing list, the post page, the feed, and build-time code colouring
- [upstream] `inception/units-generation/unit-of-work-story-map.md` § U2 and
  § Cross-cutting — the ten requirements, and what U1 built minimally here
- [upstream] `inception/requirements-analysis/requirements.md` — FR2.1, FR2.3,
  FR2.4, FR2.6, FR2.8, FR2.9, NFR1, NFR2, NFR6, NFR7
- [upstream] `inception/domain-design/components.md` — `PageRenderer` owns every
  template below, `MarkupRenderer` renders bodies
- [upstream] `inception/refined-mockups/mockups.md` and `interaction-spec.md` —
  the Writing and Post page shapes, the editorial register, and the four-token
  code theme
- [upstream] `construction/u1-publishable-site-shell/functional-design/frontend-components.md`
  — the shell and the skeleton versions of these templates
- [Q1], [Q2] `functional-design-questions.md`

The declared `contract-summary` input is absent: Contract Design is SKIP in this
scope.

---

## Hierarchy

Everything below slots into the `Main` element of U1's `BaseDocument`; the shell,
head metadata and security policy are inherited unchanged.

```
WritingListPage
 +- PageHeading
 +- PostRow*            (one per published post)
 |   +- PostTitle
 |   +- PostDate
 |   +- PostSummary
 +- EmptyState          (instead of the rows, when nothing is published)

PostPage
 +- PostHeader
 |   +- PostTitle
 |   +- PostDate
 |   +- PostSummary
 +- AllPostsLink        (above the body)
 +- RenderedBody
 |   +- CodeBlock*      (coloured at build time)
 |   +- ContentImage*   (alt text is an authoring rule, not build-enforced — BR8.1)
 +- AllPostsLink        (after the body)
```

`PostRow` and `AllPostsLink` are named reusable includes, used by name. `PostRow`
is used by both the Writing list and Home's recent-posts section, which is the
whole reason it is an include rather than markup written twice.

---

## Props and branches

| Template | Props | Branches |
|---|---|---|
| WritingListPage | `posts` (ordered) | `EmptyState` replaces the rows when `posts` is empty (U1 BR5.5) |
| PostRow | `post` | none |
| PostHeader | `post` | none |
| PostPage | `post`, `renderedBody` | none |
| AllPostsLink | — | none |
| RenderedBody | `renderedBody` | none — every branch happens at render time in `MarkupRenderer`, not in the template |
| CodeBlock | `code`, `language` (may be absent) | Unlabelled renders plain; a known language is coloured; an unknown one never reaches the template because the build already failed (BR8.2) |

**`posts` arrives already ordered.** The template never sorts. Ordering is
`PostCatalog`'s rule (U1 BR2.4) and it is the one piece of this unit that has a
unit test behind it; a template that re-sorted would put a tested rule somewhere
no test can reach.

---

## The whole row is one link

`PostRow` renders a single anchor wrapping the title, the date and the summary.
Three consequences follow, and all three are requirements rather than styling:

- Clicking the summary line opens the post (FR2.3).
- The 44px phone target is a property of one element, so it is met once rather
  than three times (NFR7).
- The row is **one** tab stop, not three, so tabbing the Writing list moves post
  by post. A row built from three separate links would triple the tab stops on
  the page and fail the keyboard walkthrough's tab-order condition.

The date moves beneath the title at phone width without splitting the target,
because the target is the row rather than any of its parts (NFR6).

---

## Interaction flows

| Flow | Trigger | Result |
|---|---|---|
| Open a post | Click or Enter anywhere in a Writing row | The post page |
| Return to the list | Either "All posts" link | The Writing list |
| Return from a long post | The second "All posts" link, after the body | The Writing list, without scrolling back up |
| Reach Writing from anywhere | The shell's navigation link | The Writing list (U1 BR5.7) |
| Subscribe | The feed's fixed URL | An Atom document of titles, dates, links and summaries |

**No flow in this unit involves JavaScript**, so there is no focus management to
write, no disclosure to open, and nothing to trap focus. The keyboard walkthrough
for the Writing and Post page types is therefore a short one: tab from the skip
link through the navigation to the rows, confirm each row is one stop with a
visible outline, and confirm both "All posts" links are reachable.

---

## Form validation

**Not applicable.** This unit has no forms. Comments and an email newsletter are
excluded from the initiative entirely rather than deferred, and U1's
content-security policy carries `form-action 'none'`, which makes the absence
enforced rather than merely intended.

## API integration points

**None.** Every component runs at build time. The feed is a static file written
by the build and served from this site's own origin; it fetches nothing and
collects nothing about anyone, which is what separates it from the excluded
analytics.

---

## What U5 must not be forced to undo

Two structural commitments this unit makes, so the visual pass can style them
rather than rewrite them:

- **The code block emits at most four token classes**, and none of them is the
  link accent (`interaction-spec.md` § Code Block). The class set is fixed here;
  U5 chooses their colours.
- **The post page is the editorial register**, and its measure is a property of
  the body element rather than of the page. U5 sets the measure; this unit does
  not wrap the body in anything that would fight it.

The keyboard walkthrough runs on the Writing and Post page types when this unit
is built, and again after U5 applies the styling. A page type whose walkthrough
has not been done is not finished.
