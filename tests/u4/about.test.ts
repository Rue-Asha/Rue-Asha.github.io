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

import { renderWriting } from "../../src/page-renderer/pages.ts";
import {
  FEED_PATH,
  SITE_LINKS,
  renderDocument,
} from "../../src/page-renderer/shell.ts";
import { TEST_SITE } from "../u1/helpers.ts";
import {
  TEST_CONTEXT,
  anchorFor,
  anchors,
  countLevelOneHeadings,
  firstHeadingSkip,
  mainParagraphs,
  offOriginResources,
  renderAboutPage,
  renderAboutPageWith,
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
    expect(html).toContain('<h1 class="phead__title">About</h1>');
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
  it("carries the two contact hrefs in order, both read from SITE_LINKS", () => {
    const html = renderAboutPage();
    const main = /<main[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? "";
    const destinations = anchors(main).map((anchor) => anchor.href);

    // Compared against the constant rather than against a literal spelled out
    // here, so this test cannot agree with a stale copy. The footer on every
    // page and Home's intro row already read these two URLs from `SITE_LINKS`;
    // About typing them out separately is what made three copies of two values,
    // and it is the copy that would have been missed when one of them changed.
    //
    // The contact pair is asserted as a subsequence rather than as the whole
    // list, and the reason is that the earlier form pinned the wrong property.
    // What BR10.2 is about is where an *outbound* link's URL comes from, not how
    // many links the page is allowed to have; the equality form made an ordinary
    // internal route — the feed the rail now offers — read as a rule violation.
    // The link inventory is still closed, by the two assertions below it.
    expect(
      destinations.filter(
        (href) =>
          href === SITE_LINKS.github.href || href === SITE_LINKS.email.href,
      ),
    ).toEqual([SITE_LINKS.github.href, SITE_LINKS.email.href]);

    // Nothing leaves this origin except through `SITE_LINKS`. This is the half
    // of the old assertion that was load-bearing, and it is now stated
    // directly: a hard-coded profile URL added to a new band fails here.
    const knownExternal: string[] = Object.values(SITE_LINKS).map(
      (link) => link.href,
    );
    const offSite = destinations.filter(
      (href) => !href.startsWith("/") && !knownExternal.includes(href),
    );
    expect(offSite).toEqual([]);

    // Every remaining link is a root-relative path on this site. Catches a
    // relative href, which resolves differently from `/about/` than it does
    // from the page it was copied out of.
    const internal = destinations.filter((href) => href.startsWith("/"));
    expect(internal).toContain(FEED_PATH);
    expect(
      internal.every((href) => href.endsWith("/") || href.includes(".")),
    ).toBe(true);

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

describe("the page head carries the title alone, with no lead beneath it", () => {
  it("emits the full-width head here and keeps the split head on the listings", () => {
    const about = renderAboutPage();

    // The lead this page used to carry was a table of contents for the panel
    // directly beneath it. Its absence is a decision, so it is asserted: a
    // later edit that reinstates one has to come past this test rather than
    // arriving as a quiet addition.
    expect(about).toContain('<div class="phead__grid phead__grid--full">');
    expect(about).toContain('<section class="phead phead--tight">');
    expect(about).not.toContain('class="phead__lead"');

    // The listings are untouched by this: their leads still fill their column,
    // and a change to About's head must not quietly restyle the other two.
    const writing = renderDocument(renderWriting([]), TEST_CONTEXT);
    expect(writing).toContain('<p class="phead__lead">');
    expect(writing).toContain('<section class="phead">');
    expect(writing).not.toContain("phead__grid--full");
  });

  it("leaves no empty element where the lead and its rule used to be", () => {
    const html = renderAboutPage();
    const head = /<section class="phead[^"]*">([\s\S]*?)<\/section>/.exec(
      html,
    )?.[1];

    // A `<p></p>` or a leftover spacer would keep the vertical gap the removed
    // block occupied, which is the usual way a "removed" element survives.
    expect(head).toBeDefined();
    expect(head).not.toMatch(/<p[^>]*>\s*<\/p>/);
    expect(head).not.toContain("phead__rule");
  });
});

describe("the panel opens with its lead and states the role exactly once", () => {
  it("sets the opening line apart from the prose it introduces", () => {
    const html = renderAboutPage();

    // The lead is a separate element rather than the first `.prose` paragraph,
    // because it is typeset differently; asserting it exists as its own element
    // is what stops it being folded back into the run of body text.
    expect([...html.matchAll(/<p class="about__lead">/g)]).toHaveLength(1);
  });

  it("prints the role once and the location once across the whole page head", () => {
    const html = renderAboutPage();
    const main = /<main[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? "";

    // The page used to say "Sysadmin / DevOps in Germany" in its lead, print
    // Germany again in the count cell beside it, and then list Role and Based as
    // two more rows of the rail. Each now appears once in `main`; the footer's
    // own copy of the location is outside it and is not counted here.
    expect([...main.matchAll(/Sysadmin \/ DevOps/g)]).toHaveLength(1);
    expect([...main.matchAll(/Germany/g)]).toHaveLength(1);
  });

  it("drops the rail's note when the profile carries no current work", () => {
    const withNow = renderAboutPage();
    expect(withNow).toContain('class="about__now"');

    // Cleared in `site.config.ts`, the note goes with it rather than leaving a
    // label over a blank — the rule BR3.5 states for the project rail.
    const withoutNow = renderAboutPageWith({ now: "" });
    expect(withoutNow).not.toContain('class="about__now"');
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
