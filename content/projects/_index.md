---
title: Projects
type: docs
weight: 2
sidebar:
  open: true
cascade:
  type: docs
---

Living documentation for the things I build. Each project gets its own folder, so it can
grow from a single page into a small handbook without reorganising anything.

{{< cards >}}
  {{< card link="homelab/" title="Homelab" icon="server" subtitle="Self-hosted infrastructure and how it is wired together." >}}
{{< /cards >}}

## How a project page is organised

Every project starts from the same shape — what it is, why it exists, how it is built,
how to run it, and a dated progress log. Create one with:

```bash
hugo new content projects/my-project/_index.md --kind projects
```
