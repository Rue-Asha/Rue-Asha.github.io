/**
 * The stylesheet and the font against a real build — BR11.2, BR11.3, BR11.4.
 *
 * Test 1 is the one that catches a page linking a stylesheet the build forgot
 * to copy: a fault that leaves every page unstyled in production while every
 * other test in this repository still passes. Nothing else would notice it —
 * the three blocking checks cover the build, page coverage and internal links,
 * and a missing stylesheet is none of those. (Check 3 does resolve the head's
 * two `href` values, which is a second line of defence rather than the same
 * one: it would report a broken path, not a stylesheet that was never written.)
 *
 * The build runs for real into a temporary output root from the OS temp
 * directory — nothing is written inside the repository, and the author's `dist/`
 * is never touched. The content tree is the repository's own, which the three
 * blocking checks already exercise, so no new fixture is added.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { type CheckRunnerOptions, runChecks } from "../../src/check-runner.ts";
import { FONT_PATH, STYLESHEET_PATH } from "../../src/page-renderer/shell.ts";
import {
  TEST_BUILD_DATE,
  TEST_SITE,
  temporaryOutputRoot,
} from "../u1/helpers.ts";
import { REPO_ROOT } from "./helpers.ts";

function optionsFor(
  outputRoot: string,
  manifestPath: string,
): CheckRunnerOptions {
  return {
    repoRoot: REPO_ROOT,
    outputRoot,
    manifestPath,
    site: TEST_SITE,
    homeIntro: "An intro.",
    buildDate: TEST_BUILD_DATE,
    startedAt: new Date("2026-09-23T09:00:00.000Z"),
  };
}

/** Every `.html` file in a built output tree, as output-relative paths. */
async function htmlPages(outputRoot: string): Promise<string[]> {
  const found: string[] = [];

  const walk = async (directory: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.name.endsWith(".html")) {
        found.push(
          path.relative(outputRoot, absolute).split(path.sep).join("/"),
        );
      }
    }
  };

  await walk(outputRoot);
  return found.sort((a, b) => a.localeCompare(b));
}

describe("BR11.3, BR11.4 — the build writes what the head references", () => {
  it("writes the stylesheet and the font at the exact paths the head links", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const report = await runChecks(
        optionsFor(outputRoot, path.join(dir, "m.json")),
      );

      // The build and all three blocking checks pass with the two new head
      // elements in place: an unresolvable stylesheet path would fail check 3.
      expect(report.failures).toEqual([]);
      expect(report.blocking).toBe(false);

      // The head's paths are site paths; the output holds them without their
      // leading slash. Asserted against the same exported constants the head
      // emits, so the two cannot disagree.
      const stylesheet = path.join(outputRoot, STYLESHEET_PATH.slice(1));
      const font = path.join(outputRoot, FONT_PATH.slice(1));

      await expect(readFile(stylesheet, "utf8")).resolves.toContain(":root");
      expect((await stat(font)).size).toBeGreaterThan(0);
    } finally {
      await cleanup();
    }
  });
});

describe("BR11.3, BR11.2 — every page gets the treatment", () => {
  it("references the stylesheet and the font from every emitted page", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      await runChecks(optionsFor(outputRoot, path.join(dir, "m.json")));

      const pages = await htmlPages(outputRoot);

      // Home, Writing, Projects, About, 404, one post and one project: the
      // repository's own content tree, so this is the real page set rather
      // than a fixture's.
      expect(pages.length).toBeGreaterThanOrEqual(7);

      for (const page of pages) {
        const html = await readFile(path.join(outputRoot, page), "utf8");
        expect(html, `${page} has no stylesheet`).toContain(
          `rel="stylesheet" href="${STYLESHEET_PATH}"`,
        );
        expect(html, `${page} has no font preload`).toContain(
          `rel="preload" href="${FONT_PATH}"`,
        );
      }
    } finally {
      await cleanup();
    }
  });
});
