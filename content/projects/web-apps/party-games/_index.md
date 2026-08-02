---
title: Party Games
date: 2026-07-31
type: docs
weight: 2
summary: 'Self-hosted party games for one screen in a living room — and a study in how much architecture a clear constraint lets you delete.'
aliases:
  - /projects/party-games/
---

|             |                                             |
| ----------- | ------------------------------------------- |
| **Status**  | Building — six games playable                |
| **Started** | June 2026                                   |
| **Architecture** | [The shared web-app stack]({{< relref ".." >}}) |
| **Scale**   | 6 games · 12 migrations · ~9,900 lines of TS/Svelte · 0 WebSockets |
| **Source**  | [github.com/Rue-Asha/Party-Games](https://github.com/Rue-Asha/Party-Games) |

The stack, deployment and architecture are the [shared ones]({{< relref ".." >}}). This page
covers only what this app decides differently — which, given the whole project is an
exercise in deleting architecture, is mostly a list of things it doesn't have.

## What it is

A web app hosting party games I've written, run on the homelab and played on a single
screen in the room — a TV or a laptop everyone can see. Not one-device-per-player. It's
the digital equivalent of a board game on the coffee table.

## Why it exists

Partly to have the games. Mostly because it was the first service I deployed with the
homelab's new delivery model, and I wanted a real application to prove that model against
rather than a toy.

It turned out to be a good study in something else too: how much complexity one honest
constraint lets you delete.

## Key decisions

### One screen, so no real-time layer at all

**Chose:** no WebSockets, no Socket.IO, no lobby or room logic. None of it.

**Because:** exactly one browser connects. Real-time machinery exists to keep multiple
clients in agreement about shared state — with a single client there is no disagreement to
resolve. Every tutorial for this kind of app reaches for Socket.IO by reflex, and adopting
it would have meant a connection lifecycle, reconnection handling, and server-authoritative
state, all to synchronise one client with itself.

**Trade-off:** adding phones as controllers later means building the entire real-time layer
that was skipped. That's a genuine one-way-ish door, and it was worth walking through: the
single-screen format is the point, not a limitation I'm working around.

**This is the decision the whole project rests on.** Nail the usage model first and large
amounts of architecture simply evaporate.

### The backend exists only to remember things

**Chose:** game logic and rendering run entirely in the browser. The server persists prompt
and word banks and does nothing else.

**Because:** once there's no synchronisation to do, the only thing a server is still needed
for is surviving a page refresh. Keeping that boundary explicit stopped logic drifting
server-side out of habit.

**Trade-off:** everything is client-trusted — anyone with devtools can set their own score.
In a room where the scoreboard is a TV everyone is looking at, cheating is a social problem
rather than a technical one. It would be indefensible for anything competitive or public.

### Scores don't outlive the evening

**Chose:** no persistent scoreboard. Scores live in the browser for the length of one game
and are then gone.

**Because:** a `scores` table existed from the first migration to prove the persistence loop
worked. Nothing ever wrote to it, and nobody ever asked what they scored last Tuesday, so
migration `0008` drops it. The feature was inherited from what a "game app" is assumed to
need, not from anything the actual usage model wanted.

**Trade-off:** no history, no stats, no rivalries across evenings. If that ever gets asked
for it comes back — but it will come back because someone wanted it, not because the schema
assumed it.

## What the constraint deleted

Worth listing explicitly, because this is the actual return on getting the usage model
right. None of these are things I built and then simplified — they are subsystems that
never had to exist:

- **No real-time transport.** No connection lifecycle, no reconnection handling, no
  server-authoritative state. Verifiably none of it: the string `socket` does not appear
  anywhere in the source.
- **No lobby, rooms or join codes.** No matchmaking, no room state to expire, no way for a
  game to end up in an unreachable state because someone closed a tab.
- **No accounts.** No sign-up, no sessions, no password reset — three screens and a table
  that a "party game" is normally assumed to need.
- **No user-submitted content.** Prompts and word banks are seeded by migration rather than
  written by players, so there's no moderation surface and no content to sync between
  people.

**Where the line moves.** The moment phones become controllers, every item above comes back
at once — and not incrementally: a server that can't trust its clients is a different
program, not this one with a feature added. That's the main reason the single-screen format
is stated as the point rather than as a limitation I'm working around.

## Where it stands

Six games are playable end to end: Imposter, Wavelength, Family Feud, Duck, Codes and Most
Likely To. Their prompt and word banks are seeded and versioned through migrations, the
container is provisioned and reverse-proxied, and the deploy model is proven end to end —
checkout, build, migrate, symlink flip, restart. This was the first service to run that
model for real.

## What I learned

**Ask what the usage model actually is before choosing a stack.** The instinct was to reach
for a multiplayer architecture because "party game" pattern-matches to it. One sentence —
everyone looks at the same screen — removed a real-time layer, a state-synchronisation
problem, and a whole category of bugs. The cheapest code is the code you talked yourself out
of writing.

**Features arrive by assumption, not by request.** The scores table was never asked for by
anyone, including me. It got built because it's what that kind of app has. It sat empty for
eleven migrations before I noticed it had no users and dropped it — and the only reason I
noticed at all is that writing this page made me justify it.
