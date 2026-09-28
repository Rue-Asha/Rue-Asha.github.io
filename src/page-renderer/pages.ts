/**
 * PageRenderer — the seven page templates (BR5.3 to BR5.7).
 *
 * All seven emitted on every build, which is what lets the navigation link to
 * Writing, Projects and About from every page (BR5.7) without an internal link
 * that does not resolve — a blocking check failure (BR6.3).
 *
 * The visual direction is "Control Room": the page is an instrument panel, with
 * bordered panels, a visible grid, monospace for every label and number, and one
 * signal colour. Two consequences of the content-security policy shape what is
 * emitted here, and neither is a style choice:
 *
 *   - **No `style` attribute anywhere.** `style-src 'self'` carries no
 *     `'unsafe-inline'`, so a grid template passed as an inline style would be
 *     dropped by the browser and the table would collapse into one column with
 *     nothing saying so. Column layouts are classes (`.row--post`,
 *     `.row--project`).
 *   - **Nothing runs in the reader's browser.** `script-src 'none'`, so the
 *     contents rail is a plain list of anchors with no active marking, the tag
 *     chips are labels rather than filters, and there is no reading-progress
 *     indicator. Each of those would need a script, and a control that does not
 *     work is worse than one that is not there.
 *
 * About's prose and its contact links are template literals, authored here
 * (BR10.1): `ContentFile.kind` stays at exactly post and project, so no missing
 * or malformed content file can make that page lose its text.
 */

import { escapeHtml } from "../markup-renderer.ts";
import type { BodyHeading } from "../markup-renderer.ts";
import { formatDisplayDate, parseIsoDate } from "../content-transforms.ts";
import type { Post, Project, SiteProfile } from "../types.ts";
import {
  DEFAULT_PROFILE,
  OUTPUT_PATHS,
  type PageDefinition,
  ROUTES,
  SITE_LINKS,
  pad2,
  postOutputPath,
  postPath,
  projectOutputPath,
  projectPath,
} from "./shell.ts";

/**
 * How many of each ordered list Home shows.
 *
 * BR5.3 fixed one figure for both listings and a single `HOME_LIMIT` carried
 * it. The two are now set independently, so a change meant for one listing
 * cannot move the other without anyone noticing: projects stayed at the value
 * the rule approved, and posts were raised on their own.
 */
const HOME_POST_LIMIT = 5;
const HOME_PROJECT_LIMIT = 3;

/** The empty-state sentences BR5.5 fixes. */
const EMPTY_WRITING = "Nothing published yet.";
const EMPTY_PROJECTS = "Nothing here yet.";

/**
 * Words a reader gets through in a minute.
 *
 * A round number, used to turn a word count into a figure a reader can plan
 * around. It is an estimate and is presented beside the word count it was
 * derived from, so nobody has to trust it on its own.
 */
const WORDS_PER_MINUTE = 220;

