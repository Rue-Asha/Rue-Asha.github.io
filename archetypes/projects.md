---
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
date: {{ .Date }}
draft: true
type: docs
weight: 10
summary: 'One line: what this project is and who it is for.'
tags: []
params:
  repo: 'https://github.com/Rue-Asha/'
  status: wip     # idea | wip | active | shelved | done
  stack: []
---

## What it is

## Why I built it

## Architecture

## Setup

## Progress log

| Date | What changed |
|---|---|
| {{ dateFormat "2006-01-02" .Date }} | Started documenting |

## Open questions
