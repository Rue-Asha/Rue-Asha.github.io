# Entity Model — U1 Publishable Site Shell

The data shape of the five entities `inception/domain-design/components.md`
assigns to owning components, plus the one addition this stage makes and
declares. Ownership and attribute names are inherited unchanged; what this file
adds is the part Domain Design deferred — logical types, required/unique
constraints, allowed values, defaults, bounds, and relationship cardinality.

Technology-agnostic throughout. No language, library, or storage format is named:
types below are logical (`string`, `date`, `boolean`, `list<string>`), and how
they are represented on disk is Code Generation's decision.

## Sources

- [upstream] `inception/units-generation/unit-of-work.md` — U1's boundary: every
  component at minimum depth, so every entity in the catalogue is established
  here even where a later unit deepens its rules
- [upstream] `inception/units-generation/unit-of-work-story-map.md` — the 16
  functional requirements assigned to U1, and the cross-cutting table naming the
  requirements U1 touches that U2 and U3 complete
- [upstream] `inception/requirements-analysis/requirements.md` — FR1.3 to FR1.7,
  FR3.3, FR3.4, NFR8, and constraint C2
- [upstream] `inception/domain-design/components.md` — § Entity Ownership, the
  authority for which component owns each entity and which attributes it carries
- [upstream] `inception/domain-design/decisions.md` — ADR-002 (two content
  entities), ADR-004 (validation inside the build), ADR-007 (one component owns
  the content-directory boundary)
- [Q1]–[Q4], [Q7] `functional-design-questions.md`

The declared `contract-summary` input is absent: Contract Design is SKIP in this
scope, because every unit is embedded in one build and there is no inter-unit API
to formalise (`unit-of-work-dependency.md` § Integration points).

---

## Entity Model

