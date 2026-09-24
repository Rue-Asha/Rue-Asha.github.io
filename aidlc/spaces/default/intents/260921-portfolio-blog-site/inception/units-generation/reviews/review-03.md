## Review

**Verdict:** NOT-READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-23T21:23:01Z
**Iteration:** 1

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | `unit-of-work.md` § U3 — Projects § Boundary | U3's Boundary now reads "Owns `ProjectCatalog`'s rules and the project-facing parts of `PageRenderer` and `ContentTransforms` — the latter because project sorting lives there (`components.md` § ContentTransforms), mirroring U2's ownership of the post-facing parts of the same component." This mirrors U2's phrasing exactly, and `components.md` confirms `ContentTransforms` owns `sortProjects` as a project-facing derived function (line 533, ADR-008 note). The original gap is closed. | None — verified fixed. | Resolved |
| R-02 | Major | `unit-of-work.md` § U3 — Projects § Boundary, sentence "`sortProjects` is therefore within this unit's scope, including its unit tests and its share of the coverage floor." | The R-01 fix went one sentence further than the mirrored ownership statement and additionally claims U3 owns `sortProjects`' unit tests and coverage. The built system contradicts this directly: `sortProjects` is unit-tested in `tests/u1/content-transforms.test.ts` (alongside `sortPosts`, under the same `describe("ContentTransforms", …)` block), and `tests/u3/ordering-parity.test.ts` states explicitly in its file header — "`sortProjects` is U1's and is already unit-tested; this file does not re-test it. What BR9.3 actually adds is the **parity** …". U3's own test suite disclaims ownership of `sortProjects`' unit test. This also cuts against `components.md`'s own rationale for keeping `ContentTransforms` as one component: "gathering them gives NFR12's coverage floor one target instead of several" (components.md line 644) — the coverage floor for `ContentTransforms` is designed as a single target, not something split per consuming unit. Note this is a narrower, factual claim than U2's parallel sentence about `ContentTransforms`, which makes no equivalent "including its unit tests and coverage" assertion for `sortPosts` — so the asymmetry R-01 was fixing has reappeared as an asymmetry in the *test-ownership* claim instead of the *rendering-ownership* claim. | Remove or correct the "including its unit tests and its share of the coverage floor" clause in U3's Boundary. State instead (matching the built system and `components.md`'s single-coverage-target rationale) that `ContentTransforms`' unit tests and coverage are measured once, against the whole component, not per consuming unit — or, if per-unit attribution is genuinely wanted, first reconcile it with the already-built `tests/u3/ordering-parity.test.ts` header, which explicitly assigns the sort test to U1. | New |

### Validation Tool Results

No stage-specific validation tooling is listed for `units-generation` in the stage definition beyond manual cross-reference checking. Cross-checks performed manually:

| Check | Result | Interpretation |
|---|---|---|
| `unit-of-work.md` edge block (`unit-of-work-dependency.md`) — acyclicity | PASS | U1 root; U2/U3/U4 depend on U1 only; U5 depends on U2,U3,U4; U6 depends on U2,U3. No cycle. |
| Every functional requirement assigned exactly once | PASS (by inspection of `traceability.json` `coverage` array and `unit-of-work-story-map.md` §166 count: 16+10+7+1=34, matching the 34 FRs cited in `unit-of-work.md` § Sources) | No unmapped or duplicated FR found in the U3-adjacent entries checked. |
| `traceability.json` agrees with `unit-of-work-story-map.md` for U3 | PASS | FR3.1–FR3.7 map to U3 in both `coverage` and `reverse` blocks, and the story map's per-requirement table names the same set. |
| No inter-unit build order or critical path recommended | PASS | `unit-of-work-dependency.md` explicitly disclaims picking an order or critical path, and the "Parallel development opportunities" section frames set {U2,U3,U4} as topologically-equal options, not a recommendation. |
| Prior R-01 fix vs. `components.md` | PASS | `ContentTransforms` is confirmed as the owning component for both `sortPosts` and `sortProjects` (components.md line 480, 533, 643-645). |
| Prior R-01 fix vs. built `tests/` and `src/` | FAIL (new finding R-02) | The unit-test-ownership clause added alongside the R-01 fix contradicts `tests/u3/ordering-parity.test.ts`'s own header comment and the actual location of the `sortProjects` test suite. |

### Summary

The R-01 fix itself is correct and resolves the original finding — U3's Boundary now credits the project-facing parts of `ContentTransforms`, mirrored from U2's phrasing and backed by `components.md`. However, the same edit introduced a new, more specific claim (test and coverage ownership for `sortProjects`) that the built system directly contradicts: `sortProjects` is tested and attributed to U1 in the existing `tests/` tree, not U3. This is a factual inaccuracy a downstream Construction agent scoping U3's Build and Test could act on incorrectly — the opposite failure mode from the one R-01 raised, but the same class of risk (a unit believing it owns work it does not, or vice versa). No other divergence was found between these four documents, the revised Domain Design, or the built system; the DAG, requirement coverage, and traceability all check out clean.
