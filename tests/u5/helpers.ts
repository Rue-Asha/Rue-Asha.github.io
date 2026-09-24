/**
 * Shared test helpers for U5.
 *
 * Only what U1's helpers do not already provide. `TEST_SITE`, `TEST_BUILD_DATE`
 * and `temporaryOutputRoot` are imported from `../u1/helpers.ts` rather than
 * redefined; duplicating them would let the copies drift, and `TEST_SITE`
 * deliberately writes out the content-security-policy string BR5.10 fixes
 * character for character (`unit-test-instructions.md` § Shared helpers).
 *
 * The stylesheet is **data** to these tests, not a module: it is read from disk
 * as text. There is nothing to mock — a mocked read would test the mock, and
 * the file a reader receives is the thing under test.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  type PageContext,
  type PageDefinition,
  renderDocument,
} from "../../src/page-renderer/shell.ts";
import { TEST_BUILD_DATE, TEST_SITE, aPost, aProject } from "../u1/helpers.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path of the repository root — the real content tree the build reads. */
export const REPO_ROOT = path.resolve(HERE, "..", "..");

/** The one stylesheet, as a repository-relative path. */
export const STYLESHEET_SOURCE = "src/assets/styles/site.css";

/** The self-hosted font file, as a repository-relative path. */
export const FONT_SOURCE = "src/assets/fonts/source-serif-4-latin.woff2";

/** The page context every rendering test uses. */
export const TEST_CONTEXT: PageContext = {
  site: TEST_SITE,
  buildDate: TEST_BUILD_DATE,
};

/** The source of the one stylesheet, read from disk. */
export async function readStylesheet(): Promise<string> {
  return readFile(path.join(REPO_ROOT, STYLESHEET_SOURCE), "utf8");
}

/** CSS with every comment removed, so prose about a token is never parsed as one. */
export function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Every custom property declared in a `:root` block, name to declared values.
 *
 * A name mapping to more than one value is a token declared twice, which is the
 * drift the token test exists to catch.
 */
export function rootDeclarations(css: string): Map<string, string[]> {
  const declarations = new Map<string, string[]>();

  for (const block of withoutComments(css).matchAll(/:root\s*\{([^}]*)\}/g)) {
    for (const line of (block[1] ?? "").matchAll(
      /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi,
    )) {
      const name = line[1] ?? "";
      const value = (line[2] ?? "").replace(/\s+/g, " ").trim();
      declarations.set(name, [...(declarations.get(name) ?? []), value]);
    }
  }

  return declarations;
}

/**
 * The body of the first rule whose selector matches, or `undefined`.
 *
 * Deliberately simple: this stylesheet has no nesting, so a rule is a selector
 * followed by one brace pair.
 */
export function ruleBody(css: string, selector: string): string | undefined {
  for (const rule of withoutComments(css).matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if ((rule[1] ?? "").replace(/\s+/g, " ").trim() === selector) {
      return (rule[2] ?? "").replace(/\s+/g, " ").trim();
    }
  }
  return undefined;
}

/** One `<link>` element of a rendered document's head. */
export interface HeadLink {
  readonly rel: string;
  readonly href: string;
  readonly as?: string;
  readonly type?: string;
  /** Present as a bare attribute, so its presence is what matters. */
  readonly crossorigin: boolean;
}

/** Every `<link>` in a rendered document, in document order. */
export function headLinks(html: string): HeadLink[] {
  const attribute = (attributes: string, name: string): string | undefined =>
    new RegExp(`\\b${name}="([^"]*)"`).exec(attributes)?.[1];

  return [...html.matchAll(/<link\s([^>]*)>/g)].map((match) => {
    const attributes = match[1] ?? "";
    return {
      rel: attribute(attributes, "rel") ?? "",
      href: attribute(attributes, "href") ?? "",
      as: attribute(attributes, "as"),
      type: attribute(attributes, "type"),
      crossorigin: /\bcrossorigin\b/.test(attributes),
    };
  });
}

/** One URL a document emits, and whether it came from an anchor. */
export interface EmittedUrl {
  readonly url: string;
  /** An anchor is a link the reader chooses to follow; anything else is a fetch. */
  readonly fromAnchor: boolean;
}

/**
 * Every `href` and `src` a document emits, tagged by whether it is an anchor.
 *
 * The distinction is the whole point of the same-origin test: an outbound
 * anchor is a link, while an `href` or `src` on anything else makes a reader's
 * browser talk to that server while they read (BR11.4, U1 BR5.10).
 */
export function allUrls(html: string): EmittedUrl[] {
  const urls: EmittedUrl[] = [];

  for (const tag of html.matchAll(/<([a-z][a-z0-9]*)\s([^>]*)>/gi)) {
    const name = (tag[1] ?? "").toLowerCase();
    const attributes = tag[2] ?? "";
    for (const found of attributes.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
      urls.push({ url: found[1] ?? "", fromAnchor: name === "a" });
    }
  }

  return urls;
}

/** One rendered page type: its name, for a failure message, and its document. */
export interface RenderedPageType {
  readonly name: string;
  readonly html: string;
}

const SAMPLE_BODY = "<p>Body text.</p>";

/**
 * One rendered document per page type — all seven.
 *
 * Asserted across every type rather than on a sample, because a stylesheet link
 * present on six pages and missing on the seventh is exactly the fault a
 * single-page test misses.
 */
export function everyPage(): RenderedPageType[] {
  const post = aPost();
  const project = aProject();
  const posts = [post];
  const projects = [project];

  const definitions: readonly (readonly [string, PageDefinition])[] = [
    ["Home", renderHome(posts, projects, TEST_SITE.siteName, "An intro.")],
    ["Writing", renderWriting(posts)],
    ["Post", renderPost(post, SAMPLE_BODY)],
    ["Projects", renderProjects(projects)],
    ["Project", renderProject(project, SAMPLE_BODY)],
    ["About", renderAbout(TEST_SITE.siteName)],
    ["404", renderNotFound()],
  ];

  return definitions.map(([name, definition]) => ({
    name,
    html: renderDocument(definition, TEST_CONTEXT),
  }));
}
