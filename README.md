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

| File kind | Required front matter                              |
| --------- | -------------------------------------------------- |
| Post      | `title`, `summary`, `date`                         |
| Project   | `name`, `summary`, `year`, `type`, `tools`, `repo` |

A project may also carry a live URL; when it is absent the rail row is omitted
rather than rendered empty. A missing **required** field is a build failure that
names the file and the field — the build fails loudly rather than skipping the
file.

The file name is the URL, so file names are lowercase, kebab-case and ASCII.
Published slugs never change: renaming one breaks every link anyone shared, and
GitHub Pages has no server-side redirects.

Post ordering reads the `date` in front matter, never the file's modification
time.

## Layout

| Path                 | What it is                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `content/`           | Posts and project write-ups — the prose                                                              |
| `src/`               | The generator: content sources, catalogues, renderers, checks                                        |
| `src/assets/`        | Stylesheet and the self-hosted font                                                                  |
| `bin/`               | `build.ts` and `check.ts` entry points                                                               |
| `site.config.ts`     | Site name, base URL, content-security policy                                                         |
| `tests/`             | Unit tests, one directory per unit of work                                                           |
| `.github/workflows/` | The publish workflow                                                                                 |
| `aidlc/`, `.claude/` | The AI-DLC workspace this site was built with — version-controlled, and excluded from the built site |

## Deployment

`main` is production; there is no staging. A push to `main` is the only thing
that publishes, and it is the approval. A build that did not produce a complete
site deploys nothing and the previously live site keeps serving.

This requires the repository's Pages source to be set to **GitHub Actions**
rather than _Deploy from a branch_.

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
