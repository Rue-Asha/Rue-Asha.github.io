/**
 * PageRenderer, the project half — BR9.1, BR9.2, BR9.4, BR9.5, FR3.1 to FR3.7.
 *
 * Four of this unit's five rules were already satisfied by the templates U1 left.
 * `functional-spec.md` says of BR9.1, BR9.2, BR9.4 and BR9.5 that they are
 * "caught by no automated check" — they are template properties, and the pre-push
 * check set covers the build, page coverage and internal links, none of which
 * inspects either a rail's row order or a row's target count.
 *
 * That was true when it was written. These tests are what makes it no longer
 * true, which is the whole of this unit's work: turning "already correct" into
 * something that stays correct when U4, U5 and U6 change the same pages.
 */

import { describe, expect, it } from "vitest";

import {
  renderHome,
  renderProject,
  renderProjects,
} from "../../src/page-renderer/pages.ts";
import { aProject } from "../u1/helpers.ts";
import {
  anchorTags,
  projectRows,
  projectTableRows,
  railLabels,
  railOf,
  renderPage,
} from "./helpers.ts";

const WITH_LIVE = aProject({
  slug: "with-live",
  name: "With Live",
  summary: "A thing that is deployed somewhere.",
  year: 2026,
  type: "Web app",
  tools: ["TypeScript", "Node.js"],
  repo: "https://github.com/Rue-Asha/with-live",
  liveUrl: "https://example.com/with-live",
});

const WITHOUT_LIVE = aProject({
  slug: "without-live",
  name: "Without Live",
  summary: "A thing with nowhere to visit.",
  year: 2025,
  type: "CLI",
  tools: ["Rust"],
  repo: "https://github.com/Rue-Asha/without-live",
});

describe("BR9.1 — the metadata rail's row order is fixed", () => {
  it("emits year, type, tools and then links, in that order and no other", () => {
    const html = renderPage(renderProject(WITH_LIVE, "<p>Body.</p>"));

    // The order itself, not merely the presence of each label. A rail whose row
    // order varied by project would make a reader re-read it each time, and
    // asserting presence alone would not notice.
    //
    // The repository and the live site now share one `Links` row rather than
    // holding a row each: they are the same kind of value — somewhere else to
    // go — and two adjacent one-item rows read as a longer rail without saying
    // more. Their order inside that row is asserted below.
    expect(railLabels(html)).toEqual(["Year", "Type", "Tools", "Links"]);

    const rail = railOf(html);
    expect(rail.indexOf("project-rail-repo-link")).toBeLessThan(
      rail.indexOf("project-rail-live-link"),
    );
  });

  it("omits the live link entirely when a project declares no live URL", () => {
    const html = renderPage(renderProject(WITHOUT_LIVE, "<p>Body.</p>"));
    const rail = railOf(html);

    // The absent value omits its whole entry, label included (U1 BR3.5, FR3.4).
    // A label with nothing after it is what this rule exists to forbid, and the
    // `Links` row still exists because the repository is required.
    expect(railLabels(html)).toEqual(["Year", "Type", "Tools", "Links"]);
    expect(rail).not.toContain("project-rail-live-link");
    expect(rail).not.toContain("Live <span");
    expect(rail).not.toContain('<dd class="spec__val"></dd>');
    expect(rail.match(/<li>/g) ?? []).toHaveLength(1);
  });
});

/**
 * The rail's `<dt>`/`<dd>` structure, grouped: each label with the values that
 * follow it before the next label.
 *
 * Kept local to this file rather than added to `helpers.ts`, because it exists
 * to assert one commitment — that a multi-valued rail row is several `<dd>`
 * elements under one `<dt>`, which is the only shape a `<dl>` has for it.
 */
function railGroups(html: string): { label: string; values: string[] }[] {
  const rail = railOf(html);
  const groups: { label: string; values: string[] }[] = [];

  for (const match of rail.matchAll(
    /<(dt|dd) class="spec__(?:key|val)">([\s\S]*?)<\/\1>/g,
  )) {
    const tag = match[1];
    const inner = (match[2] ?? "").trim();
    if (tag === "dt") {
      groups.push({ label: inner, values: [] });
      continue;
    }
    const group = groups.at(-1);
    if (!group) continue;
    // A multi-valued row is a list inside one `<dd>`. Its items are the values;
    // a single-valued row is its own one value.
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(
      (item) => (item[1] ?? "").trim(),
    );
    group.values.push(...(items.length > 0 ? items : [inner]));
  }

  return groups;
}

