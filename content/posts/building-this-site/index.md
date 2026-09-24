---
title: Building this site
summary: Why this site has its own build rather than an off-the-shelf generator.
date: 2026-09-23
---

This site is a folder of Markdown turned into a folder of HTML. There is no
database, no server, and nothing runs while you are reading this page.

## Why not a generator

Every generator considered would happily build a site while quietly dropping a
post whose front matter was malformed — a green build, a missing page, and
nothing anywhere saying so. The build here does the opposite: a missing or
malformed field stops the build and names the file and the field.

```ts
const post = { title: 'Building this site', date: '2026-09-23' }
```

Publishing is one act. Write a file, commit it, push it, and the page is live.
