/**
 * The stylesheet's own obligations — BR11.4, BR11.6, BR11.7, BR11.8.
 *
 * The stylesheet is read from disk as text. It is data here, not a module:
 * there is no behaviour to invoke and nothing to mock.
 *
 * Test 1 is what makes "the palette and the scale are declared in one place"
 * checkable rather than asserted. It lists the token names and their values
 * explicitly, so changing a colour or a step in the stylesheet without changing
 * it here is a failing test rather than silent drift.
 *
 * What is still not checked here, and by anything else: the contrast ratios
 * those colours actually produce. The automated accessibility scan was offered
 * at Practices Discovery and declined, so measuring the table by hand remains
 * the whole verification of BR11.5.
 */

import { beforeAll, describe, expect, it } from "vitest";

import {
  readStylesheet,
  rootDeclarations,
  ruleBody,
  withoutComments,
} from "./helpers.ts";

/**
 * Every token the "Control Room" palette and scale declare, with its value.
 *
 * Compared case-insensitively with whitespace collapsed, so `#0A6E52` and
 * `#0a6e52` are the same colour and a wrapped font stack is the same stack —
 * but every digit, size and step must match exactly.
 */
const TOKENS: readonly (readonly [string, string])[] = [
  // Families. Both self-hosted faces are named first, then the reader's own
  // stacks at zero bytes, chosen for metric proximity so the swap is small —
  // and they are what the page keeps if a face never arrives at all.
  ["--mono", '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace'],
  [
    "--sans",
    '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
  ],

  // The type scale. Dense at the bottom, because this design shows more per
  // screen; fluid at the top, because a display size that fits a 1320px shell
  // is unreadable on a phone.
  ["--t-xs", "0.6875rem"],
  ["--t-sm", "0.75rem"],
  ["--t-base", "0.875rem"],
  ["--t-body", "0.9375rem"],
  ["--t-prose", "clamp(1rem, 0.95rem + 0.25vw, 1.0625rem)"],
  ["--t-lg", "clamp(1.0625rem, 0.98rem + 0.45vw, 1.3125rem)"],
  ["--t-xl", "clamp(1.4375rem, 1.18rem + 1.2vw, 2.25rem)"],
  ["--t-2xl", "clamp(1.875rem, 1.35rem + 2.4vw, 3.25rem)"],
  ["--t-hero", "clamp(2rem, 1.05rem + 3.7vw, 4.25rem)"],

  // Measure and rhythm.
  ["--max", "1320px"],
  ["--pad", "clamp(1rem, 2.5vw, 2.25rem)"],
  ["--gap", "clamp(2rem, 4.5vw, 4.5rem)"],

  // Motion.
  ["--ease", "cubic-bezier(0.2, 0.7, 0.3, 1)"],
  ["--fast", "140ms"],
  ["--med", "280ms"],

  // "Reactor" — a cool off-white ground with a deep teal-emerald signal. The
  // site is light-only, so these are the palette rather than one half of it.
  ["--bg", "#EDF1EF"],
  ["--panel", "#FFFFFF"],
  ["--panel-2", "#F5F8F6"],
  ["--line", "#DBE3DF"],
  ["--line-2", "#C0CAC5"],
  ["--fg", "#08100D"],
  ["--fg-2", "#45524D"],
  // Darkened from the reference direction's #76827D, which measured 3.5:1
  // against `--bg`. This is the colour of every label, date and navigation item
  // at rest, so it is body text and the 4.5:1 floor applies.
  ["--fg-3", "#636E67"],
  ["--signal", "#0A6E52"],
  ["--signal-dim", "#B9E0D2"],
  ["--ok", "#14607A"],

  // The code theme: three named treatments plus unclassified text, which is
  // four in total and the ceiling the interaction spec sets. None reuses
  // `--signal`; brand and syntax must not be confusable.
  ["--code-comment", "#6B7A74"],
  ["--code-string", "#1F6B3A"],
  ["--code-keyword", "#6D3FA8"],
];

