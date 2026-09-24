# Test Results

Executed 2026-09-24. Every command below was run; nothing here is projected.

## Build status

```
$ npm run build
Built 11 pages into dist/ (4 from content files).
```

Success. Eleven outputs: Home, Writing, Projects, About, 404, the feed, the
sitemap, two post pages, and two project pages.

## Blocking checks

The three affirmed blocking checks (`team.md` § Testing Posture, `NFR9`):

```
$ npm run check
1. The site builds ......................... pass
2. Every content file produced a page ...... pass
3. Internal links resolve .................. pass

All three checks passed.
```

External links are not checked and are not on the publish path (`NFR11`),
verified by reading `src/check-runner.ts`: the link check resolves against the
built output tree and never issues a network request.

## Suite

```
$ npm test          # vitest run --coverage
Test Files  22 passed (22)
     Tests  160 passed (160)
  Duration  1.08s
```

| Total | Passed | Failed | Skipped |
|---|---|---|---|
| 160 | 160 | 0 | 0 |

No failures, so no failure details to record.

Draft handling (`NFR10`) is asserted by fixture: `tests/u1/fixtures/with-draft/`
and `tests/u2/fixtures/feed-site/` both carry a `hidden-post`, and the
assertions require it to be absent from pages, lists, the feed and the sitemap
while the published sibling is present.

## Coverage

Measured over `src/**` on the combined run, against the 80% line floor
inherited from `org.md` by scope.

```
Statements   : 95.18% ( 573/602 )
Branches     : 87.28% ( 302/346 )
Functions    : 97.5%  ( 117/120 )
Lines        : 96.25% ( 540/561 )
```

Per file:

| File | Lines | Covered/Total |
|---|---|---|
| src/check-runner.ts | 94.80% | 73/77 |
| src/content-source.ts | 92.39% | 85/92 |
| src/content-transforms.ts | 100% | 62/62 |
| src/errors.ts | 81.81% | 9/11 |
| src/markup-renderer.ts | 98.46% | 64/65 |
| src/post-catalog.ts | 93.33% | 42/45 |
| src/project-catalog.ts | 97.59% | 81/83 |
| src/site-builder.ts | 97.10% | 67/69 |
| src/page-renderer/pages.ts | 100% | 27/27 |
| src/page-renderer/shell.ts | 100% | 30/30 |

Every file clears the floor individually as well as in aggregate.

Two honest qualifications, neither of which changes the verdict:

- `pages.ts` is a file of several hundred lines with 27 *instrumented* lines.
  V8 counts executable lines and this renderer is mostly template literals,
  which are not executable. The 100% is true and it overstates how much of that
  file's behaviour is exercised. The integration tests are what actually cover
  the markup.
- `src/types.ts` and the three files under `src/assets/` report 0/0 and display
  as 100%. They have no executable lines at all. This is report noise from the
  `include: ["src/**"]` glob, not a measurement.

## Static verification

Evidence for the targets whose stated criteria call for a browser but whose
substance is checkable in the built output.

| Check | Command | Result |
|---|---|---|
| No client-side scripts (`NFR2`) | `grep -rl "<script" dist/` | No matches. Every page is complete as served; the JavaScript-disabled criterion passes trivially. |
| No third-party origins (`NFR3`) | `grep -rhoE 'https?://[a-z0-9.-]+' dist/ --include="*.html" \| sort -u` | `https://github.com`, `https://rue-asha.github.io`. The first appears only as link `href` targets, which are not resource loads. |
| CSP on every page (`NFR4`) | `grep -rl 'http-equiv="Content-Security-Policy"' dist --include="*.html"` | 9 of 9 HTML pages. |
| Slug rule (`NFR8`) | Inspection of `content/*/*/` directory names | `building-this-site`, `implementing-a-methodology-paper`, `rue-asha-github-io`, `homelab` — all lowercase, kebab-case, ASCII. |
| Action pinning | `grep -cE "uses: .+@[0-9a-f]{40}" .github/workflows/publish.yml` | 5 of 5 `uses:` entries pinned to full commit SHAs. |
| Dependencies | `npm audit` | found 0 vulnerabilities |
| Type check | `npm run typecheck` | clean, no output |
| Lint | `npm run lint` | clean, no output |
| Format | `npm run format:check` | All matched files use Prettier code style! |

## Ordering across a fresh checkout

`FR2.2` requires post order to come from the declared front-matter date and
never from file modification time, with the stated criterion being a fresh
clone and rebuild.

The repository was cloned to a temporary directory and rebuilt. The Writing
list order was identical to the local build.

