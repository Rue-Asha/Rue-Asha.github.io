/**
 * Heading order — `project.md` § Mandated (WCAG 2.1 AA landmark and heading
 * structure), NFR1.
 *
 * This is the one thing in this unit that was actually wrong. The Projects page
 * emitted `h1` and then each row's name as `h3`, with nothing at `h2` between
 * them, so a screen-reader user navigating by heading heard a level skip that
 * implies a missing section.
 *
 * Nothing in this repository would have caught it: `team.md` § Testing Posture
 * records heading order as one of the things the declined automated
 * accessibility scan covered, and says plainly that without the scan it is "a
 * design-review responsibility and a walkthrough observation, or it is
 * nobody's". It was nobody's. These tests make it something's.
 *
 * Written as a property over the rendered markup — no level is skipped, exactly
 * one `h1` — rather than as an assertion about a fixed sequence, because U4, U5
 * and U6 all change these pages and a fixed sequence would break the first time
 * one of them adds a legitimate section.
 */

import { describe, expect, it } from "vitest";

import {
  renderHome,
  renderProject,
  renderProjects,
} from "../../src/page-renderer/pages.ts";
import { TEST_SITE, aPost, aProject } from "../u1/helpers.ts";
import {
  countLevelOneHeadings,
  firstHeadingSkip,
  renderPage,
} from "./helpers.ts";

/** Four projects, enough that the list is a list rather than a single row. */
const PROJECTS = [
  aProject({ slug: "alpha", name: "Alpha", year: 2026, featured: true }),
  aProject({ slug: "beta", name: "Beta", year: 2025 }),
  aProject({ slug: "gamma", name: "Gamma", year: 2024 }),
  aProject({ slug: "delta", name: "Delta", year: 2023 }),
];

const POSTS = [
  aPost({ slug: "one", title: "One", date: "2026-05-01" }),
  aPost({ slug: "two", title: "Two", date: "2026-04-01" }),
];

/**
 * A body carrying its own headings, at the level an author would actually write.
 *
 * A project page's `h1` is the project name, so an author's top-level body
 * heading is `h2`. Rendering the body with no headings at all would leave the
 * write-up page's property untested against real content.
 */
const BODY = [
  "<h2>What the problem was</h2>",
  "<p>Some prose.</p>",
  "<h3>A detail</h3>",
  "<p>More prose.</p>",
  "<h2>What is next</h2>",
].join("\n");

describe("the Projects page has a well-formed heading outline (BR9.4, NFR1)", () => {
  it("skips no heading level between the page heading and its rows", () => {
    const html = renderPage(renderProjects(PROJECTS));

    // Before this unit this read `h1` then `h3` — a skip on a page whose rows
    // are its only structural level.
    expect(firstHeadingSkip(html)).toBeNull();
  });

  it("emits exactly one h1, so the rows are headings rather than page titles", () => {
    const html = renderPage(renderProjects(PROJECTS));

    // The no-skip property alone would be satisfied by four `h1` rows. This is
    // the half of the contract that rules that out.
    expect(countLevelOneHeadings(html)).toBe(1);
  });
});

describe("Home has a well-formed heading outline (BR5.3, NFR1)", () => {
  it("skips no level and emits exactly one h1, with both sections at the same depth", () => {
    const html = renderPage(
      renderHome(POSTS, PROJECTS, TEST_SITE.siteName, "An intro."),
    );

    expect(firstHeadingSkip(html)).toBeNull();
    expect(countLevelOneHeadings(html)).toBe(1);
  });

  it("keeps its project rows one level below the section heading they sit under", () => {
    const html = renderPage(
      renderHome(POSTS, PROJECTS, TEST_SITE.siteName, "An intro."),
    );

    // Home was already correct and must stay correct: the fix to the Projects
    // page moved a shared include, so the regression risk runs this way.
    expect(html).toContain('<h2 id="home-projects">Projects</h2>');
    expect(html).toContain('<h3><a href="/projects/alpha/"');
  });
});

describe("a project write-up page has a well-formed heading outline (BR9.5, NFR1)", () => {
  it("skips no level across the header, the rail and an authored body", () => {
    const html = renderPage(renderProject(PROJECTS[1]!, BODY));

    expect(firstHeadingSkip(html)).toBeNull();
    expect(countLevelOneHeadings(html)).toBe(1);
  });

  it("puts the project name at h1 rather than leaving the page without one", () => {
    const html = renderPage(renderProject(PROJECTS[1]!, BODY));

    expect(html).toContain("<h1>Beta</h1>");
  });
});
