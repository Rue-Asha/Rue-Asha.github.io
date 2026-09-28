/**
 * PageRenderer — the global shell, the head metadata, and the one
 * content-security-policy fragment (BR5.1, BR5.2, BR5.8 to BR5.10).
 *
 * Everything a page needs that is not its own body lives here, because "every
 * page carries X" is only true by construction when exactly one place emits X.
 *
 * The shell the "Control Room" direction draws has two bands rather than one: a
 * thin readout strip carrying the site's real counts and the real build date,
 * and the navigation bar beneath it. The readout is generated data, never
 * decoration — every figure in it comes from the build that wrote the page.
 */

import { escapeHtml } from "../markup-renderer.ts";
import {
  FEED_OUTPUT_PATH,
  parseIsoDate,
  toAbsoluteUrl,
  toSitePath,
} from "../content-transforms.ts";
import type { SiteMetadata, SiteProfile } from "../types.ts";

/** The site paths the navigation links to. Every page type is one click from Home (BR5.7). */
export const ROUTES = {
  home: "/",
  writing: "/writing/",
  projects: "/projects/",
  about: "/about/",
} as const;

/** Output-relative paths of the pages that have no content file behind them. */
export const OUTPUT_PATHS = {
  home: "index.html",
  writing: "writing/index.html",
  projects: "projects/index.html",
  about: "about/index.html",
  notFound: "404.html",
} as const;

/** The site path of a post page. The slug is the URL and never changes (NFR8). */
export function postPath(slug: string): string {
  return `/writing/${slug}/`;
}

/** The site path of a project page. */
export function projectPath(slug: string): string {
  return `/projects/${slug}/`;
}

/** Output-relative path of a post page. */
export function postOutputPath(slug: string): string {
  return `writing/${slug}/index.html`;
}

/** Output-relative path of a project page. */
export function projectOutputPath(slug: string): string {
  return `projects/${slug}/index.html`;
}

/**
 * The site paths of the static assets U5 adds (BR11.3, BR11.4).
 *
 * All root-relative paths on this site's own origin, because that is what
 * `default-src 'self'` allows and what keeps a reader's browser from talking to
 * anyone else's server while they read. They are exported so the build and the
 * tests name the same strings the head does: a page linking a stylesheet the
 * build never wrote would leave every page unstyled in production while every
 * unit test still passed.
 *
 * Six faces are served; two are preloaded. Preloading all six would fetch
 * weights most pages never use before the page they are on has finished
 * loading. A preload is a hint about a file this page already needs, not a
 * performance target — nothing here sets a byte ceiling or a timing budget,
 * which NFR5 forbids introducing.
 */
export const STYLESHEET_PATH = "/assets/styles/site.css";

/** The faces the head preloads: body text first, then the interface mono. */
export const FONT_PRELOAD_PATHS: readonly string[] = [
  "/assets/fonts/ibm-plex-sans-latin-400-normal.woff2",
  "/assets/fonts/ibm-plex-mono-latin-500-normal.woff2",
];

/** The first preloaded face. Kept as its own name because the head, the build and the tests all reference it. */
export const FONT_PATH = FONT_PRELOAD_PATHS[0] ?? "";

/** One outbound contact link: where it goes, what it reads, what it is announced as. */
export interface SiteLink {
  readonly href: string;
  /** The visible text. Names the destination rather than reading "here" or "profile". */
  readonly label: string;
  /**
   * The accessible name. Contains the visible label verbatim, because an
   * accessible name that drops the visible text breaks WCAG 2.5.3 for anyone
   * driving the page by voice.
   */
  readonly accessibleName: string;
  /** Off-origin, and therefore carrying `rel="noopener noreferrer"`. */
  readonly external: boolean;
}

