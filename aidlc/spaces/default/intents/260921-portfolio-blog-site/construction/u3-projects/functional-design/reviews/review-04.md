## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-23T14:34:13Z
**Iteration:** 1

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | `functional-spec.md` § New rules this unit adds — BR9.1/BR9.2/BR9.3 status | Previously: none of BR9.1/BR9.2/BR9.3 was caught by an automated check. Re-verified: the file states BR9.3 is covered by `ProjectCatalog`'s sort unit test, and `frontend-components.md` § Props and branches confirms "ordering... is one of the functions with a unit test behind it," matching `team.md` § Testing Posture's "post sorting"-class testability rule. | None — verified resolved. | Resolved |
| R-02 | Major | `frontend-components.md` § Responsive commitments | Previously: the two-row-target sizing claim named no mechanism for the outbound repository link reaching 44px. Re-verified against the named integration file: `construction/u5-visual-direction/functional-design/functional-spec.md` BR11.1 states exactly the shared vertical-padding mechanism U3 cites, and BR11.6's `scope_of_the_hit_target_clause` explicitly carves out rows whose desktop form already has two targets, citing BR9.2 by ID. Cross-reference accurate on both sides. | None — verified resolved. | Resolved |
| R-03 | Major | `traceability.json` coverage row `FR3.1` (target now `BR9.4, BR9.3, BR9.2`) | Previously: neither cited rule established FR3.1's row-content commitment (name, summary, tools, repo link, each shown once per project). Re-verified: `functional-spec.md` now defines BR9.4 ("The Projects page lists every project exactly once, and each row shows the project's name, one-line summary, tools and a repository link"), with logic stating the row carries exactly four values sourced from `ProjectCatalog`'s yield and an explicit no-duplicate/no-omission cardinality constraint — matching FR3.1's acceptance test ("every project appears once with all four") word for word. This is a genuine authored rule, not a retarget: it states real trigger/logic/violation content distinct from BR9.2 (shape) and BR9.3 (order), and the `on_violation` clause explicitly explains why those two rules alone would not have caught a name-only row. | None — verified resolved; the remedy was authoring, not retargeting, as directed. | Resolved |
| R-04 | Major | `traceability.json` coverage row `FR3.2` (target now `BR9.5, BR9.1`) | Previously: BR9.1 alone established only row order, not that the rail carries five categories, sits beside the body, or that the body renders. Re-verified: `functional-spec.md` now defines BR9.5 ("A project write-up page carries the metadata rail beside a body, and the rail carries year, type, tools, repository and live URL"), whose logic states the rail is a sibling of the body, names the five rows, and states the body renders "the project's authored content at whatever structure and length the author chose" — covering every clause of FR3.2 ("a metadata rail... beside a body of author-chosen structure and length"). `on_violation` correctly distinguishes BR9.5's contribution (that the rail/body structure exists at all) from BR9.1's (only the row order and omit behaviour within an already-existing rail). | None — verified resolved; the remedy was authoring, not retargeting, as directed. | Resolved |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `sensor fire traceability` | FAIL — `missing_from_upstream_ids` lists FR1.x/FR2.x/FR4.x/FR5.x; `invalid_targets` flags every `BR9.x`/`BR3.x`/`BR5.5` citation as "absent from rules.md" | Both are the two pre-diagnosed, known limitations for this `ui` unit (whole-requirement-set comparison with no `user-stories` scoping; sensor expects a `rules.md` this unit deliberately does not produce). Per the stage brief, not raised as findings. The fields that DO matter — `gaps`, `orphans`, `missing_from_table`, `invalid_entries` — are all empty. |
| `sensor fire required-sections` | PASS | — |
| `sensor fire upstream-coverage` | PASS | — |

### Spot-checks against named integration points

- `construction/u1-publishable-site-shell/functional-design/rules.md`: BR3.1–BR3.7, BR4.4, and BR5.5 all exist and match U3's citations exactly (six required fields, `liveUrl`/`featured` optionality, ordering, fail-nothing-written-on-error, and the empty-state sentence-plus-link pattern for Home/Writing/Projects).
- `construction/u5-visual-direction/functional-design/functional-spec.md`: BR11.1 (shared 44px standalone-link padding rule) and BR11.6 (contraction constraints, with its hit-target clause explicitly scoped away from Projects rows by citing BR9.2) both say exactly what U3 claims they say.

### Fresh adversarial pass (this iteration)

- `functional-spec.md` § W1, step 1 cites only "U1 BR3.7" for the Projects list's ordering, when the rule that actually governs the *full* list (as opposed to Home's top-three subset) is this unit's own BR9.3 — BR9.3 exists precisely because BR3.7 was scoped to Home. The omission is recoverable in the same document (§ New rules this unit adds spells out the BR3.7→BR9.3 relationship explicitly, and the traceability row for FR3.1 does cite BR9.3), so a developer is not actually misled, but the single most-load-bearing workflow table in the file points at the wrong rule ID for the behaviour it is describing. Not blocking — the correct rule is one section away and is otherwise fully specified — but worth tightening on the next touch.
- Checked component ownership: BR9.3's `applies_to: ProjectCatalog` is legitimate — `unit-of-work.md` § U3 explicitly assigns "`ProjectCatalog`'s rules" to this unit, so authoring an ordering rule against that component from within U3 is not a boundary violation.
- Checked for `BR9.x` ID collisions against the one sibling file open to this review (U1's `rules.md`, which runs BR1.x–BR5.x) — none found.
- Checked internal consistency of the two newly authored rules against the rest of the file: BR9.4's "exactly four values, not links for summary/tools" is consistent with BR9.2's "the row's summary and tools are not links"; BR9.5's five-row, sibling-of-body structure is consistent with `frontend-components.md`'s `MetadataRail` hierarchy and its single documented branch (the omitted live row). No contradiction found.
- Checked the `traceability.json` `upstream_ids` list against `requirements.md`: FR3.1–FR3.7 are exactly the seven IDs assigned to U3 by `unit-of-work-story-map.md` § U3; no orphaned or invented ID.

### Summary

Both Major findings carried into this round (R-03, R-04) were fixed the way the human directed: by authoring BR9.4 and BR9.5 as real rules with their own trigger/logic/violation content that establish FR3.1's and FR3.2's structural commitments, not by retargeting or softening the coverage rows. Both new rules are cross-checked against the requirement text, the workflow tables, and `frontend-components.md`'s template hierarchy, and hold up. The two previously-accepted resolutions (R-01, R-02) remain verified. One new Minor observation (a workflow-table rule citation that should point at BR9.3 rather than BR3.7) is not blocking, since the correct rule is fully specified elsewhere in the same document. No Critical findings and no more than the two carried-forward, now-Resolved Major findings — the unit is implementable without further architectural guidance.
