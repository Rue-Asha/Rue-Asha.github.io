# Business Rules — U1 Publishable Site Shell

Every rule this unit enforces, numbered so downstream stages and the traceability
file can cite them. Rules are stated as decisions the system makes, in plain
language, with the behaviour on violation written down — a rule whose violation
behaviour is unstated is a rule nobody can verify.

**"Field error" throughout means one thing**: a message naming the offending file
path and the offending field name, collected by `SiteBuilder`, reported alongside
every other field error, and ending the build before anything is written
(`inception/domain-design/decisions.md` ADR-004). It is never a warning and never
a skipped file.

## Sources

- [upstream] `inception/units-generation/unit-of-work.md` — U1's boundary and its
  six pass/fail conditions, which several rules below exist to satisfy
- [upstream] `inception/units-generation/unit-of-work-story-map.md` — the 16
  functional requirements assigned to U1 and the ordering within the unit
- [upstream] `inception/requirements-analysis/requirements.md` — FR1.1 to FR1.7,
  FR4.2 to FR4.6, FR5.2 to FR5.5, NFR8 to NFR11, and constraints C2 and C4
- [upstream] `inception/domain-design/components.md` — the component that owns
  each rule's enforcement point
- [upstream] `inception/domain-design/decisions.md` — ADR-004 (validation inside
  the build; one check runner), ADR-005 (publishing route), ADR-007 (one owner
  for the content-directory boundary)
- [Q1]–[Q7] `functional-design-questions.md`

The declared `contract-summary` input is absent: Contract Design is SKIP in this
scope, because one build produces one deployable and no inter-unit contract
exists to formalise.

---

## Rules