/**
 * The two contact links, held once.
 *
 * The footer draws them on every page, Home's status readout prints the address
 * again, and About lists both, so without one home for the pair the same two
 * URLs would have several copies and nothing would notice when one of them
 * rotted. They are a module constant rather than a `SiteMetadata` field
 * deliberately: `entities.md` § Additions fixes that entity's purpose as the
 * values every page's *head* needs, and a visible footer link is not head
 * metadata.
 */
export const SITE_LINKS = {
  github: {
    href: "https://github.com/Rue-Asha",
    label: "GitHub",
    accessibleName: "Rue Asha on GitHub",
    external: true,
  },
  email: {
    href: "mailto:rue.asha@proton.me",
    label: "rue.asha@proton.me",
    accessibleName: "Email Rue Asha at rue.asha@proton.me",
    external: false,
  },
} as const satisfies Record<string, SiteLink>;

/** The order the footer draws them in. */
const CONTACT_LINK_ORDER: readonly SiteLink[] = [
  SITE_LINKS.github,
  SITE_LINKS.email,
];

/**
 * The profile values used when a build supplies none.
 *
 * Editorial copy belongs in `site.config.ts`, which is where the real values
 * live; this exists so a build that predates the field — every fixture build in
 * the test suite — still renders a complete shell rather than a readout with
 * holes in it.
 */
export const DEFAULT_PROFILE: SiteProfile = {
  role: "Sysadmin / DevOps",
  location: "Germany",
  now: "Writing the generator this site is built by",
};

/** Which navigation item is the current page, if any (BR5.1). */
export type NavKey = "home" | "writing" | "projects" | "about" | null;

interface NavItem {
  readonly key: Exclude<NavKey, null>;
  readonly href: string;
  readonly label: string;
}

/**
 * The navigation, Home first.
 *
 * Home is reachable twice from the bar — here, and from the mark at the left
 * end — and that repetition is deliberate rather than an oversight. A wordmark
 * that goes home is a convention a reader has to already know; a link that
 * reads "Home" is one they can see. The two carry the same `href`, so there is
 * still one definition of where home is.
 */
const NAV_ITEMS: readonly NavItem[] = [
  { key: "home", href: ROUTES.home, label: "Home" },
  { key: "writing", href: ROUTES.writing, label: "Writing" },
  { key: "projects", href: ROUTES.projects, label: "Projects" },
  { key: "about", href: ROUTES.about, label: "About" },
];

/** The id the skip link targets, and the id of the main landmark (BR5.2). */
const MAIN_ID = "main";

/** Two digits, so the readout's columns do not jump between 9 and 10. */
export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export interface PageContext {
  readonly site: SiteMetadata;
  /** The build's own date, `YYYY-MM-DD`, injected rather than read from a clock. */
  readonly buildDate: string;
  /**
   * How many published posts and projects the build found.
   *
   * Optional because the header readout is the only thing that reads them and a
   * build without them is still a complete site. They default to zero rather
   * than being omitted from the strip: a readout that silently drops a column
   * when a number is missing is worse than one that says zero.
   */
  readonly postCount?: number;
  readonly projectCount?: number;
  /** Editorial copy about the author. Falls back to {@link DEFAULT_PROFILE}. */
  readonly profile?: SiteProfile;
}

export interface PageDefinition {
  /** Output-relative path this page is written to. */
  readonly outputPath: string;
  /**
   * The page's own title, without the site-name suffix. Empty on Home, where the
   * site name is the whole title.
   */
  readonly title: string;
  /**
   * The page's own description. When a template supplies none,
   * `SiteMetadata.fallbackDescription` is used — which is what makes "a
   * description on every page" true by construction rather than by vigilance
   * (BR5.8).
   */
  readonly description?: string;
  readonly current: NavKey;
  /** The inner markup of the main landmark. Must carry exactly one `h1`. */
  readonly main: string;
  /**
   * Which of the two registers the body uses. `editorial` is a reading page —
   * a post or a project write-up, where a measured prose column is the point;
   * `technical` is everything else. Emitted as a class on the body so the
   * stylesheet can tell them apart without inspecting the markup.
   */
  readonly register: "editorial" | "technical";
}

