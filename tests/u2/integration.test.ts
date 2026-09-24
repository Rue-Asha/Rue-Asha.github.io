/**
 * The spine, end to end — W1 to W5, BR8.2, BR4.4, BR4.5, NFR2, NFR9.
 *
 * Real fixture trees on disk, for the reason U1's suite gives: this build's whole
 * job is reading files and failing correctly on what it finds, so a mocked file
 * system would test the mock rather than the rule.
 */

import { cp, readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { type CheckRunnerOptions, runChecks } from "../../src/check-runner.ts";
import { FEED_OUTPUT_PATH } from "../../src/content-transforms.ts";
import { buildSite } from "../../src/site-builder.ts";
import {
  TEST_BUILD_DATE,
  TEST_SITE,
  expectBuildFailure,
  temporaryOutputRoot,
} from "../u1/helpers.ts";
import { entryId, feedEntries, fixture, readFeed } from "./helpers.ts";

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

/** Every file in a tree, as relative paths, with its bytes. */
async function snapshot(root: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  const walk = async (directory: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else {
        files.set(
          path.relative(root, absolute).split(path.sep).join("/"),
          await readFile(absolute, "base64"),
        );
      }
    }
  };

  await walk(root);
  return files;
}

describe("W4 — the feed is written, recorded, and carries no draft", () => {
  it("lists both published posts and neither the draft nor any body", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const manifest = await buildSite(
        optionsFor(fixture("feed-site"), outputRoot, path.join(dir, "m.json")),
      );

      // W4 step 5 — written to the output and recorded in the manifest.
      expect(manifest.pagesWritten).toContain(FEED_OUTPUT_PATH);

      const feed = await readFeed(outputRoot);
      const ids = feedEntries(feed).map(entryId);

      expect(ids).toEqual([
        "https://rue-asha.github.io/writing/newer-post/",
        "https://rue-asha.github.io/writing/older-post/",
      ]);
      // The draft is absent by construction rather than by a second rule: the
      // ordered post list never contained it (BR1.7).
      expect(feed).not.toContain("hidden-post");
      expect(feed).not.toContain("The hidden post");
      // Summaries travel; bodies do not (BR8.3).
      expect(feed).toContain("The more recent of the two published posts.");
      expect(feed).not.toContain("quintessence");
    } finally {
      await cleanup();
    }
  });
});

describe("BR8.2 — a misspelled fence label fails the build", () => {
  it("names the file and the language, writes nothing, and leaves the previous output byte-identical", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const manifestPath = path.join(dir, "m.json");
      const repoRoot = path.join(dir, "repo");

      // Start from a site that builds, and publish it.
      await cp(fixture("feed-site"), repoRoot, { recursive: true });
      await buildSite(optionsFor(repoRoot, outputRoot, manifestPath));
      const before = await snapshot(outputRoot);
      expect(before.size).toBeGreaterThan(0);

      // Now commit a post whose only fault is its fence label.
      const broken = path.join(repoRoot, "content/posts/typo-fence");
      await mkdir(broken, { recursive: true });
      await writeFile(
        path.join(broken, "index.md"),
        await readFile(
          path.join(
            fixture("unknown-fence"),
            "content/posts/typo-fence/index.md",
          ),
          "utf8",
        ),
        "utf8",
      );

      const error = await expectBuildFailure(
        buildSite(optionsFor(repoRoot, outputRoot, manifestPath)),
      );

      const named = error.errors.find(
        (fieldError) => fieldError.path === "content/posts/typo-fence/index.md",
      );
      expect(named?.field).toBe("body");
      expect(named?.message).toContain("rustlang");

      // Nothing at all was written, and the previously built site is untouched —
      // which is what leaves the previously live site serving (BR4.4, BR4.5).
      expect(await snapshot(outputRoot)).toEqual(before);
    } finally {
      await cleanup();
    }
  });
});

describe("W2 and W3 — a post page renders the whole Markdown set", () => {
  it("renders headings, links, lists, an image and a coloured fence, with no script anywhere", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      await buildSite(
        optionsFor(fixture("rich-post"), outputRoot, path.join(dir, "m.json")),
      );

      const page = await readFile(
        path.join(outputRoot, "writing/rich-post/index.html"),
        "utf8",
      );

      expect(page).toContain("<h2>A heading</h2>");
      expect(page).toContain('<a href="/writing/">an internal link</a>');
      expect(page).toContain("<li>a bullet</li>");
      expect(page).toContain("<li>a numbered step</li>");
      expect(page).toContain('alt="A diagram of the four build phases"');
      expect(page).toContain('class="tok-keyword"');
      expect(page).toContain('class="tok-comment"');
      // The unlabelled fence renders plain, beside the coloured one.
      expect(page).toContain("a &lt; b");

      // Nothing runs in the reader's browser, anywhere in the built output
      // (NFR2, NFR3). The policy carries `script-src 'none'`, so a script would
      // be dead markup as well as a broken promise.
      for (const [file, bytes] of await snapshot(outputRoot)) {
        if (!file.endsWith(".html")) continue;
        expect(Buffer.from(bytes, "base64").toString("utf8")).not.toContain(
          "<script",
        );
      }
    } finally {
      await cleanup();
    }
  });
});

describe("NFR9 — the built site passes all three checks", () => {
  it("passes, and the feed's discovery link resolves rather than breaking check 3", async () => {
    const { dir, cleanup } = await temporaryOutputRoot();
    try {
      const outputRoot = path.join(dir, "out");
      const report = await runChecks(
        optionsFor(fixture("feed-site"), outputRoot, path.join(dir, "m.json")),
      );

      expect(report.failures).toEqual([]);
      expect(report.blocking).toBe(false);

      // Check 3 reads `href` values out of every built page, and every page head
      // now carries `/feed.xml`. That makes a feed which failed to write a
      // blocking failure on every page — the closest thing to automated
      // verification the feed gets (U2CA4).
      const home = await readFile(path.join(outputRoot, "index.html"), "utf8");
      expect(home).toContain('href="/feed.xml"');
    } finally {
      await cleanup();
    }
  });
});