```yaml
rules:
  # BR1 — Content discovery, identity, and drafts (ContentSource)

  - id: BR1.1
    statement: >
      Only the `content/` directory is ever read as a source of pages.
    category: constraint
    applies_to: ContentSource
    trigger: Every build, at the load phase.
    logic: >
      IF a path is not under `content/` THEN it is not content, is never parsed,
      and can never produce a page — including `aidlc/`, `.claude/`, and every
      other repository directory.
    on_violation: >
      Not reachable by authoring. This is a property of how discovery is written
      rather than a check that can fail; it is a rule so that a future change
      that widens the walk is visibly a change to this rule.
    source: FR1.6, C2

  - id: BR1.2
    statement: >
      An item is a directory directly under `content/posts/` or
      `content/projects/` that contains an `index.md`.
    category: validation
    applies_to: ContentFile
    trigger: Load phase, for each directory found.
    logic: >
      IF such a directory contains no `index.md` THEN raise a field error naming
      the directory and `index.md`.
    on_violation: Field error; build fails.
    source: FR1.5, [Q2]

  - id: BR1.3
    statement: >
      An item's kind is derived from the top content directory, never declared.
    category: calculation
    applies_to: ContentFile.kind
    trigger: Load phase, per item.
    logic: >
      IF the item is under `content/posts/` THEN kind is post.
      IF under `content/projects/` THEN kind is project.
    on_violation: >
      No violation is possible — a directory under neither is not an item and is
      not read (BR1.1).
    source: "[Q2]"

  - id: BR1.4
    statement: >
      An item's slug is its own directory name, and it must be lowercase,
      kebab-case, ASCII only.
    category: validation
    applies_to: ContentFile.slug
    trigger: Load phase, per item.
    logic: >
      IF the directory name does not match `^[a-z0-9]+(-[a-z0-9]+)*$` THEN raise
      a field error naming the directory and `slug`.
    on_violation: Field error; build fails.
    source: NFR8, [Q2]

  - id: BR1.5
    statement: >
      Two items of the same kind may not share a slug.
    category: validation
    applies_to: ContentFile.slug
    trigger: Load phase, after all items are found.
    logic: >
      IF two items of the same kind have the same slug THEN raise a field error
      naming both directories and `slug`.
    on_violation: >
      Field error; build fails. Silently letting one win would publish one of
      two posts and say nothing.
    source: NFR8

  - id: BR1.6
    statement: >
      An item is a draft when its front matter carries `draft: true`, and only
      then.
    category: validation
    applies_to: ContentFile.isDraft
    trigger: Load phase, per item.
    logic: >
      IF `draft` is absent THEN the item is not a draft.
      IF `draft` is a boolean THEN the item is a draft when it is true.
      IF `draft` is present and not a boolean THEN raise a field error naming the
      file and `draft`.
    on_violation: >
      Field error; build fails. A non-boolean `draft` is rejected rather than
      coerced, because a coerced `draft: "false"` would publish a post the author
      believes is hidden.
    source: FR1.3, [Q1]

  - id: BR1.7
    statement: >
      A draft produces nothing anywhere in the output.
    category: policy
    applies_to: ContentFile
    trigger: Every phase after load.
    logic: >
      IF an item is a draft THEN it has no page, no list entry, no Home entry, no
      feed item, no sitemap entry, and no row in the build manifest.
    on_violation: >
      A draft appearing in any output is a defect in this rule's single
      enforcement point, not a per-consumer omission — exclusion happens once,
      at the boundary, so no consumer has to remember it.
    source: FR1.3

  - id: BR1.8
    statement: >
      Publishing a draft requires no change other than removing its draft mark.
    category: policy
    applies_to: ContentFile
    trigger: The author edits a draft's front matter.
    logic: >
      IF the `draft: true` line is deleted THEN the next build publishes the item
      at the same URL it would always have had. The file does not move, is not
      renamed, and needs no other edit.
    on_violation: >
      Any design that requires a move or rename to publish breaks this rule. This
      is the reason [Q1] chose a front-matter field over a `_drafts/` folder or a
      file-name prefix.
    source: FR1.4, [Q1]

  - id: BR1.9
    statement: >
      A front-matter block that cannot be parsed is a field error naming the
      file, never a skipped file.
    category: validation
    applies_to: ContentFile.frontMatter
    trigger: Load phase, per item.
    logic: >
      IF the front-matter block is malformed THEN raise a field error naming the
      file and the parse failure.
    on_violation: >
      Field error; build fails. ContentSource reports it and does not decide what
      to do about it — only SiteBuilder aborts (ADR-007).
    source: FR1.5

  # BR2 — Post rules (PostCatalog)

  - id: BR2.1
    statement: Every post must carry a non-empty `title`.
    category: validation
    applies_to: Post.title
    trigger: Validate phase, per post.
    logic: IF `title` is absent or empty after trimming THEN field error naming file and `title`.
    on_violation: Field error; build fails.
    source: FR2.5, FR1.5

  - id: BR2.2
    statement: >
      Every post must carry a non-empty one-line `summary` containing no line
      break.
    category: validation
    applies_to: Post.summary
    trigger: Validate phase, per post.
    logic: >
      IF `summary` is absent, empty after trimming, or contains a line break THEN
      field error naming file and `summary`.
    on_violation: >
      Field error; build fails. The single-line constraint is real rather than
      cosmetic: the summary is rendered inside a list row and reused verbatim as
      the page description in head metadata.
    source: FR2.5, FR5.3

  - id: BR2.3
    statement: >
      Every post must carry a `date` written as an ISO 8601 calendar date,
      `YYYY-MM-DD`, and nothing else, falling within the bound `entities.md`
      states for `Post.date`.
    category: validation
    applies_to: Post.date
    trigger: Validate phase, per post.
    logic: >
      IF `date` is absent THEN field error naming file and `date`.
      IF `date` does not strictly match `YYYY-MM-DD` as a real calendar date THEN
      field error naming file and `date`.
      A value a forgiving parser would accept — `Sept 23, 2026`, `23/09/2026`,
      a date with a time or offset — is rejected.
      IF the date is earlier than `1970-01-01`, or later than the build's own
      date plus 366 days, THEN field error naming file and `date`.
    on_violation: >
      Field error; build fails. Strictness was chosen deliberately at [Q3]: a
      permissive parser's failure mode is silent misordering from day-first
      versus month-first ambiguity, not a loud error.
      The range half is enforced for the same reason and in the same shape as
      `Project.year` under BR3.2: both bounds are checkable inside the build,
      because the build knows its own date. A mistyped `2062-09-23` parses
      perfectly and pins the post to the top of the Writing list for the next
      thirty-six years, which is exactly the silent wrong answer this project
      converts into a loud one everywhere else.
    source: FR1.5, [Q3]

  - id: BR2.4
    statement: >
      Posts are ordered by declared date, newest first, with ties broken by slug.
    category: calculation
    applies_to: PostCatalog
    trigger: Whenever an ordered post list is produced.
    logic: >
      Sort by `date` descending; where dates are equal, sort by `slug` ascending.
      Never read the file's modification time.
    on_violation: >
      Reading mtime would reorder the list on a fresh clone or CI checkout, since
      git does not preserve timestamps. The tie-break exists so two posts on one
      day have a stable order rather than an incidental one.
    source: FR2.2, [Q3]

  # BR3 — Project rules (ProjectCatalog)

  - id: BR3.1
    statement: >
      Every project must carry `name`, `summary`, `year`, `type`, `tools`, and
      `repo`.
    category: validation
    applies_to: Project
    trigger: Validate phase, per project.
    logic: >
      IF any of the six is absent or empty THEN field error naming the file and
      each missing field. All six are reported together, not one at a time.
    on_violation: Field error; build fails.
    source: FR3.3, FR1.5

  - id: BR3.2
    statement: "`year` must be a four-digit calendar year within range."
    category: validation
    applies_to: Project.year
    trigger: Validate phase, per project.
    logic: >
      IF `year` is not an integer, or is below 1970, or is above the build's own
      year plus one THEN field error naming file and `year`.
    on_violation: Field error; build fails.
    source: FR3.3

  - id: BR3.3
    statement: "`tools` must list at least one non-empty entry."
    category: validation
    applies_to: Project.tools
    trigger: Validate phase, per project.
    logic: >
      IF `tools` is not a list, is empty, or contains an empty entry THEN field
      error naming file and `tools`.
    on_violation: >
      Field error; build fails. An empty list is rejected because the Projects
      list row is specified to display tools.
    source: FR3.3, FR3.1

  - id: BR3.4
    statement: "`repo` must be an absolute http or https URL."
    category: validation
    applies_to: Project.repo
    trigger: Validate phase, per project.
    logic: >
      IF `repo` is not an absolute URL with an `http` or `https` scheme THEN
      field error naming file and `repo`. Whether the URL resolves is NOT
      checked.
    on_violation: >
      Field error on shape only. Reachability is deliberately not checked —
      external links are never build-blocking (NFR11), so a repository that is
      temporarily unavailable never stops this site publishing.
    source: FR3.3, NFR11

  - id: BR3.5
    statement: >
      A project with no live URL has its live-URL rail row omitted entirely,
      rather than rendered empty.
    category: policy
    applies_to: Project.liveUrl
    trigger: Rendering a project page.
    logic: >
      IF `liveUrl` is absent THEN render no Live row and no blank row.
      IF `liveUrl` is present but empty THEN field error naming file and
      `liveUrl` — an empty value is an authoring mistake, not a deliberate
      omission.
    on_violation: >
      Rendering an empty row would show the reader a label with nothing after it.
    source: FR3.4

  - id: BR3.6
    statement: >
      `featured` is an optional boolean defaulting to false.
    category: validation
    applies_to: Project.featured
    trigger: Validate phase, per project.
    logic: >
      IF `featured` is absent THEN it is false.
      IF present and not a boolean THEN field error naming file and `featured`.
    on_violation: Field error; build fails.
    source: "[Q4]"

  - id: BR3.7
    statement: >
      Projects are ordered featured-first, then by year descending, then by slug.
      `featured` orders; it never selects.
    category: calculation
    applies_to: ProjectCatalog
    trigger: Whenever an ordered project list is produced.
    logic: >
      Sort by `featured` true before false; within each group by `year`
      descending; within equal years by `slug` ascending. Every project appears
      in the list exactly once regardless of its `featured` value.
    on_violation: >
      Treating `featured` as a filter would allow a state in which projects exist
      and Home's Projects section shows its empty state — the launch-day case
      [Q7] was asked to close, since U6 writes the first projects and may not
      mark either one.
    source: "[Q4], [Q7]"

  # BR4 — Build ordering and the fail-loudly contract (SiteBuilder)

  - id: BR4.1
    statement: >
      The build runs four phases in order: load, validate, render, write.
    category: constraint
    applies_to: SiteBuilder
    trigger: Every build.
    logic: >
      Validation is a phase of the build, not a separate command. There is no way
      to invoke a build that skips it.
    on_violation: >
      A separate validation step could be bypassed by invoking the build
      directly — the precise failure ADR-004 rejected.
    source: ADR-004

  - id: BR4.2
    statement: >
      Every field error found in one build is reported, not just the first.
    category: policy
    applies_to: SiteBuilder
    trigger: End of the validate phase.
    logic: >
      Collect field errors from ContentSource, PostCatalog, and ProjectCatalog
      across every item; IF any exist THEN report all of them together.
    on_violation: >
      Stopping at the first error makes fixing three broken files a three-build
      exercise.
    source: FR1.5

  - id: BR4.3
    statement: >
      Every field error names both the file and the field.
    category: policy
    applies_to: SiteBuilder
    trigger: Reporting field errors.
    logic: >
      Each reported error contains the item's repository-relative path and the
      name of the field at fault.
    on_violation: >
      An error naming neither is the generic tool message ADR-001 rejected stock
      generators for. This is the single capability the decision to write our own
      build was made to obtain.
    source: FR1.5

  - id: BR4.4
    statement: >
      A build with any field error writes nothing at all.
    category: policy
    applies_to: SiteBuilder
    trigger: End of the validate phase, when errors exist.
    logic: >
      IF any field error exists THEN abort before the render phase; write no
      page, no feed, no sitemap, and no build manifest.
    on_violation: >
      A partially written output directory is what would let a failed build
      replace a working site with a broken one.
    source: FR1.5, FR1.7

  - id: BR4.5
    statement: >
      When a build does not complete, the previously live site keeps serving.
    category: policy
    applies_to: SiteBuilder
    trigger: A failed build on the publishing path.
    logic: >
      Because a failed build writes nothing (BR4.4), no deploy occurs, and the
      last successfully deployed site remains live.
    on_violation: >
      Any design that deploys partial output breaks this. It is checked
      explicitly as one of U1's conditions: commit a deliberately broken post,
      confirm the build fails naming the file and the field, and confirm the
      previously live site stays up.
    source: FR1.7

  # BR5 — Shell, pages, and head metadata (PageRenderer)

  - id: BR5.1
    statement: >
      Every page carries the global shell, with the current page marked.
    category: policy
    applies_to: PageRenderer
    trigger: Rendering any page.
    logic: >
      Render the name on the left linking Home, the navigation links on the
      right, and the footer. The current page's navigation link carries
      `aria-current="page"` in addition to any visual treatment.
    on_violation: >
      Marking the current page visually alone leaves a screen-reader user with no
      indication of where they are.
    source: FR4.2

  - id: BR5.2
    statement: >
      A skip-to-content link is the first focusable element on every page.
    category: policy
    applies_to: PageRenderer
    trigger: Rendering any page.
    logic: >
      The skip link precedes all other focusable content in document order and
      targets the page's main landmark.
    on_violation: >
      Without it, a keyboard user tabs through the whole navigation on every
      page. The visible-on-focus styling belongs to U5; the markup order and the
      target belong here, because U5 cannot add a link that the templates do not
      emit.
    source: NFR1

  - id: BR5.3
    statement: >
      Home shows the 3 most recent posts and the top 3 projects, taken from the
      two ordered lists and never selected by any other means.
    category: calculation
    applies_to: PageRenderer
    trigger: Rendering Home.
    logic: >
      Take the first 3 of the ordered post list (BR2.4 — declared `date`
      descending, ties by `slug`) and the first 3 of the ordered project list
      (BR3.7 — `featured` first, then `year` descending, then `slug` ascending).
      Both lists are total: no filter, no `featured`-only selection, and no
      second ordering.
      IF a list holds fewer than 3 items THEN that section shows every item it
      has, in the same order, and nothing else. Two posts means two rows; one
      project means one row. This is the normal case at launch, not an error and
      not a degraded state.
      IF a list is empty THEN that section shows its empty state (BR5.5) — the
      heading, its rule, one plain sentence and a route to the other section —
      rather than a bare heading or an omitted section. Home renders legibly with
      one section empty and with both empty.
      Because BR3.7 orders rather than selects, the Projects section can only be
      empty when no project exists at all; it can never be empty while projects
      exist, whatever any project's `featured` value says.
    on_violation: >
      Showing all posts on Home would make Home and Writing the same page.
      Treating a short list as an error, or omitting a section that has fewer
      items than the count, would break FR4.3's requirement that both sections
      carry the same treatment — the two lists fill at different rates and Home
      must read correctly at every combination of their lengths.
    source: FR4.3, FR4.6, [Q4], [Q7]

  - id: BR5.4
    statement: >
      Home's two sections are structurally equal.
    category: policy
    applies_to: PageRenderer
    trigger: Rendering Home.
    logic: >
      The Writing and Projects sections use the same heading level, the same rule
      treatment, and each carries an "All X" affordance. Neither gets a larger
      heading, an image, or a treatment the other lacks.
    on_violation: >
      Unequal treatment would state that one half of the site matters more, which
      contradicts the initiative's premise that both halves carry equal weight.
    source: FR4.3

  - id: BR5.5
    statement: >
      A section with nothing to list shows a plain sentence and a route to the
      other section, not a bare heading.
    category: policy
    applies_to: PageRenderer
    trigger: Rendering Home, Writing, or Projects with an empty list.
    logic: >
      Keep the section's heading and rule; replace the rows with one sentence —
      "Nothing published yet." for Writing, "Nothing here yet." for Projects —
      followed by a link to the other section. Home renders legibly with both
      sections empty.
    on_violation: >
      A bare heading reads as a broken page rather than an empty one. Note that
      BR3.7 makes the Projects-empty case impossible whenever any project exists.
    source: FR4.6

  - id: BR5.6
    statement: >
      A 404 page exists at the site root, carries the global shell, and is served
      by the platform for unmatched paths.
    category: policy
    applies_to: PageRenderer
    trigger: Rendering the site; a request for an unmatched path.
    logic: >
      Emit a 404 page carrying the shell, a plain sentence, and links to Writing
      and Projects. Configure the published output so the platform serves it for
      any path that matches no page.
    on_violation: >
      A reader following a stale link sees the platform's own default page, which
      carries none of this site's navigation.
    source: FR4.4

  - id: BR5.7
    statement: >
      Every page type is reachable in one click from Home.
    category: constraint
    applies_to: PageRenderer
    trigger: Rendering the global shell.
    logic: >
      Writing, Projects, and About are navigation links present on every page,
      including Home. A post or project page is one click from its list page,
      which is itself one click from Home; the requirement applies to page types
      reachable through navigation.
    on_violation: >
      Any structure needing two navigation steps to reach a page type breaks it.
    source: FR4.5

  - id: BR5.8
    statement: >
      Every page carries a title and a description in its head.
    category: policy
    applies_to: PageRenderer
    trigger: Rendering any page.
    logic: >
      For a post or project page, the description is that item's `summary`.
      For Home, Writing, Projects, About and 404, it is the description written
      into that page's own template.
      IF a template supplies none THEN use `SiteMetadata.fallbackDescription`.
    on_violation: >
      A page with no description is a shared link with no preview text. The
      fallback is what makes "every page" true by construction rather than by the
      author remembering.
    source: FR5.3, [Q5]

  - id: BR5.9
    statement: >
      Every page carries Open Graph and Twitter-card tags matching its own title
      and description, and no preview image.
    category: policy
    applies_to: PageRenderer
    trigger: Rendering any page.
    logic: >
      Emit the card tag set with values taken from the same title and description
      as BR5.8, plus the canonical URL built from `SiteMetadata.baseUrl`.
      Emit no `og:image` or equivalent.
    on_violation: >
      Tags carrying the site's title on every page make every shared link look
      identical. The absent image is deliberate for this version, not an
      oversight.
    source: FR5.4, FR5.5

  - id: BR5.10
    statement: >
      Every page carries a content-security-policy meta tag with exactly this
      value.
    category: constraint
    applies_to: PageRenderer
    trigger: Rendering any page.
    logic: >
      Emit `<meta http-equiv="Content-Security-Policy">` with
      `default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:;
      script-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`.
      The value is held once, in `SiteMetadata`, and emitted by one template
      fragment.
    on_violation: >
      A page without it can silently load a third-party resource, which sends
      every reader's IP address and referring page to a company nobody chose.
      The meta form is the only form available: the platform sets no HTTP
      response headers (C4).
    source: NFR3, NFR4, [Q6]

  - id: BR5.11
    statement: >
      A sitemap lists every published page and no draft.
    category: policy
    applies_to: SiteBuilder
    trigger: Write phase.
    logic: >
      Emit `sitemap.xml` containing an absolute URL, built from
      `SiteMetadata.baseUrl`, for every page in `BuildManifest.pagesWritten`
      except the sitemap itself. Drafts have no page and therefore no entry
      (BR1.7).
    on_violation: >
      A sitemap listing a draft's URL would expose it even though no page links
      to it.
    source: FR5.2

  - id: BR5.12
    statement: >
      Home carries an intro, placed above both sections, and renders it whatever
      the two lists hold.
    category: policy
    applies_to: PageRenderer
    trigger: Rendering Home.
    logic: >
      The intro is the first block inside Home's main landmark, above the Writing
      section and above the Projects section, and a rule separates it from the
      first of them in the same hairline treatment the two sections use between
      themselves (BR5.4).
      It carries the site name as Home's only `h1`, taken from
      `SiteMetadata.siteName`, followed by one or two sentences of prose saying
      who the author is and what this site holds.
      That prose is a site-level editorial value, authored once outside
      `content/` and handed to the Home template at render time. It is never
      derived from any `Post` or `Project`, never assembled from their titles or
      summaries, and never written into more than one place.
      The intro does not depend on either list. It renders unchanged when both
      sections are full, when one is empty, and when both are empty — the
      launch-day case, where the intro is the only thing Home has (FR4.6, BR5.5).
    on_violation: >
      A Home page without an intro is two lists and nothing else, and a reader
      arriving from a shared link learns nothing about whose site this is — which
      is step 1 of the browse-without-a-goal flow
      (`ideation/rough-mockups/user-flow.md` Flow 4). An intro derived from the
      most recent post would change every time a post is published and would
      vanish in exactly the case FR4.6 names. An intro placed below either
      section, or omitted when a list is empty, breaks the same requirement.
    source: FR4.3, FR4.6

  # BR6 — The three blocking checks (CheckRunner)

  - id: BR6.1
    statement: >
      One command runs all three blocking checks and reports all three outcomes
      together.
    category: policy
    applies_to: CheckRunner
    trigger: The author, before a push; the publishing workflow, as a backstop.
    logic: >
      Run the build (check 1), then page coverage (check 2), then internal links
      (check 3). Report every failure across all three rather than stopping at
      the first. One runner serves both callers, so the local and remote check
      sets cannot drift.
    on_violation: >
      Two commands is one command to forget, in a habit that has to hold for
      content commits made in a hurry.
    source: NFR9, ADR-004

  - id: BR6.2
    statement: >
      Check 2 confirms every non-draft item produced an output page, and ignores
      drafts entirely.
    category: validation
    applies_to: CheckRunner
    trigger: After a successful build.
    logic: >
      For each row in `BuildManifest.sourceToOutput`, confirm the named output
      page exists. Drafts have no row, so they are not reported. IF any row's
      page is missing THEN the check fails naming the source file.
    on_violation: >
      This is the check that catches the site's most likely real failure — a
      build that succeeds while silently dropping a post. Neither of the other
      two checks would see it.
    source: NFR10, NFR9

  - id: BR6.3
    statement: >
      Check 3 confirms every internal link in the built output resolves.
    category: validation
    applies_to: CheckRunner
    trigger: After a successful build.
    logic: >
      For each link in the built output whose target is on this site, confirm the
      target page exists. IF it does not THEN the check fails naming the
      containing page and the dead target.
    on_violation: >
      A dead internal link is a defect in this repository, and it is invisible
      once published because nothing reports it.
    source: NFR9

  - id: BR6.4
    statement: >
      External links are never checked and never block.
    category: constraint
    applies_to: CheckRunner
    trigger: Check 3.
    logic: >
      IF a link's target is not on this site THEN it is not checked, at all, on
      the publish path.
    on_violation: >
      Failing on an external link means this site stops publishing because an
      unrelated website went down.
    source: NFR11

  - id: BR6.5
    statement: >
      Any failed check blocks the change until it is fixed.
    category: policy
    applies_to: CheckRunner
    trigger: End of a check run.
    logic: >
      IF any of the three results is `fail` THEN the run is blocking. A `not-run`
      result — which occurs only when the build failed — is never treated as a
      pass.
    on_violation: >
      An advisory check is a check that gets ignored on the day it matters.
    source: NFR9

  # BR7 — Publishing (the route ADR-005 settled)
  #
  # `Publishing route` is NOT one of the eight components in
  # `inception/domain-design/components.md`, and that is deliberate rather than
  # an omission — see § Where the BR7 rules are enforced, below.

  - id: BR7.1
    statement: >
      A push to `main` is the only thing that publishes this site.
    category: policy
    applies_to: Publishing route (not a component — see § Where the BR7 rules are enforced)
    trigger: A push to `main`.
    logic: >
      One trigger exists. No other event, schedule, or manual action publishes
      the site, so there is exactly one path to the live site and exactly one
      path to audit.
    on_violation: >
      A second publishing path is a second thing that can deploy something nobody
      reviewed.
    source: FR1.1, FR1.2, ADR-005

  - id: BR7.2
    statement: >
      No action is required of the author after the push for a page to go live.
    category: policy
    applies_to: Publishing route (not a component — see § Where the BR7 rules are enforced)
    trigger: After a push to `main`.
    logic: >
      There is no publish button, dashboard, manual deploy trigger, or any other
      post-push step. Writing a file, committing it, and pushing it is the whole
      of publishing.
    on_violation: >
      Every added step is ceremony, and ceremony is what stops posts from being
      written at all. This is the initiative's one mandated publishing rule.
    source: FR1.1, FR1.2

  - id: BR7.3
    statement: >
      The publishing route deploys only a complete build.
    category: policy
    applies_to: Publishing route (not a component — see § Where the BR7 rules are enforced)
    trigger: The build step of the publishing route.
    logic: >
      IF the build or the check run fails THEN deploy nothing and leave the
      previously live site serving (BR4.4, BR4.5).
    on_violation: >
      Deploying partial output replaces a working site with a broken one.
    source: FR1.7, ADR-005
```

