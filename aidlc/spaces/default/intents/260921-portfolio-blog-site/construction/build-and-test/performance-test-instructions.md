# Performance Test Instructions

## Not applicable, and this is a decision rather than an omission

`NFR5` states it directly: "The site shall carry no numeric performance target.
Its performance requirement is `NFR2` and `NFR3`, which are what get checked.
No separate speed measurement is taken, and none may be introduced without a
new decision."

The stage file makes performance instructions conditional on NFR performance
requirements existing. None do. This file records the absence with its reason,
rather than being omitted silently or filled with an invented benchmark.

Recording it rather than skipping it follows the project correction learned at
code-generation: an absence with a stated reason is something a later reader can
act on; an absence without one looks like a skipped step.

## What stands in for a performance target

Two requirements, both verified elsewhere in this stage:

| ID | Requirement | Where it is verified |
|---|---|---|
| `NFR2` | Every page served complete, with no loading state and nothing assembled in the reader's browser | `test-results.md` § Static verification — no `<script>` tag exists in any built page, so the JavaScript-disabled criterion passes trivially |
| `NFR3` | No page loads any resource from a third-party server | `test-results.md` § Static verification — the only outbound origins in the built output are `github.com` link targets and the site's own base URL; no fonts, styles, or scripts are fetched from elsewhere |

These are the performance requirement for this site. A static page with no
scripts, no third-party requests, one self-hosted font and one stylesheet has
no meaningful load-time variable left to measure, which is why the requirement
was written this way rather than as a millisecond figure.

## What would change this

Introducing a numeric performance target requires a new decision, per `NFR5`.
If one is ever taken, this file is where its load, stress, and soak procedures
belong, and `performance-validation` (currently SKIPPED for this scope) is the
stage that would own executing them.