```yaml
entities:
  - name: ContentFile
    owning_component: ContentSource
    description: >
      One item of authored content as found on disk and parsed. It is the only
      entity that knows about the file system, and its `path` constraint is what
      keeps `aidlc/` and `.claude/` out of the published output by construction
      rather than by an ignore list (FR1.6, constraint C2).
    identifier: path
    attributes:
      - name: path
        type: string
        required: true
        unique: true
        constraint: >
          Repository-relative path of the item's `index.md`. MUST match
          `content/posts/<slug>/index.md` or `content/projects/<slug>/index.md`.
          No other path is ever read, and no path outside `content/` is
          reachable by any code path.
      - name: kind
        type: enum
        required: true
        allowed_values: [post, project]
        constraint: >
          Derived from the top content directory, never declared in front
          matter. `content/posts/` yields post; `content/projects/` yields
          project.
      - name: slug
        type: string
        required: true
        unique: within kind
        constraint: >
          The item's own directory name, not the `index.md` file name.
          MUST match `^[a-z0-9]+(-[a-z0-9]+)*$` — lowercase, kebab-case, ASCII
          only. It is the published URL segment and never changes once live
          (NFR8).
        min_length: 1
        max_length: 80
      - name: frontMatter
        type: map<string, any>
        required: true
        default: empty map
        constraint: >
          The parsed front-matter block. An unparseable block is a field error
          naming the file, never a skipped file.
      - name: body
        type: string
        required: true
        default: ""
        constraint: May be empty; an empty body is not an error at this layer.
      - name: isDraft
        type: boolean
        required: true
        default: false
        constraint: >
          True when front matter carries `draft: true`. Absent means false. A
          `draft` key holding anything other than a boolean is a field error.
    entity_constraints:
      - >
        Exactly one `index.md` per item directory. A directory directly under
        `content/posts/` or `content/projects/` with no `index.md` is a field
        error naming the directory (BR1.2).
      - >
        Files other than `index.md` inside an item directory are that item's
        assets. They are copied to the output beside the item's page and are
        never parsed as content.
      - >
        Nesting below one level is not content. A directory inside an item
        directory is treated as assets, not as a second item.
    relationships:
      - to: Post
        cardinality: one-to-one
        direction: ContentFile → Post
        note: A ContentFile of kind post yields exactly one Post.
      - to: Project
        cardinality: one-to-one
        direction: ContentFile → Project
        note: A ContentFile of kind project yields exactly one Project.

  - name: Post
    owning_component: PostCatalog
    description: >
      A published piece of writing. U1 establishes the entity and its
      required-field rules at skeleton depth so one post page can be served;
      U2 completes the post-facing behaviour (story map § Cross-cutting).
    identifier: slug
    attributes:
      - name: slug
        type: string
        required: true
        unique: true
        references: ContentFile.slug
        constraint: Carried unchanged from the ContentFile it was built from.
      - name: title
        type: string
        required: true
        constraint: >
          Non-empty after trimming surrounding whitespace. Absent or empty is a
          field error naming the file and `title` (FR2.5, FR1.5).
        min_length: 1
      - name: summary
        type: string
        required: true
        constraint: >
          The one-line summary. Non-empty after trimming, and MUST contain no
          line break — it is rendered on one line in list rows and reused as the
          page description in head metadata.
        min_length: 1
        max_length: 200
      - name: date
        type: date
        required: true
        constraint: >
          ISO 8601 calendar date, `YYYY-MM-DD`, strictly parsed. No time, no
          offset, no other notation. Anything else — including a value a
          forgiving parser would accept — is a field error naming the file and
          `date` (FR1.5, [Q3]).
          The `min`/`max` bound below is enforced by BR2.3, as `Project.year`'s
          bound is enforced by BR3.2: both are checkable inside the build,
          because the build knows its own date.
        min: "1970-01-01"
        max: the build's own date, plus 366 days
      - name: body
        type: string
        required: true
        default: ""
        constraint: The Markdown body, unrendered at this layer.
    entity_constraints:
      - >
        Ordering is by `date` descending. Two posts sharing a date tie, and the
        tie is broken by `slug` ascending, so the order is identical on every
        rebuild and on a fresh clone (FR2.2, [Q3]).
      - >
        Ordering never reads the file's modification time. Git does not preserve
        mtimes, so a fresh clone would otherwise reorder the list silently.
    relationships:
      - to: ContentFile
        cardinality: one-to-one
        direction: Post → ContentFile
        note: Each Post is built from exactly one ContentFile of kind post.

  - name: Project
    owning_component: ProjectCatalog
    description: >
      A piece of work being presented. U1 establishes the entity and its
      required-field rules at skeleton depth so one project page can be served;
      U3 completes the project-facing behaviour.
    identifier: slug
    attributes:
      - name: slug
        type: string
        required: true
        unique: true
        references: ContentFile.slug
      - name: name
        type: string
        required: true
        constraint: Non-empty after trimming. Absent is a field error (FR3.3).
        min_length: 1
      - name: summary
        type: string
        required: true
        constraint: Non-empty, single line, as for Post.summary.
        min_length: 1
        max_length: 200
      - name: year
        type: integer
        required: true
        constraint: >
          A four-digit calendar year. Non-integer or out-of-range is a field
          error naming the file and `year`.
        min: 1970
        max: the build's own year, plus 1
      - name: type
        type: string
        required: true
        constraint: >
          Free text, non-empty. No enumeration is imposed: nothing upstream
          declares one, and inventing a closed list here would reject a project
          the author has every right to describe their own way.
        min_length: 1
      - name: tools
        type: list<string>
        required: true
        constraint: >
          At least one entry, each non-empty after trimming. An empty list is a
          field error, because the Projects list row is specified to show tools
          (FR3.1).
        min_items: 1
      - name: repo
        type: string
        required: true
        constraint: >
          An absolute URL with an `http` or `https` scheme. A relative path or a
          bare name is a field error. External reachability is NOT checked —
          external links are never build-blocking (NFR11).
      - name: liveUrl
        type: string
        required: false
        constraint: >
          Absolute `http`/`https` URL when present. Absence is a documented
          behaviour, not an error: the rail row is omitted entirely rather than
          rendered empty (FR3.4). Present-but-empty is a field error, because it
          is an authoring mistake rather than a deliberate omission.
      - name: featured
        type: boolean
        required: false
        default: false
        constraint: >
          An ordering key, not a selection filter. Added by this stage — see
          § Additions below. A non-boolean value is a field error.
    entity_constraints:
      - >
        Ordering is `featured` true first, then `year` descending, then `slug`
        ascending. One list, total and deterministic; Home takes its top 3
        ([Q4], [Q7]).
      - >
        Because ordering is total rather than filtered, there is no state in
        which projects exist and Home's Projects section is empty.
    relationships:
      - to: ContentFile
        cardinality: one-to-one
        direction: Project → ContentFile
        note: Each Project is built from exactly one ContentFile of kind project.

  - name: SiteMetadata
    owning_component: PageRenderer
    description: >
      The site-level values every page's head needs and no content file carries:
      the site name, its canonical base URL, and the fallback description used
      when a page template supplies none. Declared as an addition — see
      § Additions.
    identifier: (singleton)
    attributes:
      - name: siteName
        type: string
        required: true
        constraint: Used as the Open Graph site name and in the page title suffix.
        min_length: 1
      - name: baseUrl
        type: string
        required: true
        constraint: >
          Absolute `https` URL with no trailing slash. Sitemap entries and
          Open Graph canonical URLs are built from it (FR5.2, FR5.4).
      - name: fallbackDescription
        type: string
        required: true
        constraint: >
          Used only when a page template supplies no description of its own. Its
          presence is what makes "a description on every page" (FR5.3) true by
          construction rather than by vigilance.
        min_length: 1
        max_length: 200
      - name: contentSecurityPolicy
        type: string
        required: true
        constraint: >
          The exact policy value emitted into every page head (BR5.10). Held as
          one value in one place so the policy cannot drift between templates.
    entity_constraints:
      - >
        Exactly one instance exists for the site. It is configuration, not
        authored content, and is never discovered by ContentSource.
    relationships: []

  - name: BuildManifest
    owning_component: SiteBuilder
    description: >
      The record of what a successful build actually wrote. It exists so the
      second blocking check compares against what the build knows it produced
      rather than against a re-derivation (ADR-004).
    identifier: buildId
    attributes:
      - name: buildId
        type: string
        required: true
        unique: true
        constraint: Unique per build run.
      - name: outputRoot
        type: string
        required: true
        constraint: Repository-relative path of the directory the build wrote to.
      - name: pagesWritten
        type: list<string>
        required: true
        constraint: >
          Output-relative path of every page written, including pages with no
          content file behind them (Home, Writing, Projects, About, 404) and the
          sitemap.
        min_items: 1
      - name: sourceToOutput
        type: list<SourceOutputRow>
        required: true
        default: empty list
        constraint: >
          One row per non-draft ContentFile: `{ sourcePath, outputPath, kind }`.
          Drafts produce no row, which is what lets check 2 ignore them entirely
          without a second draft rule (NFR10).
      - name: startedAt
        type: timestamp
        required: true
    entity_constraints:
      - >
        A manifest exists only for a build that completed. A build that aborted
        on field errors writes nothing at all, manifest included (FR1.7).
      - >
        Every `sourceToOutput.outputPath` also appears in `pagesWritten`.
    relationships:
      - to: ContentFile
        cardinality: one-to-many
        direction: BuildManifest → ContentFile
        note: >
          Each sourceToOutput row maps exactly one non-draft ContentFile to the
          page written from it.

  - name: CheckReport
    owning_component: CheckRunner
    description: >
      The outcome of one run of all three blocking checks, reported together
      rather than stopping at the first failure (NFR9).
    identifier: buildId
    attributes:
      - name: buildId
        type: string
        required: true
        unique: true
        references: BuildManifest.buildId
        constraint: >
          Present even when the build failed, in which case it identifies the
          attempted build and no manifest exists.
      - name: buildResult
        type: enum
        required: true
        allowed_values: [pass, fail]
      - name: pageCoverageResult
        type: enum
        required: true
        allowed_values: [pass, fail, not-run]
        constraint: >
          `not-run` when and only when buildResult is fail — this check reads the
          manifest, which a failed build never wrote.
      - name: internalLinkResult
        type: enum
        required: true
        allowed_values: [pass, fail, not-run]
        constraint: >
          `not-run` under the same condition as pageCoverageResult.
      - name: failures
        type: list<CheckFailure>
        required: true
        default: empty list
        constraint: >
          One entry per distinct failure: `{ check, message }`, where `check` is
          one of `build`, `page-coverage`, `internal-links`. Every failure across
          all three checks appears; the report is never truncated at the first.
    entity_constraints:
      - >
        The run is blocking if any of the three results is `fail`. A `not-run`
        result is never treated as a pass.
    relationships:
      - to: BuildManifest
        cardinality: one-to-one
        direction: CheckReport → BuildManifest
        note: >
          Each CheckReport describes exactly one build. The manifest is absent
          when that build failed.
```

