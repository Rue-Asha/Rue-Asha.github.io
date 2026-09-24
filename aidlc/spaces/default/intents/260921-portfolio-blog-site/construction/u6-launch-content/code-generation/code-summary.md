# Code Summary — U6 Launch Content

Two Markdown files. No code, no template, no test, no configuration change, and
no instrumentable line. `functional-spec.md` resolved this unit's design as not
applicable and gave the reason; this stage is that conclusion carried into
Construction rather than quietly reversed.

**This file records two passes.** The second pass (§ Second pass, at the end) is
a verification pass: it wrote no file, and it corrects a false claim the first
pass made about the draft mark. The first pass's record below is kept unaltered
so the correction reads as a correction rather than as a rewrite of history.

---

# First pass — the files were written

## Files created

| Path | What |
|---|---|
| `content/projects/homelab/index.md` | Project write-up for the Proxmox homelab |
| `content/posts/implementing-a-methodology-paper/index.md` | Post about implementing AI-DLC as a harness |

Nothing else was created, modified, or deleted. The two content files U1 wrote —
`content/posts/building-this-site/index.md` and
`content/projects/rue-asha-github-io/index.md` — are untouched (U6CA6), as are
every template, stylesheet, build file and configuration file in the repository.

## Sourcing — every fact traces to a file on disk

Nothing about the author's experience, opinions or history was invented. Where a
source offered several framings, the draft picks one and leaves the rest for the
author to refine; where a fact was in neither source, it was not written.

| File | Source of fact |
|---|---|
| Homelab write-up | `/home/Rue/Repos/Homelab-Managment/README.md` and `docs/terraform-ansible-split.md` — the service list, the app-per-LXC two-repo model, the Terraform/Ansible boundary and the three reasons Terraform replaced the Ansible provisioning layer, the `NN_` playbook ordering, the `.envrc`/`ANSIBLE_CONFIG` detail, and the three-command run example |
| AI-DLC post | `/home/Rue/Repos/AI-DLC-BLOG-NOTES.md` — the author's own notes, labelled "raw material for a later post": the premise, the SPA/PDF indirection, the room-versus-one-person framing, the Bolt and PRFAQ audits, the traceability-direction mistake, the fail-open hook, and the closing scope caveat |

Two facts were checked against the repository rather than taken from prose: the
Homelab remote URL (`git remote -v`) and its `year: 2026` (first commit
2026-08-03).

## Key decisions

**Both slugs are permanent from the moment they are pushed** (NFR8, U1 BR1.4).
`homelab` was not a free choice — `/home/Rue/Repos/Homelab-Managment/README.md`
already links readers to `rue-asha.github.io/projects/homelab/`, and the built
output confirms the page lands at exactly `/projects/homelab/`. Using any other
name would publish a broken link in a repository that is already public.
`implementing-a-methodology-paper` was chosen for what the post is about rather
than for the acronym, because acronyms age and the URL cannot be changed.

**The Homelab project omits the optional `liveUrl`** (U6CA1). A private home
network has no public URL, and U1 BR3.5 specifies that an absent `liveUrl` omits
the rail row entirely rather than rendering it empty. Verified against the built
page: `dist/projects/homelab/index.html` carries `Year`, `Type`, `Tools` and
`Repo` rows and no `Live` row.

**`featured` was not set on the new project.** It is optional and defaults to
false (U1 BR3.6), it affects ordering only, and the approved plan says nothing
about it. Setting it would have reordered the Projects list on a decision this
stage was not asked to make.

**The post carries no fenced code block.** The one structural illustration it
needs — the five-gate chain — is an indented block, which has no language label
at all and therefore cannot trip U2 BR8.2. The Homelab write-up's single fence is
labelled `sh`, confirmed present in the highlighter's bundled grammar set before
the build was run. Neither file references an image, so U2 BR8.1 has nothing to
apply to.

## The word "draft", and what it does not mean here

The author asked for a "draft entry" and a "draft post", and the approved plan
adds no `draft` field. That is what was done, and it is worth being precise about
why, because the reason stated in `code-generation-questions.md` is not quite
accurate and a later reader would trip over it.

That file says "There is no draft state." The content model does in fact carry
one: U1 BR1.6 and BR1.7 are implemented in `src/content-source.ts`, which reads
an optional boolean `draft` key and drops every draft before anything downstream
sees it. So a hidden state was available.

