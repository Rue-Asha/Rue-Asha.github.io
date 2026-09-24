/**
 * PageRenderer — BR5.1 to BR5.10.
 *
 * `team.md` § Testing Posture says template markup does not need unit tests.
 * This file exists anyway, because the accessibility and head-metadata rules are
 * properties of rendered markup and there is no other way to check them
 * (`unit-test-instructions.md` § Coverage target).
 */

import { describe, expect, it } from "vitest";

import {
  renderAbout,
  renderHome,
  renderNotFound,
  renderPost,
  renderProject,
  renderProjects,
  renderWriting,
} from "../../src/page-renderer/pages.ts";
import {
  type PageDefinition,
  SITE_LINKS,
  renderDocument,
} from "../../src/page-renderer/shell.ts";
import { TEST_BUILD_DATE, TEST_SITE, aPost, aProject } from "./helpers.ts";

const CONTEXT = { site: TEST_SITE, buildDate: TEST_BUILD_DATE };

function render(page: PageDefinition): string {
  return renderDocument(page, CONTEXT);
}

/** One of every page type, so a rule stated as "every page" can be checked as one. */
function everyPageType(): PageDefinition[] {
  const posts = [aPost()];
  const projects = [aProject()];
  return [
    renderHome(
      posts,
      projects,
      TEST_SITE.siteName,
      TEST_SITE.fallbackDescription,
    ),
    renderWriting(posts),
    renderPost(posts[0]!, "<p>Body.</p>"),
    renderProjects(projects),
    renderProject(projects[0]!, "<p>Body.</p>"),
    renderAbout(TEST_SITE.siteName),
    renderNotFound(),
  ];
}

/**
 * The footer's own markup, sliced out of the page.
 *
 * Asserting against the whole document would pass on the wrong evidence: a
 * project's repository URL begins with the same GitHub profile URL the footer
 * links to, so `toContain` against the full page would be satisfied by a link
 * somewhere else entirely.
 */
function footerOf(html: string): string {
  const start = html.indexOf('<footer class="site-footer"');
  expect(start).toBeGreaterThan(-1);
  return html.slice(start, html.indexOf("</footer>", start));
}

/** Home's intro block, sliced out for the same reason. */
function homeIntroOf(html: string): string {
  const start = html.indexOf('<section class="home-intro"');
  expect(start).toBeGreaterThan(-1);
  return html.slice(start, html.indexOf("</section>", start));
}

describe("PageRenderer — the shell", () => {
  it("carries the shell on every page and marks the current navigation item (BR5.1, BR5.7)", () => {
    for (const page of everyPageType()) {
      const html = render(page);

      expect(html).toContain('<header class="site-header">');
      expect(html).toContain('<nav aria-label="Primary">');
      expect(html).toContain('<footer class="site-footer">');
      // Writing, Projects and About are on every page, so every page type is one
      // click from Home.
      expect(html).toContain('href="/writing/"');
      expect(html).toContain('href="/projects/"');
      expect(html).toContain('href="/about/"');

      const marked = html.match(/aria-current="page"/g) ?? [];
      expect(marked.length).toBe(page.current === null ? 0 : 1);
    }

    expect(render(renderWriting([]))).toContain(
      '<a href="/writing/" aria-current="page">',
    );
  });

  it("puts the skip link first in document order, targeting the main landmark (BR5.2, NFR1)", () => {
    for (const page of everyPageType()) {
      const html = render(page);

      expect(html).toContain(
        '<a class="skip-link" href="#main">Skip to content</a>',
      );
      expect(html).toContain('<main id="main"');

      // "First focusable element" is a statement about document order: nothing
      // focusable may appear before it.
      const skipIndex = html.indexOf('class="skip-link"');
      const firstAnchor = html.indexOf("<a ", html.indexOf("<body"));
      expect(firstAnchor).toBe(html.indexOf('<a class="skip-link"'));
      expect(skipIndex).toBeLessThan(html.indexOf("<header"));
    }
  });

  it("footers every page with the copyright line and both contact links (mockups.md § Global Shell)", () => {
    for (const page of everyPageType()) {
      const footer = footerOf(render(page));

      // The copyright line stays; the links are added beside it, not instead.
      expect(footer).toContain(`© 2026 ${TEST_SITE.siteName}`);

      for (const link of [SITE_LINKS.github, SITE_LINKS.email]) {
        expect(footer).toContain(`href="${link.href}"`);
        expect(footer).toContain(`>${link.label}</a>`);
        // The accessible name says where the link goes rather than repeating a
        // bare label, and contains the visible text verbatim so voice control
        // can still address it by what it reads (WCAG 2.5.3).
        expect(footer).toContain(`aria-label="${link.accessibleName}"`);
        expect(link.accessibleName).toContain(link.label);
      }

      // The off-origin link is the one that needs it; the mailto is not a
      // navigation and gains nothing from it.
      expect(footer).toContain(
        `href="${SITE_LINKS.github.href}" rel="noopener noreferrer"`,
      );
      expect(footer.match(/rel="noopener noreferrer"/g) ?? []).toHaveLength(1);
    }
  });

  it("carries exactly one h1 and proper landmark elements on every page (NFR1)", () => {
    for (const page of everyPageType()) {
      const html = render(page);
      expect(html.match(/<h1[ >]/g) ?? []).toHaveLength(1);
      expect(html).toContain("<main");
      expect(html).toContain("<header");
      expect(html).toContain("<footer");
    }
  });
});

