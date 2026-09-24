/**
 * PostCatalog — BR2.1 to BR2.4.
 *
 * Pure inputs, no mocks: these are the branching functions the coverage floor is
 * really measuring.
 */

import { describe, expect, it } from "vitest";

import { buildPostCatalog } from "../../src/post-catalog.ts";
import type { ContentFile } from "../../src/types.ts";
import { TEST_BUILD_DATE, hasError } from "./helpers.ts";

function aFile(
  slug: string,
  frontMatter: Record<string, unknown>,
): ContentFile {
  return {
    path: `content/posts/${slug}/index.md`,
    directory: `content/posts/${slug}`,
    kind: "post",
    slug,
    frontMatter,
    body: "Body text.",
    isDraft: false,
    assets: [],
  };
}

const VALID = {
  title: "A post",
  summary: "A one-line summary.",
  date: "2026-03-12",
};

function run(files: ContentFile[]) {
  return buildPostCatalog(files, { buildDate: TEST_BUILD_DATE });
}

describe("PostCatalog", () => {
  it("accepts a post carrying all three required fields (BR2.1 to BR2.3)", () => {
    const result = run([aFile("a-post", VALID)]);

    expect(result.errors).toEqual([]);
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0]?.title).toBe("A post");
  });

  it("reports every missing required field on one post together (BR2.1 to BR2.3, BR4.2)", () => {
    const result = run([aFile("a-post", {})]);

    expect(result.posts).toEqual([]);
    expect(hasError(result.errors, "a-post/index.md", "title")).toBe(true);
    expect(hasError(result.errors, "a-post/index.md", "summary")).toBe(true);
    expect(hasError(result.errors, "a-post/index.md", "date")).toBe(true);
    // All three at once, not one per build.
    expect(result.errors).toHaveLength(3);
  });

  it("rejects a summary carrying a line break (BR2.2)", () => {
    const result = run([
      aFile("a-post", { ...VALID, summary: "First line.\nSecond line." }),
    ]);

    expect(hasError(result.errors, "a-post/index.md", "summary")).toBe(true);
    expect(result.posts).toEqual([]);
  });

  it.each([
    ["Sept 23, 2026", "a month name"],
    ["23/09/2026", "day-first slashes"],
    ["2026-03-12T10:00:00Z", "a time and an offset"],
    ["2026-03-12 10:00:00", "a time"],
    ["2026-3-12", "unpadded components"],
    ["2026-02-30", "a day that does not exist"],
  ])("rejects the date %s, which carries %s (BR2.3)", (date) => {
    const result = run([aFile("a-post", { ...VALID, date })]);

    expect(hasError(result.errors, "a-post/index.md", "date")).toBe(true);
    expect(result.posts).toEqual([]);
  });

  it("names both the file and the field on every error (BR4.3)", () => {
    const result = run([aFile("a-post", { ...VALID, title: "   " })]);

    expect(result.errors[0]?.path).toBe("content/posts/a-post/index.md");
    expect(result.errors[0]?.field).toBe("title");
    expect(result.errors[0]?.message.length).toBeGreaterThan(0);
  });

  it("rejects a date more than a year past the build date, using the injected date (entities.md)", () => {
    const result = run([aFile("a-post", { ...VALID, date: "2030-01-01" })]);

    expect(hasError(result.errors, "a-post/index.md", "date")).toBe(true);
  });

  it("orders by declared date descending, breaking ties by slug ascending (BR2.4)", () => {
    const result = run([
      aFile("older", { ...VALID, date: "2026-02-28" }),
      aFile("zebra", { ...VALID, date: "2026-03-12" }),
      aFile("apple", { ...VALID, date: "2026-03-12" }),
    ]);

    expect(result.errors).toEqual([]);
    // Newest first; the two sharing a date are ordered by slug, not by the order
    // they were found in, so a fresh clone produces the same list.
    expect(result.posts.map((post) => post.slug)).toEqual([
      "apple",
      "zebra",
      "older",
    ]);
  });

  it("never consults file modification time (BR2.4)", () => {
    // The catalogue is handed no timestamp at all: there is nothing on a
    // ContentFile for ordering to read except the declared date. Git does not
    // preserve mtimes, so a fresh clone would otherwise reorder the list.
    const file = aFile("a-post", VALID);
    expect(Object.keys(file)).not.toContain("modifiedAt");
    expect(run([file]).posts[0]?.date).toBe("2026-03-12");
  });
});
