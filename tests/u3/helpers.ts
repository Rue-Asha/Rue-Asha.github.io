/**
 * Shared test helpers for U3.
 *
 * Only what U1's helpers do not already provide. `TEST_SITE`, `TEST_BUILD_DATE`,
 * `aProject`, `temporaryOutputRoot` and `expectBuildFailure` are imported from
 * `../u1/helpers.ts`; duplicating them here would let the copies drift.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  type PageContext,
  type PageDefinition,
  renderDocument,
} from "../../src/page-renderer/shell.ts";
import { TEST_BUILD_DATE, TEST_SITE } from "../u1/helpers.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path of a committed U3 fixture tree, used as a repository root. */
export function fixture(name: string): string {
  return path.join(HERE, "fixtures", name);
}

/** The page context every rendering test uses. */
export const TEST_CONTEXT: PageContext = {
  site: TEST_SITE,
  buildDate: TEST_BUILD_DATE,
};

/**
 * Render a page definition into the complete document a reader gets.
 *
 * Heading-order and landmark properties are properties of the whole page, not of
 * a template's `main` fragment: the shell contributes markup too.
 */
export function renderPage(page: PageDefinition): string {
  return renderDocument(page, TEST_CONTEXT);
}

/**
 * Every heading level in document order, e.g. `[1, 2, 2, 3]`.
 *
 * Matches `<h1>` to `<h6>` opening tags only — a closing tag or an attribute
 * value must not count, or the sequence doubles and every page looks flat.
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
 * rather than against a fixed sequence, because U4, U5 and U6 all change these
 * pages afterwards and a fixed sequence would break on a legitimate new section
 * (`unit-test-instructions.md` § The heading-order extractor).
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

/** Every `<a …>` opening tag in a fragment, in document order. */
export function anchorTags(html: string): string[] {
  return [...html.matchAll(/<a\s[^>]*>/g)].map((match) => match[0]);
}

/**
 * The project cards of a rendered Projects page, in order.
 *
 * A card, not a table row: the Projects listing is a grid of panels, and each
 * `<li class="unit …">` is one project. Home's compact table rows are a
 * different shape and are extracted by {@link projectTableRows}.
 */
export function projectRows(html: string): string[] {
  // Closed on the card's own anchor rather than on the first `</li>`: the tool
  // chips are list items too, and a non-greedy match would stop at the first of
  // them and report a card with no tools in it.
  return [
    ...html.matchAll(/<li class="unit panel ticks">([\s\S]*?<\/a>)\s*<\/li>/g),
  ].map((match) => match[1] ?? "");
}

/** Home's `<a class="row row--project">…</a>` rows, whole anchors, in order. */
export function projectTableRows(html: string): string[] {
  return [...html.matchAll(/<a class="row row--project"[\s\S]*?<\/a>/g)].map(
    (match) => match[0],
  );
}

/**
 * The specification rail of a rendered project page.
 *
 * Scoped to the rail's own panel, because Home draws a `spec` list too and a
 * pattern matching every `<dl class="spec">` on the site would happily assert
 * against the wrong one.
 */
export function railOf(html: string): string {
  return /<div class="side__inner">([\s\S]*?)<\/aside>/.exec(html)?.[1] ?? "";
}

/** The `<dt>` labels of the metadata rail, in document order. */
export function railLabels(html: string): string[] {
  return [...railOf(html).matchAll(/<dt class="spec__key">([^<]*)<\/dt>/g)].map(
    (match) => (match[1] ?? "").trim(),
  );
}

/**
 * The project slugs a rendered Projects page or Home section links to, in order.
 *
 * Scanned from the whole page rather than from one listing shape, because the
 * two listings have different markup — Home draws compact table rows, the
 * Projects page draws cards — and this helper is used against both. The
 * navigation's own `/projects/` link carries no slug segment and therefore does
 * not match.
 */
export function listedProjectSlugs(html: string): string[] {
  return [...html.matchAll(/href="\/projects\/([^/"]+)\//g)].map(
    (match) => match[1] ?? "",
  );
}