describe("BR9.1 — the rail lists tools one per line, the index row inline", () => {
  const THREE_TOOLS = aProject({
    slug: "three-tools",
    name: "Three Tools",
    summary: "A thing built out of three things.",
    year: 2026,
    type: "Service",
    tools: ["TypeScript", "Postgres", "Docker"],
    repo: "https://github.com/Rue-Asha/three-tools",
  });

  it("emits one element per declared tool, in declaration order, under a single Tools label", () => {
    const html = renderPage(renderProject(THREE_TOOLS, "<p>Body.</p>"));
    const groups = railGroups(html);

    // Exactly one `Tools` label — not one per tool, which would read as three
    // separate rows rather than one row with three values.
    const toolsGroups = groups.filter((group) => group.label === "Tools");
    expect(toolsGroups).toHaveLength(1);

    // The tools are a list of separate elements rather than one joined string.
    // A stylesheet cannot split a joined value apart, so the shape is a markup
    // commitment and belongs in a test rather than in the stylesheet.
    expect(toolsGroups[0]?.values).toEqual([
      "TypeScript",
      "Postgres",
      "Docker",
    ]);
  });

  it("welds no separator glyph into any rail value", () => {
    const html = renderPage(renderProject(THREE_TOOLS, "<p>Body.</p>"));

    for (const group of railGroups(html)) {
      for (const value of group.values) {
        // A literal `·` inside a value is announced by a screen reader, or
        // swallowed as a pause, where the rail means "these are a list".
        expect(value).not.toContain("·");
      }
    }
  });

  it("lists the Projects card's tools as separate elements too, never a joined string", () => {
    const html = renderPage(renderProjects([THREE_TOOLS]));
    const card = projectRows(html)[0] ?? "";
    const tools = [...card.matchAll(/<li class="chip">([^<]*)<\/li>/g)].map(
      (match) => match[1] ?? "",
    );

    // The listing and the rail now agree, where the previous design held them
    // deliberately apart: the card drew a joined `A · B · C` summary line and
    // the rail drew a list. Making them the same is a decision, and the reason
    // is the one the rail's own rule already gave — a welded separator is
    // announced by a screen reader where the markup means "these are a list".
    expect(tools).toEqual(["TypeScript", "Postgres", "Docker"]);
    expect(card).not.toContain("TypeScript · Postgres");
  });
});

describe("BR9.2 — a listing entry carries exactly one target", () => {
  it("emits one anchor per card and one per Home row", () => {
    const projects = [WITH_LIVE, WITHOUT_LIVE];
    const cards = projectRows(renderPage(renderProjects(projects)));

    expect(cards).toHaveLength(2);
    for (const card of cards) {
      // Counted rather than merely checked for presence. The previous design
      // gave a row two targets — the name and an outbound repository link —
      // and BR9.2's own reasoning was that a reader must be able to predict
      // where each tab stop goes. One target per entry satisfies that outright:
      // every entry on this site now goes exactly one place, and the repository
      // is one click further in, on the project's own page.
      expect(anchorTags(card)).toHaveLength(1);
    }

    for (const row of projectTableRows(
      renderPage(renderHome([], projects, "Rue Asha", "An intro.")),
    )) {
      expect(anchorTags(row)).toHaveLength(1);
    }
  });

  it("makes the whole entry the target, summary and tools included", () => {
    const html = renderPage(renderProjects([WITH_LIVE]));
    const card = projectRows(html)[0] ?? "";

    // The summary and the tools are inside the one anchor rather than being
    // targets of their own. No nested anchor: that is the third target the rule
    // forbids, arriving through a different door.
    expect(card).toContain("A thing that is deployed somewhere.");
    expect(card).toContain("TypeScript");
    expect(anchorTags(card)).toHaveLength(1);
  });

  it('names the repository link for its own project rather than a bare "repo"', () => {
    // FR3.6: read out of context, a page of links all named "repo" tells a
    // screen-reader user nothing about which project each one belongs to. The
    // link lives on the project page now, so that is where it is asserted.
    for (const project of [WITH_LIVE, WITHOUT_LIVE]) {
      const html = renderPage(renderProject(project, "<p>Body.</p>"));
      expect(html).toContain(`aria-label="Repository for ${project.name}"`);

      const repoAnchors = anchorTags(html).filter((tag) =>
        tag.includes("project-rail-repo-link"),
      );
      expect(repoAnchors).toHaveLength(1);
      for (const anchor of repoAnchors) {
        expect(anchor).toMatch(/aria-label="Repository for [^"]+"/);
        // It leaves this site, so it must not hand the destination a window
        // reference or a referrer.
        expect(anchor).toContain('rel="noopener noreferrer"');
      }
    }
  });
});

