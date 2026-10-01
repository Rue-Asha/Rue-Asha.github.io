---
title: The harness proves, the human judges
summary: Designing flow, a development workflow for one person, by moving everything I was approving into something a machine can check.
date: 2026-10-01
---

`flow` is a development workflow for one person working with AI agents — a
Claude Code skill, designed and written in one day, that wraps OpenSpec and adds
the parts I found missing on either side of it.

It has not been piloted yet. Everything below is a design that has been run
against a scratch repository and read against my real ones, not one that has
shipped a feature.

## Why AI-DLC was slow

This site was built with AI-DLC. In this repository it is 33 stages, 14 role
agents, and 240 files — 5.7 MB — of artifacts, for 14 commits.

The tempting conclusion is that it simply has too many stages. I think the real
diagnosis is narrower: **AI-DLC is slow because it uses human approvals where
verification is missing.** In a team, an approval is a second pair of eyes.
Alone, I approve my own work, and that is ceremony with nobody behind it.

Turned around, it becomes a design rule. Everything the harness can prove
deterministically is one approval the process no longer needs.

The second input was Raihan Alam's talk
[Minimum Viable Harness](https://ra1han.github.io/minimum-viable-harness/talks/introduction-deck.html):
understand, run, prove, learn; sensors, gates, backpressure. Its list of failure
modes maps almost one to one onto what I wanted to fix — loops that keep getting
longer, false completion signals, session amnesia. And its example of a gate is
the one I keep in my head: an agent adds a non-null column, a gate intercepts the
commit, a sensor runs the migration as a dry run, backpressure blocks, and the
error goes straight back into the agent's context. Nobody was asked anything.

## The human gets three questions

The principle fits on one line: the harness proves, the human judges. I am asked
about scope, taste, and irreversible actions. Everything else goes to a sensor,
and the sensor's output goes back to an agent, not to me. Two of the skill's
guardrails say it in so many words:

> Never ask the user something a sensor can answer.
>
> Never report done without evidence from this session (command + exit status).

That only works if process and harness are kept apart. The harness belongs to
the repository — the commands that prove a change — and the skill only reads it,
from one section of the repository's `CLAUDE.md`:

```markdown
## Harness
- proof: `npm run proof`
- proof-full: `npm run proof:full`
- run: `npm run dev` → http://localhost:5173
- ship: ask
```

`proof` is fast — typecheck, build, unit tests — and runs after every task.
`proof-full` adds the end-to-end tests. Both have to print the name of every test
that passed, for a reason that comes up below. If a repository has no harness,
the skill does not invent one: establishing it becomes the first unit of work. It
is a section in `CLAUDE.md` rather than a file of its own because that was the
smallest thing that worked, and it can move later.

The other early fork was whether to replace OpenSpec or wrap it. OpenSpec already
does the middle well — proposal, spec, task plan — so `flow` wraps it. It adds a
front, triage, and an end, verification and learning, and it makes mandatory the
one step OpenSpec leaves optional.

## Triage decides how much process a change gets

In AI-DLC every change pays for the whole lifecycle, so the ceremony scales with
the method rather than with the risk. `flow` puts a switch in front of it. Before
anything else, the agent classifies the change and says so in one line:

    Triage: change — user-visible, one session. Appetite: one evening.

Four questions decide it. If user-visible behaviour changes, it is at least a
*change*. If it touches a schema, infrastructure, or anything irreversible, or
will probably take more than one session, it is a *feature*. Everything else — a
typo, styling, a refactor — is *trivial*, and trivial gets no artifact at all: a
branch, one builder, one commit, and `git log` is the record. I considered a
minimal artifact for trivial work and dropped it. A record nothing reads is a
cost with no return.

Appetite comes from Shape Up. It is not an estimate but a budget: when a report
shows the work outgrowing it, the scope is renegotiated instead of the work
carrying on. And I can overrule the triage in one word, which the skill accepts
without arguing.

## A proof line binds every scenario to a test

Specs drift silently. In Party-Games, the change that added the duck game was
archived, and `openspec/specs/` still contains only `homepage` — the duck and
lobby capabilities were never synced. A stale spec is worse than none, because
the agent believes it.

So every scenario in a `flow` spec ends with a line naming its evidence:

```markdown
#### Scenario: Empty list
- **WHEN** the user exports with no items added
- **THEN** the export contains only the header row
- **proof:** unit
```

The options are `unit`, `e2e` or `manual (<reason>)`. `manual` is allowed, but
it has to say why. The test that proves a scenario is named `Scenario: <title>`,
so finding the evidence is a lookup rather than a judgement call.

My first idea was a custom OpenSpec schema with a `verification` artifact the
build would have to produce. OpenSpec 1.4.1 supports that experimentally, and in
a scratch repository the requirement really did block. It was still the wrong
tool: an artifact can only be demanded *before* the build, and the evidence only
exists *after* it. What remained is plain project configuration, and the proof
line passes `validate --strict` and survives archiving unchanged.

Test depth is risk-based, with no coverage target. Typecheck and build always;
unit tests for pure logic, which agents write well; one smoke end-to-end test per
main flow; and screenshots that a human judges. A repository that adopts `flow`
late gets no test backfill. Its tests grow with each change, through the proof
lines.

## The main session only orchestrates

The session I talk to holds my context, the gates, and short reports from
agents. Every unit of work — planning, building, verifying, reviewing, fixing,
closing — runs in a subagent. The main session does not read source files,
diffs or full test output, only the last lines of `proof`. There are two
exceptions. It merges the unit branches and resolves conflicts itself, and scope
exploration stays with it, because that is a conversation with me.

The rule underneath is that nothing lives only in the main session. A decision
made at a gate is written into the artifacts before the next agent depends on it.
Briefs carry paths, not summaries — the OpenSpec artifacts *are* the handoff —
and every agent returns the same short format: status, summary, tasks, proof,
deviations, friction, needs-human.

That is also the answer to session amnesia. Every run starts with a script,
`flow-status`, that derives each change's phase and progress from the repository:
which artifacts exist, which boxes are ticked, which branches exist and what is
unmerged on them. The only things recorded rather than derived are decisions —
the triage, gate approvals, learning candidates — in a small `flow.yaml` beside
the change. Any new session picks up where the last one stopped.

Run read-only against my repositories, it justified a limit of two active changes
straight away. The homelab repository had three in flight at once, and
Party-Games had two that were complete and never archived.

## Builds run in waves

The planner cuts the task list into units, and each unit gets one annotation line
under its heading:

    ## 2. Timer UI
    > unit: depends=1 · files=src/lib/Timer.svelte, src/routes/imposter/+page.svelte

OpenSpec only counts the checkboxes, so the line is invisible to it. The
dependencies form a graph, which is sorted into waves of at most three builders,
and units in the same wave own disjoint files. When several units share an
interface, unit 1 is a *contract unit*: it creates only the types and stubs that
typecheck, and everything that uses them can then run in parallel.

I considered builders that start at once and wait for their dependencies
mid-run, and rejected it. A subagent cannot wait for an event; it can only stop
and be resumed, and by then its branch would be missing the dependency's work.
Finer units with the contract first get the same speed without that problem.

Each unit gets its own branch and worktree, with its own port for the end-to-end
server. Its builder commits per task, once `proof` is green. The main session
merges in unit order and runs `proof-full` after every wave. A text conflict it
resolves; a design conflict — two units that chose different behaviour — comes
to me. Commits are allowed inside `flow`, pushing is not, and nothing is ever
committed on the base branch. When the plan comes out as one unit per wave
anyway, that is reported as `serial: no independent units`: a normal outcome,
not a planning failure.

## Verification has three layers

The first is deterministic. `proof-full` passes or it does not, and red goes to a
fixer agent, not to me.

The second is spec coverage. For every scenario, the verifier looks up the test
named after it and checks that the name appears as *passed* in the output — which
is why the harness has to print names. A test that exists but did not run is not
wired into the harness, and it does not count.

| Scenario             | proof           | Evidence                                            |
| -------------------- | --------------- | --------------------------------------------------- |
| Basic export         | unit            | `src/export.test.ts` › "Scenario: Basic export" ✓   |
| Looks right on phone | manual (visual) | `shots/basic-export-mobile.png`                     |
| Empty list           | unit            | ✗ gap: no test named "Scenario: Empty list"         |

The third is a review by a subagent with no session context. It gets the paths
to the spec and the diff command and nothing else — no summary, because the point
is a reader who has not been primed by my reasoning. It looks for two things in
particular: *weakened tests*, where an agent made a red test green by changing
what it expects, and *weak tests*, new tests that would still pass if the
scenario's THEN were false.

The verifier and the reviewer only find; a separate fixer writes. Whoever writes
the evidence should not also be the one who grades it. If a constraint can be
expressed as a missing capability, it should not be expressed as a sentence. After three rounds
the change goes to the gate anyway, with "couldn't fix, here's why". A fixer that
closes a gap by downgrading a scenario to `manual` is called out separately at
the gate, so a downgrade never slips through.

This is the layer aimed at false completion. In Party-Games, a task reading "Run
`npm run build` (and lint/check if configured)" is ticked, with nothing anywhere
to show it ran.

The second gate shows that evidence, the diff, and the screenshots for me to
judge. It reads from a `verification.md` written into the change, so the gate
works from a later session too. Archiving then goes through the OpenSpec command
line rather than its skill, because only the command line syncs specs by
default — which, after the duck game, is the whole point.

## Learning, with a budget

Every agent report has a `friction` field, and every correction I make at a gate
is noted. Those are the candidates. An entry is kept only if it meets all four
criteria: it cost something, it cannot be derived from the code, the README or
the git log, it will happen again, and the fix has been verified.

Where it lands is ordered too. Best is a check or a script, so the harness
prevents the mistake and no text is needed. Only failing that does it become one
line in `CLAUDE.md`, and that section is capped at about fifteen entries — when
it is full, entries are consolidated before a new one goes in. A `CLAUDE.md` that
only grows makes agents worse. Learnings about the workflow itself go into the
skill's own file, so the process can improve itself. That file is still empty.

None of this asks me first. It appears at the second gate as one line,
`Learnings: +1 new, 1 updated`, which I can veto.
