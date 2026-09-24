/**
 * The two head elements U5 adds, and the same-origin property they must not
 * break — BR11.2, BR11.3, BR11.4.
 *
 * Every test here runs across all seven page types rather than one sample. The
 * fault this unit is most likely to produce is not "the link is wrong" but "the
 * link is missing from one page", and a single-page test cannot see it.
 *
 * What these tests deliberately do not assert: a contrast ratio, a rendered
 * pixel height, a tab order, or a focus trap. Asserting those against a string
 * of HTML would measure an approximation and report confidence the site has not
 * earned (`unit-test-instructions.md` § What is being tested). The keyboard
 * walkthrough and the phone-width measurement are the real verification, and
 * they are plan Steps 12 and 13.
 */

import { describe, expect, it } from "vitest";

import { FONT_PATH, STYLESHEET_PATH } from "../../src/page-renderer/shell.ts";
import { TEST_SITE } from "../u1/helpers.ts";
import { allUrls, everyPage, headLinks } from "./helpers.ts";

const PAGES = everyPage();

describe("BR11.3 — one stylesheet, on every page, from this origin", () => {
  it("emits exactly one root-relative stylesheet link per page type", () => {
    for (const page of PAGES) {
      const sheets = headLinks(page.html).filter(
        (link) => link.rel === "stylesheet",
      );

      // Exactly one: a second stylesheet is how two registers become two design
      // systems, which is what BR11.3 exists to prevent.
      expect(sheets, `${page.name} stylesheet links`).toHaveLength(1);
      expect(sheets[0]?.href).toBe(STYLESHEET_PATH);
      expect(sheets[0]?.href.startsWith("/")).toBe(true);
      expect(sheets[0]?.href.startsWith("//")).toBe(false);
    }

    expect(PAGES).toHaveLength(7);
  });
});

describe("BR11.2 — the font is preloaded, and text never waits for it", () => {
  it("emits the font preload with as, type and crossorigin on every page type", () => {
    for (const page of PAGES) {
      const preloads = headLinks(page.html).filter(
        (link) => link.rel === "preload",
      );

      expect(preloads, `${page.name} preload links`).toHaveLength(1);
      const font = preloads[0];
      expect(font?.href).toBe(FONT_PATH);
      expect(font?.as).toBe("font");
      expect(font?.type).toBe("font/woff2");
      // Required even same-origin: a font is fetched in CORS mode, and a
      // preload without it fetches the file twice rather than once.
      expect(font?.crossorigin).toBe(true);
    }
  });
});

describe("BR11.4 — nothing inline, nothing scripted", () => {
  it("emits no style block, no style attribute and no script anywhere", () => {
    // The policy in `TEST_SITE` carries `style-src 'self'` with no
    // `'unsafe-inline'` and `script-src 'none'`, so each of these would render
    // as a silently broken page rather than as a visible mistake.
    expect(TEST_SITE.contentSecurityPolicy).not.toContain("unsafe-inline");
    expect(TEST_SITE.contentSecurityPolicy).toContain("script-src 'none'");

    for (const page of PAGES) {
      expect(page.html, `${page.name} <style>`).not.toMatch(/<style[\s>]/i);
      expect(page.html, `${page.name} style=`).not.toMatch(/\sstyle="/i);
      expect(page.html, `${page.name} <script>`).not.toMatch(/<script[\s>]/i);
    }
  });
});

describe("BR11.4 — every fetched resource is this site's own", () => {
  it("emits no off-origin href or src outside an anchor", () => {
    for (const page of PAGES) {
      const fetched = allUrls(page.html).filter((url) => !url.fromAnchor);

      // There is something to check: a page with no resource URLs at all would
      // pass this vacuously.
      expect(fetched.length, `${page.name} resource URLs`).toBeGreaterThan(0);

      for (const { url } of fetched) {
        const sameOrigin =
          url.startsWith(TEST_SITE.baseUrl) ||
          (url.startsWith("/") && !url.startsWith("//"));
        const documentRelative =
          !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith("//");

        expect(
          sameOrigin || documentRelative,
          `${page.name} fetches ${url} from another origin`,
        ).toBe(true);
      }
    }
  });
});
