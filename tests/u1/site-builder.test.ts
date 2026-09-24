/**
 * SiteBuilder — BR4.1 to BR4.5, plus BR1.7 and BR5.11 as they show up in output.
 *
 * The fail-loudly contract is the single most important behaviour in this unit,
 * so it is tested hard: every error reported, every error naming file and field,
 * and nothing whatsoever written when any error exists.
 */

import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { BuildFailedError } from "../../src/errors.ts";
import { type BuildOptions, buildSite } from "../../src/site-builder.ts";
import {
  TEST_BUILD_DATE,
  TEST_SITE,
  expectBuildFailure,
  fixture,
  temporaryOutputRoot,
} from "./helpers.ts";

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

/**
 * A temporary destination for one build.
 *
 * Both the output tree and the manifest go somewhere disposable: the real
 * `dist/` is never touched, and a fixture tree never gains a build record.
 */
async function build(): Promise<{
  outputRoot: string;
  manifestPath: string;
  cleanup: () => Promise<void>;
}> {
  const { dir, cleanup } = await temporaryOutputRoot();
  return {
    outputRoot: path.join(dir, "out"),
    manifestPath: path.join(dir, "build-manifest.json"),
    cleanup,
  };
}

function optionsFor(
  fixtureName: string,
  outputRoot: string,
  manifestPath: string,
): BuildOptions {
  return {
    repoRoot: fixture(fixtureName),
    outputRoot,
    manifestPath,
    site: TEST_SITE,
    homeIntro: "An intro.",
    buildDate: TEST_BUILD_DATE,
    startedAt: new Date("2026-09-23T09:00:00.000Z"),
  };
}

describe("SiteBuilder — a successful build", () => {
  it("writes every page type plus the sitemap, and records what it wrote (BR4.1)", async () => {
    const { outputRoot, manifestPath, cleanup } = await build();
    try {
      const manifest = await buildSite(
        optionsFor("valid-site", outputRoot, manifestPath),
      );

      for (const page of [
        "index.html",
        "writing/index.html",
        "writing/first-post/index.html",
        "projects/index.html",
        "projects/first-project/index.html",
        "about/index.html",
        "404.html",
        "sitemap.xml",
      ]) {
        expect(await exists(path.join(outputRoot, page))).toBe(true);
        expect(manifest.pagesWritten).toContain(page);
      }

      expect(manifest.sourceToOutput).toHaveLength(2);
      expect(await exists(manifestPath)).toBe(true);
    } finally {
      await cleanup();
    }
  });

  it("puts every sourceToOutput row’s page into pagesWritten as well (entities.md)", async () => {
    const { outputRoot, manifestPath, cleanup } = await build();
    try {
      const manifest = await buildSite(
        optionsFor("valid-site", outputRoot, manifestPath),
      );

      for (const row of manifest.sourceToOutput) {
        expect(manifest.pagesWritten).toContain(row.outputPath);
        expect(row.sourcePath.startsWith("content/")).toBe(true);
      }
    } finally {
      await cleanup();
    }
  });

  it("lists every published page in the sitemap and never the sitemap itself (BR5.11)", async () => {
    const { outputRoot, manifestPath, cleanup } = await build();
    try {
      await buildSite(optionsFor("valid-site", outputRoot, manifestPath));
      const sitemap = await readFile(
        path.join(outputRoot, "sitemap.xml"),
        "utf8",
      );

      expect(sitemap).toContain(
        "<loc>https://rue-asha.github.io/writing/first-post/</loc>",
      );
      expect(sitemap).toContain(
        "<loc>https://rue-asha.github.io/projects/first-project/</loc>",
      );
      expect(sitemap).not.toContain("sitemap.xml");
    } finally {
      await cleanup();
    }
  });

  it("copies an item’s assets beside its page (FA2, CA3)", async () => {
    const { outputRoot, manifestPath, cleanup } = await build();
    try {
      await buildSite(optionsFor("with-assets", outputRoot, manifestPath));

      // The body references `diagram.png` relatively, so it must land beside the
      // page for that link to resolve.
      expect(
        await exists(
          path.join(outputRoot, "writing/illustrated-post/diagram.png"),
        ),
      ).toBe(true);
    } finally {
      await cleanup();
    }
  });

  it("gives a draft no page, no sitemap entry and no manifest row (BR1.7)", async () => {
    const { outputRoot, manifestPath, cleanup } = await build();
    try {
      const manifest = await buildSite(
        optionsFor("with-draft", outputRoot, manifestPath),
      );
      const sitemap = await readFile(
        path.join(outputRoot, "sitemap.xml"),
        "utf8",
      );
      const writing = await readFile(
        path.join(outputRoot, "writing/index.html"),
        "utf8",
      );
      const home = await readFile(path.join(outputRoot, "index.html"), "utf8");

      expect(await exists(path.join(outputRoot, "writing/hidden-post"))).toBe(
        false,
      );
      expect(sitemap).not.toContain("hidden-post");
      expect(writing).not.toContain("hidden-post");
      expect(home).not.toContain("hidden-post");
      expect(
        manifest.sourceToOutput.some((row) =>
          row.sourcePath.includes("hidden-post"),
        ),
      ).toBe(false);

      // The published one is unaffected.
      expect(manifest.sourceToOutput).toHaveLength(1);
      expect(writing).toContain("published-post");
    } finally {
      await cleanup();
    }
  });
});

