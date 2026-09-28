/**
 * Shared test helpers for U4.
 *
 * Only what U1's helpers do not already provide. `TEST_SITE`, `TEST_BUILD_DATE`
 * and `temporaryOutputRoot` are imported from `../u1/helpers.ts`; duplicating
 * them here would let the copies drift, and `TEST_SITE` deliberately writes out
 * the content-security-policy string that BR5.10 fixes character for character
 * (`unit-test-instructions.md` § Shared helpers).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderAbout } from "../../src/page-renderer/pages.ts";
import {
  type PageContext,
  renderDocument,
} from "../../src/page-renderer/shell.ts";
import { TEST_BUILD_DATE, TEST_SITE } from "../u1/helpers.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path of a committed U4 fixture tree, used as a repository root. */
export function fixture(name: string): string {
  return path.join(HERE, "fixtures", name);
}

/** The page context every rendering test uses. */
export const TEST_CONTEXT: PageContext = {
  site: TEST_SITE,
  buildDate: TEST_BUILD_DATE,
};

/**
 * The About page as a complete document, not as its `main` fragment.
 *
 * Heading order and landmark structure are properties of the whole page — the
 * shell contributes markup too, so asserting against the fragment alone would
 * measure the wrong thing.
 */
export function renderAboutPage(): string {
  return renderDocument(renderAbout(TEST_SITE.siteName), TEST_CONTEXT);
}

/**
 * Every heading level in document order, e.g. `[1, 2]`.
 *
 * Matches `<h1>` to `<h6>` opening tags only — a closing tag or an attribute
 * value must not count, or the sequence doubles and every page looks flat. Same
 * extractor U3 established.
 */
export function headingLevels(html: string): number[] {
  return [...html.matchAll(/<h([1-6])(?=[\s/>])/g)].map((match) =>
    Number(match[1]),
  );
}

/**
 * The first heading-level skip in a page, or `null` when there is none.
 *
 * A page is well-formed when its first heading is `h1` and no heading is more
 * than one level deeper than the heading before it. Asserted as a property
 * rather than against a fixed sequence, because U5 and U6 both change this page
 * afterwards and a fixed sequence would break on a legitimate new section.
 */
export function firstHeadingSkip(html: string): string | null {
  const levels = headingLevels(html);
  if (levels.length === 0) return "the page emits no heading at all";

  const first = levels[0] ?? 0;
  if (first !== 1) {
    return `the first heading is h${String(first)} rather than h1`;
  }

  for (let index = 1; index < levels.length; index += 1) {
    const previous = levels[index - 1] ?? 0;
    const current = levels[index] ?? 0;
    if (current > previous + 1) {
      return `h${String(previous)} is followed by h${String(current)}, skipping a level`;
    }
  }

  return null;
}

/** How many `h1` elements a page emits. Exactly one is the contract. */
export function countLevelOneHeadings(html: string): number {
  return headingLevels(html).filter((level) => level === 1).length;
}

/** One `<a>` element of a rendered page: its attributes and its inner text. */
export interface Anchor {
  readonly href: string;
  /**
   * The link's accessible name — its `aria-label` when it carries one, and
   * otherwise its visible text with tags and whitespace collapsed.
   */
  readonly accessibleName: string;
}

/** Every `<a …>…</a>` of a rendered page, in document order. */
export function anchors(html: string): Anchor[] {
  return [...html.matchAll(/<a\s([^>]*)>([\s\S]*?)<\/a>/g)].map((match) => {
    const attributes = match[1] ?? "";
    const inner = match[2] ?? "";
    const ariaLabel = /aria-label="([^"]*)"/.exec(attributes)?.[1];
    return {
      href: /href="([^"]*)"/.exec(attributes)?.[1] ?? "",
      accessibleName: (ariaLabel ?? inner.replace(/<[^>]*>/g, ""))
        .replace(/\s+/g, " ")
        .trim(),
    };
  });
}

/** The single anchor with this `href`, or `undefined` when there is none. */
export function anchorFor(html: string, href: string): Anchor | undefined {
  return anchors(html).find((anchor) => anchor.href === href);
}

/**
 * The text of every `<p>` in a page's `main` landmark, empties excluded.
 *
 * Scoped to `main` so the footer's copyright line is not mistaken for the
 * page's own prose (BR10.3 is about what sits beneath the heading).
 */
export function mainParagraphs(html: string): string[] {
  const main = /<main[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? "";
  return [...main.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((match) =>
      (match[1] ?? "")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((text) => text !== "");
}

/**
 * Every off-origin URL a page references outside an ordinary anchor `href`.
 *
 * `src=`, `<link … href=` and `<iframe>` are the three ways a page can make a
 * reader's browser talk to another server while they read; an anchor `href` is
 * a link the reader chooses to follow and is not one of them. Anything this
 * returns is a content-security-policy violation waiting to happen (BR10.2,
 * U1 BR5.10).
 */
export function offOriginResources(html: string, siteOrigin: string): string[] {
  const found: string[] = [];

  const isOffOrigin = (url: string): boolean =>
    /^(?:https?:)?\/\//.test(url) && !url.startsWith(siteOrigin);

  for (const match of html.matchAll(/\ssrc="([^"]*)"/g)) {
    if (isOffOrigin(match[1] ?? "")) found.push(match[1] ?? "");
  }
  for (const match of html.matchAll(/<link\s[^>]*href="([^"]*)"/g)) {
    if (isOffOrigin(match[1] ?? "")) found.push(match[1] ?? "");
  }
  for (const match of html.matchAll(/<iframe\b/g)) {
    found.push(match[0]);
  }

  return found;
}