---

## Rules summary

| ID | Rule | Category | Enforced by |
|---|---|---|---|
| BR1.1 | Only `content/` is read as a source of pages | constraint | ContentSource |
| BR1.2 | An item is a directory containing `index.md` | validation | ContentSource |
| BR1.3 | Kind is derived from the top content directory | calculation | ContentSource |
| BR1.4 | Slug is the item's directory name, lowercase kebab ASCII | validation | ContentSource |
| BR1.5 | Slugs are unique within a kind | validation | ContentSource |
| BR1.6 | A draft is `draft: true`, and only that | validation | ContentSource |
| BR1.7 | A draft produces nothing anywhere | policy | ContentSource |
| BR1.8 | Removing the draft line is the only change needed to publish | policy | ContentSource |
| BR1.9 | Unparseable front matter is a field error, not a skip | validation | ContentSource |
| BR2.1 | Posts require a non-empty `title` | validation | PostCatalog |
| BR2.2 | Posts require a one-line `summary` | validation | PostCatalog |
| BR2.3 | Posts require a strict ISO `YYYY-MM-DD` `date`, within the stated range | validation | PostCatalog |
| BR2.4 | Posts order by date descending, ties by slug | calculation | PostCatalog |
| BR3.1 | Projects require six fields | validation | ProjectCatalog |
| BR3.2 | `year` is a four-digit year in range | validation | ProjectCatalog |
| BR3.3 | `tools` lists at least one entry | validation | ProjectCatalog |
| BR3.4 | `repo` is an absolute http(s) URL, reachability unchecked | validation | ProjectCatalog |
| BR3.5 | Absent `liveUrl` omits the rail row entirely | policy | ProjectCatalog |
| BR3.6 | `featured` is an optional boolean defaulting to false | validation | ProjectCatalog |
| BR3.7 | Projects order featured-first, then year, then slug | calculation | ProjectCatalog |
| BR4.1 | Build phases run load, validate, render, write | constraint | SiteBuilder |
| BR4.2 | Every field error in a build is reported | policy | SiteBuilder |
| BR4.3 | Every field error names file and field | policy | SiteBuilder |
| BR4.4 | A build with any field error writes nothing | policy | SiteBuilder |
| BR4.5 | A failed build leaves the previous site serving | policy | SiteBuilder |
| BR5.1 | Global shell on every page, current page marked | policy | PageRenderer |
| BR5.2 | Skip link is the first focusable element | policy | PageRenderer |
| BR5.3 | Home shows 3 recent posts and the top 3 projects, fewer when fewer exist | calculation | PageRenderer |
| BR5.4 | Home's two sections are structurally equal | policy | PageRenderer |
| BR5.5 | An empty section shows a sentence and a route out | policy | PageRenderer |
| BR5.6 | A 404 page carries the shell and is served for unmatched paths | policy | PageRenderer |
| BR5.7 | Every page type is one click from Home | constraint | PageRenderer |
| BR5.8 | Every page carries a title and a description | policy | PageRenderer |
| BR5.9 | Every page carries card tags and no preview image | policy | PageRenderer |
| BR5.10 | Every page carries the exact content-security policy | constraint | PageRenderer |
| BR5.11 | The sitemap lists every published page and no draft | policy | SiteBuilder |
| BR5.12 | Home carries an intro above both sections, whatever the lists hold | policy | PageRenderer |
| BR6.1 | One runner runs all three checks and reports together | policy | CheckRunner |
| BR6.2 | Check 2 covers every non-draft item, ignores drafts | validation | CheckRunner |
| BR6.3 | Check 3 resolves internal links | validation | CheckRunner |
| BR6.4 | External links are never checked | constraint | CheckRunner |
| BR6.5 | Any failed check blocks | policy | CheckRunner |
| BR7.1 | A push to `main` is the only publish trigger | policy | Publishing route (not a component) |
| BR7.2 | No post-push action is required of the author | policy | Publishing route (not a component) |
| BR7.3 | Only a complete build deploys | policy | Publishing route (not a component) |

