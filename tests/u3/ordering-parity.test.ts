/**
 * BR9.3 — one project order on this site, not two.
 *
 * `sortProjects` is U1's and is already unit-tested; this file does not re-test
 * it. What BR9.3 actually adds is the **parity**: the Projects page and Home read
 * the same total order, so marking a project featured moves it on both pages
 * rather than one.
 *
 * `functional-spec.md` states the failure plainly — "two orderings for one
 * collection is the kind of divergence nobody remembers" — and it is a rendering
 * property, not a sorting one. Two templates each calling a correct sort can
 * still disagree if one of them sorts again, slices before ordering, or filters.
 */

import { describe, expect, it } from "vitest";

import { sortProjects } from "../../src/content-transforms.ts";
import { renderHome, renderProjects } from "../../src/page-renderer/pages.ts";
import { TEST_SITE, aPost, aProject } from "../u1/helpers.ts";
import { listedProjectSlugs, renderPage } from "./helpers.ts";

/** How many projects Home shows (BR5.3). Asserted against, never imported. */
const HOME_LIMIT = 3;

const POSTS = [aPost()];

/**
 * Five projects, deliberately declared out of order.
 *
 * Passing an already-sorted list would let a template that never ordered
 * anything pass every test here.
 */
const DECLARED = [
  aProject({ slug: "delta", name: "Delta", year: 2023 }),
  aProject({ slug: "alpha", name: "Alpha", year: 2026 }),
  aProject({ slug: "echo", name: "Echo", year: 2026 }),
  aProject({ slug: "beta", name: "Beta", year: 2024, featured: true }),
  aProject({ slug: "charlie", name: "Charlie", year: 2025 }),
];

/** What the catalog hands both templates: one ordering, applied once. */
const ORDERED = sortProjects(DECLARED);

function projectsPageOrder(projects: readonly ReturnType<typeof aProject>[]) {
  return listedProjectSlugs(renderPage(renderProjects(projects)));
}

function homeOrder(projects: readonly ReturnType<typeof aProject>[]) {
  return listedProjectSlugs(
    renderPage(renderHome(POSTS, projects, TEST_SITE.siteName, "An intro.")),
  );
}

describe("BR9.3 — the Projects page uses the catalog's order", () => {
  it("lists projects in exactly the order the catalog produced", () => {
    expect(projectsPageOrder(ORDERED)).toEqual(
      ORDERED.map((project) => project.slug),
    );
  });
});

describe("BR9.3 — Home is a window onto the same order", () => {
  it("shows exactly the first three of the catalog's order, not its own top three", () => {
    const home = homeOrder(ORDERED);

    expect(home).toHaveLength(HOME_LIMIT);
    expect(home).toEqual(
      ORDERED.slice(0, HOME_LIMIT).map((project) => project.slug),
    );
    // And it is a prefix of the full page, which is the property that fails if
    // either template ever sorts again on its own.
    expect(projectsPageOrder(ORDERED).slice(0, HOME_LIMIT)).toEqual(home);
  });

  it("moves a project on both pages when it becomes featured, never on one", () => {
    // `echo` is last among the 2026 projects by slug and is nowhere near the top
    // of either page while unfeatured.
    const before = sortProjects(DECLARED);
    expect(homeOrder(before)[0]).not.toBe("echo");

    const after = sortProjects(
      DECLARED.map((project) =>
        project.slug === "echo" ? { ...project, featured: true } : project,
      ),
    );

    // One edit, both pages. If the two templates held separate orderings, this
    // is the assertion that would fail — and nothing else would.
    expect(homeOrder(after)[0]).toBe("echo");
    expect(projectsPageOrder(after)[0]).toBe("echo");
  });
});

describe("BR9.3, U1 BR3.7 — featured orders and never filters", () => {
  it("still lists every project on the Projects page whatever its featured value", () => {
    const noneFeatured = sortProjects(
      DECLARED.map((project) => ({ ...project, featured: false })),
    );
    const allFeatured = sortProjects(
      DECLARED.map((project) => ({ ...project, featured: true })),
    );

    // Treating `featured` as a filter would allow a state in which projects
    // exist and the Projects page shows its empty state.
    for (const projects of [ORDERED, noneFeatured, allFeatured]) {
      const listed = projectsPageOrder(projects);
      expect(listed).toHaveLength(DECLARED.length);
      expect([...listed].sort()).toEqual(
        DECLARED.map((project) => project.slug).sort(),
      );
    }
  });
});
