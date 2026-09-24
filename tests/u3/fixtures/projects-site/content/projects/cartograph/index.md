---
name: Cartograph
summary: A command-line tool that draws a dependency map of a repository.
year: 2026
type: CLI
tools:
  - Rust
repo: https://github.com/Rue-Asha/cartograph
---

## What the problem was

Reading a dependency graph out of a package manifest by hand does not scale past
about thirty modules.

## What would be done differently

The output format was chosen before the rendering was, which is the wrong way
round.
