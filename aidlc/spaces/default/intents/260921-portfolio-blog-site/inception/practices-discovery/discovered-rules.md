# Discovered Rules — Personal Portfolio & Blog Site

> Hard constraints affirmed for this project. On promotion these are appended,
> stamped, under `## Mandated` and `## Forbidden` in
> `aidlc/spaces/default/memory/project.md`, where they bind every later stage.
>
> Admission test applied to every line below: it is a hard constraint stated by
> the human — either in an approved Ideation artifact or in the
> practices-discovery interview — rather than inferred or proposed by an agent.
> Nothing has been invented, and nothing has been promoted from "preference" to
> "rule" to make the list look fuller.
>
> Practices — branching, the check set, the deployment gate, formatting — live in
> `team-practices.md` and are deliberately absent here. Several controls the
> support reviews argued hard for (a committed lockfile, SHA-pinned actions,
> dependency alerts, per-post directories) are agent-proposed and are recorded as
> practice, not as rules. Each line below is written to be read cold, months from
> now, with no surrounding context.

## Scope Note

Two things that are easy to mis-file, recorded here so a later stage does not
get them wrong:

- **Topic navigation — tags, categories, or search — is NOT forbidden.** It is
  deferred: "not selected for the first version but was not ruled out either
  ... the design may leave room for it without building it"
  (`ideation/scope-definition/scope-document.md` § Deferred — Later, Not
  Excluded; `intent-backlog.md` PU-7, Won't Have this time). Do not build it in
  this version; do not design it out either.
- **The visual style is not a rule, it is an open decision.** The wireframes
  deliberately carry no colour, type, or spacing, and Refined Mockups is the
  stage that settles it (`ideation/approval-handoff/initiative-brief.md`).
  Nothing in this file constrains it.

## Mandated

- ALWAYS keep publishing to a single act: the author writes a file, commits it,
  and pushes it, and the page is live. Source: "Write a file, commit it, and it
  appears; no further steps" (`ideation/scope-definition/scope-document.md`
  § Minimum Viable Scope, [Q7]); restated as a first-class user flow in
  `ideation/rough-mockups/user-flow.md` Flow 3.
- ALWAYS meet WCAG 2.1 AA for keyboard operation and landmark structure on every
  page of this site: a working skip-to-content link, tab order following visual
  order, no focus trap, and a visible focus indicator on every focusable element.
  Source: `ideation/rough-mockups/user-flow.md` § Keyboard Flow and
  `ideation/rough-mockups/wireframes.md` ([Q5]), carried into
  `ideation/approval-handoff/initiative-brief.md` § Concept Visuals.
- ALWAYS serve this site's pages complete, with no loading state. Source: the
  wireframes mark the loading state not applicable on the stated grounds that
  pages are served complete (`ideation/approval-handoff/initiative-brief.md`
  § Concept Visuals). This is a constraint on how pages are built, not a styling
  preference: a page that assembles itself client-side breaks it.
- ALWAYS exclude the AI-DLC workspace (`aidlc/`) and the tooling directories
  (`.claude/`) from this site's published output. They stay in the repository and
  are version-controlled; they must not be reachable as pages on the website, and
  exclusion must be configured in the site generator rather than left to the
  author remembering. Source: practices-discovery interview [Q2], answer A.
- ALWAYS keep GitHub's secret push protection switched on for this repository, so
  a push containing something that looks like a credential is rejected before it
  reaches the remote. Source: practices-discovery interview [Q10], answer A.
- ALWAYS revoke a leaked credential at the service that issued it *before*
  touching git history. Rewriting history does not unpublish anything that was
  already fetched, forked, or archived; revocation is the only step that actually
  ends the exposure. Source: practices-discovery interview [Q10], answer A — the
  author explicitly asked for this rule to be recorded.
- ALWAYS serve this site's fonts, icons, stylesheets, and scripts from files
  copied into this repository, and enforce that with a content-security policy in
  the page head. Source: practices-discovery interview [Q11], answer A.

## Forbidden

- NEVER add comments on posts. Source:
  `ideation/scope-definition/scope-document.md` § Out of Scope ([Q3]).
- NEVER add an email newsletter or subscriber list. Same source.
- NEVER add visitor analytics or tracking of any kind. Same source, and
  consistent with the intent statement's decision that no visitor figure is a
  success signal (`ideation/intent-capture/intent-statement.md` § Success
  Metrics).
- NEVER add a CMS, an admin interface, or any authoring path beyond editing
  files directly. Same source.
- NEVER design around the four exclusions above or leave hooks, extension
  points, placeholder configuration, or commented-out scaffolding for them.
  Source: the exclusions are stated as "excluded from this initiative entirely,
  not deferred. Later stages must not design around them or leave hooks for
  them" (`ideation/scope-definition/scope-document.md` § Out of Scope).
- NEVER require an action from the author after `git push` for a published page
  to go live — no publish button, no dashboard, no manual deploy trigger, no
  step to remember. Source: as the Mandated publishing rule above; stated
  negatively here because that is the form a Construction agent can be checked
  against.
- NEVER let a page of this site load any resource from a third-party server while
  a reader is viewing it — no web fonts, icon sets, stylesheets, scripts, or
  embedded widgets fetched from someone else's domain. Each such request sends
  every reader's IP address and referring page to a company nobody chose, which
  is the substance of the visitor tracking already excluded. Source:
  practices-discovery interview [Q11], answer A.
