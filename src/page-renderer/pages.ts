/**
 * PageRenderer — the seven page templates (BR5.3 to BR5.7).
 *
 * All seven at skeleton depth, which is [Q4]'s answer: BR5.7 puts Writing,
 * Projects and About in the navigation on every page, and BR6.3 makes an
 * internal link that does not resolve a blocking check failure — so the skeleton
 * either emits those pages or does not link to them. About's prose and its two
 * contact links are template literals, authored by U4 (BR10.1).
 *
 * Structure only. The visual treatment is U5's
 * (`refined-mockups/mockups.md` is the layout source for what is emitted here).
 */

import { escapeHtml } from "../markup-renderer.ts";
import { formatDisplayDate } from "../content-transforms.ts";
import type { Post, Project } from "../types.ts";
import {
  OUTPUT_PATHS,
  type PageDefinition,
  ROUTES,
  SITE_LINKS,
  postOutputPath,
  postPath,
  projectOutputPath,
  projectPath,
  renderContactLinks,
} from "./shell.ts";

/** How many of each ordered list Home shows (BR5.3). */
const HOME_LIMIT = 3;

/** The empty-state sentences BR5.5 fixes. */
const EMPTY_WRITING = "Nothing published yet.";
const EMPTY_PROJECTS = "Nothing here yet.";

/**
 * A section with nothing to list keeps its heading and shows one sentence and a
 * route to the other section, never a bare heading (BR5.5).
 */
function emptyState(sentence: string, href: string, label: string): string {
  return [
    `        <p class="empty-state">${escapeHtml(sentence)}</p>`,
    `        <p><a href="${href}">${escapeHtml(label)}</a></p>`,
  ].join("\n");
}

/** One Writing list row. The whole row is a single link target (FR2.3). */
function postRow(post: Post): string {
  return [
    `        <li class="post-row">`,
    `          <a href="${postPath(post.slug)}">`,
    `            <span class="post-row-title">${escapeHtml(post.title)}</span>`,
    `            <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDisplayDate(post.date))}</time>`,
    `            <span class="post-row-summary">${escapeHtml(post.summary)}</span>`,
    `          </a>`,
    `        </li>`,
  ].join("\n");
}

/**
 * The heading level a `ProjectRow` emits its project name at.
 *
 * The row is one reusable include used at two depths — directly under the
 * Projects page's `h1`, and under Home's `h2` section heading — so the level is
 * a prop rather than a constant. Hard-coding it made the Projects page emit
 * `h1` then `h3`, a level skip that tells a screen-reader user navigating by
 * heading that a section is missing. Nothing in this repository would have
 * caught it: heading order is one of the things the declined automated
 * accessibility scan covered (`team.md` § Testing Posture).
 */
type RowHeadingLevel = 2 | 3;

/**
 * One Projects list row.
 *
 * Two link targets, and they must not be confusable (FR3.5, BR9.2). The
 * repository link carries an accessible name identifying its project rather than
 * a bare "repo", because a screen-reader user navigating by link list otherwise
 * gets a column of identical entries (FR3.6).
 *
 * The summary and the tools list are deliberately not links: a third target in
 * one row leaves a reader unable to predict where each stop goes (BR9.2).
 */
function projectRow(project: Project, headingLevel: RowHeadingLevel): string {
  const heading = `h${String(headingLevel)}`;
  return [
    `        <li class="project-row">`,
    `          <${heading}><a href="${projectPath(project.slug)}" data-testid="project-row-name-link">${escapeHtml(project.name)}</a></${heading}>`,
    `          <p class="project-row-summary">${escapeHtml(project.summary)}</p>`,
    `          <p class="project-row-tools">${project.tools.map((tool) => escapeHtml(tool)).join(" · ")}</p>`,
    `          <p class="project-row-repo"><a href="${escapeHtml(project.repo)}" rel="noopener noreferrer" aria-label="Repository for ${escapeHtml(project.name)}" data-testid="project-row-repo-link">repo ↗</a></p>`,
    `        </li>`,
  ].join("\n");
}

/**
 * Home — the intro, then two structurally equal sections (BR5.3, BR5.4).
 *
 * Both sections use the same heading level, the same rule treatment, and each
 * carries an "All X" affordance. Neither gets a larger heading, an image, or a
 * treatment the other lacks: unequal treatment would state that one half of the
 * site matters more, which contradicts the initiative's premise that both halves
 * carry equal weight.
 */
