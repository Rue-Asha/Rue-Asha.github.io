# Refined Mockups — Questions

Seven questions, all about **visual style** — colour, type, spacing, overall
feel. That is precisely what Ideation carried into this stage as a directive:
"Refined Mockups revisits the visual style — colour, type, spacing, overall
feel. The page layouts and the Mobbin patterns already chosen are not in
question" (`ideation/approval-handoff/initiative-brief.md` § Open Items Handed
to Inception).

So nothing here reopens layout. The page inventory, the global shell, the
metadata rail, the two-ends "All posts" link, the flat one-click structure, the
five screen states, the WCAG 2.1 AA keyboard bar, and the desktop-resolved /
phone-contraction rule are all settled and are not re-asked.

**A cost that applies to every answer below.** No page of this site may load
anything from a third-party server (`inception/requirements-analysis/requirements.md`
NFR3, NFR4). Every typeface is therefore a font file committed to this
repository and served from it — there is no Google Fonts option. Each family and
each weight is bytes the reader downloads and a file the author maintains.

**A second cost, specific to colour.** The automated accessibility scan was
offered at Practices Discovery and declined
(`inception/practices-discovery/team-practices.md` § Testing Posture). Colour
contrast is the thing that scan was best at, and nothing now checks it. Every
colour decision below is therefore verified by hand at design review or by
nobody — which is why the options say what each one obliges you to check.

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/rough-mockups/wireframes.md` — the page frames, accessibility notes, and responsive table this stage dresses
- [upstream] `ideation/rough-mockups/user-flow.md` — the four flows and the keyboard flow the styling must not break
- [upstream] `inception/requirements-analysis/requirements.md` — NFR1 to NFR12, and the FR set the pages must still satisfy
- [upstream] `inception/practices-discovery/team-practices.md` — the declined scan, the keyboard walkthrough, and the code-style rules that shape includes
- [mobbin] Mobbin references consulted for this stage, listed under "Mobbin references consulted" below

---

## Mobbin references consulted

Searched for this stage, on the web platform, before writing the questions.

| Reference | What it shows | Link |
|---|---|---|
| Substack reading page | Serif display title, one-line dek, small-caps byline and date, narrow measure, warm near-white | [screen](https://mobbin.com/screens/748e369a-1f0e-444f-a010-dd66dafd23bb) |
| Substack archive | Typographic post list, title over one-line summary, date beneath, hairline rules between rows, month dividers | [screen](https://mobbin.com/screens/ab559473-d1dd-44d4-8332-9679d2a363a0) |
| Julienne article | Large serif title centred over a narrow measure, muted grey body, a light/dark toggle in the header | [screen](https://mobbin.com/screens/55efafcc-c31a-40fc-941b-20db82a4ea56) |
| Mintlify docs | One sans family, near-black on white, monospace reserved for inline code and config names, boxed card | [screen](https://mobbin.com/screens/f5b84a31-9145-44d3-a766-39ff4d372181) |
| Visual Electric changelog | Dark surface, dates set in monospace in an accent colour, sans headings and body | [screen](https://mobbin.com/screens/e9bc8680-1b38-414a-8abe-0866671078a6) |
| GitBook changelog | Dark docs shell with a light content column — the hybrid that needs two palettes checked | [screen](https://mobbin.com/screens/9d4c368b-f719-442d-8bb6-95af4b1a04d0) |
| Canny changelog | Date in a left column against the entry, light surface, heavy reliance on hairline rules | [screen](https://mobbin.com/screens/32a827a7-bbaf-4184-942d-d52462742365) |
| Notion page | Sans throughout, tight leading, accent used only on links | [screen](https://mobbin.com/screens/aedea57f-f35d-4fc7-93f3-0a9b5bed5f42) |
| Ghost theme gallery | What a stock blog theme looks like, for contrast with a considered one | [screen](https://mobbin.com/screens/340daca2-4989-4e60-91f2-cfc0737139ef) |
| Lovable portfolio | The generated-portfolio look: oversized hero sentence, pill buttons, coloured word emphasis | [screen](https://mobbin.com/screens/b91e60c7-0628-4960-9ade-2013ee19f484) |

---

## Q1 — The overall feel

This is the question the other six hang off. The wireframes already chose the
patterns; this chooses what they look like.

A. **Quiet editorial.** Reading comes first. A serif for titles and post
   headings, a sans for the body, a warm off-white page rather than pure white,
   a generous measure, plenty of air. Closest to the
   [Substack reading page](https://mobbin.com/screens/748e369a-1f0e-444f-a010-dd66dafd23bb)
   and the [Julienne article](https://mobbin.com/screens/55efafcc-c31a-40fc-941b-20db82a4ea56).
   Cost: two font families to self-host, and a serif that reads well at display
   size is the fussiest thing here to pick.

B. **Neutral technical.** One sans family, near-black on white, monospace
   reserved for code and for the project rail's labels, structure carried by
   hairline rules rather than by colour. Closest to the
   [Mintlify docs page](https://mobbin.com/screens/f5b84a31-9145-44d3-a766-39ff4d372181)
   and the [Substack archive list](https://mobbin.com/screens/ab559473-d1dd-44d4-8332-9679d2a363a0).
   Cost: the least of any option — two families at most, and it is the hardest
   to get wrong. It is also the most common look among developer sites, so it
   signals competence rather than personality.

C. **Mono-accented.** Sans body, but monospace used deliberately as a voice:
   dates, tools, years, the project rail's labels, section markers. Closest to
   the [Visual Electric changelog](https://mobbin.com/screens/e9bc8680-1b38-414a-8abe-0866671078a6).
   Cost: monospace is wide, so it forces tighter type sizes and eats horizontal
   room on a phone; and three families if the body sans and the title sans
   differ.

D. **Editorial with a technical spine** — A's reading page for posts, B's
   structure for the lists and the project rail, so the blog half reads like
   writing and the projects half reads like a spec sheet. Cost: two visual
   registers to keep coherent, which is the most work here, and the risk that
   the site reads as two sites.

X. Other (please specify)

[Answer]: D

---

## Q2 — Typefaces

Follows from Q1 but is worth answering separately, because the hosting decision
has a cost the direction does not.

A. **Self-host a chosen pairing.** Pick the families deliberately, commit the
   font files, subset them to the characters actually used. The site looks the
   same everywhere. Cost: roughly 30–120 KB per weight per family in the repo,
   and you maintain the files.

B. **System font stack only.** No font files at all — the site uses whatever
   the reader's OS provides. Zero bytes, zero maintenance, nothing to break.
   Cost: the site looks meaningfully different on macOS, Windows, and Android,
   and you do not control the serif at all if Q1 needs one.

C. **A hybrid: self-host one family, system stack for the rest.** Self-host
   only the one that carries the site's character — the title face — and let
   the body and monospace fall back to the system. Cost: one file set to
   maintain, and the body text still varies by platform.

D. **Self-host, but restricted to two weights total** across the whole site
   (for example regular and bold, no light, no semibold, no italics beyond what
   the body needs). Cost: some typographic range is simply unavailable; the
   payoff is the smallest self-hosted footprint that still looks deliberate.

X. Other (please specify)

[Answer]: C

---

## Q3 — Light, dark, or both

A. **Light only.** One palette to design and one to check for contrast. The
   site ignores a reader's dark-mode preference.

B. **Dark only.** One palette, and it suits the developer audience — see the
   [Visual Electric changelog](https://mobbin.com/screens/e9bc8680-1b38-414a-8abe-0866671078a6).
   Cost: long-form reading on dark is harder for many readers, and this site's
   main job is long-form reading.

C. **Both, following the reader's system setting**, with no control on the
   page. Uses `prefers-color-scheme` and needs no JavaScript at all, so it does
   not touch the serve-pages-complete rule. Cost: two palettes, both checked by
   hand for contrast, and a reader whose system setting does not match what they
   want has no way to override it.

D. **Both, with a toggle in the header**, as the
   [Julienne article](https://mobbin.com/screens/55efafcc-c31a-40fc-941b-20db82a4ea56)
   has. Cost: everything in C, plus a small script and a stored preference —
   the only JavaScript this site would carry, and one more focusable control in
   the keyboard walkthrough on all seven page types.

X. Other (please specify)

[Answer]: B

---

## Q4 — Accent colour, and where it is allowed

Where colour is used determines how much of it has to be contrast-checked by
hand, now that nothing checks it automatically.

A. **No accent at all.** Links are distinguished by underline and weight, not by
   colour. One text colour, one page colour, one rule colour. Checking is
   trivial and nothing can drift.

B. **One accent, links only.** A single colour used for links and for the focus
   ring, nowhere else. One contrast pair to verify (accent on page background,
   4.5:1), plus the focus ring against its surroundings (3:1).

C. **One accent, links plus small metadata** — dates, tool names, the "All
   posts" affordance — as the
   [Visual Electric changelog](https://mobbin.com/screens/e9bc8680-1b38-414a-8abe-0866671078a6)
   does with its dates. Cost: metadata is usually small text, so it needs the
   full 4.5:1 rather than the 3:1 large-text allowance, which rules out most
   pale accents.

D. **One accent used on surfaces too** — a filled button, a tinted project rail,
   a highlighted current nav item. Cost: every filled surface adds a text-on-
   accent pair to check, and this is the option most likely to age into looking
   like a template.

X. Other (please specify)

[Answer]: B

---

## Q5 — Spacing and density

A. **Generous.** Wide vertical rhythm, list rows well separated, large gaps
   between sections. Suits reading and a site with little content; looks
   deliberate when there are two posts, which is launch day.

B. **Compact.** Tight rows, small section gaps, more visible per screen. Suits a
   recruiter scanning quickly — and Flow 1 is built around exactly that reader
   (`ideation/rough-mockups/user-flow.md`). Cost: with two posts and two
   projects, a compact page can read as sparse rather than efficient.

C. **Generous on reading pages, compact on lists** — air in the Post and Project
   bodies, density in the Writing and Projects lists and on Home. Cost: two
   spacing scales to keep straight rather than one.

X. Other (please specify)

[Answer]: C

---

## Q6 — What a list row does under the cursor and under keyboard focus

The whole row is one link on the Writing and Projects lists
(`inception/requirements-analysis/requirements.md` FR2.3), and this is very
nearly the only interaction the site has. Focus must be visible on every
focusable element (NFR1), so the focus answer is not optional — only its form
is.

A. **Background tint on hover; a distinct outline ring on focus.** The two look
   different, which is correct: hover is a mouse affordance, focus is a
   keyboard position, and conflating them makes the keyboard state easy to miss.

B. **Title underline on hover; the same outline ring on focus.** Lighter touch,
   no surfaces to contrast-check, and it reads as a link rather than a button.

C. **The same treatment for both hover and focus** — whatever is chosen applies
   to each. Simplest to build; cost is that a keyboard user sees the same thing
   a mouse user sees, which is usually weaker than a dedicated focus ring.

X. Other (please specify)

[Answer]: A

---

## Q7 — Code blocks

Syntax colouring is applied when the site is built, not in the reader's browser
(`inception/requirements-analysis/requirements.md` FR2.7), so a theme has to be
chosen and its colours are then fixed in the output.

A. **A restrained theme** — three or four token colours at most (comments,
   strings, keywords, everything else plain), on a surface tinted slightly from
   the page. Comment colours are the usual contrast failure; a short palette is
   a short checking job.

B. **A full standard theme** (a well-known one adopted as-is, eight or more
   token colours). More useful for reading real code; cost is a long list of
   colours to contrast-check by hand, and it will likely clash with the Q4
   accent.

C. **No colouring at all** — plain monospace on a tinted surface. Nothing to
   check, nothing to clash, and it reverses the Q7 answer already recorded in
   requirements (FR2.7), so choosing it means that requirement changes too.

X. Other (please specify)

[Answer]: A

---

## Q8 — Follow-up: what the editorial register means on a dark-only site

Q1's chosen option described the editorial half by reference to option A, which
included "a warm off-white page". Q3 then chose dark only, which removes that
palette. So the editorial register now has to be carried by something else, and
which something is a real decision rather than a detail.

A. **One dark surface everywhere.** The editorial/technical split is carried by
   type and spacing alone — serif titles and a generous measure on Post and
   Project, sans with hairline rules and tighter rows on the lists and Home.
   One background colour to contrast-check, and the two registers still read
   apart because the type does the work.

B. **Reading pages sit on a lifted surface** — a step lighter than the page — so
   a post reads as a sheet you are reading on rather than as part of the shell.
   Cost: a second background, so every text and accent colour is checked against
   two surfaces instead of one.

C. **Reading pages take a warmer dark**, lists stay neutral dark. Cost: as B,
   plus warm-versus-neutral drift is easy to get wrong by eye and there is no
   automated check to catch it.

X. Other (please specify)

[Answer]: B

---

## Q9 — Follow-up: which face is the one you self-host

Q2's chosen option self-hosts exactly one family and takes the rest from the
system stack. Q1's chosen option needs both an editorial voice and a technical
one, so which of them gets the font file is not implied by either answer.

A. **The serif**, used for post and project titles and for post-body headings.
   The editorial half gets the deliberate voice; lists, body text, and code fall
   back to the system sans and system monospace.

B. **A distinctive sans**, used for everything the serif would not have covered
   — the shell, the lists, the rail, body text — with the system serif used for
   titles. The technical half gets the deliberate voice.

C. **The monospace**, used for the rail labels, dates, tools, and code, with
   system serif and system sans elsewhere. The spine gets the deliberate voice;
   this is the smallest visible change from a wholly-system site.

X. Other (please specify)

[Answer]: A

---

## Consolidated Summary Confirmation

- **Overall feel: editorial with a technical spine.** Post and Project read like
  writing; Writing, Projects, Home and the project rail read like a spec sheet.
  Two registers held together deliberately. [Q1]
- **Dark only.** One palette. No light mode, no toggle, no `prefers-color-scheme`
  branch — which also means no JavaScript anywhere on the site. [Q3]
- **Reading pages sit on a surface lifted one step from the shell**, which is
  what carries the editorial register now that the warm off-white is gone. [Q8]
- **One self-hosted family: the serif**, used for post and project titles and
  for headings inside a post body. Body text, lists, the rail and code take the
  system sans and system monospace stacks. [Q2], [Q9]
- **One accent colour, used for links and the focus ring only.** Nothing else is
  coloured. [Q4]
- **Generous spacing on reading pages, compact on lists.** Two spacing scales.
  [Q5]
- **List rows: background tint on hover, a distinct accent outline ring on
  focus** — deliberately different from each other. [Q6]
- **Code blocks: a restrained build-time theme**, three or four token colours on
  a tinted surface. [Q7]

Three consequences that follow from the combination rather than from any single
answer, and that the artifacts will be written to:

- **Contrast is now checked against two surfaces, not one.** Every text colour,
  the accent, and the focus ring are verified against both the shell dark and
  the lifted reading dark. That is the cost the lifted-surface option carried,
  and with no automated scan it is a design-review obligation.
- **"Compact" has a hard floor.** List rows stay at or above the 44px touch
  target at phone width (`inception/requirements-analysis/requirements.md`
  NFR7). Density may not go below it.
- **The serif is chosen for dark rendering.** Fine-stroke display serifs thin
  out and shimmer on dark backgrounds, and body text is set slightly lighter
  than pure white to avoid halation. This narrows which serifs are viable and is
  a selection criterion, not a preference.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
