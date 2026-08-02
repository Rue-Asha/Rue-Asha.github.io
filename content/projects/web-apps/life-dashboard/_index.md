---
title: Life Dashboard
date: 2026-07-31
type: docs
weight: 1
summary: 'A single self-hosted app for tasks, uni, notes and projects — built to replace a sprawling Notion workspace with something that survives a bad week.'
aliases:
  - /projects/life-dashboard/
---

|             |                                          |
| ----------- | ---------------------------------------- |
| **Status**  | Building — five modules in daily use      |
| **Started** | July 2026                                |
| **Architecture** | [The shared web-app stack]({{< relref ".." >}}) |
| **Scale**   | 5 modules live · 17 migrations · ~3,800 lines of TS/Svelte |
| **Source**  | Private repo                             |

The stack, deployment and threat model are the [shared ones]({{< relref ".." >}}). This page
covers only what this app decides differently.

## What it is

One self-hosted web app that holds tasks, university coursework, personal projects, notes
and a weekly study schedule. It runs on the homelab, reachable only from the LAN or over
VPN, and it replaced a Notion workspace that had grown past the point of being maintainable.

## Why it exists

The Notion setup worked until it didn't. Six domains spread across a dozen linked
databases meant that finding anything required remembering where I'd put it, and keeping
it accurate required daily maintenance I stopped doing within a month. A system that
demands upkeep to stay useful is a system you eventually abandon — and abandoning it
quietly is worse than not having it, because you keep half-trusting stale data.

So the constraint came first, before any feature: **two rituals, a morning glance and a
Sunday review, and nothing may demand more than that.** Every module has to earn its place
against that budget, and the ones that couldn't were cut rather than shipped thin.

Finances was the clearest case. The original plan folded in a budgeting app I'd written
earlier — "one thing has exactly one home" only holds if there isn't a second app owning a
domain. In practice the money side needed daily attention to stay accurate, which is
precisely the upkeep the two-ritual budget exists to refuse, and it would have been the one
module quietly rotting inside an app whose whole promise is that its data can be trusted.
So it was dropped from scope: a deliberate exception to "one home", taken because the
alternative was breaking the constraint that everything else depends on. The app it took
over the machine and database from still shapes one decision below.

## Key decisions

### Quotas, not clock times

**Chose:** study scheduling is modelled as order, duration and weekly quotas — never fixed
times of day as obligations. The schema has no column for "this happens at 09:00", and that
absence is deliberate rather than incidental.

**Because:** every previous attempt at a time-blocked schedule failed the same way. One
disrupted morning invalidates the whole day's blocks, the plan is visibly wrong by 10am,
and you stop looking at it. A weekly quota degrades gracefully instead: a missed session
is a number that's behind, not a plan that's broken.

**Trade-off:** useless if you need a schedule enforced against a clock — so hard
appointments are deliberately not this app's job at all. They live in a normal calendar,
outside the dashboard, and the two are not connected.

### A hand-written design system, no CSS framework

**Chose:** every component is mine. No Tailwind, no component library — just a token file
and hand-rolled CSS.

**Because:** the app has maybe fifteen distinct components, and a framework's value is
mostly in the hundredth. What it costs immediately is a defaults system I'd have to fight
every time the design wanted something specific — and this design is specific: near-black
ground, serif display type, and a small accent palette that carries meaning rather than
decoration.

**Trade-off:** slower to build and entirely mine to maintain. Fine at this size; it would
be a bad trade on anything with a second contributor. One rule survives from an earlier
version of the design that I since abandoned: state is always symbol *plus* word, never
colour alone, which stays the accessibility-correct answer regardless of the display.

### Date-prefixed migrations, so it could adopt an existing database in place

**Chose:** migration files are named with a date prefix rather than a plain incrementing
counter — the one place this app departs from the [shared migration convention]({{< relref ".." >}}).

**Because:** this app took over the machine and the database that previously ran the
budgeting app, which already had its own migration history with sequential numbers. Date
prefixes let new migrations sort correctly alongside entries already recorded, without
colliding with numbers the old scheme had used — so the existing database was adopted in
place rather than exported and rebuilt.

**Trade-off:** ordering within a single day depends on the counter after the date, and the
scheme only makes sense if you know the history. Which is exactly why it's written down
here. It also means the schema still carries the inherited budget tables, which nothing
reads now that finances is out of scope — migrated on every deploy and dead. That's the
standing cost of adopting a database rather than rebuilding it, and it's the honest half of
a decision I'd still make again.

The migrations directory is the artefact of that decision — the two schemes sitting side
by side, old below new, nothing renumbered:

```text
migrations/
  0001_init.sql                    ← inherited from the budgeting app
  0002_seed.sql
  0003_once_cadence.sql
  0004_waterfall.sql
  0005_savings_and_wiring.sql      ← last of the old sequential history
  20260713_0001_tasks.sql          ← everything from here is the dashboard
  20260713_0002_uni.sql
  20260713_0003_notes.sql
  ...
  20260802_0012_english.sql
```

## Where it stands

Built in bricks, each one usable before the next starts. Five modules are live and in daily
use:

- **Home** — a rolling 7-day overview with the week's open work in one glance
- **Tasks**
- **University** — semesters, courses and coursework
- **Notes** — a block editor with a quick-capture inbox
- **Projects** — a registry of what's in flight

Underneath them, the legacy database was adopted in place and migrations run clean over it.

## What I learned

**Writing the constraints before the features was the highest-leverage hour.** "Two
rituals, nothing more" and "everything has exactly one home" killed several modules before
I built them. Without those written down, I'd have rebuilt the Notion sprawl in a different
tool and called it progress.

**A schema is not a feature.** Several modules have tables, migrations and indexes and no
interface, which for a while I counted as "mostly done". They aren't done at all — nobody
can use a table. Migrating the schema is the part I find easy, so it's the part I kept
doing, and the status above is now written against what has a UI rather than what has a
table, because that's the only version of the list that isn't lying to me.

**I optimised for a constraint I'd assumed rather than measured.** The first design system
was built around reading the app on an E-Ink device: high contrast, no reliance on colour,
symbol-plus-word everywhere. Internally coherent, and aimed at the wrong target — once the
app was in daily use, almost all of that use was on a backlit screen, and the E-Ink
constraint had been quietly taxing every design decision for months. Rebuilding the
interface cost more than getting it right first would have. The lesson isn't "don't design
for constraints"; it's that a constraint you haven't checked against your own behaviour is
an assumption wearing a constraint's clothes, and the check is cheap — look at where you
actually opened the thing last week.
