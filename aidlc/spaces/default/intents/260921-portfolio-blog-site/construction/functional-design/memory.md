<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-09-23T14:13:58Z — read a `status: OK` traceability row as asserting that some RULE establishes every commitment the requirement makes, not that the unit works on the requirement. Under that reading eight rows across four units were wrong: they cited the nearest related rule (a row's link shape for a requirement about its contents, a rail's row order for a requirement that the rail exists, a contrast rule for a keyboard requirement). The remedy is to author the missing rule, never to retarget — retargeting finds another near-miss.
- 2026-09-23T14:13:58Z — treated a requirement naming two distinct things as needing two rules, not one. NFR7 names list rows AND interactive targets; one rule covered standalone links and the list-row half rested on an uncited arithmetic derivation in an upstream document. Split into BR11.8 and BR11.1.

- 2026-09-23T13:21:48Z — read a requirement quoted verbatim into a rule (NFR6's "one hit target") as needing SCOPING against rules written after the requirement, not faithful reproduction. NFR6 predates BR9.2 and BR11.1; quoting it unqualified made BR11.6 instruct a developer to remove a target BR11.1 sizes. Restricted the clause to rows whose desktop form is already single-target and named the Projects row as the stated exception, in both U5 and U3.
- 2026-09-23T13:21:48Z — read a traceability coverage row claiming `OK` as a claim that some RULE covers every condition of the requirement, not that the unit works on the requirement. NFR1 has four conditions and the cited rules covered one and a half, so the gap was closed by writing the missing obligation as BR11.7 rather than by softening the coverage row.
- 2026-09-23T13:21:48Z — treated an assumption that a later rule makes true as needing promotion, not deletion. U5A4 assumed styling preserves tab order; BR11.7 now states it. Left the row in place marked as promoted, so a reader who remembers the assumption can see where it went.


- 2026-09-23T11:01:13Z — read NFR8's "the file name is the URL" as "the item's directory name is the URL" under the chosen directory-per-item layout; the answer to Q2 stated that reading explicitly, so it is a settled interpretation rather than a contradiction with the affirmed practice.
<!-- aidlc-wave-memory:u1-publishable-site-shell:24339cfe5f4d9bc9bd332e48cb31f865710cd92986d1411907fb7b9fd6d83242 -->


- 2026-09-23T11:01:13Z — treated `featured` on a project as an ORDERING key rather than a selection filter (Q7), so Home can never show its empty state while projects exist.
<!-- aidlc-wave-memory:u1-publishable-site-shell:a70f8b49f7f26adceff9e9e345e07c58c53e6214088418bfb77d42acb231372d -->


- 2026-09-23T11:22:19Z — read FR5.1's "(RSS or Atom)" as a genuine open choice rather than a preference for the first-named, and put it to the human; Atom was chosen for its stricter date and identity model, which matters because declared dates are this site's ordering key.
<!-- aidlc-wave-memory:u2-blog:ea957c7a54436c3b186f16ba418fd5a18f6e9ab2b4277a8546db21ad240c1491 -->


- 2026-09-23T12:20:38Z — treated the Projects page ordering as still genuinely open even though U1 had already defined a total project order, because U1 defined it to serve Home's top-three and `unit-of-work.md` names ordering as this unit's to settle. Putting it to the human confirmed one rule site-wide rather than inheriting U1's by default.
<!-- aidlc-wave-memory:u3-projects:7fe94b93ed102cf8abb54a6b4f0e5093ada2fce52c75ce47246a19b84079a8f0 -->


- 2026-09-23T12:28:17Z — read the absence of an About content kind as a genuine structural gap rather than an oversight: `ContentFile.kind` is exactly post and project, and About has prose, so something had to give. Put it to the human rather than quietly adding a third kind.
<!-- aidlc-wave-memory:u4-about-page:a6e6fc3bcdba9a7d48a06f2a1fefd51f52b542bbb5d6bf38676bafae9f1f2446 -->


- 2026-09-23T12:37:16Z — read the design system's silence on standalone-link sizing as a genuine gap rather than an implied default, because NFR7 applies to every interactive target and the interaction spec only derives the figure for list rows.
<!-- aidlc-wave-memory:u5-visual-direction:9cc18deaa5ca1851e9003e3d54e9ff322d8f2a166abebf806cff340a0c17d510 -->


- 2026-09-23T12:45:56Z — treated "not applicable" as the artifact's content rather than as a reason to leave files thin. Units Generation instructed this outcome; what it did not say is what a not-applicable design artifact should contain, so each file states the three tests the unit fails, and lists the rules that do govern its files with where they were authored.
<!-- aidlc-wave-memory:u6-launch-content:3382d9dfaeb62f7e469472c75b898d5df7b6900ec12fcda6ce41a0330b6f54a9 -->


- 2026-09-23T13:04:25Z — read "not applicable" as a claim the stage's own machine checks must still accept, not as an exemption from them. Review found the empty `coverage` array and the invented `BR0.0` placeholder failed the traceability check outright. Recorded the five requirements that constrain this unit's files as `N/A` coverage rows naming the delivering unit, and explained each borrowed `BRx.y` in `reverse`, which cleared every orphan, invalid entry, and invalid target.
<!-- aidlc-wave-memory:u6-launch-content:71dee5ec1ae877220f686f6a96af7f8f2f6a5d1f68570d595cd4e0e329a24fdf -->


- 2026-09-23T13:04:25Z — treated the stage's mandated fenced `yaml` source-of-truth block as unconditional for an untagged unit, since the only documented carve-out is for a `ui` unit that omits `entities.md`/`rules.md` entirely. Declared the empty sets explicitly with a comment stating why they are empty and where the real model lives, rather than omitting the block.
<!-- aidlc-wave-memory:u6-launch-content:f3ddd39d313c8007347e9fee3f7a113fcdfd91bea65540bdd012b3280cb6b38a -->

## Deviations

- 2026-09-23T13:50:00Z — offered a three-option approval gate in Construction ("Approve / Request Changes / Fix only U2 R-01") where the protocol allows exactly two. The third option was useful to the human and they chose it, but it is not a sanctioned lifecycle decision: it had to be reported as Request Changes with the scope carried in the feedback field. If a partial-fix choice is worth offering, it belongs in the feedback prompt after Request Changes, not as a third gate option.
- 2026-09-23T13:21:48Z — offered the approval gate with a Critical finding open, having just written that it was the one I would fix first. The human sent it back to fix all seven. The gate presentation was accurate but the recommendation and the offered default pulled against each other; where a finding is named as one that should be fixed, the revision should be done before the gate is presented rather than offered as the human's to waive.
- 2026-09-23T13:21:48Z — documented two traceability-check findings as known limitations rather than clearing them, in U5 as well as U6. The check compares each unit against the whole requirement set (it only scopes per unit when `inception/user-stories/` exists, which this scope skipped), and it resolves `BRx.y` targets against a `rules.md` that `produces_kinds` does not give a `ui` unit. Both are the check disagreeing with the stage contract; clearing either would mean writing something untrue into the file.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->


- 2026-09-23T11:01:13Z — asked a seventh question beyond the six planned. Q4's answer (`featured: true` selects Home's projects) left the launch-day case where no project carries the field, which would have shipped a silent Home/Projects disagreement. The affirmed practice is to resolve a contradiction rather than carry it forward, so the extra question cost less than the unresolved case.
<!-- aidlc-wave-memory:u1-publishable-site-shell:030bdf4baeaaa613fafc39ed9c2694920bcdf8eda864f6a33950b30f26351b15 -->