Forty-five rules. The concentration in BR5 is expected and was predicted at
Domain Design: `PageRenderer` is deliberately the largest component, and ADR-006
records that most of FR4 and FR5 lands there.

---

## Where the BR7 rules are enforced

Every other rule above names one of the eight components in
`inception/domain-design/components.md` as its enforcement point. BR7.1–BR7.3
name `Publishing route`, which is not one of them, and this section is why —
stated here rather than left for a reader to notice that the name resolves to
nothing in the catalogue.

**The publishing route is deliberately not a component.** `components.md`
§ Rationale says so directly: *"The GitHub Actions workflow that publishes the
site ([Q7]) is not a component. It is deployment configuration, not a logical
building block of the code, and it belongs to CI Pipeline (stage 3.7)."* ADR-005
settled the route itself and recorded that its only job is to run `CheckRunner`
and deploy `SiteBuilder`'s output, so nothing in the catalogue changes shape
because of it.

**So these three rules cannot be attributed to a component that exists, and
attributing them to one anyway would be false.** No component decides what
triggers a publish (BR7.1), no component can guarantee the absence of a
post-push step (BR7.2), and no component performs the deploy (BR7.3).
`SiteBuilder` and `CheckRunner` are the nearest candidates and neither is
answerable for any of the three: the first writes an output directory, the
second reports on it, and both have finished before the route acts.

