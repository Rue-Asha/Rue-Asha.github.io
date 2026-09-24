/**
 * PageRenderer — the global shell, the head metadata, and the one
 * content-security-policy fragment (BR5.1, BR5.2, BR5.8 to BR5.10).
 *
 * Everything a page needs that is not its own body lives here, because "every
 * page carries X" is only true by construction when exactly one place emits X.
 */

import { escapeHtml } from "../markup-renderer.ts";
import {
  FEED_OUTPUT_PATH,
  parseIsoDate,
  toAbsoluteUrl,
  toSitePath,
} from "../content-transforms.ts";
import type { SiteMetadata } from "../types.ts";

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
 * The site paths of the two static assets U5 adds (BR11.3, BR11.4).
 *
 * Both are root-relative paths on this site's own origin, because that is what
 * `default-src 'self'` allows and what keeps a reader's browser from talking to
 * anyone else's server while they read. They are exported so the build and the
 * tests name the same two strings the head does: a page linking a stylesheet the
 * build never wrote would leave every page unstyled in production while every
 * unit test still passed.
 */
export const STYLESHEET_PATH = "/assets/styles/site.css";
export const FONT_PATH = "/assets/fonts/source-serif-4-latin.woff2";

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
 * The two contact links, held once (`mockups.md` § Global Shell, § Home).
 *
 * The footer draws them on every page and Home draws them again beneath its
 * intro, so without one home for the pair the same two URLs would have three
 * copies and nothing would notice when one of them rotted. They are a module
 * constant rather than a `SiteMetadata` field deliberately: `entities.md`
 * § Additions fixes that entity's purpose as the values every page's *head*
 * needs, and a visible footer link is not head metadata.
 *
 * The footer, Home's intro row and `renderAbout` all read this constant, so each
 * of these two URLs has exactly one home. About reads the strings from here too,
 * though not always the same field: its GitHub anchor prints `accessibleName`
 * and its email anchor prints `label`, because BR10.2 requires that page's
 * visible text to name its own destination. `pages.ts` § `renderAbout` explains
 * that asymmetry where it is made.
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

/** The order the mockups draw them in, on both the footer and Home. */
const CONTACT_LINK_ORDER: readonly SiteLink[] = [
  SITE_LINKS.github,
  SITE_LINKS.email,
];

/**
 * The two contact anchors, for whichever block is drawing them.
 *
 * Emitted by one function so the footer and Home cannot drift apart. The anchors
 * are unclassed and the *container* carries the hook, which is the convention
 * U5's stylesheet already follows (`.contact-link a`); a class on each anchor
 * would be a second way to say the same thing.
 *
 * No separator glyph is emitted between them. The mockups draw a middot, but a
 * literal `·` welded between two anchors is read aloud by a screen reader and
 * cannot be respaced by the stylesheet. Drawing the separator is U5's.
 */
export function renderContactLinks(indent: string): string {
  return CONTACT_LINK_ORDER.map((link) => {
    const rel = link.external ? ' rel="noopener noreferrer"' : "";
    return `${indent}<a href="${escapeHtml(link.href)}"${rel} aria-label="${escapeHtml(link.accessibleName)}">${escapeHtml(link.label)}</a>`;
  }).join("\n");
}

/** Which navigation item is the current page, if any (BR5.1). */
export type NavKey = "writing" | "projects" | "about" | null;

interface NavItem {
  readonly key: Exclude<NavKey, null>;
  readonly href: string;
  readonly label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { key: "writing", href: ROUTES.writing, label: "Writing" },
  { key: "projects", href: ROUTES.projects, label: "Projects" },
  { key: "about", href: ROUTES.about, label: "About" },
];

/** The id the skip link targets, and the id of the main landmark (BR5.2). */
const MAIN_ID = "main";

export interface PageContext {
  readonly site: SiteMetadata;
  /** The build's own date, `YYYY-MM-DD`, injected rather than read from a clock. */
  readonly buildDate: string;
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
   * Which of the two registers the body uses
   * (`refined-mockups/mockups.md` § The Two Registers). Emitted as a class for
   * U5's stylesheet; the shell itself is always technical.
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
 * and the card tags (BR5.8, BR5.9, FR5.1).
 *
 * The autodiscovery link is how a feed reader finds the feed when someone pastes
 * the site's URL into one; it is invisible and costs nothing ([Q1], answer A). No
 * *visible feed* link accompanies it: the footer `mockups.md` § Global Shell
 * draws holds the copyright line and the two contact links and nothing else, so
 * adding a third to an approved layout is not this unit's to do.
 *
 * It is also the closest thing to automated verification the feed gets. Check 3
 * reads `href` values out of every built `.html` page, so a feed that failed to
 * write would fail the internal-link check on every page of the site (U2CA4).
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
    // The self-hosted font, preloaded, then the one stylesheet (BR11.2,
    // BR11.3). Both are this site's own files. `crossorigin` is required even
    // same-origin: a font is fetched in CORS mode, and a preload without it
    // fetches the file a second time rather than once.
    //
    // A preload is a hint about a file this page already needs, not a
    // performance target: nothing here sets a byte ceiling or a timing budget,
    // which NFR5 forbids introducing.
    `<link rel="preload" href="${FONT_PATH}" as="font" type="font/woff2" crossorigin>`,
    `<link rel="stylesheet" href="${STYLESHEET_PATH}">`,
  ]
    .map((line) => `    ${line}`)
    .join("\n");
}

/**
 * The navigation, with the current page marked by `aria-current="page"`
 * (BR5.1).
 *
 * The attribute is emitted in addition to whatever visual treatment U5 applies,
 * because marking the current page visually alone leaves a screen-reader user
 * with no indication of where they are.
 */
function renderNav(current: NavKey): string {
  const links = NAV_ITEMS.map((item) => {
    const marker = item.key === current ? ' aria-current="page"' : "";
    return `        <a href="${item.href}"${marker}>${item.label}</a>`;
  }).join("\n");

  return ['      <nav aria-label="Primary">', links, "      </nav>"].join("\n");
}

/**
 * Render a complete HTML document.
 *
 * The skip link is the first focusable element in document order and targets the
 * main landmark (BR5.2). Its visible-on-focus styling belongs to U5; the markup
 * order and the target belong here, because U5 cannot add a link the templates
 * do not emit.
 */
export function renderDocument(
  page: PageDefinition,
  context: PageContext,
): string {
  const { site } = context;
  const year =
    parseIsoDate(context.buildDate)?.year ?? new Date().getUTCFullYear();

  return `<!doctype html>
<html lang="en">
  <head>
${renderHead(page, context)}
  </head>
  <body class="register-${page.register}">
    <a class="skip-link" href="#${MAIN_ID}">Skip to content</a>
    <header class="site-header">
      <a class="site-name" href="${ROUTES.home}">${escapeHtml(site.siteName)}</a>
${renderNav(page.current)}
    </header>
    <main id="${MAIN_ID}" tabindex="-1">
${page.main}
    </main>
    <footer class="site-footer">
      <p class="footer-line contact-link">
        <span class="footer-copyright">© ${String(year)} ${escapeHtml(site.siteName)}</span>
${renderContactLinks("        ")}
      </p>
    </footer>
  </body>
</html>
`;
}