---

## Summary of the entity set

| Entity | Owner | Identifier | Required attributes | Optional |
|---|---|---|---|---|
| ContentFile | ContentSource | path | path, kind, slug, frontMatter, body, isDraft | — |
| Post | PostCatalog | slug | slug, title, summary, date, body | — |
| Project | ProjectCatalog | slug | slug, name, summary, year, type, tools, repo | liveUrl, featured |
| SiteMetadata | PageRenderer | (singleton) | siteName, baseUrl, fallbackDescription, contentSecurityPolicy | — |
| BuildManifest | SiteBuilder | buildId | buildId, outputRoot, pagesWritten, sourceToOutput, startedAt | — |
| CheckReport | CheckRunner | buildId | buildId, buildResult, pageCoverageResult, internalLinkResult, failures | — |

Six entities: the five `components.md` assigns, plus `SiteMetadata`.

**Two optional attributes, and their absence means different things.** `liveUrl`
absent means *omit the rail row* — a documented behaviour (FR3.4). `featured`
absent means *false*, which affects only sort position and can never remove a
project from a list. Neither absence is ever an error, and no other attribute in
the set is optional.

---

## Additions this stage makes, stated openly

Three things below are not in `components.md`. Each is recorded here rather than
slipped in, so the architecture review can challenge any of them. The first two
are additions to § Entity Ownership; the third is a rule actor this stage names
that the component catalogue deliberately does not contain.

