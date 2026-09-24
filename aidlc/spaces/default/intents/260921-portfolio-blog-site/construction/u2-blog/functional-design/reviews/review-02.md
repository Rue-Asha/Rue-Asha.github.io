## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-23T11:33:39Z
**Iteration:** 2

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Critical | construction/u2-blog/functional-design/functional-spec.md > BR8.1 | BR8.1 made a missing image `alt` attribute a build-failing error, contradicting `accessibility-checklist.md`'s "Image alt text (P1)" row, which stated the build does not require it. | None — see § R-01 verification below. | Resolved |
| R-02 | Major | construction/u2-blog/functional-design/functional-spec.md > FR2.8 traceability | FR2.8 was traced to Unit 1's BR5.7 (page-type reachability from Home), which does not support the same-page "All posts" links FR2.8 actually describes. | None — see § R-02 verification below. | Resolved |
| R-03 | Major | construction/u2-blog/functional-design/functional-spec.md > BR8.2 | BR8.2 depended on assumption U2A1 with no defined fallback if U2A1 did not hold, leaving the rule's buildability an open caveat. | None — see § R-03 verification below. | Resolved |
| R-04 | Minor | construction/u2-blog/functional-design/functional-spec.md > BR8.1 | BR8.1 cited NFR1 as its supporting non-functional requirement, but NFR1 never mentions alt text or image accessibility. | None — see § R-04 verification below. | Resolved |

#### R-01 verification

`functional-spec.md` § New rules this unit adds now states BR8.1's `statement` as "This is an authoring rule, and the build does not enforce it," and its `logic` confirms "The rendering path passes an image's alt attribute through unchanged... No build step inspects it and no check fails on it." The `on_violation` text explicitly names the reconciliation: "`refined-mockups/accessibility-checklist.md` records alt text as priority P1, owned by the author per post, and states plainly that 'the build does not require it'. An earlier draft of this rule made a missing alt a build failure, which would have reversed that decision silently." The summary table at line 242 confirms enforcement as "The author, at write time," and the prose immediately below the table states "BR8.1 is the one rule here with no enforcement point in software." The contradiction is gone: both the rule and the checklist now agree it is a non-enforced authoring convention.

#### R-02 verification

FR2.8 is listed in `functional-spec.md` § Sources as one of the upstream requirements carried from `inception/requirements-analysis/requirements.md` (FR2.1–FR2.9), not from U1's BR5.7. BR8.4 — the rule that actually governs the two "All posts" links — cites `source: FR2.8` and its `on_violation` text states "The second link is the requirement, not a convenience: FR2.8 names both positions explicitly," which is a correct, on-topic pairing of requirement to rule. No reference to BR5.7 remains anywhere in the artifact. The requirement is now traced to the rule that matches its actual content.

#### R-03 verification

BR8.2 now carries a `known_language_resolution` field defining an explicit PRIMARY/FALLBACK mechanism: PRIMARY asks the highlighter for its known-language set; FALLBACK, "used when the chosen highlighter exposes no such query and silently passes unrecognised labels through," declares the accepted label set in site configuration instead. The field states plainly: "The fallback is what keeps BR8.2 buildable against any highlighter; without it the rule would depend on a library capability nobody has chosen yet." The assumption U2A1 in § Assumptions & Open Questions was updated to match: its "Invalidated by" column now reads "This no longer threatens BR8.2: the rule states an explicit fallback... so the assumption failing changes which mechanism resolves 'known', not whether the rule can be built." The open "may be unimplementable" caveat is gone; a developer has a concrete fallback path regardless of highlighter capability.

#### R-04 verification

BR8.1's `source` field now reads "FR2.6, accessibility-checklist.md § Image alt text (P1)" — the NFR1 citation has been removed entirely and replaced with a citation that does support the rule (the checklist row that actually discusses alt text). No other rule in the New Rules block cites NFR1 for alt text. The unsupported citation is gone.

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| N/A | Not run | No validation tooling is listed for this stage; all findings were confirmed by manual cross-reference between `functional-spec.md`'s current text (BR8.1, BR8.2, BR8.4, U2A1, § Sources, § New rules this unit adds summary table) and the artifact state recorded against each finding at iteration 1. |

### Summary

All four iteration-1 findings are resolved in the current artifact: BR8.1 now consistently reads as an unenforced authoring rule aligned with the accessibility checklist and correctly cited (R-01, R-04); FR2.8 is traced to the rule (BR8.4) that actually describes the same-page "All posts" links, with no remaining reference to the unrelated BR5.7 (R-02); and BR8.2 now ships an explicit PRIMARY/FALLBACK resolution so its buildability no longer depends on an unconfirmed assumption (R-03). No Critical or unresolved Major findings remain — the unit's functional design is ready for a developer to build from.
