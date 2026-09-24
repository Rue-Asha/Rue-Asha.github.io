# Build and Test — Questions

**Stage**: build-and-test
**Depth**: Standard (target range ~5-8 questions)
**Questions asked**: 2

## Why only two

Construction questions are exceptional rather than routine, and the approved
upstream artifacts settle nearly everything this stage would otherwise ask.
Named explicitly, so a count below the depth range reads as prior stages having
done their work rather than as a gap:

| Topic not asked | What already settles it |
|---|---|
| Test framework, runner, configuration | `u1-publishable-site-shell/code-generation/unit-test-instructions.md` — Vitest with V8 coverage, bootstrapped at U1 |
| Coverage floor and how it is measured | `team.md` § Testing Posture — 80% lines, inherited from `org.md`, determined per unit here; `vitest.config.ts` carries the threshold |
| Test volume and types | `aidlc-state.md` → Test Strategy `Standard`; the approved `## Testing Contract`, identical across all six units (`sha256:ad8836ce…`) |
| Which checks are blocking, and where they run | `team.md` § Testing Posture — three checks, all blocking, on the author's machine before the push |
| Whether an accessibility scanner runs | Offered and declined at practices-discovery [Q3]; the manual walkthrough is the affirmed substitute, recorded with its cost |
| Build commands and publishing route | `.github/workflows/publish.yml`; `team.md` § Deployment |
| Security scanning depth | `team.md` § Code Style — linting is a quality tool here, not a security control; the controls that protect something are secret push protection, the committed lockfile, and SHA-pinned actions |

## What was already verified without asking

Everything below was executed and recorded rather than asked about. See
`test-results.md` for the evidence.

- The full unit suite: 22 files, 160 tests, all passing.
- Line coverage 96.25% (540/561) against the 80% floor, measured per file.
- The three blocking site checks: build, every content file produced a page,
  internal links resolve.
- `tsc --noEmit`, `eslint .`, `prettier --check .` — all clean.
- `npm audit` — 0 vulnerabilities.
- No `<script>` tag in any built page, and no third-party origin in the output.
- Cross-unit traceability: all 46 leaf requirements covered `OK`, all 103 file
  targets present on disk.
- The live site, against its real URL: seven page types serving, `/aidlc/` and
  `/aidlc/spaces/default/memory/project.md` both 404, an unmatched path serving
  our own 404 page rather than the platform default.

## Q1 — The manual browser checks

Three targets state acceptance criteria that can only be met by a person
driving a real browser. Nothing in this repository can execute them, and this
scope schedules no later validation stage that owns them — `performance-validation`
is SKIPPED — so each is either run by you now or recorded as `Unverified`.

**NFR1 — the keyboard walkthrough.** The mandated WCAG 2.1 AA rule, whose only
verification is this walkthrough (the automated scanner was declined). Seven
page types — Home, Writing, Post, Projects, Project, About, 404 — roughly five
minutes each. On each page confirm: the skip-to-content link is the first
focusable element and becomes visible on focus, tab order follows visual order,
every stop shows a visible focus outline, and nothing swallows focus. The
styling has landed since the last walkthrough, which is exactly the second pass
`team.md` requires.

**NFR6 and NFR7 — phone width.** Load each page type at desktop and phone
width. The Project metadata rail stacks above the body, list rows keep one hit
target with the date moving beneath the title, the top bar stays visible with
no hamburger, and every list row and interactive target clears 44px.

Which will you run now?

- A. Both — the keyboard walkthrough and the phone-width checks
- B. The keyboard walkthrough only; record the phone-width targets as unverified
- C. The phone-width checks only; record NFR1 as unverified
- D. Neither now — record all three as unverified, with what that costs written down
- X. Other (please specify)

[Answer]: C

## Q2 — The rollback rehearsal

`FR1.7` requires that a build which does not produce a complete site leaves the
previously live site serving, and its stated criterion is to break the build
deliberately and push. The same act is condition 4 of the walking skeleton in
`team.md`: "the undo path has been exercised once, deliberately… A rollback
nobody has ever run is a rollback we are guessing about."

It has never been run. Running it means pushing a deliberately broken commit to
`main`, confirming the publish workflow fails and the live site keeps serving
the current version, then reverting and pushing again. The site stays up
throughout if the gate behaves as designed — that is the thing being tested.

- A. Run it now, against the live site
- B. Record `FR1.7` as unverified and leave the rollback unrehearsed
- X. Other (please specify)

[Answer]: A

## Q3 — Follow-up: the phone-width result

Q1 selected the phone-width checks (`NFR6`, `NFR7`). Browser tooling is not
available in this session, so the measurement has to be taken by the author.
The stylesheet was read instead and every stated behaviour is implemented at
the `max-width: 719.98px` breakpoint — the rail stacks, `.post-row > a`
collapses to one column with the date moved to row 2, no hamburger exists
anywhere, and `--target-min-height` becomes `44px` below the breakpoint. That
is static evidence, not the stated criterion, which is to load each page type
at two widths and measure the row hit areas.

What did the browser show?

- A. All four behaviours held — record `NFR6` and `NFR7` as `Met`
- B. Something did not hold — record which, and treat it as a finding
- C. Not run — record `NFR6` and `NFR7` as `Unverified` on the static evidence
- X. Other (please specify)

[Answer]: A