- 2026-09-23T11:22:19Z — asked only two questions against a Standard depth range of five to eight. U1 authored the entity model and every business rule this unit would otherwise have needed to decide, and the questions file names each subtracted topic with the artifact that settled it.
<!-- aidlc-wave-memory:u2-blog:ad37a3ee7fbd003763b68fbdd3d3250656e9498c6c8891175cfd4483235c8278 -->


- 2026-09-23T12:20:38Z — asked one question against a Standard depth range of five to eight. Requirements settled the six required fields, the omitted live-URL row, the two row targets, accessible repo link names and the empty state; U1 settled the entity and its validation. The questions file names each subtracted topic with the artifact that settled it.
<!-- aidlc-wave-memory:u3-projects:46703ea7f1550fbe58a7887eb5831ed8a35734b729692d7b5f3fab77d662192a -->


- 2026-09-23T12:28:17Z — asked one question for a unit with one functional requirement. `unit-of-work.md` warns this unit's main risk is being treated as trivial; the answer is to ask the one thing that is actually undecided, not to pad the count.
<!-- aidlc-wave-memory:u4-about-page:ab0d7a4fd80a142bb2f5e6babb6b3dd93e4d6fce4a9d44743f51626e3ab28303 -->


- 2026-09-23T12:37:16Z — took on a sizing question that a sibling unit's review had raised against that sibling. The reviewer placed ownership there; this unit owns styling, so settling it here avoids the same gap being answered twice differently.
<!-- aidlc-wave-memory:u5-visual-direction:faaf1caef341e1b7756cd2483ed1f5540f2e9db158e25c652849062233101942 -->


