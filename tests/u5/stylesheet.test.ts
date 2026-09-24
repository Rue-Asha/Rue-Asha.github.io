/**
 * The stylesheet's own obligations — the design system implemented literally,
 * BR11.4, BR11.6, BR11.7, BR11.8.
 *
 * The stylesheet is read from disk as text. It is data here, not a module:
 * there is no behaviour to invoke and nothing to mock.
 *
 * Test 1 is what makes "the design system is the source of truth" checkable
 * rather than asserted. It lists the token names and their documented values
 * explicitly, so changing either the stylesheet or `design-system-mapping.md`
 * without the other is a failing test rather than silent drift.
 *
 * What is still not checked here, and by anything else: the contrast ratios
 * those colours actually produce. The automated accessibility scan was offered
 * at Practices Discovery and declined, so re-measuring the table by hand is the
 * whole verification of BR11.5 (plan Step 13).
 */

import { beforeAll, describe, expect, it } from "vitest";

import {
  readStylesheet,
  rootDeclarations,
  ruleBody,
  withoutComments,
} from "./helpers.ts";

/**
 * Every token `design-system-mapping.md` names, with the value it documents.
 *
 * Compared case-insensitively with whitespace collapsed, so `#0F1012` and
 * `#0f1012` are the same colour and a wrapped font stack is the same stack —
 * but every digit, size, leading and step must match exactly.
 *
 * The scale tokens carry weight, size, leading and family as one `font`
 * shorthand value, which is one token per row of § Type § Scale. Letter spacing
 * cannot ride in that shorthand, so the two tracked rows carry a companion.
 *
 * `--font-serif` names the self-hosted face first and then the system serif
 * stack, which is U5CA3: no fallback face is named upstream, and this is the
 * closest widely available match for a sturdy text serif.
 */
const TOKENS: readonly (readonly [string, string])[] = [
  // § Colour § Surfaces
  ["--surface-shell", "#0F1012"],
  ["--surface-reading", "#17181B"],
  ["--surface-well", "#0F1012"],
  ["--rule", "#2A2C31"],
  // § Colour § Ink
  ["--text", "#E8E6E1"],
  ["--text-muted", "#A3A199"],
  ["--accent", "#E3A857"],
  // § Type § Families
  ["--font-serif", '"Source Serif 4", Georgia, "Times New Roman", serif'],
  [
    "--font-sans",
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  ],
  [
    "--font-mono",
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  ],
  // § Type § Scale
  ["--type-post-title", "600 40px/1.2 var(--font-serif)"],
  ["--type-page-title", "600 28px/1.25 var(--font-sans)"],
  ["--type-body-heading", "600 26px/1.3 var(--font-serif)"],
  ["--type-body-subheading", "600 20px/1.35 var(--font-serif)"],
  ["--type-reading", "400 17px/1.7 var(--font-sans)"],
  ["--type-list", "400 16px/1.5 var(--font-sans)"],
  ["--type-summary", "400 16px/1.5 var(--font-sans)"],
  ["--type-section", "600 18px/1.3 var(--font-sans)"],
  ["--type-meta", "400 13px/1.4 var(--font-mono)"],
  ["--type-meta-tracking", "0.02em"],
  ["--type-rail-label", "400 12px/1.4 var(--font-mono)"],
  ["--type-rail-label-tracking", "0.06em"],
  ["--type-rail-value", "400 14px/1.5 var(--font-sans)"],
  ["--type-code", "400 14px/1.6 var(--font-mono)"],
  // § Type § Measure
  ["--measure", "66ch"],
  ["--container", "1100px"],
  // § Spacing
  ["--space-1", "4px"],
  ["--space-2", "8px"],
  ["--space-3", "12px"],
  ["--space-4", "16px"],
  ["--space-5", "24px"],
  ["--space-6", "32px"],
  ["--space-7", "48px"],
  ["--space-8", "64px"],
  ["--space-9", "96px"],
  // § Borders, radius, and motion
  ["--border-hairline", "1px solid var(--rule)"],
  ["--radius", "4px"],
  ["--focus-ring", "2px solid var(--accent)"],
  ["--focus-ring-offset", "2px"],
  ["--transition", "background-color 120ms ease-out"],
];

const normalise = (value: string): string =>
  value.replace(/\s+/g, " ").trim().toLowerCase();

let css = "";
/**
 * The same stylesheet with its comments removed.
 *
 * Every scan below runs against this rather than the raw file: a comment
 * explaining that this file never writes `outline: none` is not a rule that
 * writes it, and a test that cannot tell the difference reports a violation
 * for the sentence promising there is none.
 */
let rules = "";

beforeAll(async () => {
  css = await readStylesheet();
  rules = withoutComments(css);
});

