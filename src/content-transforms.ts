/**
 * ContentTransforms — the small derived functions, in one place.
 *
 * Pure by contract (ADR-003): no file-system access, no network access, no
 * clock. Every value these functions need is passed in, which is what makes
 * them the single clear target for the inherited 80% line-coverage floor
 * (NFR12) and what keeps the suite from starting to fail on 1 January.
 *
 * Feed construction lives here for the same reason: it is a derivation from
 * values it is handed, and holding it to that contract is what lets the suite
 * assert that two calls with identical inputs render byte-identically.
 */

import type { SiteMetadata } from "./types.ts";

/** The slug pattern BR1.4 states: lowercase, kebab-case, ASCII only. */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const MONTHS_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const MONTHS_LONG = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

/**
 * Reduce arbitrary text to the canonical slug form.
 *
 * This is the one definition of what a slug looks like. `isValidSlug` is
 * "already canonical", so a directory name is valid exactly when this function
 * would leave it unchanged — which is the operational form of the rule that the
 * file name is the URL (NFR8, `team.md` § Code Style).
 */
export function generateSlug(input: string): string {
  return (
    input
      .normalize("NFKD")
      // Drop combining marks, so `café` becomes `cafe` rather than `caf`.
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * True when `value` is already the canonical slug form (BR1.4).
 *
 * A directory name that only differs from its canonical form by case or by a
 * separator is rejected rather than silently corrected: correcting it would
 * change a published URL, and NFR8 forbids that outright.
 */
export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value) && generateSlug(value) === value;
}

/**
 * Parse a strict ISO 8601 calendar date, `YYYY-MM-DD`, and nothing else (BR2.3).
 *
 * Returns the date's UTC components, or `null` when the value is not exactly
 * that. Anything a forgiving parser would accept — `Sept 23, 2026`,
 * `23/09/2026`, a value carrying a time or an offset — returns `null`. The
 * failure mode of a permissive parser is silent misordering, not a loud error,
 * which is the trade [Q3] declined to make.
 */
export function parseIsoDate(
  value: string,
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // Reject a well-formed string that is not a real calendar day (2026-02-30).
  const asUtc = new Date(Date.UTC(year, month - 1, day));
  if (
    asUtc.getUTCFullYear() !== year ||
    asUtc.getUTCMonth() !== month - 1 ||
    asUtc.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

/**
 * Format a strict ISO date for display.
 *
 * `list` gives the compact list-row form (`12 MAR 2026`); `long` gives the post
 * and project page form (`12 MARCH 2026`). Both are derived from the declared
 * string, never from a `Date` built in the local zone — a local-zone conversion
 * moves the day across a midnight boundary for half the world.
 */
export function formatDisplayDate(
  isoDate: string,
  style: "list" | "long" = "list",
): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    throw new Error(
      `formatDisplayDate received "${isoDate}", which is not a strict YYYY-MM-DD date. ` +
        "Dates are validated by PostCatalog before they reach display (BR2.3).",
    );
  }
  const names = style === "long" ? MONTHS_LONG : MONTHS_SHORT;
  const month = names[parsed.month - 1] ?? "";
  return `${String(parsed.day).padStart(2, "0")} ${month} ${String(parsed.year)}`;
}

/**
 * Normalise an authored one-line summary, or report why it cannot be used.
 *
 * The summary is rendered on one line in list rows and reused verbatim as the
 * page description in head metadata (BR2.2, BR5.8), which is why the single-line
 * constraint is a correctness rule rather than a cosmetic one.
 */
export function deriveSummary(
  raw: unknown,
  maxLength = 200,
): { ok: true; summary: string } | { ok: false; reason: string } {
  if (raw === undefined || raw === null) {
    return { ok: false, reason: "is required and is absent" };
  }
  if (typeof raw !== "string") {
    return { ok: false, reason: `must be text, not ${typeof raw}` };
  }
  if (/[\r\n]/.test(raw)) {
    return {
      ok: false,
      reason:
        "must be a single line: it is rendered in a list row and reused as the page description",
    };
  }
  const summary = raw.trim();
  if (summary === "") {
    return { ok: false, reason: "is required and is empty" };
  }
  if (summary.length > maxLength) {
    return {
      ok: false,
      reason: `must be at most ${String(maxLength)} characters; this one is ${String(summary.length)}`,
    };
  }
  return { ok: true, summary };
}

/** The minimum shape `sortPosts` needs. Keeps the transform independent of the Post type. */
export interface SortablePost {
  readonly slug: string;
  readonly date: string;
}

/**
 * Order posts by declared date, newest first, ties broken by slug ascending
 * (BR2.4).
 *
 * The declared date is the only input. File modification time is never read:
 * git does not preserve mtimes, so a fresh clone or a CI checkout would
 * otherwise reorder the Writing list with nothing saying so.
 */
export function sortPosts<T extends SortablePost>(posts: readonly T[]): T[] {
  return [...posts].sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
}

/** The minimum shape `sortProjects` needs. */
export interface SortableProject {
  readonly slug: string;
  readonly year: number;
  readonly featured: boolean;
}

/**
 * Order projects featured-first, then year descending, then slug ascending
 * (BR3.7).
 *
 * `featured` orders; it never selects. Every project appears exactly once
 * whatever its value — treating it as a filter would allow a state in which
 * projects exist and Home's Projects section shows its empty state.
 */
export function sortProjects<T extends SortableProject>(
  projects: readonly T[],
): T[] {
  return [...projects].sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      b.year - a.year ||
      a.slug.localeCompare(b.slug),
  );
}