- 2026-09-23T13:04:25Z — left one traceability finding failing rather than clearing it. The check requires each unit's `upstream_ids` to carry every requirement ID in `requirements.md`; padding this unit's list with thirty-six unrelated IDs would pass the check while making the file claim the whole requirement set, contradicting the story map. Verified the same finding affects U1 through U5 in proportion to what each leaves to its siblings, so it is a check limitation rather than a defect in this unit, and wrote that down in `functional-spec.md`.
<!-- aidlc-wave-memory:u6-launch-content:caa3c36de3ec9b1dcb645351d94c01fb3d9d82fa609db19f242178ee31e4e8cb -->


- 2026-09-23T12:45:56Z — asked no questions and ran no summary confirmation for this unit. The stage protocol's checkpoint applies to a body that ran a file-backed Q&A; manufacturing questions for a unit whose design stage was already determined to be not applicable would have invented the very content Units Generation told this stage not to invent.
<!-- aidlc-wave-memory:u6-launch-content:1ab4cab159c5fabe518eff12fd095ac4f0977e67a87b3cf5b2408735026954fc -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->


- 2026-09-23T11:01:13Z — chose the strict CSP set without `'unsafe-inline'` for styles. It forecloses inline style attributes for every later unit, U5 in particular; accepted because a policy that permits inline styles cannot actually enforce the no-third-party rule it exists for, and U5's deliverable is an external stylesheet anyway.
<!-- aidlc-wave-memory:u1-publishable-site-shell:f6ff9c87450b0de8563d1ced4592cf4a831d1015e0f1c59f110329200542cc57 -->


- 2026-09-23T11:01:13Z — chose ISO-date-only over accepting a general date parser. Rejected the forgiving parser specifically because its failure mode is silent misordering (day-first vs month-first) rather than a loud build error, which is the failure class this project's whole check set exists to prevent.
<!-- aidlc-wave-memory:u1-publishable-site-shell:263a3edce2a010bcf368487de92fc92fcdf5ea2119ac56e225c05eaee2162149 -->


- 2026-09-23T11:22:19Z — summary-only feed over full-body. A full-body feed means a reader never loads the site, which for a site whose success bar is qualitative is not obviously a loss; chose summary-only anyway because escaping rendered HTML into feed entries correctly is a recurring source of silent breakage and this unit has no way to check it.
<!-- aidlc-wave-memory:u2-blog:641388df6da60b32ffb4b01933e7231cc2008789be9a4f0603b17684b6e840c3 -->


- 2026-09-23T11:22:19Z — split the unknown-code-fence case in two rather than picking one behaviour for both. An unlabelled fence is a deliberate authoring choice and must never block a push; a fence naming a language that does not exist is always a typo, and this project's posture is to make typos loud. One rule would have got one of those two cases wrong.
<!-- aidlc-wave-memory:u2-blog:0ff06c777200408e978a3bb3c9bdf531971f3ce9bc6dad9c375865359a1d70d0 -->


- 2026-09-23T12:20:38Z — one ordering rule for Home and the Projects page, rather than letting `featured` affect Home only. The cost is that marking a project featured silently reorders the full list too, which an author may not expect; accepted because two orderings for one collection is the kind of thing nobody remembers six months later.
<!-- aidlc-wave-memory:u3-projects:5e616040f10a948b36c4f561f9e4dae701c86bf86a5d534cd2b1d8095898830c -->


- 2026-09-23T12:20:38Z — carried U1's BR8-series numbering forward for this unit's new rules rather than opening a fresh series per unit. Keeps one readable rule set across the construction record; the cost is that a reader must know which unit authored a given BR number.
<!-- aidlc-wave-memory:u3-projects:7e401ca9f8ee6d84069faad1657bdd6c52b6069de738906aaaf18e2da4c15a60 -->