/**
 * The content-security-policy meta tag (BR5.10).
 *
 * The value is held once, in `SiteMetadata`, and emitted by this one fragment,
 * so the policy cannot drift between templates. The meta form is the only form
 * available: GitHub Pages sets no HTTP response headers (C4).
 */
function renderCspTag(site: SiteMetadata): string {
  return `<meta http-equiv="Content-Security-Policy" content="${escapeHtml(site.contentSecurityPolicy)}">`;
}

/**
 * The feed's site path, derived from its output path so the two cannot disagree.
 */
const FEED_PATH = toSitePath(FEED_OUTPUT_PATH);

/**
 * Head metadata: title, description, canonical URL, the feed autodiscovery link,
 * the card tags and the theme colour (BR5.8, BR5.9, FR5.1).
 *
 * The theme colour is emitted once, unconditionally: the site has a single
 * theme, so there is no `prefers-color-scheme` pair to keep in step.
 *
 * The autodiscovery link is how a feed reader finds the feed when someone pastes
 * the site's URL into one; it is invisible and costs nothing. It is also the
 * closest thing to automated verification the feed gets: check 3 reads `href`
 * values out of every built page, so a feed that failed to write would fail the
 * internal-link check on every page of the site.
 *
 * No `og:image` is emitted. That is deliberate for this version (FR5.5), not an
 * oversight.
 */
