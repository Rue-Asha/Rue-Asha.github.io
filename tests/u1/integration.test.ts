/**
 * The spine, end to end — W1, W2, W4 and W7.
 *
 * These exercise the whole path from a file on disk to a written page, which is
 * what makes U1 a walking skeleton rather than a set of parts.
 */

import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { BuildFailedError } from "../../src/errors.ts";
import { type CheckRunnerOptions, runChecks } from "../../src/check-runner.ts";
import { buildSite } from "../../src/site-builder.ts";
import {
  TEST_BUILD_DATE,
  TEST_SITE,
  expectBuildFailure,
  fixture,
  temporaryOutputRoot,
} from "./helpers.ts";

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

describe("W1 and W2 — build the site, then check it", () => {
  it("builds a site, passes all three checks, and writes exactly what the manifest records", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const manifestPath = path.join(dir, "manifest.json");
      const options = optionsFor(
        fixture("valid-site"),
        outputRoot,
        manifestPath,
      );

      const report = await runChecks(options);
      expect(report.blocking).toBe(false);

      const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
        pagesWritten: string[];
        sourceToOutput: { sourcePath: string; outputPath: string }[];
      };

      for (const page of manifest.pagesWritten) {
        expect(
          await readFile(path.join(outputRoot, page), "utf8"),
        ).toBeTruthy();
      }
      for (const row of manifest.sourceToOutput) {
        expect(manifest.pagesWritten).toContain(row.outputPath);
      }
    } finally {
      await cleanup();
    }
  });
});

describe("W7 — a build fails on malformed content", () => {
  it("names the file and the field, and leaves the previously built site in place", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const manifestPath = path.join(dir, "manifest.json");
      const repoRoot = path.join(dir, "repo");

      // Start from a site that builds, and publish it.
      await cp(fixture("valid-site"), repoRoot, { recursive: true });
      await buildSite(optionsFor(repoRoot, outputRoot, manifestPath));
      const goodHome = await readFile(
        path.join(outputRoot, "index.html"),
        "utf8",
      );
      expect(goodHome).toContain("first-post");

      // Now commit a deliberately broken post, exactly as the walking skeleton's
      // proof requires.
      await mkdir(path.join(repoRoot, "content/posts/broken-on-purpose"), {
        recursive: true,
      });
      await writeFile(
        path.join(repoRoot, "content/posts/broken-on-purpose/index.md"),
        [
          "---",
          "title: A deliberately broken post",
          "summary: It has no date.",
          "---",
          "",
          "Body.",
        ].join("\n"),
        "utf8",
      );

      const error = await expectBuildFailure(
        buildSite(optionsFor(repoRoot, outputRoot, manifestPath)),
      );

      expect(error).toBeInstanceOf(BuildFailedError);
      const named = error.errors.find(
        (fieldError) =>
          fieldError.path === "content/posts/broken-on-purpose/index.md",
      );
      expect(named?.field).toBe("date");

      // The previously built site is untouched — which is what leaves the
      // previously live site serving.
      expect(await readFile(path.join(outputRoot, "index.html"), "utf8")).toBe(
        goodHome,
      );
    } finally {
      await cleanup();
    }
  });
});

describe("W4 — publish a draft", () => {
  it("removes a draft from every output, then publishes it at the same URL when the mark goes", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const manifestPath = path.join(dir, "manifest.json");
      const repoRoot = path.join(dir, "repo");
      await cp(fixture("valid-site"), repoRoot, { recursive: true });

      const draftPath = path.join(
        repoRoot,
        "content/posts/draft-post/index.md",
      );
      const withDraftMark = [
        "---",
        "title: A drafted post",
        "summary: Hidden until the mark comes off.",
        "date: 2026-04-01",
        "draft: true",
        "---",
        "",
        "Body.",
      ].join("\n");

      await mkdir(path.dirname(draftPath), { recursive: true });
      await writeFile(draftPath, withDraftMark, "utf8");

      const drafted = await buildSite(
        optionsFor(repoRoot, outputRoot, manifestPath),
      );
      const draftedWriting = await readFile(
        path.join(outputRoot, "writing/index.html"),
        "utf8",
      );
      const draftedHome = await readFile(
        path.join(outputRoot, "index.html"),
        "utf8",
      );
      const draftedSitemap = await readFile(
        path.join(outputRoot, "sitemap.xml"),
        "utf8",
      );

      // No page, no list entry, no Home entry, no sitemap entry, no manifest row.
      expect(draftedWriting).not.toContain("draft-post");
      expect(draftedHome).not.toContain("draft-post");
      expect(draftedSitemap).not.toContain("draft-post");
      expect(
        drafted.sourceToOutput.some((row) =>
          row.sourcePath.includes("draft-post"),
        ),
      ).toBe(false);
      expect(drafted.pagesWritten).not.toContain(
        "writing/draft-post/index.html",
      );

      // The only change: the draft line goes. The file does not move and is not
      // renamed.
      await writeFile(
        draftPath,
        withDraftMark.replace("draft: true\n", ""),
        "utf8",
      );

      const published = await buildSite(
        optionsFor(repoRoot, outputRoot, manifestPath),
      );
      const publishedWriting = await readFile(
        path.join(outputRoot, "writing/index.html"),
        "utf8",
      );
      const publishedSitemap = await readFile(
        path.join(outputRoot, "sitemap.xml"),
        "utf8",
      );

      // It appears at the URL it would always have had.
      expect(publishedWriting).toContain("/writing/draft-post/");
      expect(publishedSitemap).toContain(
        "https://rue-asha.github.io/writing/draft-post/",
      );
      expect(published.pagesWritten).toContain("writing/draft-post/index.html");
      expect(
        published.sourceToOutput.find((row) =>
          row.sourcePath.includes("draft-post"),
        )?.outputPath,
      ).toBe("writing/draft-post/index.html");

      const page = await readFile(
        path.join(outputRoot, "writing/draft-post/index.html"),
        "utf8",
      );
      expect(page).toContain("A drafted post");
    } finally {
      await cleanup();
    }
  });
});