- 2026-09-23T12:28:17Z — About's prose lives in its template rather than in a content file. Keeps the content model at two kinds and adds no general page capability for one page, which is what the scope's exclusions argue for; the cost is that editing About is a code change on the branch path rather than a content commit direct to main, and the formatter will rewrite that prose.
<!-- aidlc-wave-memory:u4-about-page:ed1b008af7bc2a8590767bf9ba661e447be8aec59f4b5ef6ecc3ea10a8534567 -->


- 2026-09-23T12:37:16Z — applied the minimum-target padding below the breakpoint only. Desktop link targets stay visually as drawn, at the cost of one more breakpoint-conditional rule; the alternative would have made every desktop link taller than the design intended.
<!-- aidlc-wave-memory:u5-visual-direction:b1bbfc242c386b64c8df2c73dfe147b065d146b8fdf7b3b0c82989bba448d3ce -->


- 2026-09-23T12:37:16Z — one stylesheet with a register class rather than a file per register. Accepts that an editorial change touches a file every page loads, in exchange for the register staying the small set of differences the mockups intended rather than hardening into two parallel systems.
<!-- aidlc-wave-memory:u5-visual-direction:43ca9012cdc4e40bbe5d038d667ef237b385cdec2589e207177aef7e5f49f448 -->


- 2026-09-23T12:45:56Z — listed this unit's inherited obligations rather than only declaring the unit empty. It risks reading as duplication of U1 and U2, and each row points at where the rule was authored precisely so it cannot be mistaken for a second definition; the alternative was a file saying only "not applicable", which gives a content author nothing to check their work against.
<!-- aidlc-wave-memory:u6-launch-content:736a27efe9714b0bd79fe68d671324433165b3c3042d1c2e561438beaf62c54d -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

- 2026-09-23T11:01:13Z — project ordering beyond `featured` and `year` is still undeclared upstream (ADR-002 left it open deliberately). The year-descending fallback chosen here is this unit's rule, not a project-wide decision; U3 may need to revisit it when more than a handful of projects exist.
<!-- aidlc-wave-memory:u1-publishable-site-shell:5484b9d61f809d9f0bac5f0cfb1a8f4dbaaf276c27a6b18eac8cf1ceeb067369 -->

- 2026-09-23T11:22:19Z — the feed's entry identity across a slug that is deleted and later reused is unspecified. NFR8 forbids changing a live slug but says nothing about reuse after deletion, so a feed reader could show an old entry's title against new content. Carried rather than invented; it touches U1's FA1.
<!-- aidlc-wave-memory:u2-blog:7b30e928b986ab8f4ed78d21dce3859f5c4a80802748ab9cb5da61fc8ef0a6cd -->

- 2026-09-23T12:20:38Z — `type` is free text with no enumeration (U1), so a future decision to group or filter the Projects list by type would need a vocabulary that does not exist yet. Recorded rather than pre-empted: no requirement asks for grouping today.
<!-- aidlc-wave-memory:u3-projects:4d2edd41a7ba8b643972b2bd6b12a6571789876e216ac3503d33e6715fa93e9f -->

- 2026-09-23T12:28:17Z — nothing settles how often About changes. If it turns out to change like content rather than like code, the template choice is the wrong one and a third kind becomes worth its cost. Recorded so a later reader can tell a decision from an accident.
<!-- aidlc-wave-memory:u4-about-page:4db6b4651bd96120c8f5f4643c20d1d9268739e57c5af6bcd47b9b742ab0ffa6 -->

- 2026-09-23T12:37:16Z — contrast is verified by hand against the measured table and by nothing else, since the automated accessibility scan was declined. Any colour change re-opens that table; nothing enforces that it is re-opened.
<!-- aidlc-wave-memory:u5-visual-direction:4cefb544f4545dabf28e2f4bec526ff194fee60227c57a88a55dad8aba4d6626 -->

- 2026-09-23T12:45:56Z — whether a not-applicable design artifact should exist as a file at all is a framework question rather than a project one. The stage contract requires the paths, so they exist and say why they are empty.
<!-- aidlc-wave-memory:u6-launch-content:82a28a094ab7f63322a904d333f999f236a53f9d724b09f114a99bc2ef5de67b -->