/**
 * Turn an output-relative file path into the site path a reader sees.
 *
 * `index.html` becomes `/`; `writing/index.html` becomes `/writing/`; anything
 * else keeps its own name. Used by the sitemap and by the canonical URL in head
 * metadata, so the two cannot disagree about what a page's URL is.
 */
export function toSitePath(outputPath: string): string {
  const normalised = outputPath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (normalised === "index.html") return "/";
  if (normalised.endsWith("/index.html")) {
    return `/${normalised.slice(0, -"index.html".length)}`;
  }
  return `/${normalised}`;
}

/** Join a base URL with a site path, without producing a double slash. */
export function toAbsoluteUrl(baseUrl: string, sitePath: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${sitePath.startsWith("/") ? sitePath : `/${sitePath}`}`;
}

/** Escape the five characters that are not safe as XML text. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** The sitemap's own output path, excluded from its own listing (BR5.11). */
export const SITEMAP_OUTPUT_PATH = "sitemap.xml";

/**
 * Build `sitemap.xml` from the pages a build wrote (BR5.11).
 *
 * Every entry is an absolute URL built from `baseUrl`. The sitemap excludes
 * itself. Drafts have no page and therefore no entry, which follows from BR1.7
 * rather than being re-decided here — a sitemap listing a draft's URL would
 * expose it even though no page links to it.
 */
export function buildSitemap(
  baseUrl: string,
  pagePaths: readonly string[],
): string {
  const urls = pagePaths
    .filter((pagePath) => pagePath !== SITEMAP_OUTPUT_PATH)
    .map((pagePath) => toAbsoluteUrl(baseUrl, toSitePath(pagePath)))
    .sort((a, b) => a.localeCompare(b));

  const entries = urls.map(
    (url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`,
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

/**
 * The feed's output path ([Q1], answer A).
 *
 * `/feed.xml` is permanent in the way a post slug is permanent. GitHub Pages has
 * no server-side redirects (C4), so a feed that moves cannot be forwarded — every
 * existing subscriber simply stops receiving posts, and with analytics excluded
 * from this initiative entirely, nothing would ever say so (U2A3). Treat a change
 * to this constant as an NFR8-class change rather than a routine one.
 */
export const FEED_OUTPUT_PATH = "feed.xml";

/**
 * One post, as the feed needs it.
 *
 * The site path arrives rather than being derived, so this module holds no route
 * knowledge and never imports `PageRenderer` — whose shell already imports this
 * module, which would make the pair a cycle. `postPath` stays the one definition
 * of where a post lives.
 */
export interface FeedPost {
  readonly title: string;
  /** The one-line summary. The body never travels in the feed (BR8.3). */
  readonly summary: string;
  /** The declared front-matter date, `YYYY-MM-DD`. */
  readonly date: string;
  /** The post's site path, e.g. `/writing/first-post/`. */
  readonly path: string;
}

/** A declared calendar date as the RFC 3339 instant Atom's `updated` requires. */
function toAtomTimestamp(isoDate: string): string {
  return `${isoDate}T00:00:00Z`;
}

/**
 * Build the Atom feed (BR8.3, FR5.1, W4).
 *
 * Three properties are load-bearing:
 *
 * 1. **Entries carry the summary, never the body.** Carrying the body would let a
 *    reader consume the whole site inside a feed reader, and it would require
 *    rendered HTML to be escaped into the feed correctly — a recurring source of
 *    silent breakage that nothing in this unit's check set would detect ([Q1]).
 * 2. **Each entry's identity is the post's canonical URL** (BR8.3), which is what
 *    a feed reader deduplicates on.
 * 3. **No clock is read.** The feed's own `updated` is the newest declared post
 *    date, falling back to the injected build date when there are no posts — for
 *    the same reason `formatDisplayDate` takes its date as an argument (U2CA1). A
 *    clock read here would make the suite time-dependent and would rewrite the
 *    feed on every build, telling every subscriber something changed when nothing
 *    did.
 *
 * Drafts are absent by construction rather than by a check here: the ordered post
 * list never contains one (BR1.7), so `posts` cannot carry a draft to exclude.
 */
export function buildAtomFeed(
  site: SiteMetadata,
  posts: readonly FeedPost[],
  buildDate: string,
): string {
  const feedUrl = toAbsoluteUrl(site.baseUrl, toSitePath(FEED_OUTPUT_PATH));
  const siteUrl = toAbsoluteUrl(site.baseUrl, "/");

  const newestDate = posts.reduce(
    (newest, post) => (post.date > newest ? post.date : newest),
    "",
  );
  const updated = toAtomTimestamp(newestDate === "" ? buildDate : newestDate);

  const entries = posts.flatMap((post) => {
    const url = toAbsoluteUrl(site.baseUrl, post.path);
    return [
      "  <entry>",
      `    <title>${escapeXml(post.title)}</title>`,
      `    <link rel="alternate" type="text/html" href="${escapeXml(url)}"/>`,
      `    <id>${escapeXml(url)}</id>`,
      `    <updated>${toAtomTimestamp(post.date)}</updated>`,
      `    <summary type="text">${escapeXml(post.summary)}</summary>`,
      "  </entry>",
    ];
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escapeXml(site.siteName)}</title>`,
    `  <subtitle>${escapeXml(site.fallbackDescription)}</subtitle>`,
    `  <id>${escapeXml(siteUrl)}</id>`,
    `  <link rel="self" type="application/atom+xml" href="${escapeXml(feedUrl)}"/>`,
    `  <link rel="alternate" type="text/html" href="${escapeXml(siteUrl)}"/>`,
    `  <updated>${updated}</updated>`,
    ...entries,
    "</feed>",
    "",
  ].join("\n");
}