**This pass is weaker than it looks and is recorded as such.** Both posts
declare `date: 2026-09-23`, so the two orderings agree without the date
actually discriminating between them. The real evidence for date-based ordering
is `tests/u1/post-catalog.test.ts` and `tests/u3/ordering-parity.test.ts`,
which exercise it with distinct dates. The fresh-clone run confirms only that
nothing timestamp-derived leaked in — worth having, not sufficient alone.

## Rollback rehearsal

`FR1.7` and walking-skeleton condition 4 both require the undo path to be
exercised rather than assumed. It had never been run. It has now.

**The break.** `content/posts/rollback-rehearsal/index.md` was committed with
its required `date` field omitted. Locally:

```
$ npm run build
Build failed with 1 field error. Nothing was written.

  content/posts/rollback-rehearsal/index.md [date] is required and is absent.
```

The build named the file and the field and wrote nothing — `FR1.5` satisfied
against a real malformed file rather than a fixture.

**The push.** Commit `9778d53` pushed to `main`. Publish run `36058918745`:

| Job | Conclusion |
|---|---|
| Build and run the three blocking checks | failure |
| Deploy to GitHub Pages | **skipped** |

The deploy job never ran.

**The live site during the failure.**

| Measurement | Before the push | During the failure |
|---|---|---|
| Home status | 200 | 200 |
| Home body hash (sha256, first 16) | `7016b604fb8b08cd` | `7016b604fb8b08cd` |
| Posts listed on `/writing/` | 3 | 3 |
| `/writing/rollback-rehearsal/` | — | 404 |

Unchanged. The broken commit was never published.

**The undo.** `git revert` of `9778d53` as commit `437e190`, pushed. Publish
run `36059048602`: check job success, deploy job success. Afterwards the home
page hash was still `7016b604fb8b08cd` — byte-identical to before the rehearsal
began — and all seven page types serve 200.

**What this establishes.** The publish gate holds in the direction that
matters: a build that does not produce a complete site publishes nothing and
leaves the previous version serving. The rollback is no longer a procedure
nobody has run.

## In-stage fix applied

One defect was found and fixed inside this stage's own remit (test
configuration), which is rung 1 of the failure ladder:

`package.json` → `"test"` was `vitest run tests/u1 tests/u2 --coverage`,
silently skipping `tests/u3`, `tests/u4` and `tests/u5` — three of the five
test directories. The canonical command reported green while running 40% less
than the suite. This is the gap `u4-about-page`'s review raised as finding
R-02. It is now `vitest run --coverage`, which collects all 22 files via the
`include: ["tests/**/*.test.ts"]` glob; re-run confirms 22 files and 160 tests.

## Failure handling

**The failure predicate fires.** One applicable target is `Unverified`:

| Target | Why |
|---|---|
| `NFR1` — WCAG 2.1 AA keyboard operation and landmark structure | Its stated acceptance criterion is a manual keyboard walkthrough on each of the seven page types. It was offered at [Q1] and the author chose answer C, which runs the phone-width checks only. |

Per the stage's rule, an unverified target is a failure regardless of every
other result, and cannot be written up as a pass.

**Rung 1 — in-stage fix.** Not applicable. The root cause is not test
configuration, build scripting, or environment setup; the check is a human
procedure that was not performed. Nothing in this stage's remit can execute it.
Browser automation was attempted and is unavailable in this session.

**Rung 2 — classify and estimate impact.** The root cause does not lie in
generated source, in generated test code, or in an approach chosen at
code-generation. No library, image, instance type, algorithm or flag can be
swapped to produce this evidence. There is therefore **no identifiable fix in
any swappable dimension**, and rung 3's loop-back to code-generation would be
meaningless — there is nothing there to repair.

For completeness, the two things that *would* produce the evidence are both
outside this stage's authority to apply:

| Path | Effort | Financial cost | Risk |
|---|---|---|---|
| The author runs the walkthrough on seven page types | ~35 minutes | None | None. Already declined at [Q1]; re-offering it would re-open a settled decision. |
| Adopt an automated accessibility scanner | ~2 hours to add and wire in | None (open source) | Requires a new decision: the scanner was explicitly offered and declined at practices-discovery [Q3], and `team.md` records that choice with its cost. |

**Rung 3 — autonomous bounded loop-back.** Does not fire. `Construction
Autonomy Mode` is not recorded in `aidlc-state.md` and is therefore treated as
gated, and rung 2 found no code-generation fix to carry back.

**Rung 4 — halt-and-ask.** The no-fix variant applies, because rung 2 produced
no impact-estimated candidate fix in a swappable dimension. Presenting a
"Retry with fix" option would mean inventing one. The failure is logged here
and the decision is the author's.

## Loop-Back Log

No loop-back has been fired by this protocol. This section is append-only and
must survive re-runs of this stage; on any re-entry choose Modify, never Redo,
or the ledger is erased.
