/**
 * The About page against a real build — BR10.3, BR10.2, NFR1, NFR2, NFR9.
 *
 * **These two tests are the only automated check standing behind BR10.3.**
 * `functional-spec.md` says so outright: check 2 of the pre-push set matches
 * output pages against content files, and About has no content file by design
 * (BR10.1), so a build that silently stopped emitting About would register
 * nowhere else in this repository.
 *
 * Real fixture trees on disk and a real temporary output root, for the reason
 * U1's, U2's and U3's suites give: this build's whole job is reading files and
 * writing what it finds, so a mocked file system would test the mock rather
 * than the rule. `temporaryOutputRoot()` uses the OS temp directory — nothing
 * is written inside the repository.
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
import { anchorFor, fixture, mainParagraphs } from "./helpers.ts";

const ABOUT_OUTPUT_PATH = "about/index.html";
const GITHUB_HREF = "https://github.com/Rue-Asha";
const EMAIL_HREF = "mailto:rue.asha@proton.me";

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

describe("BR10.3 — About is emitted on every build", () => {
  it("writes about/index.html from a content tree holding no projects at all", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const manifest = await buildSite(
        optionsFor(
          fixture("minimal-site"),
          outputRoot,
          path.join(dir, "m.json"),
        ),
      );

      // Unconditional: the page is not derived from content, so no missing or
      // malformed content file can make it disappear. The fixture deliberately
      // supplies nothing About could be mistaken for depending on.
      expect(manifest.pagesWritten).toContain(ABOUT_OUTPUT_PATH);
      expect(
        manifest.sourceToOutput.filter((row) => row.kind === "project"),
      ).toEqual([]);
      expect(
        manifest.sourceToOutput.some(
          (row) => row.outputPath === ABOUT_OUTPUT_PATH,
        ),
      ).toBe(false);

      // And the file is really on disk, not merely named in the manifest.
      await expect(page(outputRoot, ABOUT_OUTPUT_PATH)).resolves.toContain(
        "<h1>About</h1>",
      );
    } finally {
      await cleanup();
    }
  });
});

describe("BR10.3, BR10.2 — the written file carries the prose and both links", () => {
  it("serves a complete About page, and the site still passes all three checks", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const report = await runChecks(
        optionsFor(
          fixture("minimal-site"),
          outputRoot,
          path.join(dir, "m.json"),
        ),
      );

      expect(report.failures).toEqual([]);
      expect(report.blocking).toBe(false);

      const about = await page(outputRoot, ABOUT_OUTPUT_PATH);

      // Asserted against the artefact a reader receives rather than against the
      // function's return value: NFR1 and NFR2 require the page to be complete
      // in the served HTML, with nothing assembled in the browser.
      expect(mainParagraphs(about).length).toBeGreaterThanOrEqual(4);
      expect(anchorFor(about, GITHUB_HREF)?.accessibleName).toBe(
        "Rue Asha on GitHub",
      );
      expect(anchorFor(about, EMAIL_HREF)?.accessibleName).toBe(
        "rue.asha@proton.me",
      );

      // FR4.5 — one click from anywhere, including Home. Check 3 would already
      // have failed on a dead `/about/` link; this is the same property stated
      // from the reader's side.
      expect(await page(outputRoot, "index.html")).toContain('href="/about/"');
    } finally {
      await cleanup();
    }
  });
});