It was still correct not to use it, for the reason the plan gives rather than the
one the questions file gives: these files are drafts *of prose*, not files to be
hidden. Nothing publishes until the author pushes, so they sit in the working
tree — which is exactly where refining happens — and adding `draft: true` would
have made the plan's Step 10 unverifiable, since a hidden item produces no page
to check. **If the author wants either file held back from a push, adding
`draft: true` to its front matter is all that is required; no code change is
involved.** This is recorded as an observation about an upstream artifact, not as
a deviation from the plan.

## Verification

Test methodology for this unit is **test-after** per the approved Testing
Contract, and no testable layer applies, so no test was authored. Steps 7 to 9
are this unit's verification.

| Step | Command | Result |
|---|---|---|
| 7 | `npm run build` | exit 0 — "Built 11 pages into dist/ (4 from content files)" |
| 7 | `npm run check` | exit 0 — all three blocking checks pass |
| 8 | `npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5 --coverage` | exit 0 — 22 files, 151 tests, all passing |
| 9 | `npm run format:check` | exit 0 |
| 10 | Built output inspected | Both pages present and linked from the right lists |

The three blocking checks are the verification that matters here, and check 2 —
every content file produced an output page — is the one this unit most directly
exercises. The build reported 4 pages from content files where before it reported
2, which is the pass condition stated a different way.

On Step 9: Prettier did not reformat either file and could not have.
`npx prettier --file-info content/projects/homelab/index.md` reports
`"ignored": true` — the `.prettierignore` entry for `content/` excludes the whole
tree, exactly as `team.md` § Code Style requires. The check therefore passes by
exclusion rather than by the files happening to conform, which is the stronger
outcome.

On Step 10: `/writing/implementing-a-methodology-paper/` is linked from both
`dist/index.html` and `dist/writing/index.html`; `/projects/homelab/` is linked
from both `dist/index.html` and `dist/projects/index.html`.

## Test coverage

```
N/A — no instrumentable lines in this unit
```

Recorded with that reason rather than as a pass, per `team.md` § Testing Posture,
which is explicit that zero instrumentable lines produces no measurement rather
than a passing figure. The reason is that this unit's entire deliverable is
Markdown prose: no function, no branch, no transformation.

`vitest.config.ts`'s `thresholds.lines: 80` was not touched, and no existing test
was changed. The suite's measured line coverage is 96.22% across the five earlier
units, unmoved by this unit's two files.

## Deviations from the plan

None. Steps 1 through 11 were executed in order as written.

Two things worth flagging that are not deviations:

- The `draft` observation above — an inaccuracy in
  `code-generation-questions.md`, not in the plan, and the plan's instruction was
  followed exactly.
- The post's URL segment is `/writing/<slug>/`, not `/posts/<slug>/`. That is
  U2's routing, unchanged by this unit; the slug itself is what NFR8 makes
  permanent and it is what the plan specified.

## What was not done, and is the author's

- **The prose is a first pass.** That was the instruction, and refining it is the
  author's work. Nothing automated checks whether either file is accurate or any
  good.
- **The keyboard walkthrough** was not re-run. No page type's layout or styling
  changed — these are two instances of page types U2 and U3 already built and
  walked through — so `team.md`'s trigger for a walkthrough did not fire.
- **Outbound links are unchecked**, by choice: `team.md` makes external links
  never build-blocking. The Homelab write-up carries the repository URL and the
  post carries none.
- **Nothing is committed or pushed.** These files sit in the working tree, which
  is where a draft belongs.

---

# Second pass — verification, and one correction

The stage gate was rejected so that every Code Generation unit rendering UI could
be re-entered with the design reference consulted at build time. **U6 renders no
UI and is exempt from that check** (below). What the re-entry actually produced is
a correction to something the first pass got wrong about the draft mark.

**This pass wrote no file.** Both content files were already correct against every
step; nothing needed changing, so `source-manifest.json` records an empty `writes`
array. That is the honest record for a verification-only pass, not a gap in it.

## What changed since the first pass, and why re-verification was worth doing

U5's stylesheet landed after both content files were written. The point of
re-running the whole check set is that these two files are now rendered by a
page-type treatment that did not exist when they were authored. Nothing broke.

