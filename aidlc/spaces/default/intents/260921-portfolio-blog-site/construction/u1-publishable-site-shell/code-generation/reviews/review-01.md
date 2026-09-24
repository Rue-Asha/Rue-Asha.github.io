## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-09-23T17:25:07Z
**Iteration:** 1

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | `src/site-builder.ts` § sitemap construction, referencing BR5.11 | Read literally, `pagesWritten` now includes both `/404.html` and `feed.xml` (U2's addition), so `sitemap.xml` lists an error page and the Atom feed alongside real content pages. This is the same literal reading `code-summary.md` already flagged for `/404.html`; the later change compounds it rather than resolving it, and the in-code comment documents the compounding explicitly rather than silently narrowing the rule. | Confirm at Build and Test whether BR5.11 is meant to exclude non-content utility pages from the sitemap, and make the one-line change to `buildSitemap`'s call site if so. No code defect — a literal-vs-intent question already carried forward, now with one more instance. | New |
| R-02 | Minor | `aidlc/.../code-generation/code-summary.md` § Test coverage | The committed `code-summary.md` still reports U1's original standalone figures (82 tests, 95.89% lines) and does not mention the combined `tests/u1 tests/u2` run (109 tests, 96.15%) or the fence-language field-error class U2 added into `SiteBuilder`'s validate phase. The artifact is accurate as of when U1 finished, but a reader of this file alone would not learn that a second class of field error now participates in BR4.2/BR4.4's "every field error" contract. | Not required for this unit's own claims (all of which check out against current code), but worth a one-line addendum at the next review that touches this file, noting the file predates U2's changes to shared modules. | New |

No Critical or Major findings. Both spot-checked shared-file modifications (feed/sitemap addition in `site-builder.ts`, `content-transforms.ts`; BR8.2 fence-language validation in `markup-renderer.ts`/`site-builder.ts`) preserve every U1 rule checked below rather than breaking it.

### Verification detail (evidence for the "no Critical/Major" conclusion)

- **BR2.3 / YAML core-schema pin** — `src/content-source.ts` still constructs `YAML_ENGINE` with `js-yaml`'s `CORE_SCHEMA` and hands it to `gray-matter`; untouched since U1. `parseIsoDate` in `content-transforms.ts` still does the strict `YYYY-MM-DD` regex-plus-real-calendar-day check, unmodified.
- **BR1.6/BR1.7 draft handling** — `readDraftMark` (non-boolean → field error, absent → not-draft) and the `if (draft.isDraft) continue;` exclusion point in `loadContent` are unchanged; drafts still never enter `items`, so every downstream consumer (catalogs, sitemap, feed) excludes them by construction.
- **BR4.1–BR4.5 fail-loudly contract** — `buildSite` in `site-builder.ts` now folds U2's `fenceLanguageErrors(loaded.items)` into the same `errors` array collected at the end of the validate phase, before the `if (errors.length > 0) throw new BuildFailedError(errors)` gate that precedes the render phase. The new error class reaches the abort point through the existing single gate rather than a parallel check, so "any field error → nothing is written" (BR4.4) and "every error reported together" (BR4.2) both still hold for the new fault class. Confirmed live: `npx vitest run tests/u1 tests/u2` — 13 files, 109 tests, all passing.
- **BR5.10 CSP, byte-for-byte** — `site.config.ts`'s `contentSecurityPolicy` string and `rules.md`'s BR5.10 fixed value are character-identical (`default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; script-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`). `escapeHtml` (in `markup-renderer.ts`) escapes `&`, `<`, `>`, `"` but deliberately not `'`; the policy string's only quote characters are single quotes, so the emitted `content="..."` attribute in `shell.ts` reproduces the rule's text unchanged.
- **BR5.11 sitemap** — see R-01 above; behavior is a literal, documented reading, not a silent break.
- **The narrowed U1 test** — `tests/u1/markup-renderer.test.ts` still asserts "renders an unlabelled fence as plain escaped code, silently"; only the labelled-unknown-language sub-case was removed, with an in-file comment pointing to where it moved (`tests/u2/*`) and why (BR8.2 reverses only that one case). The U1 rule this test exists for (`BR8.2`'s sibling behavior for *unlabelled* fences, which is not itself a BR-numbered U1 rule but is asserted in the same file) is intact and still covered.
- **`traceability.json`** — every `target` path (`src/*.ts`, `bin/check.ts`, `.github/workflows/publish.yml`, `tests/u1/*.test.ts`) exists in the current tree and lies within the paths `source-manifest.json` claims (`src/`, `bin/`, `tests/`, `.github/`). No dangling reference found among the 44 BR ids plus the 9 NFR ids listed.
- **Publishing workflow, `team.md` § Deployment's four controls** — `.github/workflows/publish.yml`: (1) top-level `permissions: contents: read`, with `pages: write`/`id-token: write` granted only on the `deploy` job; (2) all four third-party actions (`checkout`, `setup-node`, `configure-pages`, `upload-pages-artifact`, `deploy-pages`) pinned to full commit SHAs with a version comment, no tags; (3) trigger is `on: push: branches: [main]` only — no `pull_request_target` anywhere in the file; (4) the only install step is `npm ci`, no unpinned fetch or installer script.
- **Local gate, run directly** — `tsc --noEmit` exit 0; `eslint .` exit 0; `prettier --check .` exit 0 ("All matched files use Prettier code style!"); these match the orchestrator-supplied output and were independently reproduced.
- **Coverage floor** — `vitest.config.ts` still sets `thresholds.lines: 80` with no `coverage.exclude`; the orchestrator-supplied combined run shows 96.15% lines, above floor, and no threshold was weakened to reach it.
- **BR3.5 liveUrl** — validation (empty-but-present → field error) lives in `project-catalog.ts`; the omit-the-row-not-blank rendering lives in `page-renderer/pages.ts`. Both halves of the rule are implemented in the component the rule assigns.
- **Content/tooling exclusion (`project.md` § Mandated)** — `ContentSource` only ever walks `content/posts/` and `content/projects/`, so `aidlc/` and `.claude/` are never read as content and never appear in `dist/`; this is a structural guarantee (BR1.1), not a filter that could be forgotten.
- **Carried-forward open items** — `code-summary.md`'s CA4 (Pages source must be switched to "GitHub Actions" by hand), CA5 (six skeleton conditions proved at Build and Test), FA1/OQ2, and the un-run keyboard walkthrough are stated as open rather than claimed done, and nothing in the current code or workflow contradicts that framing.

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `npx tsc --noEmit` | PASS (exit 0), reproduced directly | Type-checking is clean across the shared U1/U2 tree. |
| `npx eslint .` | PASS (exit 0), reproduced directly | No lint violations. |
| `npx prettier --check .` | PASS (exit 0), reproduced directly | Formatting matches the project config. |
| `npx vitest run tests/u1 tests/u2` | PASS — 13 files, 109 tests, reproduced directly | Confirms the orchestrator-supplied figures; no regression from U2's shared-file edits against U1's own suite. |
| `npx vitest run tests/u1 tests/u2 --coverage` (orchestrator-run, not reproduced per instructions) | 96.15% lines against an 80% floor | Consistent with `vitest.config.ts`'s unweakened threshold; taken as given per dispatch instructions. |
| `node --import tsx bin/check.ts` (orchestrator-run, not reproduced per instructions) | All three checks pass | Consistent with `check-runner.ts`'s implementation of BR6.1–BR6.5; taken as given per dispatch instructions. |

### Summary

The 44 rules this unit claims were spot-checked at the points most exposed by U2's later edits to shared files (`markup-renderer.ts`, `content-transforms.ts`, `site-builder.ts`, `page-renderer/shell.ts`), and every one checked — BR2.3's YAML pin, BR1.6/BR1.7 draft handling, BR4.1–BR4.5's fail-loudly gate, BR5.10's exact CSP string, and the narrowed U1 test — still holds correctly in the current code. The one genuine drift (BR5.11's sitemap now literally including two utility pages instead of one) is the same documented, deliberate literal-reading choice U1 already flagged for Build and Test, not a defect introduced by omission. Traceability targets all resolve, the publishing workflow meets all four required controls, and the local gate reproduces clean.
