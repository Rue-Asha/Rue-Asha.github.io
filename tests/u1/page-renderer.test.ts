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
  DEFAULT_PROFILE,
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
  const start = html.indexOf('<footer class="foot"');
  expect(start).toBeGreaterThan(-1);
  return html.slice(start, html.indexOf("</footer>", start));
}

/** Home's status readout, sliced out for the same reason. */
function homeStatusOf(html: string): string {
  const start = html.indexOf('<div class="hero__status"');
  expect(start).toBeGreaterThan(-1);
  return html.slice(start, html.indexOf("</dl>", start));
}

describe("PageRenderer — the shell", () => {
  it("carries the shell on every page and marks the current navigation item (BR5.1, BR5.7)", () => {
    for (const page of everyPageType()) {
      const html = render(page);

      expect(html).toContain('<header class="head">');
      expect(html).toContain('<nav class="nav" aria-label="Primary">');
      expect(html).toContain('<footer class="foot">');
      // Writing, Projects and About are on every page, so every page type is one
      // click from Home.
      expect(html).toContain('href="/writing/"');
      expect(html).toContain('href="/projects/"');
      expect(html).toContain('href="/about/"');

      const marked = html.match(/aria-current="page"/g) ?? [];
      expect(marked.length).toBe(page.current === null ? 0 : 1);
    }

    expect(render(renderWriting([]))).toContain(
      '<a class="nav__link" href="/writing/" aria-current="page">',
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

  it("keeps the footer to one line, and adds nothing back to it", () => {
    // The footer was three schematic cells — Contact, Elsewhere, Colophon —
    // over a base line. It is one line now, and this test is the record of what
    // that line is allowed to contain: a footer is the region of a site where
    // anything can be added without an argument, so the absences below are
    // asserted rather than left to be noticed.
    for (const page of everyPageType()) {
      const footer = footerOf(render(page));

      expect(footer).toContain('<p class="foot__base">');
      expect(footer).toContain(`© 2026 ${TEST_SITE.siteName}`);
      expect(footer).toContain(`>${DEFAULT_PROFILE.location}<`);

      // Each contact link exactly once. The address appeared twice in the cell
      // design — its own Contact cell and again under Elsewhere — which is the
      // duplication the line was meant to end.
      for (const link of [SITE_LINKS.github, SITE_LINKS.email]) {
        expect(
          footer.match(new RegExp(`href="${link.href}"`, "g")) ?? [],
        ).toHaveLength(1);
      }

      // The cells and their contents, gone rather than hidden.
      for (const removed of [
        "foot__grid",
        "foot__cell",
        "foot__mail",
        "foot__links",
        "foot__note",
        "Colophon",
        "Elsewhere",
        "end of document",
        "dot",
      ]) {
        expect(footer, `${removed} is still in the footer`).not.toContain(
          removed,
        );
      }

      // Nothing new in their place. A feed link, a licence pair and a second
      // navigation list were each considered and refused; a list element in
      // this region is the shape all three would arrive in.
      expect(footer).not.toContain("<ul");
      expect(footer).not.toContain("<nav");
      expect(footer).not.toContain("feed.xml");
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
  it("shows the first five posts and the first three projects on Home, and does not error on fewer (BR5.3)", () => {
    // BR5.3 fixed one figure for both listings and this test asserted it as
    // one. The two are now set independently — five posts, three projects —
    // and the projects half is the one that kept the approved figure.
    //
    // Six posts and four projects, so each listing has something past its own
    // cap to leave out: a fixture sized at the cap would pass against a
    // template that capped nothing.
    const posts = ["a", "b", "c", "d", "e", "f"].map((slug, index) =>
      aPost({
        slug,
        title: `Post ${slug}`,
        date: `2026-03-0${String(6 - index)}`,
      }),
    );
    const projects = ["w", "x", "y", "z"].map((slug) =>
      aProject({ slug, name: `Project ${slug}` }),
    );
    const html = render(
      renderHome(posts, projects, TEST_SITE.siteName, "An intro."),
    );

    expect(html).toContain("/writing/a/");
    expect(html).toContain("/writing/e/");
    expect(html).not.toContain("/writing/f/");
    expect(html).toContain("/projects/y/");
    expect(html).not.toContain("/projects/z/");

    // The cap governs the rows and nothing else. Each heading's route out still
    // counts the whole catalog, and the listing pages still carry every entry —
    // both would be easy to break by reaching for the already-sliced list.
    expect(html).toContain('href="/writing/">All 06 ');
    expect(html).toContain('href="/projects/">All 04 ');
    expect(render(renderWriting(posts))).toContain("/writing/f/");
    expect(render(renderProjects(projects))).toContain("/projects/z/");

    // Fewer than the cap available means fewer are shown; that is not an error.
    expect(
      render(renderHome([posts[0]!], [], TEST_SITE.siteName, "An intro.")),
    ).toContain("/writing/a/");
  });

  it('gives Home’s two sections equal structure and an "All X" affordance each (BR5.4)', () => {
    const html = render(
      renderHome([aPost()], [aProject()], TEST_SITE.siteName, "An intro."),
    );

    expect(html).toContain('<h2 id="home-writing">Recent writing</h2>');
    expect(html).toContain('<h2 id="home-projects">Selected work</h2>');
    // The same affordance on both, carrying each section's own count.
    expect(html.match(/class="lbl sect__more"/g) ?? []).toHaveLength(2);
    expect(html).toContain('href="/writing/">All 01 ');
    expect(html).toContain('href="/projects/">All 01 ');
    // Same heading level for both; neither section gets a larger face.
    expect(html.match(/<h2[ >]/g) ?? []).toHaveLength(2);

    // Projects leads. Equal treatment is what the assertions above are about,
    // and sequence is a separate question — one of the two has to be first on
    // a page that reads downward, and the hero's two routes out are in this
    // same order, so the page names one order rather than two.
    expect(html.indexOf('id="home-projects"')).toBeLessThan(
      html.indexOf('id="home-writing"'),
    );
  });

  it("prints the contact address in Home’s status readout, from the pair the footer uses", () => {
    const page = renderHome(
      [aPost()],
      [aProject()],
      TEST_SITE.siteName,
      "An intro.",
    );
    const html = render(page);
    const status = homeStatusOf(html);

    // The readout carries the address itself rather than a link. Home's one
    // outbound contact row from an earlier design is gone: the pair appearing
    // twice on the same page made one of the two copies read as an
    // afterthought, and the footer's line is where a reader looks for it.
    expect(status).toContain(`<dd class="spec__val">${SITE_LINKS.email.label}`);

    // The URLs still have exactly one home. A second hard-coded copy appearing
    // anywhere later fails here rather than drifting unnoticed.
    const footer = footerOf(html);
    for (const link of [SITE_LINKS.github, SITE_LINKS.email]) {
      expect(footer).toContain(`href="${link.href}"`);
    }
    expect(footer).toContain(
      `href="${SITE_LINKS.github.href}" rel="noopener noreferrer"`,
    );
  });

  it("prints exactly five status rows on Home, in one order", () => {
    // The row set is the readout's content rather than its styling, so it is
    // asserted here. It was seven: "Focus" said in different words what "Now"
    // already says, and "Stack" printed every tool across every project as one
    // line that grew with the content. Both are gone, and the `focus` field
    // behind the first went with it rather than staying as configuration
    // nothing reads.
    const html = render(
      renderHome([aPost()], [aProject()], TEST_SITE.siteName, "An intro."),
    );
    const status = homeStatusOf(html);

    const keys = [
      ...status.matchAll(/<dt class="spec__key">([^<]*)<\/dt>/g),
    ].map((match) => match[1]);
    expect(keys).toEqual(["Role", "Based", "Now", "Shipped", "Contact"]);

    // The derived row still reports what the build found, which is why it is
    // the one row here that no one can type.
    expect(status).toContain("1 projects, 1 posts");
  });

  it("gives Home’s two routes out the identical treatment", () => {
    // The two halves of the site carry equal weight — the premise the two
    // listings below the hero state by sharing a heading level and a table
    // treatment. A primary button beside a ghost one said the opposite, so
    // Projects lost `.btn--ghost` and gained the same arrow Writing carries.
    const html = render(
      renderHome([aPost()], [aProject()], TEST_SITE.siteName, "An intro."),
    );
    const start = html.indexOf('<div class="hero__cta">');
    expect(start).toBeGreaterThan(-1);
    const cta = html.slice(start, html.indexOf("</div>", start));

    expect(cta).toContain(
      '<a class="btn" href="/writing/">Writing <span aria-hidden="true">→</span></a>',
    );
    expect(cta).toContain(
      '<a class="btn" href="/projects/">Projects <span aria-hidden="true">→</span></a>',
    );
    // Projects first, matching the order of the two sections below the hero.
    // Identical treatment does not decide which comes first, so the order is
    // asserted rather than left to whichever way the array happened to read.
    expect(cta.indexOf('href="/projects/"')).toBeLessThan(
      cta.indexOf('href="/writing/"'),
    );
    // Neither is set apart: no modifier class, and the glyph is decorative on
    // both, so a screen reader reads two link names rather than one of them
    // with an arrow welded on.
    expect(cta).not.toContain("btn--");
    expect(cta.match(/aria-hidden="true"/g) ?? []).toHaveLength(2);

    // `.btn--ghost` itself stays: the 404 page's route list still uses it, and
    // only Home stopped.
    expect(render(renderNotFound())).toContain("btn btn--ghost");
  });

  it("renders an empty section as a sentence and a route out, never a bare heading (BR5.5)", () => {
    const home = render(renderHome([], [], TEST_SITE.siteName, "An intro."));
    expect(home).toContain("Nothing published yet.");
    expect(home).toContain("Nothing here yet.");
    // Home must render legibly with both sections empty — the launch-day case.
    expect(home).toContain('<h2 id="home-writing">Recent writing</h2>');
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

    expect(withLive).toContain('data-testid="project-rail-live-link"');
    expect(withoutLive).not.toContain('data-testid="project-rail-live-link"');
    // Not an empty entry, not a dash — one fewer item in the Links list.
    expect(withoutLive).not.toContain("<li>\n</li>");
    expect(withoutLive).not.toContain('<dd class="spec__val"></dd>');
  });

  it('names each repository link for its project rather than a bare "repo" (FR3.6)', () => {
    // The repository link lives in the project page's spec rail. The listing
    // rows deliberately carry one target each — see `projectRow` in pages.ts.
    const html = render(
      renderProject(aProject({ name: "A project" }), "<p>Body.</p>"),
    );
    expect(html).toContain('aria-label="Repository for A project"');
  });

  it('puts an "All posts" link at both the top and the end of a post page (FR2.8)', () => {
    const html = render(renderPost(aPost(), "<p>Body.</p>"));
    expect(html.match(/All posts/g) ?? []).toHaveLength(2);
  });

  it("serves the 404 page with the shell, one sentence and both routes (BR5.6)", () => {
    const page = renderNotFound();
    const html = render(page);

    // At the site root, which is where the platform looks for it.
    expect(page.outputPath).toBe("404.html");
    expect(html).toContain('<h1 class="nf__code">404</h1>');
    expect(html).toContain("That page does not exist.");
    expect(html).toContain('href="/writing/"');
    expect(html).toContain('href="/projects/"');
    expect(html).toContain('<header class="head">');
  });

  it("marks the 404 sentence as a note while About’s paragraphs stay body prose", () => {
    const notFound = render(renderNotFound());

    // The class is what lets the stylesheet tell this sentence apart from body
    // prose at all.
    expect(notFound).toContain(
      '<p class="page-note">That page does not exist.',
    );
    expect(notFound).toContain('<ul class="page-routes">');

    // About's paragraphs are full-strength body text and stay unclassed — the
    // whole point is that the two are distinguishable. Asserted as "the prose
    // block contains unclassed paragraphs" rather than against the opening
    // words, which is what the earlier form pinned: the sentence is editorial
    // copy the author edits (U4CA1), and rewriting it broke a test about CSS
    // classes. The lead is a classed paragraph by design and sits outside the
    // prose block, so it is not what this matches.
    const about = render(renderAbout(TEST_SITE.siteName));
    expect(about).not.toContain("page-note");
    const aboutProse = /<div class="prose">([\s\S]*?)<\/div>/.exec(about)?.[1];
    expect(aboutProse).toBeDefined();
    expect([...(aboutProse ?? "").matchAll(/<p>/g)].length).toBeGreaterThan(1);

    // Still no illustration. The oversized numeral BR5.6 ruled out IS now
    // drawn, and the reversal is deliberate rather than an oversight: that rule
    // was written against a design with no display register at all, where a
    // large numeral would have been the one decorative gesture on the site.
    // This direction sets the hero name and every page title in the same
    // display mono, so the code is the page speaking the site's own vocabulary.
    const body = renderNotFound().main;
    expect(body).not.toContain("<img");
    expect(body).toContain('<h1 class="nf__code">404</h1>');
  });

  it("escapes authored text so a title cannot inject markup", () => {
    const html = render(
      renderPost(aPost({ title: "<script>alert(1)</script>" }), "<p>Body.</p>"),
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

/**
 * The parts of the "Control Room" shell and the reading pages that carry
 * generated data rather than fixed copy.
 *
 * Every figure in the header readout comes from the build that wrote the page.
 * A readout that could go stale without anyone noticing would be decoration
 * dressed up as instrumentation, and these are what keep it honest.
 */
describe("PageRenderer — the readout and the reading-page rails", () => {
  it("prints the build's own counts and date in the header strip", () => {
    const html = renderDocument(renderNotFound(), {
      site: TEST_SITE,
      buildDate: "2026-09-28",
      postCount: 7,
      projectCount: 12,
    });

    // Two digits, so the columns do not jump between 9 and 10.
    expect(html).toContain('<span class="strip__cell lbl">posts 07</span>');
    expect(html).toContain('<span class="strip__cell lbl">projects 12</span>');
    expect(html).toContain("build 2026-09-28");
  });

  it("says zero rather than dropping a column when a build supplies no counts", () => {
    const html = render(renderNotFound());

    expect(html).toContain("posts 00");
    expect(html).toContain("projects 00");
  });

  it("draws a contents rail only when a body has more than one section", () => {
    const one = render(
      renderPost(aPost(), "<p>Body.</p>", [{ id: "a", html: "A" }]),
    );
    const two = render(
      renderPost(aPost(), "<p>Body.</p>", [
        { id: "a", html: "A" },
        { id: "b", html: "B" },
      ]),
    );

    // A rail listing one section is a list of the page you are already on.
    expect(one).not.toContain('<aside class="toc"');
    expect(two).toContain('<aside class="toc"');
    expect(two).toContain('href="#a"');
    expect(two).toContain('href="#b"');
  });

  it("offers each neighbour only when there is one, and never links to itself", () => {
    const post = aPost({ slug: "middle", title: "Middle" });
    const older = aPost({ slug: "older", title: "Older one" });
    const newer = aPost({ slug: "newer", title: "Newer one" });

    const both = render(renderPost(post, "<p>Body.</p>", [], { older, newer }));
    expect(both).toContain('href="/writing/older/"');
    expect(both).toContain('href="/writing/newer/"');

    // The newest post has nothing newer: the panel is omitted rather than
    // rendered empty or pointed back at the page the reader is on.
    const newest = render(renderPost(post, "<p>Body.</p>", [], { older }));
    expect(newest).toContain('href="/writing/older/"');
    expect(newest).not.toContain("Newer");

    // A lone post gets no rail at all.
    const alone = render(renderPost(post, "<p>Body.</p>"));
    expect(alone).not.toContain('class="nextnav"');
    expect(alone).not.toContain('href="/writing/middle/"');
  });

  it("shows a post's tags and kicker when it declares them, and nothing when it does not", () => {
    const tagged = render(
      renderPost(
        aPost({ tags: ["realtime", "infra"], kicker: "Field notes" }),
        "<p>Body.</p>",
      ),
    );

    expect(tagged).toContain('<li class="chip">realtime</li>');
    expect(tagged).toContain('<li class="chip">infra</li>');
    expect(tagged).toContain("Field notes");

    // Absent means the cell and the line are omitted, never drawn empty — the
    // rule `Project.liveUrl` already follows (BR3.5).
    const plain = render(renderPost(aPost(), "<p>Body.</p>"));
    expect(plain).not.toContain('class="chip"');
    expect(plain).not.toContain("post__kicker");
  });

  it("prints a reading estimate beside the word count it came from", () => {
    const short = render(renderPost(aPost({ body: "One two three." }), "<p>."));
    // Never below one minute: a rounded zero would read as an error.
    expect(short).toContain("1 min · 3 words");

    const long = render(
      renderPost(aPost({ body: "word ".repeat(440).trim() }), "<p>."),
    );
    expect(long).toContain("2 min · 440 words");
  });

  it("groups the Writing listing by year without reordering it", () => {
    const posts = [
      aPost({ slug: "c", title: "C", date: "2026-05-01" }),
      aPost({ slug: "b", title: "B", date: "2026-01-09" }),
      aPost({ slug: "a", title: "A", date: "2025-11-30" }),
    ];
    const html = render(renderWriting(posts));

    expect(html).toContain('<h2 class="year__num" id="year-2026">2026</h2>');
    expect(html).toContain('<h2 class="year__num" id="year-2025">2025</h2>');
    expect(html).toContain("02 entries");
    expect(html).toContain("01 entries");

    // The grouping is a reading aid, not a second ordering: the sequence down
    // the page is the one the catalog produced (BR2.4).
    const order = [...html.matchAll(/href="\/writing\/([a-z])\//g)].map(
      (match) => match[1],
    );
    expect(order).toEqual(["c", "b", "a"]);
  });
});

describe("PageRenderer — the Writing listing's tag column", () => {
  const untagged = [
    aPost({ slug: "a", title: "A", date: "2026-03-02" }),
    aPost({ slug: "b", title: "B", date: "2026-03-01" }),
  ];
  const tagged = [
    aPost({ slug: "a", title: "A", date: "2026-03-02", tags: ["infra"] }),
    aPost({ slug: "b", title: "B", date: "2026-03-01" }),
  ];

  it("drops the column entirely when no entry in the listing is tagged", () => {
    const html = render(renderWriting(untagged));

    expect(html).toContain('class="row row--post-plain"');
    expect(html).not.toContain("row__tags");
  });

  it("keeps the column for every row once any entry is tagged", () => {
    const html = render(renderWriting(tagged));

    // Both rows carry the cell, including the one with nothing in it: a grid
    // needs its cell, and a column that came and went down the page would move
    // the reading estimate from row to row.
    expect(html.match(/class="row row--post"/g) ?? []).toHaveLength(2);
    expect(html.match(/class="row__tags"/g) ?? []).toHaveLength(2);
    expect(html).toContain('<span class="chip">infra</span>');
  });

  it("decides Home's column from the rows Home shows, not from the whole site", () => {
    // The sixth post is the only tagged one and Home shows five, so Home's
    // table has no tag column while the Writing page's does.
    //
    // The fixture grew with Home's post cap, from four posts to six. The whole
    // point is that the tagged post sits *beyond* what Home shows; at four
    // posts and a cap of five it would be on Home, and the test would assert
    // nothing.
    const posts = [
      aPost({ slug: "a", date: "2026-03-06" }),
      aPost({ slug: "b", date: "2026-03-05" }),
      aPost({ slug: "c", date: "2026-03-04" }),
      aPost({ slug: "d", date: "2026-03-03" }),
      aPost({ slug: "e", date: "2026-03-02" }),
      aPost({ slug: "f", date: "2026-03-01", tags: ["infra"] }),
    ];

    const home = render(renderHome(posts, [], TEST_SITE.siteName, "An intro."));
    expect(home).toContain('class="row row--post-plain"');
    expect(home).not.toContain("row__tags");

    expect(render(renderWriting(posts))).toContain('class="row row--post"');
  });
});

describe("PageRenderer — the Home item in the navigation", () => {
  it("offers Home as its own navigation link, first, on every page", () => {
    for (const page of everyPageType()) {
      const nav =
        /<nav class="nav"[\s\S]*?<\/nav>/.exec(render(page))?.[0] ?? "";

      expect(nav).toContain(">Home</a>");
      // First, so the four routes read in the order a reader would guess.
      expect(nav.indexOf(">Home</a>")).toBeLessThan(
        nav.indexOf(">Writing</a>"),
      );
    }
  });

  it("marks Home current on Home and nowhere else", () => {
    const home = render(renderHome([], [], TEST_SITE.siteName, "An intro."));
    expect(home).toContain(
      '<a class="nav__link" href="/" aria-current="page">Home</a>',
    );

    // Every other page leaves it unmarked, and the 404 marks nothing at all:
    // it is not one of the four routes, and marking one would tell a reader
    // they are somewhere they are not.
    expect(render(renderWriting([]))).toContain(
      '<a class="nav__link" href="/">Home</a>',
    );
    expect(render(renderNotFound()).match(/aria-current/g) ?? []).toHaveLength(
      0,
    );
  });

  it("keeps the wordmark pointing at the same one definition of home", () => {
    const html = render(renderAbout(TEST_SITE.siteName));

    // Two ways to reach it, one `href`. A second literal would be a second
    // thing to keep in step.
    expect(html.match(/href="\/"/g) ?? []).toHaveLength(2);
    expect(html).toContain('<a class="mark" href="/"');
  });
});
