---
name: This site
summary: A personal portfolio and blog with a hand-written build that fails loudly.
year: 2026
type: Static site
tools:
  - TypeScript
  - Node.js
  - markdown-it
  - Shiki
repo: https://github.com/Rue-Asha/Rue-Asha.github.io
featured: true
---

A GitHub Pages user site built from Markdown by a small TypeScript build.

The build validates every content file before it writes anything. If any file is
missing a required field, the build reports every fault it found, names the file
and the field for each, and writes nothing at all — so a broken commit can never
replace a working site with a partial one.

Three blocking checks run before a push: the site builds, every content file
produced an output page, and every internal link resolves.
