# Phase Check — Construction

**Boundary**: Construction → Operation
**Verdict**: **PASS, with two recorded exceptions.** The transition is not
blocked. Neither exception is a traceability or coverage failure.

Run at ci-pipeline Step 5, per the stage contract and
`.claude/knowledge/aidlc-shared/verification.md`.

## Scope of this check

Operation is SKIPPED in its entirety for this scope — all seven of its stages.
This boundary is therefore also the end of the workflow rather than a handoff
into another phase. The check is run anyway: the value is the record it leaves,
not the transition it authorises.

## 1. All Units built and tested

Six Units, all built, all reviewed, all with completion receipts in the audit
ledger (58 `UNIT_COMPLETED` rows across the stage's attempts).

| Unit | code-generation | Final review verdict |
|---|---|---|
| u1-publishable-site-shell | Complete | NOT-READY (iteration 2) — see exception 2 |
| u2-blog | Complete | READY |
| u3-projects | Complete | READY |
| u4-about-page | Complete | READY |
| u5-visual-direction | Complete | READY |
| u6-launch-content | Complete | READY |

Construction stage state: `functional-design` `[x]`, `code-generation` `[x]`,
`build-and-test` `[x]`, `ci-pipeline` in progress and completing with this
check. `nfr-requirements`, `nfr-design` and `infrastructure-design` are SKIP by
scope.

Build and test evidence, from `construction/build-and-test/test-results.md`:
22 test files, 160 tests, all passing; 96.25% line coverage against the 80%
floor; all three blocking site checks passing; typecheck, lint and format
clean; `npm audit` reporting 0 vulnerabilities.

## 2. Traceability files complete, with no unresolved GAP or ORPHAN

All six `construction/*/code-generation/traceability.json` files are present.
Every `coverage` and `reverse` entry across all six carries a status of `OK`,
`N/A` or `Deferred` — **no `GAP` and no `ORPHAN` anywhere**.

## 3. The cross-Unit FR/NFR/AC gate passed

From `construction/build-and-test/cross-unit-traceability.md`, verdict PASS:

| Measure | Count |
|---|---|
| Enumerated leaf requirements (34 FR + 12 NFR) | 46 |
| Covered `OK` in at least one Unit | 46 |
| Uncovered | 0 |
| `OK` entries naming a file target | 103 |
| File targets missing from disk | 0 |

No `AC` set exists to enumerate: `user-stories` is SKIP for this scope.

## 4. CI quality gates enforce the recorded build and test commands

This is the check that closes the loop between what Build and Test executed and
what the pipeline enforces. Every command Build and Test ran as blocking is now
a blocking step in the `check` job of `.github/workflows/publish.yml`:

| Command recorded by Build and Test | Enforced in CI |
|---|---|
| `npm run check` — the three blocking site checks | Yes, pre-existing |
| `npm test` — suite and the 80% coverage floor | Yes, added at [Q1] |
| `npm run typecheck` | Yes, added at [Q1] |
| `npm run lint` | Yes, added at [Q1] |
| `npm run format:check` | Yes, added at [Q1] |

The deploy job has `needs: check`, so any one of them failing means nothing is
published. That gating behaviour was exercised against the live site during
Build and Test rather than assumed — check job failed, deploy job skipped, live
page hash unchanged.

## Exceptions

Both were accepted by the author at the gate that owns them. Neither is a
traceability or coverage failure, and neither blocks this boundary.

### Exception 1 — `NFR1` is Unverified

The mandated WCAG 2.1 AA rule for keyboard operation and landmark structure.
Its only stated acceptance criterion is a manual keyboard walkthrough across
the seven page types; the automated scanner was declined at practices-discovery
[Q3] and the walkthrough was declined at build-and-test [Q1]. Build and Test
recorded a failed run on this basis and the author chose "Accept failure" at
the halt-and-ask.

`NFR1` is covered `OK` in the traceability chain — the implementation exists
and is traced. What is absent is the *verification* that it behaves as
specified. Nothing now checks skip-link behaviour, tab order, focus visibility,
focus traps, landmark structure, heading order, image alt text, link names, or
colour contrast, and a regression in any of them is invisible until a reader
hits it.

### Exception 2 — 13 open findings from Code Generation

One Critical, four Major, eight Minor, all mapped to `Accepted risk` on that
stage's `GATE_APPROVED` row. The Critical (`u1` R-03) concerned a
`source-manifest.json` claim and a `.gitignore` edit that were subsequently
reverted; the Majors are traceability citations and one overstated claim about
what `src/content-source.ts` validates. None is a code defect in the shipped
site.

## Consistency

No contradictions were found between phases.

One contradiction *within* this stage was detected and remains **open** at this
boundary. [Q3] leaves dependency alerting off, which contradicts `team.md`
§ Deployment ("enable **security-only dependency alerts**"). [Q4] chose to
resolve it by amending `team.md` through the learnings step, but the learnings
ritual answered "Nothing to add", so no amendment was persisted. `team.md`
still asserts a practice this project does not follow.

This does not block the boundary — it is a documentation-consistency defect in
the team's own rule file, not a traceability, coverage, or build failure — but
it crosses into Operation unresolved and is recorded here so it is not
mistaken for settled. `construction/ci-pipeline/quality-gates.md` § The
dependency-alerting divergence carries the three ways it can still be closed.

## Human approval

- [ ] Reviewed and accepted at the ci-pipeline approval gate