describe("BR9.4 — every project appears once, with all four values", () => {
  it("emits one card per project, each carrying name, summary, tools and its route", () => {
    const projects = [
      WITH_LIVE,
      WITHOUT_LIVE,
      aProject({
        slug: "third",
        name: "Third",
        summary: "The third one.",
        year: 2024,
        tools: ["Go"],
        repo: "https://github.com/Rue-Asha/third",
      }),
    ];
    const html = renderPage(renderProjects(projects));
    const rows = projectRows(html);

    expect(rows).toHaveLength(projects.length);

    for (const [index, project] of projects.entries()) {
      const row = rows[index] ?? "";
      expect(row).toContain(project.name);
      expect(row).toContain(project.summary);
      expect(row).toContain(project.tools[0] ?? "");
      expect(row).toContain(`href="/projects/${project.slug}/"`);
      // The repository is reached from the project's own page, and every card
      // links to it — so the route to every repository is still exactly one
      // click from this listing.
      expect(renderPage(renderProject(project, "<p>Body.</p>"))).toContain(
        `href="${project.repo}"`,
      );
    }

    // No project appears twice: `renderProjects` maps the list it is given and
    // never re-emits a featured project at the top as well as in place.
    for (const project of projects) {
      const occurrences =
        html.split(`href="/projects/${project.slug}/"`).length - 1;
      expect(occurrences).toBe(1);
    }
  });
});

describe("BR9.5 — the rail sits beside the body, not inside it", () => {
  it("emits the rail and the prose as siblings, rail first", () => {
    const html = renderPage(renderProject(WITH_LIVE, "<p>Body.</p>"));

    const body =
      /<div class="project__body">([\s\S]*?)<\/div>\s*<p class="back-end">/.exec(
        html,
      )?.[1] ?? "";

    expect(body).toContain('<aside class="side">');
    expect(body).toContain('<div class="prose">');

    // The structural commitment the stylesheet relies on to stack the rail
    // above the write-up at phone width with one layout rule. A rail nested in
    // the prose could not be stacked that way, and a rail placed after it in
    // the markup could only be moved above it by reordering — the one thing a
    // stylesheet can do that breaks tab order (BR11.7).
    expect(body.indexOf('<aside class="side">')).toBeLessThan(
      body.indexOf('<div class="prose">'),
    );
  });

  it("renders the authored body unchanged, with no imposed section set", () => {
    const authored =
      "<h2>Whatever the author wrote</h2>\n<p>At any length.</p>";
    const html = renderPage(renderProject(WITHOUT_LIVE, authored));

    // FR3.2: the body's structure and length are the author's. The template
    // contributes the header and the rail and nothing else.
    expect(html).toContain("<h2>Whatever the author wrote</h2>");
    expect(html).toContain("<p>At any length.</p>");
  });
});

describe("W3, FR3.7 — the Projects page with nothing to list", () => {
  it("keeps its heading, shows one sentence, and offers a route to Writing", () => {
    const html = renderPage(renderProjects([]));

    expect(html).toContain('<h1 class="phead__title">Projects</h1>');
    expect(html).toContain("Nothing here yet.");
    expect(html).toContain('href="/writing/"');

    // Never a bare heading, and never a card (U1 BR5.5).
    expect(projectRows(html)).toHaveLength(0);
    expect(html).not.toContain('<ul class="units">');

    // And never a readout with nothing behind it. Three keys over three blanks
    // is the decoration this design has none of; the strip is dropped whole.
    expect(html).not.toContain('<div class="readout schematic">');
  });
});

/**
 * The figures under the Projects title.
 *
 * Every one is derived from the projects the build just validated, which is the
 * property that keeps the strip from going stale without anyone noticing. These
 * assert the derivation rather than the markup: the span reads off the year
 * range, the latest reads off the greatest year rather than off card position,
 * and the count is the length of the listing the page just drew.
 */
describe("PageRenderer — the Projects readout", () => {
  /** The `key → value` pairs of the readout strip, in document order. */
  function readoutPairs(html: string): [string, string][] {
    const strip =
      /<div class="readout schematic">([\s\S]*?)<\/div>\s*<\/div>/.exec(
        html,
      )?.[1] ?? "";
    return [
      ...strip.matchAll(
        /<span class="lbl readout__key">([^<]*)<\/span>\s*<span class="readout__val">([^<]*)<\/span>/g,
      ),
    ].map((match) => [match[1] ?? "", match[2] ?? ""]);
  }

  it("spans the year range, names the newest project, and counts the listing", () => {
    // Deliberately not in year order: projects are ordered featured-first
    // (FR3.1), so a "latest" read off the first card would name the wrong one.
    const html = renderPage(
      renderProjects([
        WITHOUT_LIVE, // 2025
        WITH_LIVE, // 2026
        aProject({
          slug: "oldest",
          name: "Oldest",
          summary: "The first one.",
          year: 2024,
          tools: ["Go"],
          repo: "https://github.com/Rue-Asha/oldest",
        }),
      ]),
    );

    expect(readoutPairs(html)).toEqual([
      ["Span", "2024–2026"],
      ["Latest", "With Live"],
      ["Projects", "3"],
    ]);
  });

  it("prints a single year rather than a range when every project shares one", () => {
    const html = renderPage(renderProjects([WITH_LIVE]));

    expect(readoutPairs(html)).toEqual([
      ["Span", "2026"],
      ["Latest", "With Live"],
      ["Projects", "1"],
    ]);
  });
});