**The divergence, and its cost.** This unit states three rules whose enforcement
point is a configuration file rather than a component, which means:

- The rules are not verifiable by reading `src/`. Nothing in the code can be
  inspected to confirm BR7.1 or BR7.2 holds; the evidence is the workflow
  definition and the repository's Pages settings.
- They are also not covered by this project's check set. The three blocking
  checks (BR6.1–BR6.5) run against a build and its output, not against a
  deployment trigger.
- What does verify them is U1's own definition of done: conditions 1 and 2 of
  the walking skeleton — the site is live at its real public URL, and a
  committed file becomes a live page with no further author action — are BR7.1
  and BR7.2 exercised against the real route. Condition 4, the rehearsed
  rollback, exercises BR7.3.
- The configuration those rules govern is authored in this unit and **hardened
  in CI Pipeline (3.7)**, which is where the four required controls (explicit
  permissions, SHA-pinned actions, no `pull_request_target`, no unpinned
  build-time fetch) are reviewed. FOQ1 already carries that handoff.

This is recorded as a divergence rather than repaired by adding a ninth
component, because `components.md` is an approved upstream artifact and its
exclusion of the publishing route is a decision, not a gap. The same flag is
carried in `entities.md` § Additions, so a reader arriving from either file
finds it.

---

## Rules that carry a cost worth stating