export function renderHome(
  posts: readonly Post[],
  projects: readonly Project[],
  siteName: string,
  intro: string,
): PageDefinition {
  const recentPosts = posts.slice(0, HOME_LIMIT);
  const topProjects = projects.slice(0, HOME_LIMIT);

  const writingSection = [
    '      <section class="home-section" aria-labelledby="home-writing">',
    '        <h2 id="home-writing">Writing</h2>',
    `        <p class="section-all"><a href="${ROUTES.writing}">All posts</a></p>`,
    recentPosts.length === 0
      ? emptyState(EMPTY_WRITING, ROUTES.projects, "See the projects instead")
      : [
          '        <ul class="post-list">',
          ...recentPosts.map(postRow),
          "        </ul>",
        ].join("\n"),
    "      </section>",
  ].join("\n");

  const projectsSection = [
    '      <section class="home-section" aria-labelledby="home-projects">',
    '        <h2 id="home-projects">Projects</h2>',
    `        <p class="section-all"><a href="${ROUTES.projects}">All projects</a></p>`,
    topProjects.length === 0
      ? emptyState(EMPTY_PROJECTS, ROUTES.writing, "Read the writing instead")
      : [
          '        <ul class="project-list">',
          // `h3` here: this section's own heading is the `h2` above, so the row
          // sits one level beneath it rather than skipping one.
          ...topProjects.map((project) => projectRow(project, 3)),
          "        </ul>",
        ].join("\n"),
    "      </section>",
  ].join("\n");

  return {
    outputPath: OUTPUT_PATHS.home,
    title: "",
    current: null,
    register: "technical",
    main: [
      '      <section class="home-intro">',
      `        <h1>${escapeHtml(siteName)}</h1>`,
      `        <p>${escapeHtml(intro)}</p>`,
      // The contact row the mockups draw directly beneath the intro sentence
      // (`mockups.md` § Home). The same two links the footer carries, from the
      // same constant: re-typing them here would give the pair a third home.
      '        <p class="home-contact contact-link">',
      renderContactLinks("          "),
      "        </p>",
      "      </section>",
      writingSection,
      projectsSection,
    ].join("\n"),
  };
}

/** Writing — every published post, newest first (FR2.1, BR5.5). */
export function renderWriting(posts: readonly Post[]): PageDefinition {
  return {
    outputPath: OUTPUT_PATHS.writing,
    title: "Writing",
    description:
      "Posts about what I am currently learning or find interesting.",
    current: "writing",
    register: "technical",
    main: [
      "      <h1>Writing</h1>",
      posts.length === 0
        ? emptyState(EMPTY_WRITING, ROUTES.projects, "See the projects instead")
        : [
            '      <ul class="post-list">',
            ...posts.map(postRow),
            "      </ul>",
          ].join("\n"),
    ].join("\n"),
  };
}

/**
 * Post — title, one-line summary, date and body, with an "All posts" link at
 * both the top and the end (FR2.4, FR2.8).
 *
 * The description is the post's own summary, so a shared link shows that post
 * rather than the site (BR5.8, BR5.9).
 */
export function renderPost(post: Post, bodyHtml: string): PageDefinition {
  return {
    outputPath: postOutputPath(post.slug),
    title: post.title,
    description: post.summary,
    current: "writing",
    register: "editorial",
    main: [
      `      <p class="back-link"><a href="${ROUTES.writing}">← All posts</a></p>`,
      "      <article>",
      "        <header>",
      `          <h1>${escapeHtml(post.title)}</h1>`,
      `          <p class="dek">${escapeHtml(post.summary)}</p>`,
      `          <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDisplayDate(post.date, "long"))}</time>`,
      "        </header>",
      '        <div class="prose">',
      bodyHtml.trimEnd(),
      "        </div>",
      "      </article>",
      `      <p class="back-link"><a href="${ROUTES.writing}">← All posts</a></p>`,
    ].join("\n"),
  };
}

/** Projects — every project, ordered featured-first (FR3.1, BR5.5). */
export function renderProjects(projects: readonly Project[]): PageDefinition {
  return {
    outputPath: OUTPUT_PATHS.projects,
    title: "Projects",
    description: "Things I have built, with a write-up for each.",
    current: "projects",
    register: "technical",
    main: [
      "      <h1>Projects</h1>",
      projects.length === 0
        ? emptyState(EMPTY_PROJECTS, ROUTES.writing, "Read the writing instead")
        : [
            '      <ul class="project-list">',
            // `h2` here: this page's own heading is the `h1` above it, and the
            // rows are its only structural level. Emitting `h3` — as the shared
            // include did before this unit — skipped a level on this page alone.
            // The mockups draw no intermediate section heading, so the fix is
            // the row's level rather than an invented `h2` above the list
            // (`refined-mockups/mockups.md` § Projects).
            ...projects.map((project) => projectRow(project, 2)),
            "      </ul>",
          ].join("\n"),
    ].join("\n"),
  };
}