describe("the design system is implemented literally", () => {
  it("declares every documented token exactly once, with its documented value", () => {
    const declared = rootDeclarations(css);

    for (const [name, documented] of TOKENS) {
      const values = declared.get(name);
      expect(values, `${name} is not declared in :root`).toBeDefined();
      expect(values, `${name} is declared more than once`).toHaveLength(1);
      expect(normalise(values?.[0] ?? "")).toBe(normalise(documented));
    }

    // Declaring the tokens is only half of "implemented literally"; the rules
    // have to consume them. BR11.8: 16px on each side of a 24px title line is
    // 56px, which clears the 44px floor with room. Written as the token so a
    // later change to the step cannot silently drop the row below the floor —
    // the derivation is the obligation, and a literal `16px` breaks the link
    // to it.
    const row = ruleBody(css, ".post-row > a");
    expect(row, ".post-row > a is not a rule in this stylesheet").toBeDefined();
    expect(row).toContain("padding-block: var(--space-4)");
  });
});

describe("BR11.4 — the stylesheet fetches nothing from another server", () => {
  it("contains no @import and no url() pointing at another host", () => {
    expect(rules).not.toMatch(/@import/i);

    const urls = [...rules.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map(
      (match) => match[1] ?? "",
    );

    // The font is the one url() in this file. A test that found none would pass
    // vacuously, which is the state the [Q1] contingency would have produced.
    expect(urls).toHaveLength(1);
    for (const url of urls) {
      expect(url, `${url} is not this site's own file`).not.toMatch(
        /^(?:[a-z][a-z0-9+.-]*:)?\/\//i,
      );
    }
    expect(urls[0]).toContain("source-serif-4-latin.woff2");
  });
});

describe("BR11.6 — one breakpoint, and the motion preference is honoured", () => {
  it("declares exactly one width query, plus a reduced-motion query that stops the transition", () => {
    const widthQueries = [...rules.matchAll(/@media[^{]*\bwidth\b/gi)];

    // Counted rather than matched against a value: moving the breakpoint is
    // allowed, adding a second one is not.
    expect(widthQueries).toHaveLength(1);

    const reducedMotion =
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*)$/.exec(
        rules,
      );
    expect(reducedMotion, "no prefers-reduced-motion query").not.toBeNull();
    expect(reducedMotion?.[1]).toContain("transition: none");
  });
});

describe("BR11.7 — the focus indicator is never removed", () => {
  it("never writes outline: none, and leaves the ring on :focus-visible", () => {
    // Stated as the absence of the removal rather than as the presence of a
    // replacement, because `outline: none` with no replacement is the exact
    // move that costs a keyboard reader their position on the page.
    expect(rules).not.toMatch(/outline\s*:\s*(?:none|0)\b/i);
    expect(rules).not.toMatch(/outline-(?:width|style)\s*:\s*(?:0|none)\b/i);

    const focusRule = ruleBody(css, ":focus-visible");
    expect(focusRule, "no :focus-visible rule at all").toBeDefined();
    expect(focusRule).toContain("outline: var(--focus-ring)");
    expect(focusRule).toContain("outline-offset: var(--focus-ring-offset)");
  });
});

describe("BR11.7, NFR1 — a rail link is never distinguished by colour alone", () => {
  it("underlines .project-rail a at rest, not only on hover", () => {
    // A regression guard as much as an assertion. Moving the underline back to
    // `:hover` restores a colour-only distinction between a rail link and the
    // plain value beside it, and nothing else in the suite would notice: the
    // page still builds, still passes all three site checks, and still looks
    // almost identical in a screenshot.
    const rest = ruleBody(css, ".project-rail a");
    expect(
      rest,
      ".project-rail a is not a rule in this stylesheet",
    ).toBeDefined();
    expect(rest).toContain("text-decoration: underline");
    expect(rest).toContain("text-underline-offset");

    // And the underline is not confined to the hover state — the fault above,
    // stated directly rather than inferred from the rest rule's presence.
    const hover = ruleBody(css, ".project-rail a:hover");
    expect(hover ?? "").not.toContain("text-decoration: underline");
  });
});

describe("NFR6 — the phone layout is the desktop layout contracted", () => {
  it("lets .prose break a word too long for the measure", () => {
    // The declaration, not a rendered width: asserting a pixel measurement
    // against a headless approximation would report confidence the site has
    // not earned. Loading a post with a long URL at phone width is the real
    // check, and it is plan Step 9.
    const prose = ruleBody(css, ".prose");
    expect(prose, ".prose is not a rule in this stylesheet").toBeDefined();

    const declared = /overflow-wrap:\s*([a-z-]+)/.exec(prose ?? "")?.[1];
    expect(declared, ".prose declares no overflow-wrap").toBeDefined();
    expect(["anywhere", "break-word"]).toContain(declared);
  });
});