Three of the above make the build stricter than it strictly has to be. Each was
chosen with the trade named, so a later reader can tell a decision from an
accident.

**BR2.3 — strict dates, and a bounded range.** A forgiving parser would be
kinder to write against. It was rejected because its failure mode is silent:
`03/04/2026` is two different days depending on the reader, and the result is a
Writing list in the wrong order with no error anywhere. Strictness converts a
silent wrong answer into a loud one, which is the trade this project makes
everywhere else too.

The range half — not before `1970-01-01`, not more than 366 days after the
build's own date — costs a build failure on a post deliberately dated far ahead,
which this site has no scheduled-publishing feature to want. It buys the case a
format check cannot see: a mistyped year is still a perfectly valid ISO date, so
`2062-09-23` parses, passes, and silently pins that post to the top of the
Writing list. `Project.year` is bounded for the same reason under BR3.2, and
`entities.md` states the bound for both; leaving `Post.date`'s bound stated in
one file and enforced in neither is what this rule now closes.

**BR1.6 and BR3.6 — non-boolean values are errors rather than coerced.** A
coerced `draft: "false"` publishes a post the author believes is hidden. The cost
is a build failure on a typo; the alternative is publishing something private.

**BR1.5 — duplicate slugs fail rather than one silently winning.** The cost is
that renaming a post to a name already used is a build error. The alternative is
that one of two posts does not exist and nothing says so.