describe("PageRenderer — head metadata", () => {
  it("emits the exact content-security policy on every page, from one value (BR5.10)", () => {
    for (const page of everyPageType()) {
      const html = render(page);
      expect(html).toContain(
        `<meta http-equiv="Content-Security-Policy" content="${TEST_SITE.contentSecurityPolicy}">`,
      );
      // Held once and emitted once; a second copy would be a second thing to drift.
      expect(html.match(/Content-Security-Policy/g)).toHaveLength(1);
    }
  });

  it("gives every page a title and a description, falling back when a template supplies none (BR5.8)", () => {
    for (const page of everyPageType()) {
      const html = render(page);
      expect(html).toMatch(/<title>[^<]+<\/title>/);
      expect(html).toMatch(/<meta name="description" content="[^"]+">/);
    }

    // Home supplies no description of its own, so the fallback is what makes
    // "every page" true by construction.
    const home = render(renderHome([], [], TEST_SITE.siteName, "An intro."));
    expect(home).toContain(`content="${TEST_SITE.fallbackDescription}"`);
    expect(home).toContain(`<title>${TEST_SITE.siteName}</title>`);
  });

  it("uses a post’s own summary as its description and canonical URL (BR5.8, BR5.9)", () => {
    const post = aPost({
      slug: "a-post",
      title: "A post",
      summary: "Its own summary.",
    });
    const html = render(renderPost(post, "<p>Body.</p>"));

    expect(html).toContain(
      '<meta name="description" content="Its own summary.">',
    );
    expect(html).toContain(
      '<meta property="og:description" content="Its own summary.">',
    );
    expect(html).toContain(
      '<meta property="og:title" content="A post · Rue Asha">',
    );
    expect(html).toContain(
      '<link rel="canonical" href="https://rue-asha.github.io/writing/a-post/">',
    );
    expect(html).toContain('<meta name="twitter:card" content="summary">');
  });

  it("emits no preview image anywhere, which is deliberate for this version (BR5.9, FR5.5)", () => {
    for (const page of everyPageType()) {
      const html = render(page);
      expect(html).not.toContain("og:image");
      expect(html).not.toContain("twitter:image");
    }
  });
});

