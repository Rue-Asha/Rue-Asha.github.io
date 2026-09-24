# Code Generation Questions — U3 Projects

**No questions.** Construction questions are meant to be exceptional rather than
routine, and after subtracting everything the approved upstream artifacts settle,
nothing is left open for this unit. A count of zero is the correct outcome when
prior stages did their work; it is recorded here with what settled each topic so
it reads as that rather than as a gap.

## What was subtracted, and what settled it

| Topic | Settled by |
|---|---|
| Runtime, language, Markdown renderer, highlighter, front-matter parser, formatter, linter, test runner | U1 `code-generation-questions.md` [Q1], [Q2]; the stack is chosen and in the lockfile |
| Project ordering — the one thing `unit-of-work.md` § U3 flagged as this unit's to settle | `u3-projects/functional-design/functional-design-questions.md` [Q1] → BR9.3: one total order, `featured` first then year descending then slug, the same order Home uses |
| The metadata rail's row order, and what happens when `liveUrl` is absent | BR9.1; U1 BR3.5 — fixed order year, type, tools, repository, live; an absent live row is omitted entirely, never rendered empty |
| That a list row carries exactly two targets, and that the repository link is named for its project | BR9.2; `requirements.md` FR3.5, FR3.6 |
| What a list row contains, and that every project appears exactly once | BR9.4; FR3.1 |
| That the page carries a rail beside an author-chosen body | BR9.5; FR3.2 |
| The Projects empty state and its route to Writing | FR3.7; U1 BR5.5 |
| The six required project fields and their validation | U1 BR3.1–BR3.4; not reimplemented here |
| That external links are never checked on the publish path | `requirements.md` NFR11; W4 of the functional spec |
| How the outbound repository link reaches the 44px phone floor | Explicitly **not** this unit's: `functional-spec.md` § Sizing the second target settles it in U5 as BR11.1 |
| Every visual treatment — colour, spacing, the rail's layout, the outbound affordance's styling | U5's unit. This one emits structure and class names only |
| Test methodology, ordering, volume and the coverage floor | The Testing Contract in `code-generation-plan.md` (resolved, not chosen) |

## One thing found rather than asked

Reading U1's templates against BR9.1 to BR9.5 before writing the plan turned up a
defect that is not a decision and therefore is not a question: **the Projects page
skips a heading level.** Its `<h1>` is "Projects" and each row's project name is an
`<h3>`, with no `<h2>` between them.

It is stated here rather than asked because there is nothing to choose — a skipped
heading level is a defect against the accessibility bar `project.md` § Mandated
carries, not a preference. The plan's Step 1 fixes it, and the Plan Approval gate
below is where that fix is accepted or rejected like any other planned change.

Worth noting what this says about the check set: **nothing in this repository
would ever have reported it.** `team.md` § Testing Posture records that heading
order is one of the things the declined automated accessibility scan was good at,
and that without the scan it is "a design-review responsibility and a walkthrough
observation, or it is nobody's". This is that, happening.

---

## Second pass — the Mobbin re-entry

Everything above is from the first pass. It is answered, still binding, and is
not re-asked.

Nothing new was asked for this pass. The re-entry has one instruction — consult
Mobbin before Plan Approval for any unit that renders UI, and name in the plan
which page types were checked against which references (`project.md`
§ Corrections). For this unit the check confirmed the index row against Slack's
tool index and the rail against Harvest's case-study rail, and turned up one
markup gap: `mockups.md` § Project draws the rail's tools stacked one per line,
while `renderProject` emits them joined by a literal middle dot in a single
`<dd>`. That is not an open question — the mockup already decided it, and the
only reason it survived is that no stylesheet can split one `<dd>`, so U5 could
not reach it.

The two patterns the references show that this site does not use — project
thumbnails, and a left-rail list layout — are findings for the approval gate
rather than questions, because each is a design and scope decision the human
owns and neither can be settled in code.

---

## Plan Approval

Approve this exact Code Generation plan?

[Approval Fingerprint]: sha256:v3:d95a8c535e8db104bd0eb541cb1f43bc90fe4322f0adc70e2156d0a7d29c15e1
[Planned Source]: 3c5325f786f1ead6d4ef307ba6c679ae6768f009a6b5163a93f5f7f5ff0874d1

- Approve Plan
- Request Changes

[Answer]: Approve Plan
