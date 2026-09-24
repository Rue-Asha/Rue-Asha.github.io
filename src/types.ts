/**
 * The six entities of `functional-design/entities.md`, expressed as TypeScript
 * types, plus the small supporting shapes the components exchange.
 *
 * Attribute names, required/optional status and cardinality are inherited from
 * that file unchanged. Where a constraint cannot be expressed in the type system
 * (a strict `YYYY-MM-DD` date, a slug pattern, a bounded year) it is enforced by
 * the owning component and named in the rule it implements.
 */

/** ContentFile.kind — derived from the top content directory, never declared (BR1.3). */
export type ContentKind = "post" | "project";

/**
 * A message naming the offending file path and the offending field name.
 *
 * `rules.md` defines "field error" once, for all 44 rules: it is collected by
 * SiteBuilder, reported alongside every other field error, and ends the build
 * before anything is written (BR4.2, BR4.3, BR4.4). It is never a warning and
 * never a skipped file.
 */
export interface FieldError {
  /** Repository-relative path of the offending item (BR4.3). */
  readonly path: string;
  /** Name of the field at fault (BR4.3). */
  readonly field: string;
  /** What is wrong, in a sentence an author can act on. */
  readonly message: string;
}

/**
 * ContentFile — one item of authored content as found on disk and parsed.
 * Owned by ContentSource; the only entity that knows about the file system.
 */
export interface ContentFile {
  /** Repository-relative path of the item's `index.md`. Always under `content/` (BR1.1). */
  readonly path: string;
  /** Repository-relative path of the item's own directory. */
  readonly directory: string;
  readonly kind: ContentKind;
  /** The item's own directory name; lowercase kebab-case ASCII (BR1.4). */
  readonly slug: string;
  readonly frontMatter: Readonly<Record<string, unknown>>;
  readonly body: string;
  /** True when front matter carries `draft: true`, and only then (BR1.6). */
  readonly isDraft: boolean;
  /**
   * Every file in the item directory other than `index.md`, repository-relative.
   * Copied beside the item's page at write time (FA2, CA3).
   */
  readonly assets: readonly string[];
}

/** Post — a published piece of writing. Owned by PostCatalog. */
export interface Post {
  readonly slug: string;
  readonly title: string;
  /** One line, no line break. Reused verbatim as the page description (BR2.2, BR5.8). */
  readonly summary: string;
  /** Strict ISO 8601 calendar date, `YYYY-MM-DD` (BR2.3). */
  readonly date: string;
  /** The Markdown body, unrendered at this layer. */
  readonly body: string;
  /** Repository-relative path of the source file, for error messages and the manifest. */
  readonly sourcePath: string;
}

/** Project — a piece of work being presented. Owned by ProjectCatalog. */
export interface Project {
  readonly slug: string;
  readonly name: string;
  readonly summary: string;
  readonly year: number;
  readonly type: string;
  readonly tools: readonly string[];
  /** Absolute http(s) URL. Reachability deliberately unchecked (BR3.4, NFR11). */
  readonly repo: string;
  /** Absent means "omit the rail row entirely", never "render it empty" (BR3.5). */
  readonly liveUrl?: string;
  /** Orders; never selects. Absent means false (BR3.6, BR3.7). */
  readonly featured: boolean;
  /**
   * The Markdown write-up body.
   *
   * `entities.md` lists `body` on Post and not on Project, while FR3.2 requires
   * the project page to carry "a body of author-chosen structure and length".
   * Carried here for the same reason Post carries it; see `code-summary.md`.
   */
  readonly body: string;
  readonly sourcePath: string;
}

/** SiteMetadata — the site-level values no content file carries. Owned by PageRenderer. */
export interface SiteMetadata {
  readonly siteName: string;
  /** Absolute https URL with no trailing slash. */
  readonly baseUrl: string;
  /** Used only when a page template supplies no description of its own (BR5.8). */
  readonly fallbackDescription: string;
  /** The exact policy value emitted into every page head (BR5.10). */
  readonly contentSecurityPolicy: string;
}

/** One row of BuildManifest.sourceToOutput. Drafts produce no row (BR1.7, BR6.2). */
export interface SourceOutputRow {
  /** Repository-relative path of the source `index.md`. */
  readonly sourcePath: string;
  /** Output-relative path of the page written from it. */
  readonly outputPath: string;
  readonly kind: ContentKind;
}

/** BuildManifest — the record of what a successful build actually wrote. Owned by SiteBuilder. */
export interface BuildManifest {
  readonly buildId: string;
  /** Repository-relative path of the directory the build wrote to. */
  readonly outputRoot: string;
  /** Output-relative path of every page written, including the sitemap. */
  readonly pagesWritten: readonly string[];
  readonly sourceToOutput: readonly SourceOutputRow[];
  /** ISO 8601 timestamp. */
  readonly startedAt: string;
}

/** CheckReport result values. `not-run` occurs only when the build failed (BR6.5). */
export type CheckResult = "pass" | "fail" | "not-run";

/** Which of the three blocking checks a failure came from. */
export type CheckName = "build" | "page-coverage" | "internal-links";

export interface CheckFailure {
  readonly check: CheckName;
  readonly message: string;
}

/** CheckReport — the outcome of one run of all three blocking checks. Owned by CheckRunner. */
export interface CheckReport {
  /** Present even when the build failed, in which case no manifest exists. */
  readonly buildId: string;
  readonly buildResult: Exclude<CheckResult, "not-run">;
  readonly pageCoverageResult: CheckResult;
  readonly internalLinkResult: CheckResult;
  /** Every failure across all three checks. Never truncated at the first (BR6.1). */
  readonly failures: readonly CheckFailure[];
  /** True when any of the three results is `fail`. A `not-run` is never a pass (BR6.5). */
  readonly blocking: boolean;
}