/**
 * The one token declared twice on purpose.
 *
 * `--target-min-height` is the touch-target floor: `0` in the base block and
 * 44px inside the phone breakpoint. That second declaration is what lets the
 * minimum-target rule be written once against the element rather than as a
 * figure per site feature (BR11.1, NFR7), so it is asserted as a pair rather
 * than being caught by the declared-once check above.
 */
const SWITCHED_TOKEN = ["--target-min-height", ["0", "44px"]] as const;

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

describe("the palette and the scale are declared once", () => {
  it("declares every documented token exactly once, with its documented value", () => {
    const declared = rootDeclarations(css);

    for (const [name, documented] of TOKENS) {
      const values = declared.get(name);
      expect(values, `${name} is not declared in :root`).toBeDefined();
      expect(values, `${name} is declared more than once`).toHaveLength(1);
      expect(normalise(values?.[0] ?? "")).toBe(normalise(documented));
    }

    const [name, expected] = SWITCHED_TOKEN;
    expect(declared.get(name)).toEqual([...expected]);
  });

  it("holds the whole palette in one :root block, with no theme branch", () => {
    // The site is light-only by decision: no toggle, no stored preference, no
    // second palette. A `prefers-color-scheme` query appearing here would be a
    // second set of colours nothing in this file measures for contrast.
    expect(rules).not.toMatch(/prefers-color-scheme/i);
    expect(ruleBody(css, ":root")).toContain("color-scheme: light");

    // Two `:root` blocks: the palette, and the breakpoint that raises the
    // touch-target floor. The second carries that one token and nothing else —
    // a colour redeclared there would be a theme branch by another name.
    const roots = [...rules.matchAll(/:root\s*\{([^}]*)\}/g)].map(
      (match) => match[1] ?? "",
    );
    expect(roots).toHaveLength(2);
    expect(
      [...(roots[1] ?? "").matchAll(/(--[a-z0-9-]+)\s*:/gi)].map(
        (match) => match[1],
      ),
    ).toEqual([SWITCHED_TOKEN[0]]);
  });
});

