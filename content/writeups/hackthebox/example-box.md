---
title: Example Box
date: 2026-07-31
draft: true
type: docs
weight: 1
summary: 'Template writeup — copy this file as the starting shape for a real one.'
platforms:
  - hackthebox
tags:
  - linux
  - web
  - sudo
categories:
  - writeup
params:
  difficulty: easy
  status: solved
---

{{< callout type="warning" >}}
Spoilers for **Example Box**. This is a placeholder page kept as a style reference —
delete it once you have real writeups.
{{< /callout >}}

## Overview

| | |
|---|---|
| **Platform** | HackTheBox |
| **Difficulty** | Easy |
| **OS** | Linux |
| **Released** | 2026-07-31 |
| **Skills** | HTTP enumeration, credential reuse, `sudo` misconfiguration |

**The short version:** an exposed backup file leaked a password that was reused for SSH,
and a `sudo` rule on a binary with a shell escape gave root.

## Recon

Start wide, then narrow. Full TCP sweep first, targeted service scan second:

```bash
nmap -p- --min-rate 5000 -oN scans/all-ports.txt 10.10.11.x
nmap -p 22,80 -sCV -oN scans/services.txt 10.10.11.x
```

{{% details title="Full nmap output" closed="true" %}}
```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu
80/tcp open  http    nginx 1.18.0
```
{{% /details %}}

Two ports, so the web service is the way in.

## Foothold

{{< callout type="info" >}}
Write down *why* you tried each thing, not just the command. Future-you is the reader.
{{< /callout >}}

Content discovery turned up a stray backup:

```bash
feroxbuster -u http://10.10.11.x -w /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt -x bak,txt,zip
```

## Privilege escalation

```bash
sudo -l
```

The rule allowed a binary with a documented shell escape — see
[GTFOBins](https://gtfobins.github.io/) for the pattern.

## Lessons learned

- Always re-run content discovery with extensions; the default wordlist run missed it.
- Credential reuse between a web app and system accounts is worth checking early — it
  cost me about an hour of poking at the app instead.

## References

- [GTFOBins](https://gtfobins.github.io/)
- [HackTricks — Linux privilege escalation](https://book.hacktricks.wiki/)
