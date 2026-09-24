# Functional Design Questions — U2 Blog

Two questions. U2 is a `ui` unit, so it produces the behavioural specification,
its traceability, and its component breakdown — the entity model and the business
rules were authored once by U1 and are not redefined here.

## What was subtracted, and what settled it

| Topic | Settled by |
|---|---|
| The `Post` entity, its required fields and their types | `construction/u1-publishable-site-shell/functional-design/entities.md` |
| Post ordering: declared date descending, ties by slug | U1 BR2.4; `requirements.md` FR2.2 |
| That a missing or unparseable field fails the build naming file and field | U1 BR2.1–BR2.3, BR4.2–BR4.4 |
| Draft exclusion from page, list, feed and sitemap | U1 BR1.6, BR1.7 |
| Where a post lives on disk and how its slug is derived | U1 BR1.2–BR1.4 ([Q2] of U1) |
| That each Writing row is one link target covering title, summary and date | `requirements.md` FR2.3 |
| "All posts" links at the top and the end of every post page | `requirements.md` FR2.8 |
| The Writing empty state and its route to Projects | `requirements.md` FR2.9; U1 BR5.5 |
| That syntax colouring happens at build time, never in the browser | `requirements.md` FR2.7; NFR2 |
| The four-token colour theme and that no token reuses the link accent | `inception/refined-mockups/interaction-spec.md` § Code Block |

---

## Q1 — What feed does the site publish, and how much of each post goes in it?

`requirements.md` FR5.1 requires "a feed (RSS or Atom) of posts, containing every
published post and no draft" — and deliberately leaves the choice between the two
formats open. The second half is not stated at all: whether a feed entry carries
the whole post or only its one-line summary. That decides whether someone can
read the site entirely inside a feed reader without ever loading a page.

A. **Atom, summary only.** Each entry carries title, date, link and the one-line
   summary. Atom has a stricter, better-specified date and identity model than
   RSS, which matters because dates are the ordering key here.
B. **Atom, full body.** The whole rendered post travels in the feed. Readers
   never need to load the page; the feed is large and the rendered HTML has to be
   escaped into it correctly.
C. **RSS 2.0, summary only.** The more widely recognised format; its date
   handling is looser and its identity model weaker.
D. **RSS 2.0, full body.** As C, with the whole post in each entry.

[Answer]: A

X. Other (please specify)

---

## Q2 — What happens when a code fence names a language the highlighter does not know?

FR2.6 requires code blocks to render, FR2.7 requires colouring to be applied at
build time. Neither says what to do when a post writes ` ```rustlang ` — a typo,
or a language the chosen highlighter has no grammar for. This is exactly the kind
of case the project's fail-loudly posture usually resolves one way and its
"writing must stay cheap" goal resolves the other, so it is worth deciding
deliberately rather than inheriting whatever the library does.

A. **Render the block plain and continue.** No colour, no warning, no failure. A
   typo costs colouring on one block and nothing else; nothing ever stops a post
   going live over a fence label.
B. **Fail the build, naming the file and the language.** Consistent with every
   other content fault on this site. A typo in a fence label blocks the push
   until it is fixed.
C. **Render plain and print a build warning.** Visible at the moment of the
   check run, not blocking. Warnings that never block are warnings that get
   scrolled past.
D. **Distinguish the two cases**: an unlabelled fence renders plain and silently,
   because that is a deliberate choice; a *labelled* fence naming an unknown
   language fails the build, because that is always a mistake.

[Answer]: D

X. Other (please specify)

---

## Consolidated Summary Confirmation

- **Q1 — Feed**: Atom, summary only. Each entry carries title, date, canonical
  link and the post's one-line summary; the body stays on the site.
- **Q2 — Unknown code-fence language**: an unlabelled fence renders plain and
  silently; a fence naming a language the highlighter has no grammar for fails
  the build, naming the file and the language.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
