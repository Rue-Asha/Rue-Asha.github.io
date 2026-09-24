---
title: A post exercising the whole Markdown set
summary: Headings, links, both list kinds, an image, and two fences.
date: 2026-02-18
---

## A heading

Prose with [an internal link](/writing/) and [an external one](https://example.com/).

### A sub-heading

- a bullet
- another bullet

1. a numbered step
2. another numbered step

![A diagram of the four build phases](diagram.png)

A fence with no label, which renders plain and silently:

```
a < b
```

A fence with a label the highlighter knows, which is coloured at build time:

```ts
// the ordering rule
const ordering: string = "declared date, never mtime";
```
