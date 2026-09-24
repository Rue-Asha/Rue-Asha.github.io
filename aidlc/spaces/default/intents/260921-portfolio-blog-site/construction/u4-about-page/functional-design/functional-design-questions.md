# Functional Design Questions — U4 About Page

One question. U4 is the smallest unit in the set — `requirements.md` assigns it a
single functional requirement — and `unit-of-work.md` warns that its main risk is
being treated as trivial. The one question below is the one thing about it that
genuinely is not decided.

## What was subtracted, and what settled it

| Topic | Settled by |
|---|---|
| That About is its own page at its own URL, not prose inline on Home | `requirements.md` FR4.1, which resolved the wireframes' contradiction |
| What the page carries: who the author is, plus contact or profile links | `requirements.md` FR4.1 |
| That it is reachable in one click from Home, like every other page type | `requirements.md` FR4.5; U1 BR5.7 |
| The global shell, head metadata and security policy it inherits | U1 BR5.1, BR5.8–BR5.10 |
| Its description in head metadata: hard-coded in the template with a site-wide fallback | U1 BR5.8 ([Q5] of U1) |
| That it renders in the technical register rather than the editorial one | `inception/refined-mockups/mockups.md` § The Two Registers |
| That its keyboard walkthrough runs when built and again after U5's styling | `team-practices.md` § Testing Posture |

---

## Q1 — Where does the About page's prose live?

This is the one structural gap. `ContentFile.kind` is an enumeration of exactly
`post` and `project` (U1 `entities.md`), and the content walk reads only
`content/posts/` and `content/projects/` (U1 BR1.1). About has prose and links,
and it is neither of those kinds — so nothing currently describes where its text
comes from or who owns it.

The choice matters more than its size suggests: it decides whether this site
grows a general "page" concept, and every option except one adds something to the
content model that U1 deliberately kept to two kinds.

A. **In the About template itself.** The prose is written directly into the
   template that renders it. No new kind, no new content directory, no change to
   the content model. Editing About means editing a template rather than writing
   Markdown, and a formatter that touches templates would touch this prose.
B. **`content/about.md`, a third kind.** About is authored like a post, in
   Markdown, and `kind` gains a third value used by exactly one file. The content
   model grows by one value; the author edits prose in the place they edit all
   other prose.
C. **`content/pages/<slug>/index.md`, a generic `page` kind.** About is the first
   of a family — a future Uses, Colophon, or Now page needs no new work. It also
   builds a general capability for one current page, which is the kind of thing
   the scope's exclusions were written against.
D. **A Markdown file outside `content/`** — say `about.md` at the repository
   root — read only by the About template. `content/` stays exactly two kinds, the
   prose is still Markdown, and the content walk is untouched. The cost is one
   file that is content but does not live with the content.

[Answer]: A

X. Other (please specify)

---

## Consolidated Summary Confirmation

- **Q1 — About's prose**: written directly into the About template. No third
  `kind`, no new content directory, and no change to the content model U1
  established. The accepted cost is that editing About means editing a template
  rather than writing Markdown, and that a formatter configured for site code
  will reformat this prose.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
