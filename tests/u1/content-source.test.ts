/**
 * ContentSource — BR1.1 to BR1.9.
 *
 * These tests run against committed fixture trees, because the rules under test
 * are all statements about what is on disk.
 */

import { describe, expect, it } from "vitest";

import {
  findDuplicateSlugs,
  itemsOfKind,
  loadContent,
} from "../../src/content-source.ts";
import type { ContentFile } from "../../src/types.ts";
import { fixture, hasError } from "./helpers.ts";

describe("ContentSource", () => {
  it("reads only content/, so the AI-DLC workspace can never become a page (BR1.1)", async () => {
    // The repository root here is the real one, which carries `aidlc/`,
    // `.claude/`, `node_modules/` and `src/` beside `content/`. This is the
    // exact situation constraint C2 describes.
    const result = await loadContent({ repoRoot: process.cwd() });

    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.path.startsWith("content/")).toBe(true);
    }
    expect(result.items.some((item) => item.path.includes("aidlc/"))).toBe(
      false,
    );
    expect(result.items.some((item) => item.path.includes(".claude/"))).toBe(
      false,
    );
  });

  it("derives kind from the top directory and slug from the item directory (BR1.3, BR1.4)", async () => {
    const result = await loadContent({ repoRoot: fixture("valid-site") });

    expect(result.errors).toEqual([]);
    expect(itemsOfKind(result.items, "post").map((item) => item.slug)).toEqual([
      "first-post",
    ]);
    expect(
      itemsOfKind(result.items, "project").map((item) => item.slug),
    ).toEqual(["first-project"]);
    expect(result.items[0]?.path).toBe("content/posts/first-post/index.md");
  });

  it("reports a directory with no index.md, naming the directory (BR1.2)", async () => {
    const result = await loadContent({
      repoRoot: fixture("malformed-structure"),
    });

    expect(hasError(result.errors, "posts/no-index-here", "index.md")).toBe(
      true,
    );
    expect(result.items.some((item) => item.slug === "no-index-here")).toBe(
      false,
    );
  });

  it("reports a directory name that is not a valid slug, and publishes nothing for it (BR1.4)", async () => {
    const result = await loadContent({
      repoRoot: fixture("malformed-structure"),
    });

    expect(hasError(result.errors, "posts/Bad_Slug", "slug")).toBe(true);
    expect(result.items.some((item) => item.slug === "Bad_Slug")).toBe(false);
  });

  it("reports unparseable front matter as a field error rather than skipping the file (BR1.9)", async () => {
    const result = await loadContent({
      repoRoot: fixture("malformed-structure"),
    });

    expect(
      hasError(
        result.errors,
        "unparseable-front-matter/index.md",
        "frontMatter",
      ),
    ).toBe(true);
  });

  it("rejects a non-boolean draft mark rather than coercing it (BR1.6)", async () => {
    const result = await loadContent({
      repoRoot: fixture("malformed-structure"),
    });

    // A coerced `draft: "false"` is truthy, and would have published a post the
    // author believes is hidden. It must be an error, not a value.
    expect(hasError(result.errors, "coerced-draft/index.md", "draft")).toBe(
      true,
    );
    expect(result.items.some((item) => item.slug === "coerced-draft")).toBe(
      false,
    );
  });

  it("drops drafts once, at this boundary, so no consumer has to remember (BR1.7)", async () => {
    const result = await loadContent({ repoRoot: fixture("with-draft") });

    expect(result.errors).toEqual([]);
    expect(result.items.map((item) => item.slug)).toEqual(["published-post"]);
    expect(result.items.every((item) => !item.isDraft)).toBe(true);
  });

  it("keeps the date as authored text rather than a parsed date value (BR2.3 precondition)", async () => {
    const result = await loadContent({ repoRoot: fixture("valid-site") });

    // YAML's default schema would resolve `2026-03-12` to a date object, which
    // would make `2026-03-12 10:00:00` indistinguishable from it and quietly
    // destroy BR2.3's strictness.
    expect(result.items[0]?.frontMatter["date"]).toBe("2026-03-12");
  });

  it("treats every file beside index.md as that item’s asset (FA2, CA3)", async () => {
    const result = await loadContent({ repoRoot: fixture("with-assets") });

    expect(result.errors).toEqual([]);
    expect(result.items[0]?.assets).toEqual([
      "content/posts/illustrated-post/diagram.png",
    ]);
  });

  it("reports two same-kind items sharing a slug, naming both directories (BR1.5)", () => {
    // Unreachable from a fixture: a slug is its own directory name, so two
    // same-kind items sharing one would have to be the same directory. The rule
    // is checked directly instead of being left unverified.
    const base: Omit<ContentFile, "directory"> = {
      path: "content/posts/duplicate/index.md",
      kind: "post",
      slug: "duplicate",
      frontMatter: {},
      body: "",
      isDraft: false,
      assets: [],
    };
    const errors = findDuplicateSlugs([
      { ...base, directory: "content/posts/duplicate" },
      { ...base, directory: "content/posts/duplicate-copy" },
    ]);

    expect(errors).toHaveLength(2);
    expect(errors.every((error) => error.field === "slug")).toBe(true);
    expect(errors[0]?.message).toContain("content/posts/duplicate");
    expect(errors[0]?.message).toContain("content/posts/duplicate-copy");
  });
});
