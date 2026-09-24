/**
 * ContentTransforms — the pure derived functions, plus BR5.11's sitemap.
 *
 * `team.md` § Testing Posture names exactly this list as the code that needs
 * unit tests: date formatting, summary derivation, post sorting, slug
 * generation, sitemap construction.
 */

import { describe, expect, it } from "vitest";

import {
  SITEMAP_OUTPUT_PATH,
  buildSitemap,
  deriveSummary,
  formatDisplayDate,
  generateSlug,
  isValidSlug,
  parseIsoDate,
  sortPosts,
  sortProjects,
  toAbsoluteUrl,
  toSitePath,
} from "../../src/content-transforms.ts";

describe("ContentTransforms", () => {
  it("generates canonical slugs and recognises one that is already canonical (NFR8)", () => {
    expect(generateSlug("Building This Site")).toBe("building-this-site");
    expect(generateSlug("Café — notes (2026)!")).toBe("cafe-notes-2026");
    expect(generateSlug("  --leading and trailing--  ")).toBe(
      "leading-and-trailing",
    );

    expect(isValidSlug("building-this-site")).toBe(true);
    // Rejected rather than silently corrected: correcting a directory name would
    // change a published URL, which NFR8 forbids outright.
    expect(isValidSlug("Building-This-Site")).toBe(false);
    expect(isValidSlug("trailing-")).toBe(false);
    expect(isValidSlug("under_score")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });

  it("parses only a strict YYYY-MM-DD calendar date (BR2.3)", () => {
    expect(parseIsoDate("2026-03-12")).toEqual({
      year: 2026,
      month: 3,
      day: 12,
    });
    expect(parseIsoDate("2024-02-29")).not.toBeNull();

    for (const bad of [
      "Sept 23, 2026",
      "23/09/2026",
      "2026-03-12T00:00:00Z",
      "2026-2-3",
      "2026-02-30",
      "",
    ]) {
      expect(parseIsoDate(bad)).toBeNull();
    }
  });

  it("formats a date from the declared string, never from a local-zone Date", () => {
    expect(formatDisplayDate("2026-03-12")).toBe("12 MAR 2026");
    expect(formatDisplayDate("2026-03-12", "long")).toBe("12 MARCH 2026");
    // A local-zone conversion moves the day across midnight for half the world;
    // 1 January is where that shows up.
    expect(formatDisplayDate("2026-01-01")).toBe("01 JAN 2026");
    expect(() => formatDisplayDate("not a date")).toThrow(/strict YYYY-MM-DD/);
  });

  it("derives a one-line summary and explains each way one can fail (BR2.2)", () => {
    expect(deriveSummary("  A one-line summary.  ")).toEqual({
      ok: true,
      summary: "A one-line summary.",
    });
    expect(deriveSummary(undefined).ok).toBe(false);
    expect(deriveSummary(42).ok).toBe(false);
    expect(deriveSummary("   ").ok).toBe(false);
    expect(deriveSummary("one\ntwo").ok).toBe(false);
    expect(deriveSummary("x".repeat(201)).ok).toBe(false);
  });

  it("sorts posts newest first with a stable slug tie-break, and does not mutate (BR2.4)", () => {
    const input = [
      { slug: "zebra", date: "2026-03-12" },
      { slug: "older", date: "2026-02-28" },
      { slug: "apple", date: "2026-03-12" },
    ];
    const sorted = sortPosts(input);

    expect(sorted.map((post) => post.slug)).toEqual([
      "apple",
      "zebra",
      "older",
    ]);
    expect(input[0]?.slug).toBe("zebra");
  });

  it("sorts projects featured-first, then year, then slug (BR3.7)", () => {
    const sorted = sortProjects([
      { slug: "b", year: 2026, featured: false },
      { slug: "a", year: 2026, featured: false },
      { slug: "old-favourite", year: 2001, featured: true },
    ]);

    expect(sorted.map((project) => project.slug)).toEqual([
      "old-favourite",
      "a",
      "b",
    ]);
  });

  it("maps an output path to the site path a reader sees", () => {
    expect(toSitePath("index.html")).toBe("/");
    expect(toSitePath("writing/index.html")).toBe("/writing/");
    expect(toSitePath("writing/first-post/index.html")).toBe(
      "/writing/first-post/",
    );
    expect(toSitePath("404.html")).toBe("/404.html");
    expect(toAbsoluteUrl("https://rue-asha.github.io/", "/writing/")).toBe(
      "https://rue-asha.github.io/writing/",
    );
  });

  it("builds a sitemap of absolute URLs that excludes itself (BR5.11)", () => {
    const xml = buildSitemap("https://rue-asha.github.io", [
      "index.html",
      "writing/index.html",
      "writing/first-post/index.html",
      SITEMAP_OUTPUT_PATH,
    ]);

    expect(xml).toContain("<loc>https://rue-asha.github.io/</loc>");
    expect(xml).toContain(
      "<loc>https://rue-asha.github.io/writing/first-post/</loc>",
    );
    expect(xml).not.toContain("sitemap.xml");
    // A draft has no page, so it can never reach this list — the exclusion is
    // BR1.7's, not re-decided here.
    expect(xml.match(/<url>/g)).toHaveLength(3);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });

  it("escapes XML text so a URL carrying an ampersand cannot break the document", () => {
    const xml = buildSitemap("https://rue-asha.github.io", ["a&b/index.html"]);
    expect(xml).toContain("a&amp;b");
    expect(xml).not.toContain("a&b");
  });
});
