# Code Generation Questions — U6 Launch Content

One question, and it is the only one this unit could have: what the launch
content says. Everything structural was settled by U1 to U5, and
`functional-spec.md` resolved this unit's design as not applicable for that
reason.

## What was subtracted, and what settled it

| Topic | Settled by |
|---|---|
| Where a post and a project file live | U1 BR1.2–BR1.4 — `content/posts/<slug>/index.md`, `content/projects/<slug>/index.md` |
| Which fields a post requires | U1 BR2.1–BR2.3, from FR2.5 — `title`, one-line summary, `date` |
| Which fields a project requires | U1 BR3.1–BR3.4, from FR3.3 — `name`, summary, `year`, `type`, `tools`, `repo`; live URL optional, and the rail row is omitted when absent |
| Date format | U1 BR2.3 — ISO 8601 calendar date, strictly parsed |
| What a missing or malformed field does | U1 BR4.2–BR4.4 — fails the build, naming file and field |
| Slug rules, and that a published slug never changes | U1 BR1.4, from NFR8 — lowercase kebab-case ASCII, the directory name is the URL |
| That images carry alt text | U2 BR8.1 |
| That a labelled code fence naming an unknown language fails the build | U2 BR8.2 |
| How content reaches the site | `team.md` § Way of Working — straight to `main`, no branch, but the three blocking checks still run before the push |
| Whether this unit needs a functional design, unit tests, or a coverage measurement | `functional-spec.md` — not applicable, with the reason. U6 contains no code, no branching and no transformation |

---

## Questions

### Q1 — What should the launch content be?

The site currently carries one post ("Building this site") and one project
("This site"), both written during U1. `unit-of-work.md` § U6 sets the target at
one or two posts and one or two project write-ups, so the site does not look
empty at launch.

Nothing here may be invented: a post is the author's own writing and a project
write-up describes a real repository.

- A. **Write-ups drawn from the author's real repositories** — read each repo and
  write from what is actually there.
- B. **Ship what already exists** and add more later in the author's own voice.
- C. **The author supplies the content** and it is placed with valid front matter.
- X. Other (please specify)

[Answer]: X — "I would like to make draft entry for my Homelab Project and a
Draft Post about aidlc and later refine them"

That is a specific instance of A, narrowed to two named pieces:

1. A **project write-up for the Homelab project**, drawn from
   `/home/Rue/Repos/Homelab-Managment` — its README, its Terraform/Ansible
   split, and the services it configures.
2. A **post about AI-DLC**, drawn from the author's own notes at
   `/home/Rue/Repos/AI-DLC-BLOG-NOTES.md`, which are explicitly labelled "raw
   material for a later post".

Both are **drafts the author refines afterwards**. That instruction is recorded
rather than smoothed away, because it changes how the prose is written: a first
pass with the structure and the real facts in place, in the author's register,
rather than a finished piece.

#### A caveat that followed from the content model — and was FACTUALLY WRONG

The first pass recorded here that **"there is no draft state"**, reasoning that
`entities.md` gives a post three required fields and a project six, none of them
a `draft` flag, and that `ContentSource` walks every file it finds.

**That claim is false and is corrected below rather than left standing**, because
it was the premise for how this unit shipped and because a later reader would
have relied on it. See [Q2].

The Homelab README already links to `rue-asha.github.io/projects/homelab/`, so
that slug is fixed by an external reference and is used verbatim. That part of
the original caveat is correct and stands.

---

### Q2 — The draft mechanism exists. How should U6's two pieces ship?

**The correction.** `src/content-source.ts` implements U1 BR1.6 and BR1.7: it
reads an **optional boolean `draft` key** from front matter (`readDraftMark`,
line 142), treats a non-boolean value as a hard field error rather than coercing
it, and **drops every draft before anything downstream sees it** (line 321).
Required fields are validated before the draft mark is read, so a malformed
draft is still an error; slug uniqueness is checked after drafts are dropped.

So the mechanism the first pass said did not exist has been in the codebase since
U1, and no change to U1's content model would have been needed to use it. The
author's [Q1] answer — *"I would like to make draft entry ... and later refine
them"* — could have been honoured literally.

