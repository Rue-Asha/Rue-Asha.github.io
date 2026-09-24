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
  renderProject,
  renderProjects,
} from "../../src/page-renderer/pages.ts";
import { aProject } from "../u1/helpers.ts";
import { anchorTags, projectRows, railLabels, renderPage } from "./helpers.ts";

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
  it("emits year, type, tools, repo and then live, in that order and no other", () => {
    const html = renderPage(renderProject(WITH_LIVE, "<p>Body.</p>"));

    // The order itself, not merely the presence of each label. A rail whose row
    // order varied by project would make a reader re-read it each time, and
    // asserting presence alone would not notice.
    expect(railLabels(html)).toEqual(["Year", "Type", "Tools", "Repo", "Live"]);
  });

  it("omits the live row entirely when a project declares no live URL, leaving four rows", () => {
    const html = renderPage(renderProject(WITHOUT_LIVE, "<p>Body.</p>"));

    // Four rows, not five with one blank: the absent value omits the whole row,
    // label included (U1 BR3.5, FR3.4). A label with nothing after it is what
    // this rule exists to forbid.
    expect(railLabels(html)).toEqual(["Year", "Type", "Tools", "Repo"]);
    expect(html).not.toContain("<dt>Live</dt>");
    expect(html).not.toContain("<dd></dd>");
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
  const rail =
    /<dl class="project-rail">([\s\S]*?)<\/dl>/.exec(html)?.[1] ?? "";
  const groups: { label: string; values: string[] }[] = [];

  for (const match of rail.matchAll(/<(dt|dd)>([\s\S]*?)<\/\1>/g)) {
    const tag = match[1];
    const inner = (match[2] ?? "").trim();
    if (tag === "dt") {
      groups.push({ label: inner, values: [] });
    } else {
      groups.at(-1)?.values.push(inner);
    }
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

  it("emits one <dd> per declared tool, in declaration order, under a single Tools label", () => {
    const html = renderPage(renderProject(THREE_TOOLS, "<p>Body.</p>"));
    const groups = railGroups(html);

    // Exactly one `Tools` label — not one per tool, which would read as three
    // separate rows rather than one row with three values.
    const toolsGroups = groups.filter((group) => group.label === "Tools");
    expect(toolsGroups).toHaveLength(1);

    // `mockups.md` § Project draws the tools stacked one per line beneath the
    // label. A stylesheet cannot split a single `<dd>` into lines, so the shape
    // is a markup commitment and belongs in a test rather than in U5.
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

  it("keeps the Projects list row's tools inline on one line", () => {
    const html = renderPage(renderProjects([THREE_TOOLS]));
    const row = projectRows(html)[0] ?? "";
    const tools =
      /<p class="project-row-tools">([\s\S]*?)<\/p>/.exec(row)?.[1] ?? "";

    // Deliberately unlike the rail. § Projects draws a scannable summary line;
    // § Project draws a reference table. Asserted so the difference is held
    // rather than assumed, and so making the two the same has to be a decision.
    expect(tools).toBe("TypeScript · Postgres · Docker");
  });
});

describe("BR9.2 — a Projects list row carries exactly two targets", () => {
  it("emits two anchors per row: the project name and the repository link", () => {
    const html = renderPage(renderProjects([WITH_LIVE, WITHOUT_LIVE]));
    const rows = projectRows(html);

    expect(rows).toHaveLength(2);
    for (const row of rows) {
      // Counted rather than merely checked for presence. A row that passes "the
      // name links" can still carry a third target, which would leave a reader
      // unable to predict where each tab stop goes.
      expect(anchorTags(row)).toHaveLength(2);
    }
  });

  it("makes neither the summary nor the tools list a link", () => {
    const html = renderPage(renderProjects([WITH_LIVE]));
    const row = projectRows(html)[0] ?? "";

    const summary =
      /<p class="project-row-summary">([\s\S]*?)<\/p>/.exec(row)?.[1] ?? "";
    const tools =
      /<p class="project-row-tools">([\s\S]*?)<\/p>/.exec(row)?.[1] ?? "";

    expect(summary).toContain("A thing that is deployed somewhere.");
    expect(summary).not.toContain("<a ");
    expect(tools).toContain("TypeScript");
    expect(tools).not.toContain("<a ");
  });

  it('names each repository link for its own project rather than a bare "repo"', () => {
    const html = renderPage(renderProjects([WITH_LIVE, WITHOUT_LIVE]));

    // FR3.6: read out of context, a page of links all named "repo" tells a
    // screen-reader user nothing about which project each one belongs to.
    for (const project of [WITH_LIVE, WITHOUT_LIVE]) {
      expect(html).toContain(`aria-label="Repository for ${project.name}"`);
    }

    // The visible text may be short; the accessible name may not be the whole of
    // it. Every repo anchor carries an aria-label naming its project.
    const repoAnchors = anchorTags(html).filter((tag) =>
      tag.includes("project-row-repo-link"),
    );
    expect(repoAnchors).toHaveLength(2);
    for (const anchor of repoAnchors) {
      expect(anchor).toMatch(/aria-label="Repository for [^"]+"/);
      // It leaves this site, so it must not hand the destination a window
      // reference or a referrer.
      expect(anchor).toContain('rel="noopener noreferrer"');
    }
  });
});

describe("BR9.4 — every project appears once, with all four values", () => {
  it("emits one row per project, each carrying name, summary, tools and a repo link", () => {
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
      expect(row).toContain(`href="${project.repo}"`);
      expect(row).toContain(`href="/projects/${project.slug}/"`);
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
  it("emits the rail and the body as siblings within the project article", () => {
    const html = renderPage(renderProject(WITH_LIVE, "<p>Body.</p>"));

    const article =
      /<article class="project">([\s\S]*?)<\/article>/.exec(html)?.[1] ?? "";
    const body =
      /<div class="project-body">([\s\S]*?)<\/div>\s*<\/article>/.exec(
        html,
      )?.[1] ?? "";

    expect(article).toContain('<dl class="project-rail">');
    expect(article).toContain('<div class="project-body">');

    // The structural commitment U5 relies on to stack the rail above the body at
    // phone width with one layout rule (`frontend-components.md` § Responsive
    // commitments). A rail nested in the body cannot be stacked that way.
    expect(body).not.toContain('<dl class="project-rail">');
    expect(article.indexOf('<dl class="project-rail">')).toBeLessThan(
      article.indexOf('<div class="project-body">'),
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

    expect(html).toContain("<h1>Projects</h1>");
    expect(html).toContain("Nothing here yet.");
    expect(html).toContain('href="/writing/"');

    // Never a bare heading, and never a row (U1 BR5.5).
    expect(projectRows(html)).toHaveLength(0);
    expect(html).not.toContain('<ul class="project-list">');
  });
});