describe("SiteBuilder — the fail-loudly contract", () => {
  it("reports every field error in one build, not just the first (BR4.2)", async () => {
    const { outputRoot, manifestPath, cleanup } = await build();
    try {
      await expect(
        buildSite(optionsFor("broken-post", outputRoot, manifestPath)),
      ).rejects.toThrow(BuildFailedError);

      const error = await expectBuildFailure(
        buildSite(optionsFor("broken-post", outputRoot, manifestPath)),
      );

      // Two broken files, each with its own fault. Stopping at the first would
      // make fixing them a two-build exercise.
      expect(error.errors.length).toBeGreaterThanOrEqual(2);
      const paths = new Set(error.errors.map((fieldError) => fieldError.path));
      expect(paths).toContain("content/posts/no-date/index.md");
      expect(paths).toContain("content/posts/bad-date/index.md");
    } finally {
      await cleanup();
    }
  });

  it("names both the file and the field on every reported error (BR4.3)", async () => {
    const { outputRoot, manifestPath, cleanup } = await build();
    try {
      const error = await expectBuildFailure(
        buildSite(optionsFor("broken-project", outputRoot, manifestPath)),
      );

      expect(error.errors.length).toBeGreaterThan(0);
      for (const fieldError of error.errors) {
        expect(fieldError.path).toMatch(/^content\/.+\.md$/);
        expect(fieldError.field.length).toBeGreaterThan(0);
        expect(fieldError.message.length).toBeGreaterThan(0);
      }

      // The three missing required fields are all named.
      const fields = new Set(
        error.errors.map((fieldError) => fieldError.field),
      );
      expect(fields).toContain("type");
      expect(fields).toContain("tools");
      expect(fields).toContain("repo");
    } finally {
      await cleanup();
    }
  });

  it("writes nothing at all when any field error exists (BR4.4)", async () => {
    const { outputRoot, manifestPath, cleanup } = await build();
    try {
      await expect(
        buildSite(optionsFor("broken-post", outputRoot, manifestPath)),
      ).rejects.toThrow(BuildFailedError);

      // No page, no sitemap, no manifest — the output directory was never even
      // created.
      expect(await exists(outputRoot)).toBe(false);
      expect(await exists(manifestPath)).toBe(false);
    } finally {
      await cleanup();
    }
  });

  it("leaves a previously written output tree exactly as it was (BR4.5)", async () => {
    const { outputRoot, manifestPath, cleanup } = await build();
    try {
      // Stand in for the previously live site.
      await mkdir(path.join(outputRoot, "writing"), { recursive: true });
      await writeFile(
        path.join(outputRoot, "index.html"),
        "<p>the previous site</p>",
        "utf8",
      );

      await expect(
        buildSite(optionsFor("broken-post", outputRoot, manifestPath)),
      ).rejects.toThrow(BuildFailedError);

      expect(await readFile(path.join(outputRoot, "index.html"), "utf8")).toBe(
        "<p>the previous site</p>",
      );
      expect((await readdir(outputRoot)).sort()).toEqual([
        "index.html",
        "writing",
      ]);
    } finally {
      await cleanup();
    }
  });

  it("reports a structural fault from the load phase alongside field faults (BR1.2, BR4.2)", async () => {
    const { outputRoot, manifestPath, cleanup } = await build();
    try {
      const error = await expectBuildFailure(
        buildSite(optionsFor("malformed-structure", outputRoot, manifestPath)),
      );

      const fields = new Set(
        error.errors.map((fieldError) => fieldError.field),
      );
      expect(fields).toContain("index.md");
      expect(fields).toContain("slug");
      expect(fields).toContain("frontMatter");
      expect(fields).toContain("draft");
      expect(await exists(outputRoot)).toBe(false);
    } finally {
      await cleanup();
    }
  });
});