/**
 * Project — the metadata rail beside the write-up (FR3.2).
 *
 * A project with no live URL omits that rail row entirely — no empty label, no
 * dash (BR3.5, FR3.4). Rendering an empty row would show the reader a label with
 * nothing after it.
 */
export function renderProject(
  project: Project,
  bodyHtml: string,
): PageDefinition {
  const railRows = [
    "          <dt>Year</dt>",
    `          <dd>${escapeHtml(String(project.year))}</dd>`,
    "          <dt>Type</dt>",
    `          <dd>${escapeHtml(project.type)}</dd>`,
    "          <dt>Tools</dt>",
    // One `<dd>` per tool, in declared order, under the single `Tools` label.
    // `mockups.md` § Project draws the rail's tools stacked one per line, and a
    // `<dl>` takes several `<dd>` under one `<dt>` — a stylesheet cannot split a
    // single `<dd>` into lines, so this is markup rather than a treatment U5
    // could apply. It also removes a literal `·` welded into a value: a screen
    // reader announces that glyph, or a pause, where the rail means a list.
    // The Projects *list* row keeps its inline middle-dot form deliberately
    // (`mockups.md` § Projects) — a scannable summary line, not a reference
    // table.
    ...project.tools.map((tool) => `          <dd>${escapeHtml(tool)}</dd>`),
    "          <dt>Repo</dt>",
    `          <dd><a href="${escapeHtml(project.repo)}" rel="noopener noreferrer" aria-label="Repository for ${escapeHtml(project.name)}" data-testid="project-rail-repo-link">github ↗</a></dd>`,
  ];

  if (project.liveUrl !== undefined) {
    railRows.push(
      "          <dt>Live</dt>",
      `          <dd><a href="${escapeHtml(project.liveUrl)}" rel="noopener noreferrer" aria-label="Live site for ${escapeHtml(project.name)}" data-testid="project-rail-live-link">site ↗</a></dd>`,
    );
  }

  return {
    outputPath: projectOutputPath(project.slug),
    title: project.name,
    description: project.summary,
    current: "projects",
    register: "editorial",
    main: [
      `      <p class="back-link"><a href="${ROUTES.projects}">← All projects</a></p>`,
      '      <article class="project">',
      '        <dl class="project-rail">',
      ...railRows,
      "        </dl>",
      '        <div class="project-body">',
      "          <header>",
      `            <h1>${escapeHtml(project.name)}</h1>`,
      `            <p class="dek">${escapeHtml(project.summary)}</p>`,
      "          </header>",
      '          <div class="prose">',
      bodyHtml.trimEnd(),
      "          </div>",
      "        </div>",
      "      </article>",
      `      <p class="back-link"><a href="${ROUTES.projects}">← All projects</a></p>`,
    ].join("\n"),
  };
}

/**
 * The About page's prose, one entry per paragraph (BR10.1, BR10.3).
 *
 * Held here in the template rather than in a content file, which is BR10.1's
 * whole point: `ContentFile.kind` stays at exactly post and project, and no
 * missing or malformed content file can make this page lose its prose. The
 * accepted cost is that editing it is a code change on a branch, and the
 * formatter rewrites its line breaks (U4A1, U4A2).
 */
const ABOUT_PROSE: readonly string[] = [
  "I build things and write about what I am currently learning or find interesting.",
  "Most of what I make is small, self-contained and built to be understood. This site is a folder of Markdown turned into a folder of HTML by a few hundred lines of TypeScript, with no database, no server, and nothing running while you read it. I would rather write a build than configure one: a build I wrote fails loudly, and a build I configured fails quietly.",
  "Writing here is a record of what I was working out at the time rather than finished advice. Projects are the things that got far enough to show.",
];

