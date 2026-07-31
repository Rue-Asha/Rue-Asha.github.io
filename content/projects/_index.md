---
title: Projects
type: docs
weight: 2
sidebar:
  open: true
cascade:
  type: docs
---

Documentation for the things I build. Each project gets its own folder, so it can grow
from a single page into a small handbook without reorganising anything.

{{< cards >}}
  {{< card link="homelab/" title="Homelab" icon="server" subtitle="Self-hosted infrastructure and how it is wired together." >}}
{{< /cards >}}

## What these pages are, and aren't

They aren't install guides. Setup steps, commands and deploy instructions live in each
repo's README, next to the code that keeps them honest — duplicating them here would
just give me two places to be wrong.

What's missing everywhere else is the reasoning. Why SQLite and not Postgres. Why no
WebSockets. Why the migrations are date-prefixed. That's what these pages record: the
decisions and the trade-offs behind them, which stay true across refactors and can't be
reconstructed from reading the source.

So each page follows the same shape — what it is, why it exists, the key decisions, how
the pieces fit, where it stands, and what it taught me:

```bash
hugo new content projects/my-project/_index.md --kind projects
```
