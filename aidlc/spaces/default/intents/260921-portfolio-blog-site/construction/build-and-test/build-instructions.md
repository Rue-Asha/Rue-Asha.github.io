# Build Instructions

Source: the six units' `code-generation-plan.md` and `unit-test-instructions.md`
files, and `package.json`.

## Prerequisites

Node 22 or newer (`package.json` → `engines.node: ">=22"`). No other runtime,
no database, no local services, no environment variables. The site is static
and has no state outside this repository.

## Dependency installation

```sh
npm ci
```

A frozen install from the committed `package-lock.json`. Never `npm install` on
the publish path: the lockfile is the supply-chain control named in `team.md`
§ Deployment, and an unpinned install defeats it. The publish workflow runs the
same command.

## Build

```sh
npm run build
```

Runs `node --import tsx bin/build.ts`. TypeScript executes directly through
`tsx`; nothing is compiled to JavaScript on disk, which is the U1 tradeoff
recorded in the code-generation diary — it removes an emitted artifact that
would otherwise need keeping in step with its source.

Output goes to `dist/`. A build manifest is written to
`.build/build-manifest.json`. Both directories are gitignored.

## Build verification

A successful build prints the page count and the number of pages that came from
content files:

```
Built 11 pages into dist/ (4 from content files).
```

Two posts and two project write-ups produce 4 content pages; the remaining 7
are Home, Writing, Projects, About, 404, the feed, and the sitemap.

A build that does not produce a complete site writes nothing at all. This is
the property `FR1.7` rests on: there is no partial-output state in which the
site could be published half-built.

## Troubleshooting

**`Build failed with N field error. Nothing was written.`** — a content file is
missing a required field, or carries an unparseable date. The message names the
file and the field. This is the designed behaviour, not a defect: the build
fails loudly rather than skipping the file. Required fields are `title`,
`summary`, `date` for a post and `name`, `summary`, `year`, `type`, `tools`,
`repo` for a project. A project's live URL is optional and its rail row is
omitted when absent.

**A post you expected is missing from the output** — check for a `draft: true`
key in its front matter. Drafts are dropped at the content boundary and appear
in no page, list, feed entry, or sitemap entry.

**The build succeeds but `npm run check` fails at check 3** — an internal link
does not resolve. External links are never checked and never block.

## Type check

```sh
npm run typecheck
```

`tsc --noEmit`. Type safety without an emitted build artifact.