/**
 * About — its own page at `/about`, carrying the prose and the contact links
 * (FR4.1, BR10.1, BR10.2, BR10.3).
 *
 * Emitted on every build, unconditionally, and never empty: BR10.3 requires
 * prose identifying the author *and* at least one contact link, and says
 * outright that a heading with nothing beneath it does not satisfy it. Nothing
 * else in this repository would notice this page disappearing — check 2 of the
 * pre-push set matches output pages against content files, and About has no
 * content file by design — so `tests/u4/integration.test.ts` is the whole of
 * the automated verification behind that rule.
 *
 * Each contact link is a plain outbound anchor whose visible text is its own
 * accessible name and names where it goes — "Rue Asha on GitHub", the address
 * itself for email — rather than a bare "here" or "profile" (BR10.2, U4CA3).
 * No icon set, no embedded profile widget, and no script-obscured address: an
 * off-origin fetch is broken outright by the content-security policy (BR5.10),
 * and `script-src 'none'` means obfuscation would not run anyway (U4CA2).
 *
 * The two links are separate block-level elements rather than a side-by-side
 * row, so each clears the 44px phone touch minimum on its own (NFR6, NFR7,
 * U4CA4). There is no branch anywhere in this function; the three paragraphs
 * and both anchors' visible text are literals.
 *
 * Neither the destinations nor those two strings live here. Both come from
 * `SITE_LINKS` in `shell.ts`, which the footer on every page and Home's intro
 * row already use, so the site holds each URL and each of those strings exactly
 * once.
 *
 * The two links read *different fields* of that constant, and the asymmetry is
 * deliberate rather than an oversight. BR10.2 requires this page's visible text
 * to name its own destination, and for GitHub the string that names the
 * destination is `accessibleName` ("Rue Asha on GitHub") — `label` is "GitHub",
 * tuned for the footer's micro-type row and too bare for this page. For email
 * the destination *is* the address, so `label` ("rue.asha@proton.me") is both
 * the destination-naming string and what U4CA2 and BR10.2 fix as the visible
 * text; its `accessibleName` ("Email Rue Asha at …") is the right announcement
 * for a footer anchor but the wrong thing to print in this paragraph.
 *
 * `siteName` feeds only the head description, never the prose, a link, or a
 * branch — `frontend-components.md` § Props and branches gives `AboutPage` no
 * props, and this parameter is the documented deviation (U4CA5). Dropping it
 * would hard-code the site's name into a template and give it a second home
 * that can drift from `site.config.ts`.
 */
export function renderAbout(siteName: string): PageDefinition {
  return {
    outputPath: OUTPUT_PATHS.about,
    title: "About",
    description: `Who ${siteName} is, and where else to find them.`,
    current: "about",
    register: "technical",
    main: [
      "      <h1>About</h1>",
      ...ABOUT_PROSE.map(
        (paragraph) => `      <p>${escapeHtml(paragraph)}</p>`,
      ),
      "      <h2>Elsewhere</h2>",
      // Different fields on purpose: for GitHub the destination-naming string is
      // `accessibleName`, for email it is `label` (the address itself). See the
      // doc comment above — an undocumented asymmetry here is a trap.
      `      <p class="contact-link"><a href="${escapeHtml(SITE_LINKS.github.href)}" rel="noopener noreferrer">${escapeHtml(SITE_LINKS.github.accessibleName)}</a></p>`,
      `      <p class="contact-link"><a href="${escapeHtml(SITE_LINKS.email.href)}">${escapeHtml(SITE_LINKS.email.label)}</a></p>`,
    ].join("\n"),
  };
}

/**
 * 404 — the shell, a plain sentence, and links to Writing and Projects (BR5.6).
 *
 * No illustration and no oversized numeral: the site has no decorative
 * vocabulary and inventing one here would be the only place it appears. GitHub
 * Pages serves `/404.html` for any path that matches no page, which is what
 * makes this the site's own 404 rather than the platform's default.
 *
 * The sentence and the route line each carry a class. `mockups.md` § 404 draws
 * the sentence at "sans 17 muted" while About's paragraphs are full-strength
 * body text, and both were previously a bare `main > p` — indistinguishable to a
 * stylesheet, so U5 could not render the difference the design asked for and
 * both sat at `--text`. The classes are hooks, not a treatment: the values
 * behind them are U5's.
 */
export function renderNotFound(): PageDefinition {
  return {
    outputPath: OUTPUT_PATHS.notFound,
    title: "Not found",
    description: "That page does not exist.",
    current: null,
    register: "technical",
    main: [
      "      <h1>Not found</h1>",
      '      <p class="page-note">That page does not exist.</p>',
      `      <p class="page-routes"><a href="${ROUTES.writing}">Writing</a> · <a href="${ROUTES.projects}">Projects</a></p>`,
    ].join("\n"),
  };
}
