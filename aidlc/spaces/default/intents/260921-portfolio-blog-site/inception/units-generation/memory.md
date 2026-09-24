<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

## Interpretations
- 2026-09-23T11:05:00Z — Read the six approved proto-Units as the unit set rather than re-deriving a breakdown, because the backlog already carries them with priorities and dependencies and team-practices names PU-1 as the walking skeleton with six pass/fail conditions. Units Generation refines proto-Units; it does not replace them without reason.
- 2026-09-23T11:05:00Z — Treated the walking skeleton's "all eight components at minimum depth" as the reconciliation between a layer view and a slice view, rather than picking a winner. A skeleton is thin-but-complete by definition, so the layer thinking has a real home inside U1 instead of being overruled.
- 2026-09-23T11:05:00Z — Read the deployment model as settled by constraint C1 (one Pages site from one repository) rather than asking about it. Every unit is embedded; there is exactly one deployable, so independent testability rather than independent deployability became the boundary criterion.

## Deviations
- 2026-09-23T11:05:00Z — Asked four questions where the Standard range is five to eight, and then a fifth to resolve a contradiction. Deployment model, inter-unit contracts and build order were all settled upstream; asking them would have been noise. The fifth question was mandatory contradiction resolution, not depth padding.
- 2026-09-23T11:05:00Z — Recorded Q1's answer verbatim in the questions file even though Q5 superseded its effect, with a note pointing at Q5, rather than overwriting it. The answer the human gave is the record; the resolution is a separate entry.
- 2026-09-23T11:05:00Z — Drew a dependency edge from the visual-direction unit to the three page units, where the approved backlog's table records a dependency on the shell only. Stated the refinement and its reason openly rather than silently matching or silently diverging; the build order is unchanged either way.

## Tradeoffs
- 2026-09-23T11:05:00Z — Left two units untagged rather than forcing a kind onto them. U1 genuinely spans build code, templates and publishing, so no single kind fits; U6 contains no code at all, so every available kind would have been a wrong classification a downstream agent would act on.
- 2026-09-23T11:05:00Z — Accepted that two of six units carry no functional requirement and wrote that down in both the story map and the traceability file, rather than inventing a token mapping to make the coverage table look complete. A unit with no requirement is worth seeing.
- 2026-09-23T11:05:00Z — Kept the cross-cutting overlaps (the skeleton's minimal post and project pages versus the units that complete them) as an explicit table rather than redrawing boundaries to remove them. The overlaps follow from skeleton-first sequencing, so removing them would mean giving up the skeleton.

## Open questions
- 2026-09-23T11:05:00Z — Delivery Planning is SKIP in this workflow even though the stage contract says 2.7 and 2.9 travel together. Nothing is missing, because the build order was already approved in Ideation, but no stage will revisit it with the DAG in hand. Offered as an add-back option at the approval gate.
- 2026-09-23T11:05:00Z — Project ordering is still undefined, carried forward from Domain Design. It reaches Functional Design as an open item on U3 rather than being invented here.

## Interpretations

- 2026-09-23T21:15:46Z — Read this Modify re-entry as reconciliation against a revised upstream artifact rather than a re-decomposition, and diffed all four artifacts against the revised `components.md`, `decisions.md` and `src/` before writing a single question. Three of the four came back unaffected; only U3's ordering note was actually falsified. Scoping the pass by that diff kept it to three questions instead of re-running five settled boundary decisions against code already built on them.
- 2026-09-23T21:15:46Z — Treated the ordering rule and the field it consumes as legitimately living in different units rather than as a boundary defect to fix. `Project.featured` exists because U1's Home needs a subset; the rule that consumes it belongs to `ProjectCatalog`, which is U3's. Recording the provenance was cheaper and truer than reassigning FR4.3.

## Deviations

- 2026-09-23T21:15:46Z — Asked only three questions where Standard depth ranges 5-8, and said in the questions file which topics were subtracted and what settled each. The subtraction is the point: unit boundary strategy, which proto-Units are units, sibling independence, publishing placement, and the deployment model were all settled upstream or by `requirements.md` C1, and re-asking them against built code would have been noise.

## Tradeoffs

- 2026-09-23T21:15:46Z — Recorded static-asset copying in three places (U1 delivers it, U5 and U2 depend on it, one integration-points row) rather than in U1 alone. More text and one more place to keep in step; bought a reader of U5 the ability to tell a missing font from a path mismatch without reading U1 first.
- 2026-09-23T21:15:46Z — Left `traceability.json` untouched and said so explicitly in the story map rather than silently not editing it. An unchanged file is indistinguishable from an unexamined one unless the artifact says which it was.

## Open questions

- 2026-09-23T21:15:46Z — U6 (launch content) is a leaf with no requirement behind it, and `content/` already carries two posts and two projects. Whether U6 is therefore partly done is a Construction question, not a boundary one, and this stage did not touch it.
- 2026-09-23T21:15:46Z — The decision-brief helper still fails with `aidlc-review-brief.ts does not export main(argv)`, now observed on a second stage. Both checkpoints here were presented inline.