The test suite also grew from 151 tests to 160 between the two passes. That is
U5's work, not this unit's; U6 added no test and changed none.

## The Mobbin exemption, and its reason

`project.md` § Corrections requires a Mobbin consultation before Plan Approval for
any Code Generation unit that renders UI, and exempts a unit that renders none.
**U6 renders none.** Its entire deliverable is two Markdown files: no template, no
component, no stylesheet, no build code, no configuration. `unit-of-work.md` § U6
leaves the unit's `kind` untagged rather than calling it `ui` for exactly this
reason — none of `service`, `spec`, `ui`, `packaging` or `library` describes
written content.

The page types this content appears on are U1's, U2's and U3's templates styled by
U5, and each was checked against real references during that unit's own re-entry.
Repeating the check here would attribute another unit's design work to this one
and produce findings nobody here could act on.

Recorded rather than silently omitted: an absence with a stated reason is
readable, and an absence without one looks like a skipped step.

## The `draft` correction, and its outcome

`code-generation-questions.md` asserted **"There is no draft state."** That is
false, and both files shipped on that premise.

`src/content-source.ts` implements U1 BR1.6 and BR1.7. `readDraftMark` (line 142)
reads an optional boolean `draft` key; a non-boolean value is a hard field error
rather than a coerced one; and every draft is dropped before anything downstream
sees it (line 321). Required fields are validated *before* the mark is read, so a
malformed draft is still a build failure naming the file and the field.

The first pass's own § The word "draft" section had already noticed the mechanism
existed and said so — but it reasoned from a premise the questions file had stated
wrongly, which left the decision resting on an argument about verifiability rather
than on a choice.

**[Q2] answer B settles it: both pieces stay published.** The reason is that this
unit's deliverable is a site that does not look empty at launch, and these are the
only substantial content it has. "Draft" means the prose is a first pass, which
the author refines in place. This is now recorded as **U6CA7** — a decision with a
reason, rather than a consequence of a mechanism believed absent.

Nothing follows from the correction mechanically: the outcome is the same front
matter as before, and no file was edited. What changed is that it is now a
decision anyone can check.

If the author does want either piece held back from a push, adding `draft: true`
to its front matter is the whole of it; no code change is involved, and removing
the key publishes the page again.

## Step A1 — neither file carries a `draft` key

Confirmed by inspection. Neither front matter block carries the key, and nothing
else in either file was touched.

| File | Front-matter keys present |
|---|---|
| `content/projects/homelab/index.md` | `name`, `summary`, `year`, `type`, `tools`, `repo` |
| `content/posts/implementing-a-methodology-paper/index.md` | `title`, `summary`, `date` |

The project omits the optional `liveUrl` (U6CA1); the post's three keys are its
full required set. No `draft` key on either. **No change was required.**

## Step A2 — the three blocking checks, verbatim

```
$ npm run build
npm notice run rue-asha-github-io@1.0.0 build
npm notice run node --import tsx bin/build.ts
Built 11 pages into dist/ (4 from content files).
EXIT: 0
```

```
$ node --import tsx bin/check.ts
1. The site builds ......................... pass
2. Every content file produced a page ...... pass
3. Internal links resolve .................. pass

All three checks passed.
EXIT: 0
```

Check 2 is the one this unit most directly exercises, and it is the whole of this
unit's automated verification: four pages from content files, which is both of
U1's plus both of U6's. A build that had silently dropped either file would report
3 here and fail the check.

Check 1 is also the content-model validator. U1 BR4.2–BR4.4 make a missing or
malformed field a build failure naming the file and the field, so the build passing
is the assertion that both files satisfy FR2.5 and FR3.3 — no separate check needed.
It is likewise what enforces U2 BR8.2: the Homelab write-up's one labelled fence
(`sh`) and the post's single indented block (no fence label at all) both survive it.

## Step A3 — the existing suite and the four non-writing checks, verbatim

```
$ npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 tests/u5
 RUN  v5.0.1 /home/Rue/Repos/Rue-Asha.github.io


 Test Files  22 passed (22)
      Tests  160 passed (160)
   Start at  21:36:21
   Duration  1.05s (tests 45%, import 31%, transform 22%, worker 2%)
EXIT: 0
```

```
$ npx tsc --noEmit
EXIT: 0
```