describe("BR11.8 — a list row clears the touch-target floor by construction", () => {
  it("pads a row from the type scale rather than from a loose figure", () => {
    // 16.8px above and below a 24px title line is 57px, which clears the 44px
    // floor with room before the summary is counted. Asserted as the
    // declaration rather than as a rendered height: a headless approximation of
    // a measured box would report confidence the site has not earned.
    const row = ruleBody(css, ".row");
    expect(row, ".row is not a rule in this stylesheet").toBeDefined();
    expect(row).toContain("padding: 1.05rem 0.9rem");

    // And the floor itself, declared once against the element rather than as a
    // figure per site feature (BR11.1, NFR7).
    // The selector is matched with its whitespace collapsed, because the
    // formatter wraps it across lines once it passes the print width — and a
    // test that pinned the line breaks would fail on a reformat rather than on
    // a change of meaning.
    // `.foot__cell` left the list when the footer lost its three-cell grid.
    // The footer's two links are still covered: they sit directly inside the
    // one-line footer's `<p>`, which the element list already reaches, so the
    // selector got shorter rather than gaining a class it would have had to
    // pay specificity for.
    const target = ruleBody(
      css,
      ":where(p, li, dd, nav) > a:where( " +
        ":not(.prose *, .row, .btn, .unit__link, .toc__link, .nextnav__link) )",
    );
    expect(target, "the shared minimum-target rule is gone").toBeDefined();
    expect(target).toContain("min-height: var(--target-min-height)");
  });

  it("never lets the target rule outrank a component that lays itself out", () => {
    // The regression this guards is not hypothetical: written as
    // `a:not(.prose *):not(.row):not(.btn)` the rule scored (0,3,1), which beat
    // the (0,1,0) of `.unit__link`, `.toc__link` and `.nextnav__link` and
    // flattened all three from `grid` to `inline-flex`. The project cards came
    // apart — head, body and foot side by side on one line — and every check in
    // this repository still passed, because nothing renders a page.
    //
    // Asserted as a property of the selector rather than of a rendered box: the
    // whole compound after the combinator must sit inside `:where()`, which
    // zeroes its specificity, so any component declaring its own display wins
    // by default rather than by being remembered in the exclusion list.
    // The rule that *consumes* the token, not the `:root` blocks that declare
    // it — those carry the same name and would match first.
    const rules = [...withoutComments(css).matchAll(/([^{}]+)\{([^}]*)\}/g)];
    const owner = rules.find((rule) =>
      (rule[2] ?? "").includes("min-height: var(--target-min-height)"),
    );
    expect(owner, "nothing applies the target floor any more").toBeDefined();

    const selector = (owner?.[1] ?? "").replace(/\s+/g, " ").trim();

    // The one `:not()` in it is wrapped, so none of its arguments contributes
    // specificity. An unwrapped `:not(` is the fault itself.
    expect(selector).toMatch(/a:where\(\s*:not\(/);
    expect(selector.match(/:not\(/g) ?? []).toHaveLength(1);
    for (const component of [".unit__link", ".toc__link", ".nextnav__link"]) {
      expect(selector, `${component} is not excluded`).toContain(component);
    }
  });
});

describe("BR11.4 — the stylesheet fetches nothing from another server", () => {
  it("contains no @import and no url() pointing at another host", () => {
    expect(rules).not.toMatch(/@import/i);

    const urls = [...rules.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map(
      (match) => match[1] ?? "",
    );

    // Six faces, and nothing else. A test that found none would pass
    // vacuously, which is exactly the state a dropped `@font-face` block would
    // leave behind.
    expect(urls).toHaveLength(6);
    for (const url of urls) {
      expect(url, `${url} is not this site's own file`).not.toMatch(
        /^(?:[a-z][a-z0-9+.-]*:)?\/\//i,
      );
      expect(url).toContain("ibm-plex");
      expect(url.endsWith(".woff2")).toBe(true);
    }

    // Every declared face swaps rather than hiding text while it loads
    // (BR11.2, NFR2): a page that blanks its own text waiting for a download
    // has a loading state, which this site does not have.
    const faces = rules.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    expect(faces).toHaveLength(6);
    for (const face of faces) {
      expect(face).toContain("font-display: swap");
    }
  });
});

describe("BR11.6 — the phone layout is the desktop layout contracted", () => {
  it("contracts at every width query and never builds a second layout", () => {
    const widthQueries = [
      ...rules.matchAll(/@media\s*\(([^)]*\bwidth\b[^)]*)\)/gi),
    ].map((match) => (match[1] ?? "").trim());

    // The previous design held itself to a single breakpoint. This one has
    // several, and the difference is the layout rather than the discipline: a
    // five-column data table, a two-column page head and a sticky rail beside a
    // 40rem measure each stop fitting at a different width, and collapsing them
    // all at one width would mean either a table that overflows or a hero that
    // stacks hundreds of pixels early.
    //
    // What is held instead is the property the single breakpoint was standing
    // in for: every query is a `max-width` contraction. A `min-width` query is
    // how a second layout gets built for a second device class, and there is
    // none here — the widest layout is the base, and each query removes from
    // it.
    expect(widthQueries.length).toBeGreaterThan(0);
    for (const query of widthQueries) {
      expect(query, `${query} is not a contraction`).toMatch(/^max-width:/);
    }

    const reducedMotion =
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/.exec(
        rules,
      );
    expect(reducedMotion, "no prefers-reduced-motion query").not.toBeNull();
    expect(reducedMotion?.[1]).toContain("transition-duration");
    expect(reducedMotion?.[1]).toContain("animation-duration");
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
    expect(focusRule).toContain("outline: 2px solid var(--signal)");
    expect(focusRule).toContain("outline-offset: 2px");
  });

  it("moves no focusable element out of its document position", () => {
    // `order` and the grid's `-reverse` flows are the one thing a stylesheet
    // can do that breaks tab order without touching any markup. The project
    // rail is the place this nearly happened: it stacks above the write-up on a
    // narrow screen, and it is first in the markup so the stylesheet does not
    // have to reorder it (BR9.5).
    expect(rules).not.toMatch(/\border\s*:\s*-?\d/);
    expect(rules).not.toMatch(/(?:row|column)-reverse/);
  });
});

describe("NFR1 — a link is never distinguished by colour alone", () => {
  it("underlines a standalone link and a prose link at rest, not only on hover", () => {
    // A regression guard as much as an assertion. Moving the underline to
    // `:hover` restores a colour-only distinction between a link and the text
    // beside it, and nothing else in the suite would notice: the page still
    // builds, still passes all three site checks, and still looks almost
    // identical in a screenshot.
    for (const selector of [".lnk", ".prose a"]) {
      const rest = ruleBody(css, selector);
      expect(
        rest,
        `${selector} is not a rule in this stylesheet`,
      ).toBeDefined();
      expect(rest, `${selector} has no rule line at rest`).toContain(
        "border-block-end: 1px solid var(--line-2)",
      );

      // And the rule is not confined to the hover state — the fault above,
      // stated directly rather than inferred from the rest rule's presence.
      const hover = ruleBody(css, `${selector}:hover`);
      expect(hover ?? "").not.toContain("border-block-end: 1px solid");
    }
  });

  it("marks the current navigation item with more than a colour", () => {
    // The brackets the stylesheet draws around the current item. Colour alone
    // would leave anyone who cannot see the difference with no indication of
    // where they are; the markup's `aria-current` covers assistive technology,
    // and this covers the rest.
    const before = ruleBody(css, '.nav__link[aria-current="page"]::before');
    const after = ruleBody(css, '.nav__link[aria-current="page"]::after');
    expect(before).toContain('content: "["');
    expect(after).toContain('content: "]"');
  });
});

describe("the About panel's labels all resolve to the accent", () => {
  it("lets no later rule of equal weight take one of them back to grey", () => {
    // A regression guard for a fault that had already happened: the accent was
    // set for the four label selectors in one group, and a layout rule further
    // down the same section re-declared `color: var(--fg-3)` on one of them.
    // Equal specificity, later in the file, so it won — and one key sat grey
    // among four accented ones with nothing in the suite noticing. Markup tests
    // cannot see this: the class is on the element either way.
    //
    // Checked by resolution rather than by presence. For each selector, every
    // rule whose selector list mentions it is collected in document order and
    // the last `color` declaration among them must be the accent, which is what
    // the browser will actually apply.
    const labelSelectors = [
      ".about .panel__head .lbl",
      ".about__side-title",
      ".about__side .spec__key",
      ".about__now .lbl",
    ];

    for (const selector of labelSelectors) {
      const colours: string[] = [];

      for (const rule of rules.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
        const selectors = (rule[1] ?? "")
          .split(",")
          .map((part) => part.replace(/\s+/g, " ").trim());
        if (!selectors.includes(selector)) continue;

        for (const declaration of (rule[2] ?? "").matchAll(
          /(?:^|;)\s*color\s*:\s*([^;]+)/g,
        )) {
          colours.push((declaration[1] ?? "").trim());
        }
      }

      expect(colours, `${selector} sets no colour anywhere`).not.toHaveLength(
        0,
      );
      expect(
        colours.at(-1),
        `${selector} is overridden back to ${String(colours.at(-1))}`,
      ).toBe("var(--signal)");
    }
  });
});

describe("NFR6 — a long word never widens the page", () => {
  it("lets .prose break a word too long for the measure", () => {
    // The declaration, not a rendered width: asserting a pixel measurement
    // against a headless approximation would report confidence the site has
    // not earned. Loading a post with a long URL at phone width is the real
    // check.
    const prose = ruleBody(css, ".prose");
    expect(prose, ".prose is not a rule in this stylesheet").toBeDefined();

    const declared = /overflow-wrap:\s*([a-z-]+)/.exec(prose ?? "")?.[1];
    expect(declared, ".prose declares no overflow-wrap").toBeDefined();
    expect(["anywhere", "break-word"]).toContain(declared);
  });
});