function renderHead(page: PageDefinition, context: PageContext): string {
  const { site } = context;
  const fullTitle =
    page.title === "" ? site.siteName : `${page.title} · ${site.siteName}`;
  const description =
    page.description !== undefined && page.description.trim() !== ""
      ? page.description
      : site.fallbackDescription;
  const canonical = toAbsoluteUrl(site.baseUrl, toSitePath(page.outputPath));

  return [
    '<meta charset="utf-8">',
    renderCspTag(site),
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(fullTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<link rel="alternate" type="application/atom+xml" title="${escapeHtml(site.siteName)}" href="${FEED_PATH}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${escapeHtml(site.siteName)}">`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    '<meta name="twitter:card" content="summary">',
    `<meta name="twitter:title" content="${escapeHtml(fullTitle)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    '<meta name="theme-color" content="#edf1ef">',
    // The self-hosted faces, preloaded, then the one stylesheet (BR11.2,
    // BR11.3). Both are this site's own files. `crossorigin` is required even
    // same-origin: a font is fetched in CORS mode, and a preload without it
    // fetches the file a second time rather than once.
    ...FONT_PRELOAD_PATHS.map(
      (font) =>
        `<link rel="preload" href="${font}" as="font" type="font/woff2" crossorigin>`,
    ),
    `<link rel="stylesheet" href="${STYLESHEET_PATH}">`,
  ]
    .map((line) => `    ${line}`)
    .join("\n");
}

/**
 * The readout strip above the navigation.
 *
 * Every figure in it is generated: the two counts come from the catalogs this
 * build validated, and the date is the build's own. Nothing here is a static
 * string dressed up as instrumentation — a readout that could go stale without
 * anyone noticing would be decoration, and this design has none.
 */
function renderStrip(context: PageContext): string {
  const posts = context.postCount ?? 0;
  const projects = context.projectCount ?? 0;

  return [
    '      <div class="strip">',
    '        <div class="shell strip__inner">',
    '          <span class="strip__cell">',
    '            <span class="dot dot--ok dot--live" aria-hidden="true"></span>',
    '            <span class="lbl">rue.asha</span>',
    "          </span>",
    `          <span class="strip__cell lbl">projects ${pad2(projects)}</span>`,
    `          <span class="strip__cell lbl">posts ${pad2(posts)}</span>`,
    `          <span class="strip__cell strip__cell--end lbl">build ${escapeHtml(context.buildDate)}</span>`,
    "        </div>",
    "      </div>",
  ].join("\n");
}

/**
 * The navigation, with the current page marked by `aria-current="page"`
 * (BR5.1).
 *
 * The attribute is emitted in addition to the bracket marks the stylesheet
 * draws, because marking the current page visually alone leaves a
 * screen-reader user with no indication of where they are.
 */
function renderNav(current: NavKey): string {
  const links = NAV_ITEMS.map((item) => {
    const marker = item.key === current ? ' aria-current="page"' : "";
    return `            <a class="nav__link" href="${item.href}"${marker}>${item.label}</a>`;
  }).join("\n");

  return [
    '          <nav class="nav" aria-label="Primary">',
    links,
    "          </nav>",
  ].join("\n");
}

/**
 * The footer: one line, and nothing else.
 *
 * It was three schematic cells — Contact, Elsewhere, Colophon — over a base
 * line. The cells restated each other: the address appeared twice on the same
 * page, the Colophon sentence described the build to a reader who came to read
 * a post, and the `● end of document` marker labelled the bottom of the page as
 * the bottom of the page. What is left is what a footer is actually consulted
 * for — who this is, how to reach them, and where they are.
 *
 * Nothing was added in their place: no feed link, no licence links, no second
 * navigation. A footer is the one region of a site where anything may be
 * dropped without an argument, which is exactly why things accumulate there.
 *
 * The line is a `<p>` rather than a `<div>`, and that is load-bearing rather
 * than semantic taste: the phone touch-target floor in § 11 of the stylesheet
 * reaches `:where(p, li, dd, nav) > a`, so the two links clear 44px by being
 * inside an element that rule already knows about, without the selector having
 * to name a footer class and gain specificity it must not have.
 */
function renderFooter(site: SiteMetadata, year: number, profile: SiteProfile) {
  const links = CONTACT_LINK_ORDER.map((link) => {
    const rel = link.external ? ' rel="noopener noreferrer"' : "";
    return `          <a class="lnk" href="${escapeHtml(link.href)}"${rel} aria-label="${escapeHtml(link.accessibleName)}">${escapeHtml(link.label)}</a>`;
  });

  return [
    '    <footer class="foot">',
    '      <div class="shell">',
    '        <p class="foot__base">',
    `          <span class="lbl">© ${String(year)} ${escapeHtml(site.siteName)}</span>`,
    ...links,
    `          <span class="lbl">${escapeHtml(profile.location)}</span>`,
    "        </p>",
    "      </div>",
    "    </footer>",
  ].join("\n");
}

/**
 * Render a complete HTML document.
 *
 * The skip link is the first focusable element in document order and targets the
 * main landmark (BR5.2). Its visible-on-focus styling belongs to the stylesheet;
 * the markup order and the target belong here, because a stylesheet cannot add a
 * link the templates do not emit.
 */
export function renderDocument(
  page: PageDefinition,
  context: PageContext,
): string {
  const { site } = context;
  const profile = context.profile ?? DEFAULT_PROFILE;
  const year =
    parseIsoDate(context.buildDate)?.year ?? new Date().getUTCFullYear();

  return `<!doctype html>
<html lang="en">
  <head>
${renderHead(page, context)}
  </head>
  <body class="register-${page.register}">
    <a class="skip-link" href="#${MAIN_ID}">Skip to content</a>
    <header class="head">
${renderStrip(context)}
      <div class="bar">
        <div class="shell bar__inner">
          <a class="mark" href="${ROUTES.home}" aria-label="${escapeHtml(site.siteName)} — home">
            <span class="mark__glyph" aria-hidden="true">▚</span>
            <span class="mark__text">${escapeHtml(site.siteName)}</span>
          </a>
${renderNav(page.current)}
        </div>
      </div>
    </header>
    <main id="${MAIN_ID}" tabindex="-1">
${page.main}
    </main>
${renderFooter(site, year, profile)}
  </body>
</html>
`;
}
