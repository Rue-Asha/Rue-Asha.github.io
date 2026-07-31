# Rue-Asha.github.io

Source for [rue-asha.github.io](https://rue-asha.github.io/) — cybersecurity writeups,
project documentation and learning notes.

Built with [Hugo](https://gohugo.io/) (extended) and the
[Hextra](https://github.com/imfing/hextra) theme, deployed to GitHub Pages via Actions.

## Local development

Requires **Hugo extended ≥ 0.146** and **Go** (Hextra is pulled in as a Hugo Module).

```bash
hugo server -D          # -D also renders drafts
```

Then open <http://localhost:1313/>.

## Adding content

```bash
# A journal post / essay
hugo new content blog/what-i-learned-about-dns.md --kind blog

# A writeup (platform folder: hackthebox | tryhackme | ctf)
hugo new content writeups/hackthebox/keeper.md --kind writeups

# A project — gets its own folder so it can grow into multiple pages
hugo new content projects/my-tool/_index.md --kind projects
```

Each is scaffolded from `archetypes/` with the section's front matter and heading
skeleton already in place. New pages start as `draft: true`; flip that to publish.

## Structure

| Path | What lives there |
|---|---|
| `content/writeups/` | Writeups, docs layout, grouped by platform in the sidebar |
| `content/projects/` | Project documentation, one folder per project |
| `content/blog/` | Journal — chronological essays and notes |
| `archetypes/` | Templates used by `hugo new content` |
| `hugo.toml` | Site config: menu, theme params |

No taxonomies — full-text search covers cross-cutting lookups.

## Updating the theme

```bash
hugo mod get -u github.com/imfing/hextra
hugo mod tidy
```

## Deployment

Every push to `main` triggers `.github/workflows/hugo.yaml`, which builds the site and
publishes it to GitHub Pages. No `public/` directory is committed.
