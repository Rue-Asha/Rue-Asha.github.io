/**
 * PostCatalog — what a post is, and what order posts come in (BR2.1 to BR2.4).
 *
 * It receives parsed, non-draft content files of kind post and returns the
 * ordered post list plus every field error it found. It never decides what to do
 * about an error: SiteBuilder collects them and aborts (ADR-004, ADR-007).
 */

import { fieldError } from "./errors.ts";
import {
  deriveSummary,
  parseIsoDate,
  sortPosts,
} from "./content-transforms.ts";
import type { ContentFile, FieldError, Post } from "./types.ts";

export interface PostCatalogResult {
  /** Ordered by declared date descending, ties broken by slug ascending (BR2.4). */
  readonly posts: readonly Post[];
  readonly errors: readonly FieldError[];
}

export interface PostCatalogOptions {
  /**
   * The build's own date, `YYYY-MM-DD`, injected rather than read from a clock.
   *
   * `entities.md` bounds `Post.date` at the build's date plus 366 days. Reading
   * the clock here would make a test suite that passes today start failing
   * tomorrow, for reasons that have nothing to do with the code.
   */
  readonly buildDate: string;
}

/** `entities.md` § Post — the earliest date a post may declare. */
const MIN_DATE = "1970-01-01";

/** `entities.md` § Post — a date may run at most this far past the build's own. */
const MAX_DAYS_AHEAD = 366;

/**
 * Require a non-empty string field (BR2.1).
 *
 * Absent, not-a-string, and empty-after-trimming are three different authoring
 * mistakes and each gets its own sentence, because "title is invalid" tells an
 * author nothing they can act on.
 */
function requireText(
  frontMatter: Readonly<Record<string, unknown>>,
  field: string,
  sourcePath: string,
): { value: string } | { error: FieldError } {
  const raw = frontMatter[field];
  if (raw === undefined || raw === null) {
    return {
      error: fieldError(sourcePath, field, "is required and is absent."),
    };
  }
  if (typeof raw !== "string") {
    return {
      error: fieldError(sourcePath, field, `must be text, not ${typeof raw}.`),
    };
  }
  const value = raw.trim();
  if (value === "") {
    return {
      error: fieldError(sourcePath, field, "is required and is empty."),
    };
  }
  return { value };
}

/** Days between two strict ISO dates, positive when `later` is after `earlier`. */
function daysBetween(earlier: string, later: string): number {
  const a = parseIsoDate(earlier);
  const b = parseIsoDate(later);
  if (!a || !b) return 0;
  const MS_PER_DAY = 86_400_000;
  return (
    (Date.UTC(b.year, b.month - 1, b.day) -
      Date.UTC(a.year, a.month - 1, a.day)) /
    MS_PER_DAY
  );
}

/**
 * Validate `date` strictly (BR2.3).
 *
 * `YYYY-MM-DD` and nothing else, checked as a real calendar day. A value a
 * forgiving parser would accept — `Sept 23, 2026`, `23/09/2026`, anything
 * carrying a time or an offset — is a field error. The failure mode of a
 * permissive parser is a Writing list silently in the wrong order, which is a
 * silent wrong answer where this project consistently chooses a loud one.
 */
function requireStrictDate(
  frontMatter: Readonly<Record<string, unknown>>,
  sourcePath: string,
  buildDate: string,
): { value: string } | { error: FieldError } {
  const raw = frontMatter["date"];
  if (raw === undefined || raw === null) {
    return {
      error: fieldError(sourcePath, "date", "is required and is absent."),
    };
  }
  if (typeof raw !== "string") {
    return {
      error: fieldError(
        sourcePath,
        "date",
        `must be written as YYYY-MM-DD, for example 2026-03-12. Found ${typeof raw}.`,
      ),
    };
  }

  const value = raw.trim();
  if (!parseIsoDate(value)) {
    return {
      error: fieldError(
        sourcePath,
        "date",
        `must be an ISO calendar date written as YYYY-MM-DD and nothing else. ` +
          `Found "${value}". A date carrying a time, an offset, or a month name is rejected ` +
          "deliberately: a forgiving parser reorders the Writing list silently instead of failing.",
      ),
    };
  }

  if (value < MIN_DATE) {
    return {
      error: fieldError(
        sourcePath,
        "date",
        `must not be earlier than ${MIN_DATE}.`,
      ),
    };
  }
  if (daysBetween(buildDate, value) > MAX_DAYS_AHEAD) {
    return {
      error: fieldError(
        sourcePath,
        "date",
        `must not be more than ${String(MAX_DAYS_AHEAD)} days after the build date ` +
          `(${buildDate}). Found "${value}".`,
      ),
    };
  }

  return { value };
}

/**
 * Validate every post and return them in order.
 *
 * Every fault on a post is collected before moving to the next, so one build
 * reports all of them (BR4.2). Stopping at the first would make fixing three
 * broken files a three-build exercise.
 */
export function buildPostCatalog(
  files: readonly ContentFile[],
  options: PostCatalogOptions,
): PostCatalogResult {
  const errors: FieldError[] = [];
  const posts: Post[] = [];

  for (const file of files) {
    const fileErrors: FieldError[] = [];

    const title = requireText(file.frontMatter, "title", file.path);
    if ("error" in title) fileErrors.push(title.error);

    // The summary is rendered on one line in a list row and reused verbatim as
    // the page description (BR5.8), so the single-line constraint is a
    // correctness rule rather than a cosmetic one.
    const summary = deriveSummary(file.frontMatter["summary"]);
    if (!summary.ok) {
      fileErrors.push(fieldError(file.path, "summary", `${summary.reason}.`));
    }

    const date = requireStrictDate(
      file.frontMatter,
      file.path,
      options.buildDate,
    );
    if ("error" in date) fileErrors.push(date.error);

    if (fileErrors.length > 0) {
      errors.push(...fileErrors);
      continue;
    }

    posts.push({
      slug: file.slug,
      title: (title as { value: string }).value,
      summary: (summary as { ok: true; summary: string }).summary,
      date: (date as { value: string }).value,
      body: file.body,
      sourcePath: file.path,
    });
  }

  return { posts: sortPosts(posts), errors };
}
