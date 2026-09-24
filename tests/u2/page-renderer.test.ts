/**
 * PageRenderer — BR8.4 to BR8.7, FR2.1, FR2.3, FR2.4, FR2.8, FR2.9, FR4.3.
 *
 * These are the rules with nothing automated behind them on the publish path:
 * `functional-spec.md` records that only BR8.2 of the seven fails a build, and
 * that a row silently missing a value is caught by nothing in the three-check
 * set. These tests are that coverage, so they assert counts and positions rather
 * than mere presence — a row that passes "the title links" can still be three
 * separate links.
 */

import { describe, expect, it } from "vitest";

import {
  renderHome,
  renderPost,
  renderWriting,
} from "../../src/page-renderer/pages.ts";
import { renderDocument } from "../../src/page-renderer/shell.ts";
import { TEST_BUILD_DATE, TEST_SITE, aPost } from "../u1/helpers.ts";

const CONTEXT = { site: TEST_SITE, buildDate: TEST_BUILD_DATE };

const POSTS = [
  aPost({
    slug: "third-post",
    title: "The third post",
    summary: "Newest of the three.",
    date: "2026-05-20",
  }),
  aPost({
    slug: "second-post",
    title: "The second post",
    summary: "The middle one.",
    date: "2026-03-12",
  }),
  aPost({
    slug: "first-post",
    title: "The first post",
    summary: "Oldest of the three.",
    date: "2026-01-15",
  }),
];

/** The `<li class="post-row">` blocks of a rendered list, in document order. */
function postRows(html: string): string[] {
  return [...html.matchAll(/<li class="post-row">([\s\S]*?)<\/li>/g)].map(
    (match) => match[1] ?? "",
  );
}

function anchorCount(html: string): number {
  return [...html.matchAll(/<a\s/g)].length;
}

describe("The Writing list (BR8.5, BR8.6)", () => {
  it("emits one row per post, each carrying title, summary and date", () => {
    const rows = postRows(renderWriting(POSTS).main);

    expect(rows).toHaveLength(POSTS.length);
    for (const [index, post] of POSTS.entries()) {
      const row = rows[index] ?? "";
      expect(row).toContain(post.title);
      expect(row).toContain(post.summary);
      expect(row).toContain(`datetime="${post.date}"`);
    }
  });

  it("lists no post twice and omits none", () => {
    const main = renderWriting(POSTS).main;

    for (const post of POSTS) {
      const occurrences = [
        ...main.matchAll(new RegExp(`/writing/${post.slug}/`, "g")),
      ];
      expect(occurrences).toHaveLength(1);
    }
    expect(postRows(main)).toHaveLength(3);
  });

  it("makes each row exactly one link target covering all three values (BR8.6)", () => {
    for (const row of postRows(renderWriting(POSTS).main)) {
      // Count the anchors. A row split into a linked title beside unlinked
      // metadata fails FR2.3 directly, shrinks the 44px hit area to the title
      // line (NFR7), and turns one tab stop into three.
      expect(anchorCount(row)).toBe(1);

      const anchorBody = /<a\s[^>]*>([\s\S]*?)<\/a>/.exec(row)?.[1] ?? "";
      expect(anchorBody).toContain("post-row-title");
      expect(anchorBody).toContain("post-row-summary");
      expect(anchorBody).toContain("<time");
    }
  });

  it("keeps the heading, the sentence and the route to Projects when nothing is published (W5, FR2.9)", () => {
    const main = renderWriting([]).main;

    expect(main).toContain("<h1>Writing</h1>");
    expect(main).toContain("Nothing published yet.");
    expect(main).toContain('href="/projects/"');
    expect(postRows(main)).toHaveLength(0);
  });
});

describe("The post page (BR8.4, BR8.7)", () => {
  const post = aPost({
    slug: "a-post",
    title: "A post about failing loudly",
    summary: "Why a build should stop rather than drop a post.",
    date: "2026-03-12",
  });
  const page = renderPost(post, "<p>The rendered body.</p>");

  it("carries title, one-line summary, declared date and body (BR8.7)", () => {
    expect(page.main).toContain(post.title);
    expect(page.main).toContain(post.summary);
    expect(page.main).toContain(`datetime="${post.date}"`);
    expect(page.main).toContain("<p>The rendered body.</p>");
  });

  it("emits exactly two All posts links, one before the body and one after it (BR8.4)", () => {
    const backLinks = [
      ...page.main.matchAll(/<p class="back-link">[\s\S]*?<\/p>/g),
    ].map((match) => match[0]);

    expect(backLinks).toHaveLength(2);
    for (const link of backLinks) {
      expect(link).toContain('href="/writing/"');
      expect(link).toContain("All posts");
    }

    // Position, not just count: the second exists because a long post leaves the
    // first far off screen, so asserting two anywhere would miss the point.
    const bodyIndex = page.main.indexOf("<p>The rendered body.</p>");
    expect(page.main.indexOf(backLinks[0]!)).toBeLessThan(bodyIndex);
    expect(page.main.lastIndexOf(backLinks[1]!)).toBeGreaterThan(bodyIndex);
  });
});

describe("Home's recent posts (FR4.3)", () => {
  it("uses the same row markup as the Writing list", () => {
    const home = renderHome(POSTS, [], TEST_SITE.siteName, "An intro.").main;
    const writing = renderWriting(POSTS).main;

    // `postRow` is a named reusable include rather than markup written twice,
    // which is the whole reason it exists (`frontend-components.md` § Hierarchy).
    // Compared with indentation stripped: the two call sites nest differently.
    const strip = (rows: string[]): string[] =>
      rows.map((row) => row.replace(/^\s+/gm, ""));

    expect(strip(postRows(home))).toEqual(strip(postRows(writing)).slice(0, 3));
  });
});

describe("Feed discovery (FR5.1)", () => {
  it("carries the autodiscovery link in every page head", () => {
    const pages = [
      renderWriting(POSTS),
      renderWriting([]),
      renderPost(POSTS[0]!, "<p>Body.</p>"),
      renderHome(POSTS, [], TEST_SITE.siteName, "An intro."),
    ];

    for (const page of pages) {
      const html = renderDocument(page, CONTEXT);
      expect(html).toContain(
        '<link rel="alternate" type="application/atom+xml" title="Rue Asha" href="/feed.xml">',
      );
      // It belongs to the head, where a feed reader looks for it.
      expect(html.indexOf("/feed.xml")).toBeLessThan(html.indexOf("</head>"));
    }
  });
});
