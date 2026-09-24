# Build and Test Summary

## Overall status

Build-ready, test-ready, and deployment-ready — the site is already deployed
and serving at <https://rue-asha.github.io>.

| Dimension | Status |
|---|---|
| Build | Success. `Built 11 pages into dist/ (4 from content files).` |
| Unit tests | 22 files, 160 tests, all passing |
| Line coverage | 96.25% (540/561) against the inherited 80% floor |
| Three blocking site checks | All pass |
| Static analysis | `tsc --noEmit`, `eslint .`, `prettier --check .` all clean |
| Dependencies | `npm audit` — 0 vulnerabilities |
| Cross-unit traceability | 46/46 leaf requirements `OK`; 103/103 file targets present |

## Prerequisites

Node 22 or newer and `npm ci`. Nothing else — no database, no services, no
environment variables. See `build-instructions.md`.

## Test type inventory

| Type | Generated | Why |
|---|---|---|
| Unit | Per unit, by Code Generation | Standard strategy; `tests/u1`–`tests/u5` |
| Integration | `integration-test-instructions.md` | Standard strategy calls for key boundaries; four cross-unit seams identified |
| Performance | `performance-test-instructions.md` — **not applicable** | `NFR5` states the site carries no numeric performance target, and none may be introduced without a new decision |
| Security | `security-test-instructions.md` | `NFR3`, `NFR4` and the credential rules are security requirements, so the file is written rather than skipped |
| Accessibility scan | Not generated | Offered and declined at practices-discovery [Q3]; the manual keyboard walkthrough is the affirmed substitute |

## Coverage per unit

The floor is measured over `src/**` on the combined run. A unit-scoped run
reports coverage of the whole source tree against only that unit's tests and
reads low by construction; it is not the measurement.

| Unit | Line coverage | Against the 80% floor |
|---|---|---|
| u1-publishable-site-shell | Contributes to the combined 96.25% | Met |
| u2-blog | Contributes to the combined 96.25% | Met |
| u3-projects | Contributes to the combined 96.25% | Met |
| u4-about-page | Contributes to the combined 96.25% | Met |
| u5-visual-direction | Contributes to the combined 96.25% | Met |
| u6-launch-content | `N/A — no instrumentable lines in this unit` | N/A, with its reason recorded |

Per-file figures are in `test-results.md`. The per-unit inventory above was
built by reading each unit's `code-summary.md` and `unit-test-instructions.md`
alongside its `code-generation-plan.md`; u6's `code-summary.md` is where the
`N/A` verdict and its reason were originally recorded, and this stage confirms
rather than re-derives it — `src/**` contains no file this unit authored.

## Target Verification Matrix