(No output. The repository's `npx` runs through an npm script shim which prints
its own `npm notice run` lines ahead of the command; those are the wrapper's, not
the tool's, and are omitted here for every command but the build.)

```
$ npx eslint .
EXIT: 0
```

```
$ npx prettier --check .
Checking formatting...
All matched files use Prettier code style!
EXIT: 0
```

**No test was added, no test was changed, and `vitest.config.ts` was not touched.**

**Prettier did not want to rewrite either content file, and could not have:**

```
$ npx prettier --file-info content/projects/homelab/index.md
{ "ignored": true, "inferredParser": null }

$ npx prettier --file-info content/posts/implementing-a-methodology-paper/index.md
{ "ignored": true, "inferredParser": null }
```

The `.prettierignore` entry for `content/` excludes the whole tree, so the check
passes by exclusion rather than by the files happening to conform — the stronger
outcome, and exactly what `team.md` § Code Style requires ("the formatter formats
site code only; it never touches the text of a post"). There is no finding against
the configuration here.

## Step A4 — both pages are where they should be

Built output, nine pages:

```
dist/404.html
dist/about/index.html
dist/index.html
dist/projects/homelab/index.html
dist/projects/index.html
dist/projects/rue-asha-github-io/index.html
dist/writing/building-this-site/index.html
dist/writing/implementing-a-methodology-paper/index.html
dist/writing/index.html
```

| Page | Permanent slug | Linked from |
|---|---|---|
| Homelab project | `/projects/homelab/` | `dist/index.html`, `dist/projects/index.html` |
| AI-DLC post | `/writing/implementing-a-methodology-paper/` | `dist/index.html`, `dist/writing/index.html` |

Both slugs are unchanged from the first pass, which is what NFR8 requires: they
were chosen once, deliberately, and this pass renames neither. `homelab` in
particular is fixed by a link the Homelab-Managment README already publishes.

**The Homelab rail omits the live-URL row rather than rendering it empty**
(U6CA1, U1 BR3.5):

```
$ grep -oE '<dt[^>]*>[^<]*</dt>' dist/projects/homelab/index.html
<dt>Year</dt>
<dt>Type</dt>
<dt>Tools</dt>
<dt>Repo</dt>

$ grep -c 'Live' dist/projects/homelab/index.html
0
```

Four rows, no `Live` row, and no empty `<dd></dd>`. The check is not vacuous: the
omission is a real branch with tests on both sides of it —
`tests/u1/page-renderer.test.ts:311-314` and `tests/u3/page-renderer.test.ts:52,62`
assert that a project *with* a live URL renders `<dt>Live</dt>` and one without
renders neither the row nor an empty cell.

## Test coverage — second pass

```
N/A — no instrumentable lines in this unit
```

Recorded with that reason and **never as a pass**, per `team.md` § Testing Posture,
which is explicit that zero instrumentable lines produces no measurement rather
than a passing figure. The reason is that this unit's entire deliverable is
Markdown prose: no function, no branch, no transformation.

No coverage command was run for this unit and no coverage figure is reported for
it. `vitest.config.ts`'s `thresholds.lines: 80` was not touched.

## Deviations from the plan — second pass

None. Steps A1 through A5 were executed in order as written.

## Findings

**One, and it is about an upstream artifact rather than this unit's files.**
`code-generation-questions.md` stated "There is no draft state", which is false —
`src/content-source.ts` has implemented U1 BR1.6/BR1.7 the whole time. The
questions file is corrected and [Q2] answer B records the decision that follows
(U6CA7). Nothing in either content file changed as a result.

No finding against the Prettier configuration: it does not want to touch either
content file, and the exclusion is explicit rather than incidental.

## What is still the author's, and unchanged by this pass

- **The prose is a first pass.** Nothing automated checks whether either file is
  accurate or any good. Refining it in place is the author's work, and [Q2] answer
  B means it happens on a published page rather than behind a draft mark.
- **The keyboard walkthrough was not re-run by this unit.** U5's styling did
  change the layout of these page types, which is `team.md`'s trigger — but the
  trigger is per *page type*, and the page types are U2's and U3's. The
  walkthrough belongs to the unit that changed them, not to two new instances of
  them.
- **Outbound links are unchecked**, by choice: `team.md` makes external links
  never build-blocking. The Homelab write-up carries the repository URL; the post
  carries none.
- **Nothing is committed or pushed.**
