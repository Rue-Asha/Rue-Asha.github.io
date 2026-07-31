---
title: Homelab
date: 2026-07-31
draft: true
type: docs
weight: 1
summary: 'Self-hosted infrastructure — services, network layout, and the reasoning behind both.'
params:
  repo: 'https://github.com/Rue-Asha/Homelab-Managment'
  status: wip
  stack:
    - docker
    - linux
---

Placeholder project page — kept as a structural example. Replace or delete it.

## What it is

One paragraph a stranger could read and understand.

## Why I built it

The actual motivation, including what existing options didn't do.

## Architecture

```mermaid
graph LR
  A[Router] --> B[Proxmox host]
  B --> C[Services VM]
  B --> D[Storage VM]
```

## Setup

{{% steps %}}

### Provision the host

### Deploy the base services

### Wire up reverse proxy and TLS

{{% /steps %}}

## Progress log

| Date | What changed |
|---|---|
| 2026-07-31 | Started documenting |

## Open questions
