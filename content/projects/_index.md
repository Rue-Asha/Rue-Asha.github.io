---
title: Projects
type: docs
weight: 2
sidebar:
  open: true
cascade:
  type: docs
---

Documentation for the things I build — organised by the level a decision is actually true
at, rather than one page per repository.

There are two of those levels. **Homelab** is the platform: what runs the machines and how
anything gets deployed onto them. **Web Apps** is the architecture the self-hosted
applications share, with each app underneath it carrying only what it decides differently.

{{< cards >}}
  {{< card link="homelab/" title="Homelab" icon="server" subtitle="Ansible-managed Proxmox host. The platform the rest of these run on." >}}
  {{< card link="web-apps/" title="Web Apps" icon="template" subtitle="One stack, one process, one file — the shared architecture behind the self-hosted apps." >}}
{{< /cards >}}

New here? Read **Homelab** first — its deploy model is the decision everything else
inherits — then **Web Apps** for the application shape. The individual apps are worth
reading only if a specific one interests you.

## What these pages are, and aren't

They aren't install guides. Setup steps, commands and deploy instructions live in each
repo's README, next to the code that keeps them honest — duplicating them here would
just give me two places to be wrong.

What's missing everywhere else is the reasoning. Why SQLite and not Postgres. Why no
WebSockets. Why the migrations are date-prefixed. That's what these pages record: the
decisions and the trade-offs behind them, which stay true across refactors and can't be
reconstructed from reading the source.

So each page follows the same shape:

- **What it is** — the one-paragraph version, no jargon.
- **Why it exists** — the problem that justified building rather than installing something.
- **Key decisions** — each as *chose / because / trade-off*. The trade-off is not optional;
  a decision with no cost is a decision I hadn't finished thinking about.
- **Where it stands** — what actually runs today. Not a roadmap: these pages document what
  exists, because a plan written down in public ages into a promise nobody asked me to make.
- **What I learned** — including the parts that went badly.
