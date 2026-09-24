/**
 * The About page's markup — FR4.1, BR10.1, BR10.2, BR10.3, and the mandated
 * WCAG 2.1 AA landmark bar.
 *
 * Seven tests over one template. They are written as properties of the rendered
 * page rather than against the drafted wording, because [Q1]'s answer is
 * explicit that the prose is a starting point the author edits (U4CA1): a test
 * pinned to a sentence would break on an editorial change that breaks nothing.
 * What BR10.3 actually requires is that prose *exists*, that the placeholder is
 * gone, and that at least one contact link is there — and that is what these
 * assert.
 *
 * Tests 1 and 2 cover heading structure, and test 3 covers link names. Both are
 * things the automated accessibility scan would have covered; it was declined
 * at Practices Discovery (`team.md` § Testing Posture), so on this page type
 * these tests and the keyboard walkthrough are the whole of that coverage.
 */

import { describe, expect, it } from "vitest";

import { SITE_LINKS } from "../../src/page-renderer/shell.ts";
import { TEST_SITE } from "../u1/helpers.ts";
import {
  anchorFor,
  anchors,
  countLevelOneHeadings,
  firstHeadingSkip,
  mainParagraphs,
  offOriginResources,
  renderAboutPage,
} from "./helpers.ts";

const GITHUB_HREF = "https://github.com/Rue-Asha";
const EMAIL_HREF = "mailto:rue.asha@proton.me";

/**
 * Link names that name no destination.
 *
 * BR10.2 exists because a screen-reader user navigating by link list gets a
 * column of these and cannot tell one from another.
 */
const BARE_LABELS = ["here", "link", "profile", "this", "click here", "more"];

/** The placeholder sentence U1 shipped, which this unit replaces (BR10.3). */
const U1_PLACEHOLDER =
  "This page is written properly in a later piece of work.";

describe("the About page has a well-formed heading outline (WCAG 2.1 AA)", () => {
  it("emits exactly one h1, and it is the first heading on the page", () => {
    const html = renderAboutPage();

    expect(countLevelOneHeadings(html)).toBe(1);
    expect(html).toContain("<h1>About</h1>");
  });

  it("skips no heading level between the page heading and its sections", () => {
    const html = renderAboutPage();

    // `h1` then `h2`, with nothing deeper. A skip here would tell a
    // screen-reader user navigating by heading that a section is missing.
    expect(firstHeadingSkip(html)).toBeNull();
  });
});

describe("the contact links are plain outbound links with real names (BR10.2)", () => {
  it("links to the GitHub profile under a name that says where it goes", () => {
    const html = renderAboutPage();
    const github = anchorFor(html, GITHUB_HREF);

    expect(github).toBeDefined();
    expect(github?.accessibleName).not.toBe("");
    expect(BARE_LABELS).not.toContain(github?.accessibleName.toLowerCase());
    // Named for its destination rather than merely non-bare.
    expect(github?.accessibleName.toLowerCase()).toContain("github");
  });

  it("links to the email address as a plain mailto anchor (BR10.3)", () => {
    const html = renderAboutPage();
    const email = anchorFor(html, EMAIL_HREF);

    expect(email).toBeDefined();
    // The address is its own visible text (U4CA2): `script-src 'none'` means
    // any script-based obfuscation would not run, so obscuring it would only
    // hide the address from readers.
    expect(email?.accessibleName).toBe("rue.asha@proton.me");
  });
});

describe("both destinations come from the one place the site holds them", () => {
  it("emits exactly the two hrefs SITE_LINKS carries, in that order", () => {
    const html = renderAboutPage();
    const main = /<main[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? "";
    const destinations = anchors(main).map((anchor) => anchor.href);

    // Compared against the constant rather than against a literal spelled out
    // here, so this test cannot agree with a stale copy. The footer on every
    // page and Home's intro row already read these two URLs from `SITE_LINKS`;
    // About typing them out separately is what made three copies of two values,
    // and it is the copy that would have been missed when one of them changed.
    expect(destinations).toEqual([
      SITE_LINKS.github.href,
      SITE_LINKS.email.href,
    ]);

    // The two literals the older tests in this file pin, checked against the
    // same constant — otherwise they could keep asserting a URL the site no
    // longer uses and still pass.
    expect(GITHUB_HREF).toBe(SITE_LINKS.github.href);
    expect(EMAIL_HREF).toBe(SITE_LINKS.email.href);
  });
});

describe("the page carries prose beneath its heading (BR10.3)", () => {
  it("emits non-empty paragraphs, none of them U1's placeholder", () => {
    const html = renderAboutPage();
    const paragraphs = mainParagraphs(html);

    // "A heading with nothing beneath it does not satisfy this rule" — BR10.3.
    // Three paragraphs of prose plus the two contact links.
    expect(paragraphs.length).toBeGreaterThanOrEqual(4);
    expect(paragraphs[0]?.length).toBeGreaterThan(40);

    // The placeholder U1 shipped is gone rather than merely added to.
    expect(html).not.toContain(U1_PLACEHOLDER);
    expect(html).not.toContain("placeholder");
  });
});

describe("nothing on the page is fetched from another server (BR10.2, BR5.10)", () => {
  it("references off-origin hosts only in ordinary anchor hrefs", () => {
    const html = renderAboutPage();

    // A third-party icon or profile widget is the failure mode BR10.2 names,
    // and it is the substance of the tracking this initiative excluded. The
    // GitHub link itself is off-origin and must not be counted: a link a reader
    // chooses to follow is not a resource their browser fetches while reading.
    expect(offOriginResources(html, TEST_SITE.baseUrl)).toEqual([]);
    expect(html).toContain(GITHUB_HREF);
  });
});