Sources: the approved `## Testing Contract` (identical across all six units,
`sha256:ad8836ce366096547cd20574d1d1d59666f1f99ec2231a2f5755c074208644d4`) and
the non-functional requirements in `requirements.md`. `nfr-requirements/` and
`nfr-design/` are SKIPPED for this scope, so they contribute no targets.

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| COV-LINES | Testing Contract → `scope_floor`; `org.md` § Testing Posture | ≥ 80% lines | 96.25% (540/561) | `test-results.md` § Coverage | build-and-test | Met |
| COV-VOLUME | Testing Contract → `strategy_volume` | 5–8 tests per component | 160 tests across 10 components (16 avg) | `test-results.md` § Suite | build-and-test | Met |
| COV-CI | Testing Contract → `scope_floor` | Selected tests run in CI before merge | Publish workflow runs `npm run check` on every push to `main`; job gates the deploy | `.github/workflows/publish.yml`; run 36058918745 | build-and-test | Met |
| NFR1 | `requirements.md` line 164 | Keyboard walkthrough on all seven page types, re-run after styling | Not run | Author declined at [Q1], answer C | build-and-test | **Unverified** |
| NFR2 | `requirements.md` line 165 | Pages served complete; nothing assembled in the browser | No `<script>` tag exists in any built page | `test-results.md` § Static verification | build-and-test | Met |
| NFR3 | `requirements.md` line 166 | No third-party resource loaded by any page | Only origins in the output are `rue-asha.github.io` and `github.com` link targets | `test-results.md` § Static verification | build-and-test | Met |
| NFR4 | `requirements.md` line 167 | CSP meta tag on every page, site works with it | 9 of 9 built pages carry it; live pages render correctly | `test-results.md` § Static verification; live smoke check | build-and-test | Met |
| NFR5 | `requirements.md` line 168 | No numeric performance target exists or is introduced | None exists; none introduced | `performance-test-instructions.md` | build-and-test | Met |
| NFR6 | `requirements.md` line 169 | Rail stacks, rows keep one hit target with date beneath, top bar visible with no hamburger | All held | Author's browser check at [Q3], answer A; stylesheet `@media (max-width: 719.98px)` | build-and-test | Met |
| NFR7 | `requirements.md` line 170 | 44px minimum touch target at phone width | Held | Author's browser check at [Q3]; `--target-min-height: 44px` below the breakpoint | build-and-test | Met |
| NFR8 | `requirements.md` line 171 | Slugs lowercase, kebab-case, ASCII; never changed once live | All 4 content slugs conform; no rename has occurred | `test-results.md` § Static verification | build-and-test | Met |
| NFR9 | `requirements.md` line 172 | Three blocking checks pass before any push | All three pass locally and in the workflow | `test-results.md` § Blocking checks | build-and-test | Met |
| NFR10 | `requirements.md` line 173 | Check 2 covers every non-draft file and ignores drafts | Drafts excluded at the content boundary; `tests/u1` and `tests/u2` draft fixtures assert it | `test-results.md` § Suite | build-and-test | Met |
| NFR11 | `requirements.md` line 174 | External links never build-blocking, never checked on the publish path | `check-runner.ts` checks internal links only | `test-results.md` § Blocking checks | build-and-test | Met |
| NFR12 | `requirements.md` line 175 | Per-unit coverage measured against the floor, or explicit N/A with reason | Five units measured; u6 recorded `N/A — no instrumentable lines in this unit` | § Coverage per unit above | build-and-test | Met |
| FR1.5 | `requirements.md` line 76 | Build fails naming file and field on a malformed post | `content/posts/rollback-rehearsal/index.md [date] is required and is absent.` Nothing written. | `test-results.md` § Rollback rehearsal | build-and-test | Met |
| FR1.7 | `requirements.md` line 78 | Previously live site keeps serving when a build is incomplete | Check job failed, deploy job skipped, live home hash unchanged throughout | `test-results.md` § Rollback rehearsal | build-and-test | Met |

One target is `Unverified`. Under this stage's failure predicate that is a
failed run, and it is handled through the failure ladder rather than being
written up as a pass — see `test-results.md` § Failure handling.

## Readiness assessment

- **Build-ready** — yes. Clean install, clean build, no manual steps.
- **Test-ready** — yes. `npm test` runs the whole suite; it previously ran only
  two of five test directories and that was fixed in this stage.
- **Deployment-ready** — yes, and already deployed. The publish route was
  exercised in both directions during the rollback rehearsal.

## Known limitations and outstanding items

1. **`NFR1` has no verification behind it.** The mandated WCAG 2.1 AA rule.
   The automated scanner was declined at practices-discovery and the manual
   walkthrough — its only substitute — was declined here. Nothing now checks
   skip-link behaviour, tab order, focus visibility, focus traps, landmark
   structure, heading order, image alt text, link names, or colour contrast. A
   regression in any of them is invisible until a reader hits it. This is the
   honest cost of two deliberate choices, recorded rather than argued with.
2. **`pages.ts` reports 100% line coverage over 27 instrumented lines** in a
   file of several hundred. V8 counts executable lines, and this renderer is
   largely template literals, which are not executable lines. The figure is
   true and it overstates behavioural coverage; the integration tests, not the
   percentage, are what actually exercise the markup.
3. **The coverage `include: ["src/**"]` glob pulls in three non-code files** —
   the font, the stylesheet, and a licence text — which appear as 0/0 "100%"
   rows. Noise in the report, not a defect in the measurement.
4. **Thirteen findings from Code Generation remain open** and were accepted as
   risk at that stage's gate: one Critical, four Major, eight Minor. They are
   traceability and documentation accuracy, not code defects.
