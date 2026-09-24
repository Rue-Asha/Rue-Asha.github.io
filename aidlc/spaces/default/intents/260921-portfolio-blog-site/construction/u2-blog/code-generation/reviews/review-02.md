## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-23T18:22:27Z
**Iteration:** 1

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | `src/markup-renderer.ts` > `normaliseFenceLanguage`, `isKnownFenceLanguage` | The fence-language check case-normalises the label (` ```TS ` is treated as known) even though BR8.2's `statement`/`logic` text in `functional-spec.md` says nothing about case-insensitivity. The plan's own § "Where the fence check runs" and `code-summary.md` § "Key implementation decisions" disclose this reasoning explicitly and it is covered by a dedicated test (`tests/u2/markup-renderer.test.ts`, "treats an alias label as known, not as a typo"). It is a defensible reading, but it is still a loosening of the literal rule text that Functional Design never spelled out, so it is a decision the rule owner has not confirmed. | Confirm the case-insensitive reading of BR8.2 with Functional Design at Build and Test, or have BR8.2's text amended to state it explicitly. | New |
| R-02 | Minor | `src/site-builder.ts` § feed added to `pagesWritten`; `code-generation-plan.md` § "Read literally, flagged once" | `feed.xml` is pushed into `BuildManifest.pagesWritten` (W4 step 5) and `buildSitemap` excludes only its own output path, so the feed ends up as a `<url>` entry in `sitemap.xml` even though it is not an HTML page. This is a literal reading of BR5.11 that the plan and summary both flag explicitly as a Build-and-Test decision, following the precedent already set for `/404.html` in U1 — an honestly-disclosed judgment call rather than a hidden defect. | No action required for this unit; Build and Test should make the one-line `buildSitemap` decision the plan already scoped (list HTML pages only, or leave as is). | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `npx tsc --noEmit` (per supplied transcript) | exit 0 | No type errors |
| `npx eslint .` (per supplied transcript) | exit 0 | No lint violations |
| `npx prettier --check .` (per supplied transcript) | exit 0 | Formatting clean, consistent with the `.prettierignore` fixture-exclusion read during this review |
| `npm run build` (per supplied transcript) | exit 0, 9 pages into `dist/` | Build succeeds |
| `npm run check` (per supplied transcript) | exit 0, all three checks pass | Confirms the feed's autodiscovery link does not break check 3 |
| `npx vitest run tests/u2 --coverage` (per supplied transcript) | 4 files, 27 tests passed | Matches `code-summary.md`'s U2-only test count |
| `npx vitest run tests/u1 tests/u2 --coverage` (per supplied transcript) | 17 files, 133 tests passed, 96.17% lines / 87.2% branches against an 80% floor | Matches `code-summary.md`'s reported combined figures (96.15% cited there is consistent within rounding); confirms the unit-scoped 71.42%-vs-combined-96%+ discrepancy is a reporting artefact of the global threshold, correctly explained and flagged for Build and Test in `code-summary.md` § "Open items", not worked around |

### Summary

This unit's plan, implementation and stage artifacts are internally consistent and each of the hardest claims verified against source. `unknownFenceLanguages`/`isKnownFenceLanguage` in `src/markup-renderer.ts` correctly implement BR8.2's PRIMARY `known_language_resolution` route (ask Shiki's `bundledLanguages`, aliases included), the check runs in `SiteBuilder`'s validate phase alongside every other field error via `fieldError(item.path, "body", …)` (matching BR4.2/BR4.3), and `renderCode`'s throw on a labelled-unknown language reaching the renderer is correctly reasoned as an invariant check rather than a user-facing path, since validation already aborts before rendering (BR4.1/BR4.4). `buildAtomFeed` in `src/content-transforms.ts` matches BR8.3 exactly — title, canonical-URL `id`, `alternate` link, declared `updated`, and `summary` only, never the body — is pure (no clock, no file system), and correctly sources the post's site path from `SiteBuilder` via `postPath` rather than importing `page-renderer/shell.ts` (avoiding the module cycle the plan called out, and disclosed as a deviation from the plan's original signature). The feed autodiscovery link in `src/page-renderer/shell.ts` derives its path from `FEED_OUTPUT_PATH`, so the two cannot drift. `src/page-renderer/pages.ts` genuinely satisfies BR8.4–BR8.7 on direct reading (`postRow` wraps title/date/summary in exactly one anchor; `renderPost` emits exactly two "All posts" links, one before and one after the body) and is correctly absent from `source-manifest.json`'s writes list, consistent with the plan's and summary's claim that it was not modified. `traceability.json`'s twenty upstream IDs all resolve to files that exist and plausibly exercise the cited requirement. The two findings above were both independently reached and are the same two the unit's own artifacts (and a prior review pass recorded at `construction/u2-blog/code-generation/reviews/review-01.md`) already disclose as flagged, pre-scoped Build-and-Test decisions rather than silently introduced defects — neither is a Critical or blocking Major finding.