/** How many words a Markdown body carries, near enough for a reading estimate. */
function countWords(markdown: string): number {
  const trimmed = markdown.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

/** The reading estimate a post page prints, never below one minute. */
function readingMinutes(markdown: string): number {
  return Math.max(1, Math.round(countWords(markdown) / WORDS_PER_MINUTE));
}

/**
 * A section with nothing to list keeps its heading, says so in one sentence and
 * offers a route to the other section, never a bare heading (BR5.5).
 */
function emptyState(sentence: string, href: string, label: string): string {
  return [
    `        <p class="empty-state">${escapeHtml(sentence)}</p>`,
    `        <p class="empty-route"><a class="lnk" href="${href}">${escapeHtml(label)}</a></p>`,
  ].join("\n");
}

/**
 * The eyebrow, title and lead a listing page opens with.
 *
 * `lead` may be empty, and an empty one drops the paragraph rather than drawing
 * an empty element beside the title — the same rule the project rail follows for
 * a missing live URL (BR3.5). The grid collapses to a single column with it, so
 * the title is not left sitting in a half-width track with nothing opposite.
 */
function pageHead(
  eyebrow: string,
  title: string,
  lead: string,
  count: string,
): string {
  const hasLead = lead !== "";
  return [
    '      <section class="phead">',
    '        <div class="shell">',
    '          <div class="phead__bar">',
    `            <span class="lbl">${escapeHtml(eyebrow)}</span>`,
    `            <span class="lbl phead__count">${escapeHtml(count)}</span>`,
    "          </div>",
    `          <div class="phead__grid${hasLead ? "" : " phead__grid--solo"}">`,
    `            <h1 class="phead__title">${escapeHtml(title)}</h1>`,
    ...(hasLead
      ? [`            <p class="phead__lead">${escapeHtml(lead)}</p>`]
      : []),
    "          </div>",
    "        </div>",
    "      </section>",
  ].join("\n");
}

/**
 * A strip of generated figures under a listing's title.
 *
 * Every cell is derived from the content the build just validated — nothing here
 * is a number someone typed, which is the rule the header readout already
 * follows. A cell whose value came out empty is dropped by the caller rather
 * than drawn with a label over a blank.
 *
 * It uses Home's status-readout vocabulary rather than a new one: the schematic
 * grid, the `.lbl` key in the signal colour, the value in mono at full strength.
 * The two readouts on this site are therefore the same component read twice, not
 * two components that happen to look alike.
 */
function readout(cells: readonly (readonly [string, string])[]): string {
  return [
    '      <div class="shell">',
    '        <div class="readout schematic">',
    ...cells.map(([key, value]) =>
      [
        '          <div class="readout__cell">',
        `            <span class="lbl readout__key">${escapeHtml(key)}</span>`,
        `            <span class="readout__val">${escapeHtml(value)}</span>`,
        "          </div>",
      ].join("\n"),
    ),
    "        </div>",
    "      </div>",
  ].join("\n");
}

/** One key/value line in a spec list. The value is already-escaped markup. */
function specItem(key: string, valueHtml: string, indent: string): string {
  return [
    `${indent}<div class="spec__item">`,
    `${indent}  <dt class="spec__key">${escapeHtml(key)}</dt>`,
    `${indent}  <dd class="spec__val">${valueHtml}</dd>`,
    `${indent}</div>`,
  ].join("\n");
}

/** A list of labels as chips. Returns an empty string when there are none. */
function chips(items: readonly string[], indent: string): string {
  if (items.length === 0) return "";
  return [
    `${indent}<ul class="chips">`,
    ...items.map(
      (item) => `${indent}  <li class="chip">${escapeHtml(item)}</li>`,
    ),
    `${indent}</ul>`,
  ].join("\n");
}

/**
 * True when any post in a listing declares a tag.
 *
 * Decided per listing rather than per row, because the tag column is a column:
 * a table where some rows have one and some do not would leave the reading
 * estimate landing in a different place down the page. When no post in the
 * listing is tagged the column is dropped entirely rather than drawn empty —
 * eleven rems of nothing in every row, which is what an untagged site would
 * have looked like from the moment the field was added until the first tag was
 * written.
 */
function anyTagged(posts: readonly Post[]): boolean {
  return posts.some((post) => post.tags.length > 0);
}

/** The row class a Writing listing uses, with or without its tag column. */
function postRowClass(withTags: boolean): string {
  return withTags ? "row--post" : "row--post-plain";
}

/**
 * One Writing row — the whole row is a single link target (FR2.3).
 *
 * The left rail is the publication date, printed in its ISO form rather than
 * the display form the post page uses: a column of fixed-width dates is what
 * makes a listing scannable, and it carries a `datetime` attribute either way.
 */
function postRow(post: Post, withTags: boolean): string {
  const lines = [
    `        <a class="row ${postRowClass(withTags)}" href="${postPath(post.slug)}">`,
    `          <time class="row__id" datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>`,
    '          <span class="row__main">',
  ];

  if (post.kicker !== undefined) {
    lines.push(
      `            <span class="row__kicker">${escapeHtml(post.kicker)}</span>`,
    );
  }

  lines.push(
    `            <span class="row__name">${escapeHtml(post.title)}</span>`,
    `            <span class="row__desc">${escapeHtml(post.summary)}</span>`,
    "          </span>",
  );

  // The cell is kept when the listing has a tag column, because a grid needs
  // its cell even when this particular post has nothing to put in it.
  if (withTags) {
    lines.push(
      '          <span class="row__tags">',
      ...post.tags.map(
        (tag) => `            <span class="chip">${escapeHtml(tag)}</span>`,
      ),
      "          </span>",
    );
  }

  lines.push(
    `          <span class="row__cell">${String(readingMinutes(post.body))} min</span>`,
    '          <span class="row__go" aria-hidden="true">→</span>',
    "        </a>",
  );

  return lines.join("\n");
}

/**
 * One Projects row on Home — the whole row is a single link target.
 *
 * The row carries exactly one target, where the previous design gave it two: the
 * project name and an outbound repository link side by side. Both links are
 * still reachable — the repository moved to the project page's spec rail, one
 * click further in — and the row gained the predictability BR9.2's own
 * reasoning is about: every row on this site now goes exactly one place, so a
 * reader tabbing a listing never has to work out which of two stops they are on.
 */
function projectRow(project: Project, index: number): string {
  return [
    `        <a class="row row--project" href="${projectPath(project.slug)}" data-testid="project-row-name-link">`,
    `          <span class="row__id">${pad2(index + 1)}</span>`,
    '          <span class="row__main">',
    `            <span class="row__name">${escapeHtml(project.name)}</span>`,
    `            <span class="row__desc">${escapeHtml(project.summary)}</span>`,
    "          </span>",
    `          <span class="row__cell">${escapeHtml(project.type)}</span>`,
    `          <span class="row__cell">${escapeHtml(String(project.year))}</span>`,
    '          <span class="row__go" aria-hidden="true">→</span>',
    "        </a>",
  ].join("\n");
}

/** A section rule with a heading, a line, and an "all of them" route. */
function sectionBar(
  headingId: string,
  heading: string,
  href: string,
  label: string,
): string {
  return [
    '        <div class="sect">',
    `          <h2 id="${headingId}">${escapeHtml(heading)}</h2>`,
    '          <span class="sect__line"></span>',
    `          <a class="lbl sect__more" href="${href}">${escapeHtml(label)} <span aria-hidden="true">→</span></a>`,
    "        </div>",
  ].join("\n");
}

/**
 * Home — the identity panel and its status readout, then two structurally equal
 * listings (BR5.3, BR5.4).
 *
 * Both listings use the same heading level, the same section rule, the same
 * table treatment and the same "all of them" affordance. Neither gets a larger
 * heading, an image, or a treatment the other lacks: unequal treatment would
 * state that one half of the site matters more, which contradicts the
 * initiative's premise that both halves carry equal weight.
 *
 * Projects is emitted first. Sequence is not treatment — one of the two has to
 * be first on a page that reads top to bottom — and the hero's two routes out
 * are in the same order, so the page names one order rather than two.
 *
 * The one figure in the status readout is derived from the build — the counts
 * come from the catalogs. The three remaining lines are editorial copy from
 * `site.config.ts`, and the address comes from `SITE_LINKS`. Nothing in the
 * readout is a hard-coded number that could go stale without anyone noticing.
 */
export function renderHome(
  posts: readonly Post[],
  projects: readonly Project[],
  siteName: string,
  intro: string,
  profile: SiteProfile = DEFAULT_PROFILE,
): PageDefinition {
  const recentPosts = posts.slice(0, HOME_POST_LIMIT);
  const topProjects = projects.slice(0, HOME_PROJECT_LIMIT);

  // Decided from the rows Home actually shows rather than from every post on
  // the site: the column belongs to this table, and a column of empty cells
  // because a post past the cap is tagged is the fault it exists to avoid.
  const homeTagged = anyTagged(recentPosts);

  // Five rows, down from seven. "Focus" said in different words what "Now"
  // already says, and "Stack" listed every tool across every project as one
  // run-on line that grew with the content and told a reader nothing the
  // project pages do not say better beside the project they belong to.
  //
  // A row whose value is empty is still dropped rather than drawn with nothing
  // after it: the three editorial lines come from `site.config.ts`, and one
  // cleared there should take its row with it rather than leave a label over a
  // blank (the rule BR3.5 states for the project rail).
  const statusRows: (readonly [string, string])[] = [
    ["Role", profile.role],
    ["Based", profile.location],
    ["Now", profile.now],
    [
      "Shipped",
      `${String(projects.length)} projects, ${String(posts.length)} posts`,
    ],
    ["Contact", SITE_LINKS.email.label],
  ];
  const status = statusRows.filter(([, value]) => value !== "");

  const hero = [
    '      <section class="hero">',
    '        <div class="shell">',
    '          <div class="hero__grid schematic ticks">',
    '            <div class="hero__id">',
    '              <p class="lbl">Profile</p>',
    `              <h1 class="hero__name">${escapeHtml(siteName)}</h1>`,
    '              <p class="hero__role">',
    '                <span class="dot dot--sig dot--live" aria-hidden="true"></span>',
    `                ${escapeHtml(profile.role)} — ${escapeHtml(profile.location)}`,
    "              </p>",
    `              <p class="hero__lead">${escapeHtml(intro)}</p>`,
    // The two routes out of Home lead to the two halves of the site, and the
    // site's whole premise is that neither outranks the other — the same claim
    // the two listings below make by sharing a heading level and a table
    // treatment. A primary button beside a ghost one stated the opposite, so
    // both now carry the identical treatment and the identical glyph, and the
    // stylesheet gives them one row of two equal columns rather than two
    // left-aligned items of whatever width their labels happen to need.
    '              <div class="hero__cta">',
    // Projects first, following the order of the two sections directly below.
    // Equal weight is a claim about treatment rather than about sequence, and
    // something has to be first; offering one order here and the opposite one a
    // screen further down would leave the page stating two.
    `                <a class="btn" href="${ROUTES.projects}">Projects <span aria-hidden="true">→</span></a>`,
    `                <a class="btn" href="${ROUTES.writing}">Writing <span aria-hidden="true">→</span></a>`,
    "              </div>",
    "            </div>",
    '            <div class="hero__status">',
    '              <p class="lbl">Status</p>',
    '              <dl class="spec hero__spec">',
    ...status.map(([key, value]) =>
      specItem(key, escapeHtml(value), "                "),
    ),
    "              </dl>",
    "            </div>",
    "          </div>",
    "        </div>",
    "      </section>",
  ].join("\n");

  const projectsSection = [
    '      <section class="band" aria-labelledby="home-projects">',
    '        <div class="shell">',
    sectionBar(
      "home-projects",
      "Selected work",
      ROUTES.projects,
      `All ${pad2(projects.length)}`,
    ),
    topProjects.length === 0
      ? emptyState(EMPTY_PROJECTS, ROUTES.writing, "Read the writing instead")
      : [
          '        <div class="tbl">',
          '          <div class="tbl__head row--project">',
          '            <span class="lbl">#</span>',
          '            <span class="lbl">Unit</span>',
          '            <span class="lbl">Type</span>',
          '            <span class="lbl">Year</span>',
          "            <span></span>",
          "          </div>",
          ...topProjects.map(projectRow),
          "        </div>",
        ].join("\n"),
    "        </div>",
    "      </section>",
  ].join("\n");

  const writingSection = [
    '      <section class="band" aria-labelledby="home-writing">',
    '        <div class="shell">',
    sectionBar(
      "home-writing",
      "Recent writing",
      ROUTES.writing,
      `All ${pad2(posts.length)}`,
    ),
    recentPosts.length === 0
      ? emptyState(EMPTY_WRITING, ROUTES.projects, "See the projects instead")
      : [
          '        <div class="tbl">',
          `          <div class="tbl__head ${postRowClass(homeTagged)}">`,
          '            <span class="lbl">Date</span>',
          '            <span class="lbl">Entry</span>',
          ...(homeTagged ? ['            <span class="lbl">Tags</span>'] : []),
          '            <span class="lbl">Read</span>',
          "            <span></span>",
          "          </div>",
          ...recentPosts.map((post) => postRow(post, homeTagged)),
          "        </div>",
        ].join("\n"),
    "        </div>",
    "      </section>",
  ].join("\n");

  return {
    outputPath: OUTPUT_PATHS.home,
    title: "",
    // Home now has a navigation item of its own, so it marks itself current
    // like every other page. The 404 still marks nothing: it is not one of the
    // four routes, and marking one would tell a reader they are somewhere they
    // are not.
    current: "home",
    register: "technical",
    main: [hero, projectsSection, writingSection].join("\n"),
  };
}

/**
 * Writing — every published post, newest first, grouped by year (FR2.1, BR5.5).
 *
 * The grouping is a reading aid rather than a second ordering: posts arrive
 * already sorted newest-first (BR2.4) and are split at each year boundary
 * without being re-sorted, so the sequence down the page is exactly the sequence
 * the catalog produced.
 *
 * Each year is a section with its own `h2`, so the page can be navigated by
 * heading. That heading is the year itself — a screen-reader user moving through
 * headings gets "2026, 2025", which is what the visual rule says.
 */
export function renderWriting(posts: readonly Post[]): PageDefinition {
  // One decision for the whole listing, not one per year group: the year bars
  // are section rules over a single table, and a column that came and went
  // between them would read as two tables.
  const withTags = anyTagged(posts);

  const years: { year: number; entries: Post[] }[] = [];
  for (const post of posts) {
    const year = parseIsoDate(post.date)?.year;
    if (year === undefined) continue;
    const current = years.at(-1);
    if (current?.year === year) current.entries.push(post);
    else years.push({ year, entries: [post] });
  }

  const log = years
    .map((group) =>
      [
        `        <section class="year" aria-labelledby="year-${String(group.year)}">`,
        '          <div class="year__bar">',
        `            <h2 class="year__num" id="year-${String(group.year)}">${String(group.year)}</h2>`,
        '            <span class="year__line"></span>',
        `            <span class="lbl">${pad2(group.entries.length)} entries</span>`,
        "          </div>",
        '          <div class="tbl">',
        ...group.entries.map((post) => postRow(post, withTags)),
        "          </div>",
        "        </section>",
      ].join("\n"),
    )
    .join("\n");

  // The three figures under the title, all derived from the posts this build
  // validated. The span reads off the year groups rather than off the raw dates,
  // so a post whose date did not parse cannot widen it — the grouping above
  // already dropped that post, and a span it still counted would disagree with
  // the sections underneath it.
  const spanNewest = years[0]?.year;
  const spanOldest = years.at(-1)?.year;
  const span =
    spanNewest === undefined || spanOldest === undefined
      ? ""
      : spanNewest === spanOldest
        ? String(spanNewest)
        : `${String(spanOldest)}–${String(spanNewest)}`;
  const newest = posts[0];
  const totalMinutes = posts.reduce(
    (sum, post) => sum + readingMinutes(post.body),
    0,
  );

  const readoutCells: (readonly [string, string])[] = [
    ["Span", span],
    ["Latest", newest === undefined ? "" : formatDisplayDate(newest.date)],
    [
      "Reading",
      posts.length === 0 ? "" : `${String(totalMinutes)} min end to end`,
    ],
  ];
  const cells = readoutCells.filter(([, value]) => value !== "");

  return {
    outputPath: OUTPUT_PATHS.writing,
    title: "Writing",
    description:
      "Posts about what I am currently learning or find interesting.",
    current: "writing",
    register: "technical",
    main: [
      // No lead sentence. The page head is the eyebrow, the title and the count,
      // and the readout below carries what a sentence there was doing badly —
      // how much there is, over what period, and how long it would take.
      pageHead("Log / Entries", "Writing", "", `${pad2(posts.length)} total`),
      // Dropped entirely on an empty site rather than drawn as three zeros: a
      // readout with nothing behind it is the decoration this design has none of.
      ...(cells.length === 0 ? [] : [readout(cells)]),
      '      <div class="shell">',
      posts.length === 0
        ? emptyState(EMPTY_WRITING, ROUTES.projects, "See the projects instead")
        : ['        <div class="log">', log, "        </div>"].join("\n"),
      "      </div>",
    ].join("\n"),
  };
}

/**
 * Projects — every project, ordered featured-first (FR3.1, BR5.5).
 *
 * A card grid rather than a table, because a project row carries more than a
 * post row does — a summary, a type, a year and its tool list — and five columns
 * of that on one line is a specification sheet rather than something to browse.
 *
 * Each card's name is an `h2`, one level under the page's `h1`, so the page is
 * navigable by heading and skips no level.
 */
export function renderProjects(projects: readonly Project[]): PageDefinition {
  const cards = projects
    .map((project, index) =>
      [
        '          <li class="unit panel ticks">',
        `            <a class="unit__link" href="${projectPath(project.slug)}" data-testid="project-row-name-link">`,
        '              <div class="unit__head">',
        `                <span class="lbl unit__idx">${pad2(index + 1)}</span>`,
        `                <span class="lbl">${escapeHtml(project.type)}</span>`,
        `                <span class="lbl unit__year">${escapeHtml(String(project.year))}</span>`,
        "              </div>",
        '              <div class="unit__body">',
        `                <h2 class="unit__name">${escapeHtml(project.name)}</h2>`,
        `                <p class="unit__summary">${escapeHtml(project.summary)}</p>`,
        "              </div>",
        '              <div class="unit__foot">',
        '                <ul class="chips">',
        ...project.tools.map(
          (tool) =>
            `                  <li class="chip">${escapeHtml(tool)}</li>`,
        ),
        "                </ul>",
        '                <span class="unit__go" aria-hidden="true">→</span>',
        "              </div>",
        "            </a>",
        "          </li>",
      ].join("\n"),
    )
    .join("\n");

  return {
    outputPath: OUTPUT_PATHS.projects,
    title: "Projects",
    description: "Things I have built, with a write-up for each.",
    current: "projects",
    register: "technical",
    main: [
      pageHead(
        "Index / Units",
        "Projects",
        "Things that got far enough to show, each with a write-up of what it is and what building it taught me.",
        `${pad2(projects.length)} total`,
      ),
      '      <div class="shell">',
      projects.length === 0
        ? emptyState(EMPTY_PROJECTS, ROUTES.writing, "Read the writing instead")
        : ['        <ul class="units">', cards, "        </ul>"].join("\n"),
      "      </div>",
    ].join("\n"),
  };
}

/** The two posts either side of the one being rendered, in the listing's order. */
export interface PostNeighbours {
  /** The next post up the listing — published later. */
  readonly newer?: Post;
  /** The next post down the listing — published earlier. */
  readonly older?: Post;
}

/**
 * Post — title, summary, a metadata panel, the body, and the posts either side
 * of it (FR2.4, FR2.8).
 *
 * The description is the post's own summary, so a shared link shows that post
 * rather than the site (BR5.8, BR5.9).
 *
 * The contents rail appears only when the body has more than one second-level
 * heading: a rail listing one section is a list of the page you are already on.
 * It is a plain list of anchors — nothing marks which section you are in,
 * because that would need a script and the policy runs none.
 */
export function renderPost(
  post: Post,
  bodyHtml: string,
  headings: readonly BodyHeading[] = [],
  neighbours: PostNeighbours = {},
): PageDefinition {
  const words = countWords(post.body);
  const minutes = readingMinutes(post.body);

  const metaCells = [
    [
      '          <div class="meta__cell">',
      '            <span class="lbl">Date</span>',
      `            <time class="meta__val" datetime="${escapeHtml(post.date)}">${escapeHtml(formatDisplayDate(post.date, "long"))}</time>`,
      "          </div>",
    ].join("\n"),
    [
      '          <div class="meta__cell">',
      '            <span class="lbl">Read</span>',
      `            <span class="meta__val">${String(minutes)} min · ${String(words)} words</span>`,
      "          </div>",
    ].join("\n"),
  ];

  if (post.tags.length > 0) {
    metaCells.push(
      [
        '          <div class="meta__cell">',
        '            <span class="lbl">Tags</span>',
        chips(post.tags, "            "),
        "          </div>",
      ].join("\n"),
    );
  }

  const header = [
    '        <header class="post__head">',
    ...(post.kicker === undefined
      ? []
      : [
          `          <p class="lbl post__kicker sig">${escapeHtml(post.kicker)}</p>`,
        ]),
    `          <h1 class="post__title">${escapeHtml(post.title)}</h1>`,
    `          <p class="post__summary">${escapeHtml(post.summary)}</p>`,
    '          <div class="meta panel">',
    ...metaCells,
    "          </div>",
    "        </header>",
  ].join("\n");

  const contents =
    headings.length > 1
      ? [
          '          <aside class="toc" aria-label="Contents">',
          '            <div class="toc__panel panel">',
          '              <div class="panel__head">',
          '                <span class="lbl">Contents</span>',
          `                <span class="lbl panel__head-end">${pad2(headings.length)}</span>`,
          "              </div>",
          '              <ol class="toc__list">',
          ...headings.map((heading, index) =>
            [
              "                <li>",
              `                  <a class="toc__link" href="#${escapeHtml(heading.id)}">`,
              `                    <span class="toc__num">${pad2(index + 1)}</span>`,
              `                    <span>${heading.html}</span>`,
              "                  </a>",
              "                </li>",
            ].join("\n"),
          ),
          "              </ol>",
          "            </div>",
          "          </aside>",
        ].join("\n")
      : "";

  const nextLinks: string[] = [];
  if (neighbours.older) {
    nextLinks.push(
      [
        `          <a class="nextnav__link panel" href="${postPath(neighbours.older.slug)}">`,
        '            <span class="lbl"><span aria-hidden="true">←</span> Older</span>',
        `            <span class="nextnav__name">${escapeHtml(neighbours.older.title)}</span>`,
        "          </a>",
      ].join("\n"),
    );
  }
  if (neighbours.newer) {
    nextLinks.push(
      [
        `          <a class="nextnav__link nextnav__link--end panel" href="${postPath(neighbours.newer.slug)}">`,
        '            <span class="lbl">Newer <span aria-hidden="true">→</span></span>',
        `            <span class="nextnav__name">${escapeHtml(neighbours.newer.title)}</span>`,
        "          </a>",
      ].join("\n"),
    );
  }

  return {
    outputPath: postOutputPath(post.slug),
    title: post.title,
    description: post.summary,
    current: "writing",
    register: "editorial",
    main: [
      '      <article class="shell post">',
      `        <a class="lbl back" href="${ROUTES.writing}"><span aria-hidden="true">←</span> All posts</a>`,
      header,
      '        <div class="post__body">',
      '          <div class="prose">',
      bodyHtml.trimEnd(),
      "          </div>",
      ...(contents === "" ? [] : [contents]),
      "        </div>",
      ...(nextLinks.length === 0
        ? []
        : [
            '        <nav class="nextnav" aria-label="More posts">',
            ...nextLinks,
            "        </nav>",
          ]),
      // The second route back to the listing, at the end of the read (FR2.8).
      // The neighbour rail above it is a different offer — the next thing to
      // read rather than the way out — so it does not replace this.
      '        <p class="back-end">',
      `          <a class="lbl back" href="${ROUTES.writing}"><span aria-hidden="true">←</span> All posts</a>`,
      "        </p>",
      "      </article>",
    ].join("\n"),
  };
}

/**
 * Project — the write-up with its specification rail beside it (FR3.2).
 *
 * A project with no live URL omits that rail row entirely — no empty label, no
 * dash (BR3.5, FR3.4). Rendering an empty row would show the reader a label with
 * nothing after it.
 *
 * The rail's tools are chips rather than one comma-joined value: a screen reader
 * announces a welded-in `·` as a glyph or a pause where the rail means a list.
 */
export function renderProject(
  project: Project,
  bodyHtml: string,
  index = 0,
  next?: Project,
): PageDefinition {
  const links = [
    [
      "                    <li>",
      `                      <a class="lnk" href="${escapeHtml(project.repo)}" rel="noopener noreferrer" aria-label="Repository for ${escapeHtml(project.name)}" data-testid="project-rail-repo-link">Source <span aria-hidden="true">↗</span></a>`,
      "                    </li>",
    ].join("\n"),
  ];

  if (project.liveUrl !== undefined) {
    links.push(
      [
        "                    <li>",
        `                      <a class="lnk" href="${escapeHtml(project.liveUrl)}" rel="noopener noreferrer" aria-label="Live site for ${escapeHtml(project.name)}" data-testid="project-rail-live-link">Live <span aria-hidden="true">↗</span></a>`,
        "                    </li>",
      ].join("\n"),
    );
  }

  const rail = [
    '              <dl class="spec">',
    specItem("Year", escapeHtml(String(project.year)), "                "),
    specItem("Type", escapeHtml(project.type), "                "),
    specItem(
      "Tools",
      chips(project.tools, "                  "),
      "                ",
    ),
    specItem(
      "Links",
      ['<ul class="side__links">', ...links, "                  </ul>"].join(
        "\n",
      ),
      "                ",
    ),
    "              </dl>",
  ].join("\n");

  return {
    outputPath: projectOutputPath(project.slug),
    title: project.name,
    description: project.summary,
    current: "projects",
    register: "editorial",
    main: [
      '      <article class="shell project">',
      `        <a class="lbl back" href="${ROUTES.projects}"><span aria-hidden="true">←</span> All projects</a>`,
      '        <header class="project__head panel ticks">',
      '          <div class="panel__head">',
      `            <span class="lbl sig">Unit ${pad2(index + 1)}</span>`,
      `            <span class="lbl">${escapeHtml(project.type)}</span>`,
      `            <span class="lbl panel__head-end">${escapeHtml(String(project.year))}</span>`,
      "          </div>",
      '          <div class="project__head-body">',
      `            <h1 class="project__name">${escapeHtml(project.name)}</h1>`,
      `            <p class="project__summary">${escapeHtml(project.summary)}</p>`,
      "          </div>",
      "        </header>",
      '        <div class="project__body">',
      // The rail precedes the body in document order (BR9.5), even though the
      // grid draws it to the right of the prose on a wide screen. Keeping it
      // first is what lets the narrow layout put the specification above the
      // write-up — the summary before the detail — without the stylesheet
      // reordering anything, which is the one thing a stylesheet can do that
      // breaks tab order.
      '          <aside class="side">',
      '            <div class="panel side__panel">',
      '              <div class="panel__head"><span class="lbl">Spec</span></div>',
      '              <div class="side__inner">',
      rail,
      "              </div>",
      "            </div>",
      "          </aside>",
      '          <div class="prose">',
      bodyHtml.trimEnd(),
      "          </div>",
      "        </div>",
      ...(next === undefined
        ? []
        : [
            '        <nav class="nextnav" aria-label="More projects">',
            `          <a class="nextnav__link panel" href="${projectPath(next.slug)}">`,
            '            <span class="lbl">Next unit</span>',
            `            <span class="nextnav__name">${escapeHtml(next.name)} <span aria-hidden="true">→</span></span>`,
            "          </a>",
            "        </nav>",
          ]),
      '        <p class="back-end">',
      `          <a class="lbl back" href="${ROUTES.projects}"><span aria-hidden="true">←</span> All projects</a>`,
      "        </p>",
      "      </article>",
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
 * formatter rewrites its line breaks.
 */
const ABOUT_PROSE: readonly string[] = [
  "I build things and write about what I am currently learning or find interesting.",
  "Most of what I make is small, self-contained and built to be understood. This site is a folder of Markdown turned into a folder of HTML by a few hundred lines of TypeScript, with no database, no server, and nothing running while you read it. I would rather write a build than configure one: a build I wrote fails loudly, and a build I configured fails quietly.",
  "Writing here is a record of what I was working out at the time rather than finished advice. Projects are the things that got far enough to show.",
];

/**
 * About — the prose beside a readout of where else to find the author (FR4.1,
 * BR10.1, BR10.2, BR10.3).
 *
 * Emitted on every build, unconditionally, and never empty: BR10.3 requires
 * prose identifying the author *and* at least one contact link, and says
 * outright that a heading with nothing beneath it does not satisfy it. Nothing
 * else in this repository would notice this page disappearing — check 2 matches
 * output pages against content files, and About has no content file by design —
 * so its integration test is the whole of the automated verification behind that
 * rule.
 *
 * Each contact link's visible text names where it goes — "Rue Asha on GitHub",
 * the address itself for email — rather than a bare "here" or "profile"
 * (BR10.2). The two links read *different fields* of `SITE_LINKS`, and the
 * asymmetry is deliberate: for GitHub the destination-naming string is
 * `accessibleName`, because `label` is the bare word "GitHub"; for email the
 * destination *is* the address, which is `label`.
 *
 * No icon set, no embedded profile widget, and no script-obscured address: an
 * off-origin fetch is broken outright by the content-security policy (BR5.10),
 * and `script-src 'none'` means obfuscation would not run anyway.
 */
export function renderAbout(
  siteName: string,
  profile: SiteProfile = DEFAULT_PROFILE,
): PageDefinition {
  return {
    outputPath: OUTPUT_PATHS.about,
    title: "About",
    description: `Who ${siteName} is, and where else to find them.`,
    current: "about",
    register: "technical",
    main: [
      pageHead(
        "Operator / About",
        "About",
        `${profile.role} in ${profile.location}. I build small systems and write down what they taught me.`,
        profile.location,
      ),
      '      <div class="shell">',
      '        <div class="about schematic">',
      '          <div class="about__text">',
      '            <div class="prose">',
      ...ABOUT_PROSE.map(
        (paragraph) => `              <p>${escapeHtml(paragraph)}</p>`,
      ),
      "            </div>",
      "          </div>",
      '          <div class="about__side">',
      '            <h2 class="about__side-title">Elsewhere</h2>',
      '            <dl class="spec">',
      specItem("Role", escapeHtml(profile.role), "              "),
      specItem("Based", escapeHtml(profile.location), "              "),
      specItem(
        "Code",
        `<a class="lnk" href="${escapeHtml(SITE_LINKS.github.href)}" rel="noopener noreferrer">${escapeHtml(SITE_LINKS.github.accessibleName)}</a>`,
        "              ",
      ),
      specItem(
        "Email",
        `<a class="lnk" href="${escapeHtml(SITE_LINKS.email.href)}">${escapeHtml(SITE_LINKS.email.label)}</a>`,
        "              ",
      ),
      "            </dl>",
      "          </div>",
      "        </div>",
      "      </div>",
    ].join("\n"),
  };
}

/**
 * 404 — the shell, a plain sentence, and routes back into the site (BR5.6).
 *
 * GitHub Pages serves `/404.html` for any path that matches no page, which is
 * what makes this the site's own 404 rather than the platform's default.
 *
 * The oversized numeral the previous version refused is here deliberately: this
 * design has a display register — the hero name, the page titles — so the code
 * set in it is the page speaking the site's own vocabulary rather than a
 * decoration invented for one page. It is `aria-hidden` on nothing: the heading
 * reads "404", which is what the page is.
 */
export function renderNotFound(): PageDefinition {
  const routes: readonly (readonly [string, string])[] = [
    [ROUTES.home, "Home"],
    [ROUTES.writing, "Writing"],
    [ROUTES.projects, "Projects"],
    [ROUTES.about, "About"],
  ];

  return {
    outputPath: OUTPUT_PATHS.notFound,
    title: "Not found",
    description: "That page does not exist.",
    current: null,
    register: "technical",
    main: [
      '      <div class="shell">',
      '        <section class="nf panel ticks">',
      '          <div class="panel__head">',
      '            <span class="dot" aria-hidden="true"></span>',
      '            <span class="lbl">Error</span>',
      '            <span class="lbl panel__head-end sig">404</span>',
      "          </div>",
      '          <div class="nf__body">',
      '            <h1 class="nf__code">404</h1>',
      '            <p class="nf__msg">No route</p>',
      '            <p class="page-note">That page does not exist. It either moved or never existed — both happen on a site that gets rewritten as often as this one.</p>',
      '            <ul class="page-routes">',
      ...routes.map(
        ([href, label]) =>
          `              <li><a class="btn btn--ghost" href="${href}">${escapeHtml(label)}</a></li>`,
      ),
      "            </ul>",
      "          </div>",
      "        </section>",
      "      </div>",
    ].join("\n"),
  };
}