Against that, `unit-of-work.md` § U6 states this unit's deliverable as "a site
that does not look empty at launch", and these two pieces are the only
substantial content the site has beyond U1's two placeholders. `draft: true`
would hide both.

- A. **Mark both as drafts** — `draft: true` on each; neither appears live until
  the flag is removed.
- B. **Keep both published** and refine the prose in place.
- C. **Draft the post, publish the project** — the Homelab write-up is drawn from
  a real README and holds up; the post is built from raw notes.
- X. Other (please specify)

[Answer]: B

So "draft" stays a description of the prose — a first pass the author refines —
and not a state of the file. Both pieces remain live. **The correction above
still stands on its own**: the reason is now the unit's launch purpose and an
explicit choice, not a mechanism that was believed to be absent.

`U6CA7` records the consequence: no `draft` key is written into either file, by
decision rather than by impossibility.

---

## How these were asked

The plan-approval guard refuses every shell command for this stage — including
the `aidlc-log` decision/answer pair — until Plan Approval is explicitly
answered. A logged interview checkpoint therefore cannot exist before Plan
Approval, so the question above was put directly and its answer written here,
exactly as in U1–U5. Plan Approval remains the audited human checkpoint.

---

## Assumptions carried into the plan

| ID | Assumption | Basis |
|---|---|---|
| U6CA1 | The Homelab project has no public live URL — it is a private home network. The optional live-URL field is therefore omitted, and the rail row is omitted with it rather than rendered empty. | `wireframes.md` § Project, carried into U1 BR3.4. |
| U6CA2 | The Homelab project's slug is `homelab`, because its README already publishes that URL. | NFR8 — a published slug never changes, so an existing external reference fixes it. |
| U6CA3 | The AI-DLC post's slug is `implementing-a-methodology-paper`, chosen for what the post is about rather than for the acronym, since the slug is permanent. | NFR8, U1 BR1.4. |
| U6CA4 | The post's `date` is the date the file is written, in ISO 8601. Post ordering reads the declared date, never file mtime. | U1 BR2.3; `team.md` § Code Style. |
| U6CA5 | Neither file needs a presentation capability the layout lacks — no callout, no side-by-side pair, no diagram wrapper. | U6A1; anything else would be a change to U2's templates rather than content work. |
| U6CA6 | The existing "Building this site" post and "This site" project stay exactly as they are. This unit adds; it does not rewrite U1's content. | `unit-of-work.md` § U6 — content files only. |
| U6CA7 | Neither file carries a `draft` key. The mechanism exists (U1 BR1.6/BR1.7) and was deliberately not used, because this unit's deliverable is a site that does not look empty at launch. | [Q2] answer B. |

---

## Re-entry pass — the Mobbin consultation does not apply here

The stage gate covering every unit was rejected so that each unit which renders
UI is re-entered with the design reference consulted at build time:

> Consult Mobbin before Plan Approval for any Code Generation unit that renders
> UI, and name in the plan which page types were checked and against which
> references. **A unit that renders no UI is exempt.**
> — `project.md` § Corrections (learned 2026-09-24)

**U6 is exempt, by the rule's own terms.** It produces two Markdown files and
nothing else: no template, no component, no stylesheet, no build code, no
configuration. `unit-of-work.md` § U6 records it as untagged rather than `ui`
precisely because "none of `service`, `spec`, `ui`, `packaging` or `library`
describes written content". The page types this content is read on — Post,
Project, Writing, Projects, Home — are U2's, U3's and U1's templates styled by
U5, and every one of them was checked against real references in that unit's own
re-entry. Checking them again here would attribute another unit's design work to
this one.

**So no Mobbin section is invented for this unit**, and the exemption is written
down rather than left as a silent omission — an absence with a stated reason is
something a later reader can act on; an absence without one looks like a step
that was skipped.

What the re-entry did turn up is [Q2] above: a factual error in this file, found
by reading the code rather than a design reference. That correction is the real
content of this pass.

---

## Plan Approval

Approve this exact Code Generation plan?

[Approval Fingerprint]: sha256:v3:6009517e5c6acc87762e585e1b6adee343c64bac10333837fa955a3bb032cc6b
[Planned Source]: 159cd86399d670e992e1b08c5e7f0b13f84be4a145393447a36af5a2b745fb0e

- Approve Plan
- Request Changes

[Answer]: Approve Plan