describe("PageRenderer — the page templates", () => {
  it("shows the first three of each ordered list on Home, and does not error on fewer (BR5.3)", () => {
    const posts = ["a", "b", "c", "d"].map((slug, index) =>
      aPost({
        slug,
        title: `Post ${slug}`,
        date: `2026-03-0${String(index + 1)}`,
      }),
    );
    const projects = ["w", "x", "y", "z"].map((slug) =>
      aProject({ slug, name: `Project ${slug}` }),
    );
    const html = render(
      renderHome(posts, projects, TEST_SITE.siteName, "An intro."),
    );

    expect(html).toContain("/writing/a/");
    expect(html).toContain("/writing/c/");
    expect(html).not.toContain("/writing/d/");
    expect(html).toContain("/projects/y/");
    expect(html).not.toContain("/projects/z/");

    // Fewer than three available means fewer are shown; that is not an error.
    expect(
      render(renderHome([posts[0]!], [], TEST_SITE.siteName, "An intro.")),
    ).toContain("/writing/a/");
  });

  it('gives Home’s two sections equal structure and an "All X" affordance each (BR5.4)', () => {
    const html = render(
      renderHome([aPost()], [aProject()], TEST_SITE.siteName, "An intro."),
    );

    expect(html).toContain('<h2 id="home-writing">Writing</h2>');
    expect(html).toContain('<h2 id="home-projects">Projects</h2>');
    expect(html).toContain(">All posts</a>");
    expect(html).toContain(">All projects</a>");
    // Same heading level for both; neither section gets a larger face.
    expect(html.match(/<h2[ >]/g) ?? []).toHaveLength(2);
  });

  it("draws Home’s contact row beneath the intro, from the same pair the footer uses (mockups.md § Home)", () => {
    const page = renderHome(
      [aPost()],
      [aProject()],
      TEST_SITE.siteName,
      "An intro.",
    );
    const html = render(page);
    const intro = homeIntroOf(html);

    // Beneath the intro sentence, inside the intro block — not appended after it.
    expect(intro.indexOf("An intro.")).toBeLessThan(
      intro.indexOf('class="home-contact'),
    );

    for (const link of [SITE_LINKS.github, SITE_LINKS.email]) {
      expect(intro).toContain(`href="${link.href}"`);
      expect(intro).toContain(`aria-label="${link.accessibleName}"`);
      expect(intro).toContain(`>${link.label}</a>`);
    }

    // The two URLs Home emits are the two the footer emits. A second hard-coded
    // copy appearing in either place later fails here rather than drifting
    // unnoticed.
    const footer = footerOf(html);
    for (const link of [SITE_LINKS.github, SITE_LINKS.email]) {
      expect(footer).toContain(`href="${link.href}"`);
    }
    expect(intro).toContain(
      `href="${SITE_LINKS.github.href}" rel="noopener noreferrer"`,
    );
  });

  it("renders an empty section as a sentence and a route out, never a bare heading (BR5.5)", () => {
    const home = render(renderHome([], [], TEST_SITE.siteName, "An intro."));
    expect(home).toContain("Nothing published yet.");
    expect(home).toContain("Nothing here yet.");
    // Home must render legibly with both sections empty — the launch-day case.
    expect(home).toContain('<h2 id="home-writing">Writing</h2>');
    expect(home).toContain('href="/projects/"');

    const writing = render(renderWriting([]));
    expect(writing).toContain("Nothing published yet.");
    expect(writing).toContain('href="/projects/"');

    const projects = render(renderProjects([]));
    expect(projects).toContain("Nothing here yet.");
    expect(projects).toContain('href="/writing/"');
  });

  it("omits the live-URL rail row entirely when a project declares none (BR3.5, FR3.4)", () => {
    const withLive = render(
      renderProject(
        aProject({ liveUrl: "https://example.com/" }),
        "<p>Body.</p>",
      ),
    );
    const withoutLive = render(renderProject(aProject(), "<p>Body.</p>"));

    expect(withLive).toContain("<dt>Live</dt>");
    expect(withoutLive).not.toContain("<dt>Live</dt>");
    // Not an empty row, not a dash — one fewer pair.
    expect(withoutLive).not.toContain("<dd></dd>");
  });

  it('names each repository link for its project rather than a bare "repo" (FR3.6)', () => {
    const html = render(renderProjects([aProject({ name: "A project" })]));
    expect(html).toContain('aria-label="Repository for A project"');
  });

  it('puts an "All posts" link at both the top and the end of a post page (FR2.8)', () => {
    const html = render(renderPost(aPost(), "<p>Body.</p>"));
    expect(html.match(/← All posts/g) ?? []).toHaveLength(2);
  });

  it("serves the 404 page with the shell, one sentence and both routes (BR5.6)", () => {
    const page = renderNotFound();
    const html = render(page);

    // At the site root, which is where the platform looks for it.
    expect(page.outputPath).toBe("404.html");
    expect(html).toContain("<h1>Not found</h1>");
    expect(html).toContain("That page does not exist.");
    expect(html).toContain('href="/writing/"');
    expect(html).toContain('href="/projects/"');
    expect(html).toContain('<header class="site-header">');
  });

  it("marks the 404 sentence as a note while About’s paragraphs stay body prose (mockups.md § 404)", () => {
    const notFound = render(renderNotFound());

    // "sans 17 muted" for this sentence; the class is what lets a stylesheet
    // tell it apart from body prose at all.
    expect(notFound).toContain(
      '<p class="page-note">That page does not exist.</p>',
    );
    expect(notFound).toContain('<p class="page-routes">');

    // About's paragraphs are full-strength body text and stay unclassed — the
    // whole point is that the two are now distinguishable.
    const about = render(renderAbout(TEST_SITE.siteName));
    expect(about).not.toContain("page-note");
    expect(about).toContain("      <p>I build things");

    // Still no illustration and no oversized numeral (BR5.6). Asserted against
    // the page body alone: the canonical URL in the head is `/404.html`, so a
    // whole-document check for "404" would fail on the head and prove nothing.
    const body = renderNotFound().main;
    expect(body).not.toContain("<img");
    expect(body).not.toContain("404");
  });

  it("escapes authored text so a title cannot inject markup", () => {
    const html = render(
      renderPost(aPost({ title: "<script>alert(1)</script>" }), "<p>Body.</p>"),
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
