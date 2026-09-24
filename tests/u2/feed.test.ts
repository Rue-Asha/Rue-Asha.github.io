/**
 * ContentTransforms.buildAtomFeed — BR8.3, FR5.1, W4.
 *
 * Pure-function tests. `buildAtomFeed` takes its inputs and returns text; it
 * touches no file system, no network and no clock, which is what the last test
 * in this file actually asserts.
 */

import { describe, expect, it } from "vitest";

import { buildAtomFeed } from "../../src/content-transforms.ts";
import { TEST_BUILD_DATE, TEST_SITE, aPost } from "../u1/helpers.ts";
import { aFeedPost, entryId, feedEntries } from "./helpers.ts";

/** The ordered list a populated feed is built from: newest first, as BR2.4 fixes. */
const ORDERED = [
  aFeedPost(
    aPost({
      slug: "third-post",
      title: "The third post",
      summary: "Newest of the three.",
      date: "2026-05-20",
    }),
  ),
  aFeedPost(
    aPost({
      slug: "second-post",
      title: "The second post",
      summary: "The middle one.",
      date: "2026-03-12",
    }),
  ),
  aFeedPost(
    aPost({
      slug: "first-post",
      title: "The first post",
      summary: "Oldest of the three.",
      date: "2026-01-15",
    }),
  ),
];

describe("buildAtomFeed", () => {
  it("lists every post exactly once, in the order it was given", () => {
    const entries = feedEntries(
      buildAtomFeed(TEST_SITE, ORDERED, TEST_BUILD_DATE),
    );

    expect(entries).toHaveLength(3);
    expect(entries.map(entryId)).toEqual([
      "https://rue-asha.github.io/writing/third-post/",
      "https://rue-asha.github.io/writing/second-post/",
      "https://rue-asha.github.io/writing/first-post/",
    ]);
  });

  it("identifies each entry by the post's canonical URL, built from baseUrl (BR8.3)", () => {
    const feed = buildAtomFeed(
      { ...TEST_SITE, baseUrl: "https://example.test" },
      [ORDERED[0]!],
      TEST_BUILD_DATE,
    );
    const entry = feedEntries(feed)[0] ?? "";

    // The identifier a feed reader deduplicates on, and the link it opens, are
    // the same URL rather than two values that could drift apart.
    expect(entryId(entry)).toBe("https://example.test/writing/third-post/");
    expect(entry).toContain(
      '<link rel="alternate" type="text/html" href="https://example.test/writing/third-post/"/>',
    );
  });

  it("carries the summary and never the body (BR8.3)", () => {
    const post = aPost({
      slug: "a-post",
      title: "A post",
      summary: "The one-line summary.",
      body: "A distinctive sentence that lives only in the body.",
    });
    const feed = buildAtomFeed(TEST_SITE, [aFeedPost(post)], TEST_BUILD_DATE);

    expect(feed).toContain(
      '<summary type="text">The one-line summary.</summary>',
    );
    expect(feed).not.toContain("distinctive sentence");
  });

  it("escapes characters that are not safe as XML text", () => {
    const feed = buildAtomFeed(
      TEST_SITE,
      [
        aFeedPost(
          aPost({
            title: 'Fail loudly & "name" the <field>',
            summary: "Why a build should stop rather than drop a post.",
          }),
        ),
      ],
      TEST_BUILD_DATE,
    );

    expect(feed).toContain(
      "<title>Fail loudly &amp; &quot;name&quot; the &lt;field&gt;</title>",
    );
    expect(feed).not.toContain("<field>");
  });

  it("yields a well-formed feed with an id and an updated value when nothing is published", () => {
    const feed = buildAtomFeed(TEST_SITE, [], TEST_BUILD_DATE);

    expect(feedEntries(feed)).toEqual([]);
    expect(feed).toContain("<id>https://rue-asha.github.io/</id>");
    // With no post to take a date from, the injected build date is the fallback.
    expect(feed).toContain(`<updated>${TEST_BUILD_DATE}T00:00:00Z</updated>`);
    expect(feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(
      true,
    );
    expect(feed.trimEnd().endsWith("</feed>")).toBe(true);
  });

  it("takes its own updated value from the newest declared post date", () => {
    const feed = buildAtomFeed(TEST_SITE, ORDERED, TEST_BUILD_DATE);

    // The newest post's date, not the build's — a build that changed nothing must
    // not tell every subscriber that something changed.
    expect(feed).toContain("<updated>2026-05-20T00:00:00Z</updated>");
    expect(feed).not.toContain(
      `<updated>${TEST_BUILD_DATE}T00:00:00Z</updated>`,
    );
  });

  it("reads no clock: the same inputs render byte-identically", () => {
    const first = buildAtomFeed(TEST_SITE, ORDERED, TEST_BUILD_DATE);
    const second = buildAtomFeed(TEST_SITE, ORDERED, TEST_BUILD_DATE);

    expect(second).toBe(first);
    // Nothing resembling a wall-clock time appears anywhere: every timestamp is
    // derived from a declared date and is therefore midnight UTC.
    expect(first).not.toMatch(/T(?!00:00:00Z)\d{2}:\d{2}:\d{2}/);
  });
});
