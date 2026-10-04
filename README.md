# rue-asha.github.io

The source for a personal blog and project site published to GitHub Pages at
<https://rue-asha.github.io>.

Posts and project write-ups are Markdown files in this repository. A small
TypeScript generator in `src/` builds them into static HTML. There is no
authoring interface and there will not be one: content is files, and the
repository is the CMS.

Publishing is one act. Write a file, commit it, push it — a GitHub Actions
workflow builds the site and deploys it. Nothing else is required of the author
after the push.

## Running it locally

```sh
npm ci          # frozen install from the committed lockfile
npm run build   # writes the site into dist/
```

Node 22 or newer. `npm ci` is the whole setup.

## Before you push

Three checks are blocking, and they run on your machine rather than after the
push, so a failure is in front of you while you can still fix it:

```sh
npm run check
```

1. The site builds.
2. Every content file produced an output page — this is the one that catches a
   post silently dropped for malformed front matter.
3. Every internal link resolves across the built output.

External links are deliberately not checked: a dead third-party URL is somebody
else's outage and must never stop this site publishing.

Alongside those, `npm run typecheck`, `npm run lint` and `npm run format:check`
cover the site code. The formatter never touches the prose under `content/`.

## Writing

One directory per post, with its images inside it, under `content/posts/`.
Project write-ups live under `content/projects/`.

| File kind | Required front matter                              | Optional         |
| --------- | -------------------------------------------------- | ---------------- |
| Post      | `title`, `summary`, `date`                         | `tags`, `kicker` |
| Project   | `name`, `summary`, `year`, `type`, `tools`, `repo` | `liveUrl`        |

A missing **required** field is a build failure that names the file and the
field — the build fails loudly rather than skipping the file.

An **optional** field that is absent is omitted from the page entirely rather
than rendered empty: a project with no live URL gets no `Live` link, a post with
no kicker gets no line above its title, and a Writing listing where no entry is
tagged has no tag column at all. An optional field that is _present and the
wrong shape_ is still a build failure — `tags: infrastructure` written without
the list syntax would otherwise vanish silently.

```yaml
---
title: Building this site
summary: Why this site has its own build rather than an off-the-shelf generator.
date: 2026-09-23
kicker: Field notes
tags:
  - infrastructure
  - typescript
---
```

The file name is the URL, so file names are lowercase, kebab-case and ASCII.
Published slugs never change: renaming one breaks every link anyone shared, and
GitHub Pages has no server-side redirects.

Post ordering reads the `date` in front matter, never the file's modification
time.

## The look

One stylesheet, `src/assets/styles/site.css`, and one class on the page root.
The direction is an instrument panel: bordered panels, a visible grid, IBM Plex
Mono for every label and number, IBM Plex Sans for reading, and one signal
colour — a deep teal-emerald on a cool off-white ground. It is light-only. There
is no dark theme, no toggle and no `prefers-color-scheme` branch; the single
`:root` block is the whole palette.

Two things the policy in the page head decides rather than taste:

- **No `style` attribute is ever emitted.** `style-src 'self'` carries no
  `'unsafe-inline'`, so a grid template passed inline would be dropped by the
  browser and a table would silently collapse into one column. Every column
  layout is a class.
- **Nothing runs in the reader's browser.** `script-src 'none'`. The contents
  rail on a post page is a plain list of anchors with no active marking, the tag
  chips are labels rather than filters, and there is no reading-progress bar.
  Each would need a script, and a control that does not work is worse than one
  that is not there.

Editorial copy that is not a content file lives in `site.config.ts` — the
sentence Home opens with, and the role, location and current-work lines its
status readout prints. The rest of that readout is derived by the build: the
post and project counts come from the content and cannot go stale.

## Layout

| Path                 | What it is                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `content/`           | Posts and project write-ups — the prose                                                              |
| `src/`               | The generator: content sources, catalogues, renderers, checks                                        |
| `src/assets/`        | The stylesheet and the six self-hosted font files                                                    |
| `bin/`               | `build.ts` and `check.ts` entry points                                                               |
| `site.config.ts`     | Site name, base URL, content-security policy, and the editorial copy Home prints                     |
| `tests/`             | Unit tests, one directory per unit of work                                                           |
| `.github/workflows/` | The publish workflow, and the shared security baseline from `Rue-Asha/ci`                            |
| `aidlc/`, `.claude/` | The AI-DLC workspace this site was built with — version-controlled, and excluded from the built site |

## Deployment

`main` is production; there is no staging. A push to `main` is the only thing
that publishes, and it is the approval. A build that did not produce a complete
site deploys nothing and the previously live site keeps serving.

This requires the repository's Pages source to be set to **GitHub Actions**
rather than _Deploy from a branch_.

A separate Security workflow runs the shared baseline from
[Rue-Asha/ci](https://github.com/Rue-Asha/ci) — workflow lint, secret scan, and
dependency review on pull requests — pinned to a commit SHA. It reports; it
does not gate publishing.

To roll back, `git revert` the offending commit and push. After publishing,
look at the live site — the deploy reporting success is not the same as the URL
serving the page, and that check is the only failure detection this site has.

Nothing a reader loads comes from anyone else's server. Fonts, styles and
images are served from this repository, and a content-security policy in every
page head enforces it.

## Licence

Two licences, deliberately split:

- **MIT** — the source code, configuration and templates. See `LICENSE`.
- **CC BY 4.0** — the prose and images under `content/`. See `content/LICENSE`.