**`Project.featured` (new attribute).** [Q4] chose an explicit `featured: true`
field to promote a project onto Home, and [Q7] settled it as an ordering key
rather than a selection filter. It is optional with a `false` default, so it
cannot affect FR3.3's six required fields and cannot make an existing project
file invalid.

**`SiteMetadata` (new entity).** [Q5] chose per-template hard-coded page
descriptions *with a site-wide fallback*. That fallback has to live somewhere,
and so do the site name and base URL that FR5.2 and FR5.4 need — none of which
is authored content, so none of it belongs to ContentSource or either
catalogue. `PageRenderer` already owns head metadata and the content-security
policy meta tag (`components.md` § PageRenderer), so it is the entity's natural
owner and no new component is introduced. Holding the policy string here is what
makes BR5.10 checkable in one place rather than asserted per template.

**`Publishing route` (a rule actor, not a component and not an entity).**
BR7.1–BR7.3 in `rules.md` name `Publishing route` as the thing they apply to,
and it is not one of the eight components in `components.md`. That is not a
missing component: `components.md` § Rationale states that the workflow
publishing this site "is not a component. It is deployment configuration, not a
logical building block of the code, and it belongs to CI Pipeline (stage 3.7)",
and ADR-005 settled the route on that basis. No component can honestly own those
three rules — nothing in the code decides the publish trigger, guarantees the
absence of a post-push step, or performs the deploy.

Flagged here alongside the two entity additions because it has the same shape: a
thing this stage names that the approved catalogue does not carry. It owns no
entity and adds no attribute, so the tables above are unaffected. The divergence
and what it costs — three rules that are not verifiable from `src/` and not
covered by the three blocking checks — are written out in `rules.md` § Where the
BR7 rules are enforced.

---

## What this unit establishes and a later unit deepens

`unit-of-work.md` gives U1 every component at minimum depth, so the entity model
is authored once, here, in full. Two entities have rules that U2 and U3
*complete* rather than redefine (story map § Cross-cutting):

| Entity | Established here | Completed by |
|---|---|---|
| Post | Required fields, date format, ordering rule | U2 — the full post page, list, feed, and Markdown element set |
| Project | Required fields, optional-liveUrl behaviour, ordering rule | U3 — the metadata rail, list-row targets, and empty state |

Neither later unit changes an attribute name, a type, or a constraint above. If
one needs to, that is a change to this file rather than a second definition.
