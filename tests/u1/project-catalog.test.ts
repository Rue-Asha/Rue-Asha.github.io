/**
 * ProjectCatalog — BR3.1 to BR3.7.
 */

import { describe, expect, it } from "vitest";

import { buildProjectCatalog } from "../../src/project-catalog.ts";
import type { ContentFile } from "../../src/types.ts";
import { TEST_BUILD_DATE, hasError } from "./helpers.ts";

function aFile(
  slug: string,
  frontMatter: Record<string, unknown>,
): ContentFile {
  return {
    path: `content/projects/${slug}/index.md`,
    directory: `content/projects/${slug}`,
    kind: "project",
    slug,
    frontMatter,
    body: "Body text.",
    isDraft: false,
    assets: [],
  };
}

const VALID = {
  name: "A project",
  summary: "A one-line summary.",
  year: 2026,
  type: "CLI",
  tools: ["TypeScript"],
  repo: "https://github.com/Rue-Asha/a-project",
};

function run(files: ContentFile[]) {
  return buildProjectCatalog(files, { buildDate: TEST_BUILD_DATE });
}

describe("ProjectCatalog", () => {
  it("reports all six missing required fields together, not one per build (BR3.1, BR4.2)", () => {
    const result = run([aFile("thin", {})]);

    expect(result.projects).toEqual([]);
    for (const field of ["name", "summary", "year", "type", "tools", "repo"]) {
      expect(hasError(result.errors, "thin/index.md", field)).toBe(true);
    }
    expect(result.errors).toHaveLength(6);
  });

  it("rejects a year outside its range and a non-integer year (BR3.2)", () => {
    // The upper bound is the build year plus one, taken from the injected build
    // date rather than the clock.
    expect(
      hasError(
        run([aFile("p", { ...VALID, year: 2099 })]).errors,
        "p/index.md",
        "year",
      ),
    ).toBe(true);
    expect(
      hasError(
        run([aFile("p", { ...VALID, year: 1969 })]).errors,
        "p/index.md",
        "year",
      ),
    ).toBe(true);
    expect(
      hasError(
        run([aFile("p", { ...VALID, year: "2026" })]).errors,
        "p/index.md",
        "year",
      ),
    ).toBe(true);
    // The build year plus one is inside the range, not outside it.
    expect(run([aFile("p", { ...VALID, year: 2027 })]).errors).toEqual([]);
  });

  it("rejects an empty tools list and an empty entry inside one (BR3.3)", () => {
    expect(
      hasError(
        run([aFile("p", { ...VALID, tools: [] })]).errors,
        "p/index.md",
        "tools",
      ),
    ).toBe(true);
    expect(
      hasError(
        run([aFile("p", { ...VALID, tools: ["Go", "  "] })]).errors,
        "p/index.md",
        "tools",
      ),
    ).toBe(true);
    expect(
      hasError(
        run([aFile("p", { ...VALID, tools: "TypeScript" })]).errors,
        "p/index.md",
        "tools",
      ),
    ).toBe(true);
  });

  it("rejects a relative repo but accepts an absolute one it never tries to reach (BR3.4, NFR11)", () => {
    expect(
      hasError(
        run([aFile("p", { ...VALID, repo: "../elsewhere" })]).errors,
        "p/index.md",
        "repo",
      ),
    ).toBe(true);
    expect(
      hasError(
        run([aFile("p", { ...VALID, repo: "ftp://example.com/x" })]).errors,
        "p/index.md",
        "repo",
      ),
    ).toBe(true);

    // Shape only. This host does not resolve and never will; reachability is
    // deliberately unchecked so somebody else's outage cannot stop this site
    // publishing.
    const unreachable = run([
      aFile("p", {
        ...VALID,
        repo: "https://this-host-does-not-resolve.invalid/repo",
      }),
    ]);
    expect(unreachable.errors).toEqual([]);
    expect(unreachable.projects).toHaveLength(1);
  });

  it("treats an absent liveUrl as an omission and an empty one as an error (BR3.5)", () => {
    const absent = run([aFile("p", VALID)]);
    expect(absent.errors).toEqual([]);
    expect(absent.projects[0]?.liveUrl).toBeUndefined();

    expect(
      hasError(
        run([aFile("p", { ...VALID, liveUrl: "" })]).errors,
        "p/index.md",
        "liveUrl",
      ),
    ).toBe(true);
  });

  it("defaults featured to false and rejects a non-boolean value (BR3.6)", () => {
    expect(run([aFile("p", VALID)]).projects[0]?.featured).toBe(false);
    expect(
      hasError(
        run([aFile("p", { ...VALID, featured: "yes" })]).errors,
        "p/index.md",
        "featured",
      ),
    ).toBe(true);
  });

  it("orders featured-first, then year descending, then slug ascending (BR3.7)", () => {
    const result = run([
      aFile("zebra", { ...VALID, year: 2025 }),
      aFile("apple", { ...VALID, year: 2025 }),
      aFile("newer", { ...VALID, year: 2026 }),
      aFile("promoted", { ...VALID, year: 2020, featured: true }),
    ]);

    expect(result.errors).toEqual([]);
    expect(result.projects.map((project) => project.slug)).toEqual([
      "promoted",
      "newer",
      "apple",
      "zebra",
    ]);
  });

  it("orders but never selects: every project appears exactly once (BR3.7)", () => {
    const result = run([
      aFile("one", VALID),
      aFile("two", { ...VALID, featured: false }),
      aFile("three", { ...VALID, featured: true }),
    ]);

    // Treating `featured` as a filter would allow a state in which projects
    // exist and Home's Projects section shows its empty state.
    expect(result.projects).toHaveLength(3);
    expect(new Set(result.projects.map((project) => project.slug)).size).toBe(
      3,
    );
  });
});
