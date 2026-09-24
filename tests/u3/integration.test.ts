/**
 * The projects spine, end to end — W1, W2, W3, BR9.1, BR9.3, NFR9.
 *
 * Real fixture trees on disk, for the reason U1's and U2's suites give: this
 * build's whole job is reading files and rendering what it finds, so a mocked
 * file system would test the mock rather than the rule.
 *
 * `projects-site/` carries three projects chosen so every branch of this unit is
 * exercised by a real build: one featured, one with a live URL, one without, and
 * three different years, so the ordering is observable rather than incidental.
 * The resulting order — Beacon (featured), Cartograph (2026), Almanac (2025) —
 * matches neither declaration order, alphabetical order, nor year order alone.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { type CheckRunnerOptions, runChecks } from "../../src/check-runner.ts";
import { buildSite } from "../../src/site-builder.ts";
import {
  TEST_BUILD_DATE,
  TEST_SITE,
  temporaryOutputRoot,
} from "../u1/helpers.ts";
import { fixture, listedProjectSlugs, railLabels } from "./helpers.ts";

/** The order `sortProjects` produces from the `projects-site` fixture. */
const EXPECTED_ORDER = ["beacon", "cartograph", "almanac"];

function optionsFor(
  repoRoot: string,
  outputRoot: string,
  manifestPath: string,
): CheckRunnerOptions {
  return {
    repoRoot,
    outputRoot,
    manifestPath,
    site: TEST_SITE,
    homeIntro: "An intro.",
    buildDate: TEST_BUILD_DATE,
    startedAt: new Date("2026-09-23T09:00:00.000Z"),
  };
}

async function page(outputRoot: string, outputPath: string): Promise<string> {
  return readFile(path.join(outputRoot, outputPath), "utf8");
}

describe("W1, W2 — a site with three projects builds a page for each", () => {
  it("writes the Projects page and one write-up page per project", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const manifest = await buildSite(
        optionsFor(
          fixture("projects-site"),
          outputRoot,
          path.join(dir, "m.json"),
        ),
      );

      expect(manifest.pagesWritten).toContain("projects/index.html");
      for (const slug of EXPECTED_ORDER) {
        expect(manifest.pagesWritten).toContain(`projects/${slug}/index.html`);
      }

      // Every project produced a page — the second of the three blocking checks,
      // asserted here against the manifest as well as by `runChecks` below.
      const projectRows = manifest.sourceToOutput.filter(
        (row) => row.kind === "project",
      );
      expect(projectRows).toHaveLength(EXPECTED_ORDER.length);
    } finally {
      await cleanup();
    }
  });
});

describe("BR9.3 — the built Projects page and Home agree on order", () => {
  it("lists the same order on both, featured first and then year descending", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      await buildSite(
        optionsFor(
          fixture("projects-site"),
          outputRoot,
          path.join(dir, "m.json"),
        ),
      );

      const projects = listedProjectSlugs(
        await page(outputRoot, "projects/index.html"),
      );
      const home = listedProjectSlugs(await page(outputRoot, "index.html"));

      expect(projects).toEqual(EXPECTED_ORDER);
      // Home shows at most three, and they are the first three of that same
      // order — not an order of its own (BR5.3, BR9.3).
      expect(home).toEqual(EXPECTED_ORDER.slice(0, 3));
    } finally {
      await cleanup();
    }
  });
});

describe("BR9.1 — the rail's shape in a real build", () => {
  it("gives the project with no live URL four rows and the others five", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      await buildSite(
        optionsFor(
          fixture("projects-site"),
          outputRoot,
          path.join(dir, "m.json"),
        ),
      );

      const withoutLive = await page(
        outputRoot,
        "projects/cartograph/index.html",
      );
      const withLive = await page(outputRoot, "projects/beacon/index.html");

      expect(railLabels(withoutLive)).toEqual([
        "Year",
        "Type",
        "Tools",
        "Repo",
      ]);
      expect(railLabels(withLive)).toEqual([
        "Year",
        "Type",
        "Tools",
        "Repo",
        "Live",
      ]);

      // The omission is of the whole row, not of its value (U1 BR3.5, FR3.4).
      expect(withoutLive).not.toContain("<dt>Live</dt>");
      expect(withLive).toContain("https://example.com/beacon");
    } finally {
      await cleanup();
    }
  });
});

describe("NFR9 — the built site passes all three blocking checks", () => {
  it("passes, and every project page is reachable from the Projects list", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const report = await runChecks(
        optionsFor(
          fixture("projects-site"),
          outputRoot,
          path.join(dir, "m.json"),
        ),
      );

      expect(report.failures).toEqual([]);
      expect(report.blocking).toBe(false);

      // Check 3 reads `href` values out of every built page, so a list linking a
      // project page that was never written would already have failed above.
      // This is the same property stated from the reader's side.
      const list = await page(outputRoot, "projects/index.html");
      for (const slug of EXPECTED_ORDER) {
        expect(list).toContain(`href="/projects/${slug}/"`);
      }
    } finally {
      await cleanup();
    }
  });
});

describe("W3 — the empty Projects page in a real build", () => {
  it("builds a site with writing and no projects, and serves the empty state", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const report = await runChecks(
        optionsFor(
          fixture("no-projects"),
          outputRoot,
          path.join(dir, "m.json"),
        ),
      );

      // The empty state is only reachable when no project exists at all, and it
      // must not break the check set when it is (U1 BR5.5, FR3.7).
      expect(report.blocking).toBe(false);

      const list = await page(outputRoot, "projects/index.html");
      expect(list).toContain("<h1>Projects</h1>");
      expect(list).toContain("Nothing here yet.");
      expect(list).toContain('href="/writing/"');
      expect(listedProjectSlugs(list)).toEqual([]);
    } finally {
      await cleanup();
    }
  });
});
