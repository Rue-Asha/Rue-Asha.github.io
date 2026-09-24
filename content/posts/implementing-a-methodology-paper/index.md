---
title: Implementing a methodology paper
summary: Reading AWS's AI-DLC paper by building it, and what a method written for a room full of people becomes when one person runs it.
date: 2026-09-23
---

AWS published a method definition paper for AI-DLC — the AI-Driven Development
Lifecycle, an AI-native replacement for Scrum rather than a retrofit of it. Eight
pages. I did not want to read it; I wanted to run it, as a harness I invoke on my
own projects.

That turned out to be the only real way to read it. Every ambiguity in the paper
becomes a decision you have to write down, and the contradictions do not surface
until you try to build the thing.

## The source was one indirection away

The paper's public page is a React app that renders nothing to a fetcher, and the
text is not in the JavaScript bundle either — it is a PDF the app loads at
runtime. I had to pull it out of the bundle's asset reference.

Until I did, the first pass of my own work was based on a summary of a summary.
It cost me exactly one thing, and it was not a small one: my first review of my
own implementation got the direction of traceability backwards. Reading the
actual PDF fixed it.

## The paper assumes a room. I am one person.

Almost every place I deliberately departed from the paper traces back to that one
sentence. The method's Inception is a Mob Elaboration session — product owner,
developers, QA, a facilitator, stakeholders, condensing weeks into a few hours.
My version is one person working asynchronously across sessions.

So the paper's single ritual became five gates. That reads like more ceremony and
is the opposite: a room of five people does not need resume points, and
asynchronous solo work is entirely resume points. The extra gates are the session
boundaries made explicit.

    level-1-plan → intent → requirements → units → criteria → complete

The paper also writes each Unit's user stories into its own files, so a Unit can
be handed to a team. I keep one global set and have Units reference IDs. Solo
there is no handoff, so the duplication buys nothing and risks drift — and when a
story changes, only the Units that reference it are stale.

What genuinely is lost is the part I cannot replace. The value of the mob is
diverse people attacking the AI's decomposition, and alone that is simply gone.
Nothing in my harness compensates for it, and it would be dishonest to pretend
one of the gates does.

## Building it faithfully is how you find out what is load-bearing

Two layers went in exactly as the paper describes them, and then came back out.

The Bolt is the paper's rebrand of the Sprint, introduced with a rationale and a
list of five things it does. I went looking for where each of those five is
actually carried out, and every one of them lands on the Unit instead. Then the
finding that settled it: the last time the paper says the word "Bolt" is in
section III.2. The workflow, the whole green-field walkthrough, brown-field,
adoption, the appendix — zero mentions. It is declared and then never used again.
No step, no gate, no example, no prompt. I dropped it, and the User Story became
the smallest unit of work.

The PRFAQ went the same way. I had built it as a mirror for the human rather than
a source — explicitly not an input to any later phase, so that it could not
compete with the intent document as a second source of truth. That ruling was the
tell. An artifact nothing downstream may read, whose content restates the other
artifacts in different words, is a gate that costs a session and validates
nothing.

Both arguments were only available after building the thing. Faithfulness to a
source is a good starting bias and a bad stopping point.

## Two things I would keep even if I threw the rest away

**Do not maintain the reverse direction — derive it.** The chain runs from
outcome to story to Unit, and every downstream artifact already names its
upstream sources. So backward traceability was already complete and the forward
direction was empty: "where is this story used?" had no answer. Nothing new
needed linking. The existing links needed inverting, in one generated pass, and a
hand-written reverse link is a second source of truth that goes silently wrong
after the first reshuffle.

**A gate that fails open is worse than no gate, because you stop looking.** My
safety hook pointed at a path inside the project directory while the script lived
in my home directory. That path existed in none of my repositories, so the hook
had been passing everything through for weeks, and I had spent those weeks
believing it was there.

The general form of that lesson shows up everywhere in the design now. If a
constraint can be expressed as a missing capability, it should not be expressed
as a sentence. The agent that runs the tests has no ability to edit anything,
because the cheapest way to make a test pass is to change the test, and an agent
asked to make things green finds that route reliably.

## The caveat

The paper scopes itself, in Principle 5, to systems with high architectural
complexity and numerous trade-offs, built by multiple teams in large or regulated
organisations — and says plainly that simpler systems are outside its scope.

My projects are a party games site, a life-management dashboard, and a homelab
manager. They are not that.

So this is a learning vehicle and a harness exercise, not a method these projects
demanded. Worth saying rather than pretending the fit is better than it is.
