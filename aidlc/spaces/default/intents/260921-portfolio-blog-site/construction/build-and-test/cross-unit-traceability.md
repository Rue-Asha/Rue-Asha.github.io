# Cross-Unit Final Coverage Gate

**Verdict: PASS.** Every enumerated requirement is covered `OK` by at least one
unit, and every file target named by an `OK` entry exists on disk.

## What was enumerated

From `inception/requirements-analysis/requirements.md`:

- 34 leaf functional requirements — `FR1.1`–`FR1.7`, `FR2.1`–`FR2.9`,
  `FR3.1`–`FR3.7`, `FR4.1`–`FR4.6`, `FR5.1`–`FR5.5`
- 12 non-functional requirements — `NFR1`–`NFR12`

**46 enumerated IDs.** `FR1` through `FR5` are group headings rather than
requirements and carry no acceptance criterion of their own, so they are not
enumerated; their leaves are.

`user-stories` is SKIPPED for this scope, so there is no `stories.md` and no
three-segment `AC` set to enumerate.

## How coverage was resolved

The traceability chain on this project runs
`FR`/`NFR` → **functional-design** → `BR` → **code-generation** → source file.
Reading only the code-generation files would under-report by construction: U1's
code-generation traceability enumerates 44 `BR` entries and no `FR` entries,
because its `FR` coverage was discharged one stage earlier.

Both levels were therefore read, per unit:

| Unit | functional-design entries | code-generation entries |
|---|---|---|
| u1-publishable-site-shell | 19 (16 FR, 3 NFR) | 53 (44 BR, 9 NFR) |
| u2-blog | 10 (10 FR) | 21 (7 BR, 9 FR, 5 NFR) |
| u3-projects | 7 (7 FR) | 18 (5 BR, 7 FR, 6 NFR) |
| u4-about-page | 1 (1 FR) | 11 (2 FR, 3 BR, 5 NFR, 1 WCAG) |
| u5-visual-direction | 5 (5 NFR) | 16 (8 NFR, 8 BR) |
| u6-launch-content | 5 (3 FR, 2 NFR) | 6 (4 FR, 2 NFR) |

## Result

| Measure | Count |
|---|---|
| Enumerated IDs | 46 |
| Covered `OK` in at least one unit | **46** |
| Covered only as `N/A` | 0 |
| Uncovered | **0** |
| `OK` entries naming a file target | 103 |
| File targets missing from disk | **0** |

There are no uncovered elements, so this stage surfaces no coverage finding at
the approval gate.

## Notes on the shape of the coverage

Three requirements carry `N/A` entries in `u6-launch-content` alongside their
`OK` coverage elsewhere — `FR1.5`, `FR2.5` and `FR3.3`. These are the
"constrains this unit without being delivered by it" rows: U6 is prose only and
delivers no functional requirement, so it records what governs its two content
files and names the delivering unit rather than claiming delivery. `FR3.3`
carries the same shape in `u3-projects`. Each is additionally covered `OK` by
`u1-publishable-site-shell`, which owns the validation, so none of the three
rests on an `N/A` alone.

`u4-about-page` records one `WCAG`-prefixed entry, which is outside the ID
scheme in `.claude/knowledge/aidlc-shared/verification.md`. It is additional
coverage rather than a substitute for an enumerated ID, so it neither adds to
nor subtracts from the result above.

## Verification commands

Coverage and target existence were computed by reading every
`construction/*/functional-design/traceability.json` and
`construction/*/code-generation/traceability.json` file and resolving each
`OK` entry's target against the working tree. Re-running that resolution
reproduces the counts in the result table.
