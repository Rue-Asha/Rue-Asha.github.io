# Unit Test Instructions — U4 About Page

Eight tests over one component: six on the rendered markup, two against a real
build. The runner, its configuration and the coverage threshold were all
bootstrapped by U1; nothing here sets them up again.

`vitest.config.ts` carries the 80% line threshold that `org.md` requires by
scope. Nothing in this file lowers it, and a threshold setting is never
adjusted to make a step pass.

## How to run this unit's tests

This unit's tests only:

```bash
npx vitest run tests/u4 --coverage
```

That command is runnable before the first test is written — U1 installed vitest
and its configuration, so there is no bootstrap step here. Verify it against an
existing unit first (`npx vitest run tests/u1`) if the toolchain has not been
exercised in this session.

The whole suite, which is where the 80% line floor is measured:

```bash
npx vitest run tests/u1 tests/u2 tests/u3 tests/u4 --coverage
```

**A `tests/u4`-only run reports coverage below the floor and exits non-zero.**
That is the *global* threshold being applied to a partial run, not a failure of
this unit: rendering one page executes a small slice of `src/`. Read the
per-file rows instead — `src/page-renderer/pages.ts` is what this unit changes.
The combined command above is the one that measures the floor.

## Framework setup

Nothing to install. U1 established vitest 5, `@vitest/coverage-v8`, and the
v8 provider with `thresholds.lines: 80`. `tsx` runs the TypeScript directly, so
there is no build step before tests.

## Shared helpers

`tests/u4/helpers.ts` imports rather than redefines:

- `TEST_SITE`, `TEST_BUILD_DATE`, `temporaryOutputRoot` — from
  `../u1/helpers.ts`. Duplicating them would let the copies drift, and
  `TEST_SITE` carries the content-security-policy string that BR5.10 fixes
  character for character.
- `renderDocument`, `renderAbout` — from `../../src/page-renderer/`.

It exports two things of its own:

- `renderAboutPage()` — renders the full document, not the `main` fragment.
  Heading order and landmark structure are properties of the whole page; the
  shell contributes markup too, so asserting against the fragment would measure
  the wrong thing.
- `headingLevels(html)` — every heading level in document order, e.g.
  `[1, 2]`. Matches opening tags only (`/<h([1-6])(?=[\s/>])/g`); a closing tag
  or an attribute value must not count, or the sequence doubles and every page
  looks flat. Same extractor U3 established.

## Test files and what each covers

### `about.test.ts` — six tests

| # | Test | Rule |
|---|---|---|
| 1 | Exactly one `h1`, and it is the first heading on the page | WCAG 2.1 AA landmark bar |
| 2 | Heading levels never skip — the sequence rises by at most one | WCAG 2.1 AA landmark bar |
| 3 | A link with `href="https://github.com/Rue-Asha"` exists, and its accessible name names the destination rather than being "here", "link" or "profile" | BR10.2 |
| 4 | A link with `href="mailto:rue.asha@proton.me"` exists | BR10.2, BR10.3 |
| 5 | The page carries real prose beneath its heading — at least one non-empty paragraph, and none of U1's placeholder sentences survive | BR10.3 |
| 6 | No off-origin resource is referenced — no `src=`, no `<link href=` and no `<iframe` pointing at another host; off-origin appears only in ordinary anchor `href`s | BR10.2, U1 BR5.10 |

Test 5 is written as a property rather than against the exact drafted wording,
so editing the prose later does not break the test. What it asserts is that
prose *exists* and that the placeholder is gone — which is what BR10.3 actually
requires.

Test 3 asserts the accessible name is not a bare label, again as a property.
Nothing else in this repository checks link names: the automated accessibility
scan was declined at Practices Discovery, so this test and the keyboard
walkthrough are the whole of that coverage.

### `integration.test.ts` — two tests

Both build a real site into a temporary output root (`temporaryOutputRoot()`,
which uses the OS temp directory — nothing is written inside the repository).

| # | Test | Rule |
|---|---|---|
| 1 | `about/index.html` is written on every build, including from a content tree with no projects at all | BR10.3 |
| 2 | The written file contains the prose and both links | BR10.3, BR10.2 |

**These two are the only automated check standing behind BR10.3.**
`functional-spec.md` says so explicitly: check 2 of the pre-push set matches
output pages against content files, and About has no content file by design, so
a build that silently stopped emitting About would register nowhere else.

## Fixtures

One fixture, `tests/u4/fixtures/minimal-site/`, holding a single valid post and
no projects:

```
tests/u4/fixtures/minimal-site/
  content/posts/a-post/index.md
```

Deliberately minimal and deliberately project-free: the point of integration
test 1 is that About is emitted unconditionally, so the fixture must not supply
anything About could be mistaken for depending on.

The post carries the three required fields (`title`, `summary`, `date`) so the
build does not fail validation for an unrelated reason.

## Mocking and stubbing

None. `renderAbout` takes one string and returns a `PageDefinition`; there is
nothing to mock. The integration tests run the real build against a real
fixture and write to a real temporary directory, because a mocked build would
not prove the thing BR10.3 needs proving.

## Coverage targets

`src/page-renderer/pages.ts` is the file this unit changes. `renderAbout` is a
straight-line function with no branches, so the first test that calls it covers
100% of its lines and branches; the target is therefore full coverage of the
changed function, not a percentage negotiated downward.

The 80% line floor is a whole-suite measure and is verified at Build and Test
against the combined command above.

## What these tests do not cover, and what does instead

| Not covered here | Covered by |
|---|---|
| Tab order, visible focus, skip-link behaviour, focus traps | The keyboard walkthrough (plan Step 9) — no automated substitute exists |
| Colour contrast and visual spacing | U5, and a design review; nothing automated |
| That the two outbound links actually resolve | Nothing, by choice — `team.md` § Testing Posture makes external links never build-blocking |
| That `/about/` is linked from every page | U1's shell tests and check 3 of the pre-push set |
