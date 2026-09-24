/**
 * CheckRunner — BR6.1 to BR6.5.
 */

import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  candidateTargets,
  checkBuiltOutput,
  formatCheckReport,
  isExternalLink,
  runChecks,
} from "../../src/check-runner.ts";
import type { CheckRunnerOptions } from "../../src/check-runner.ts";
import { buildSite } from "../../src/site-builder.ts";
import {
  TEST_BUILD_DATE,
  TEST_SITE,
  fixture,
  temporaryOutputRoot,
} from "./helpers.ts";

async function destination(): Promise<{
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
): CheckRunnerOptions {
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

describe("CheckRunner", () => {
  it("passes all three checks on a good site and reports all three together (BR6.1)", async () => {
    const { outputRoot, manifestPath, cleanup } = await destination();
    try {
      const report = await runChecks(
        optionsFor("valid-site", outputRoot, manifestPath),
      );

      expect(report.buildResult).toBe("pass");
      expect(report.pageCoverageResult).toBe("pass");
      expect(report.internalLinkResult).toBe("pass");
      expect(report.failures).toEqual([]);
      expect(report.blocking).toBe(false);

      const rendered = formatCheckReport(report);
      expect(rendered).toContain("1. The site builds");
      expect(rendered).toContain("2. Every content file produced a page");
      expect(rendered).toContain("3. Internal links resolve");
    } finally {
      await cleanup();
    }
  });

  it("records both other checks as not-run when the build failed, and blocks (BR6.5)", async () => {
    const { outputRoot, manifestPath, cleanup } = await destination();
    try {
      const report = await runChecks(
        optionsFor("broken-post", outputRoot, manifestPath),
      );

      expect(report.buildResult).toBe("fail");
      expect(report.pageCoverageResult).toBe("not-run");
      expect(report.internalLinkResult).toBe("not-run");

      // A not-run is never a pass. The run blocks on it.
      expect(report.blocking).toBe(true);
      expect(report.pageCoverageResult).not.toBe("pass");
      expect(
        report.failures.every((failure) => failure.check === "build"),
      ).toBe(true);
      // Every field error reaches the report, naming file and field.
      expect(report.failures.length).toBeGreaterThanOrEqual(2);
      expect(
        report.failures.some((failure) => failure.message.includes("[date]")),
      ).toBe(true);

      expect(formatCheckReport(report)).toContain("Blocking.");
    } finally {
      await cleanup();
    }
  });

  it("fails check 2 naming the source file when an output page went missing (BR6.2)", async () => {
    const { outputRoot, manifestPath, cleanup } = await destination();
    try {
      const manifest = await buildSite(
        optionsFor("valid-site", outputRoot, manifestPath),
      );

      // The site's most likely real failure: a build reports green while a post
      // silently did not survive into the output. Neither of the other two
      // checks would see it.
      await rm(path.join(outputRoot, "writing/first-post"), {
        recursive: true,
        force: true,
      });

      const results = await checkBuiltOutput(outputRoot, manifest);

      expect(results.pageCoverageResult).toBe("fail");
      const failure = results.failures.find(
        (entry) => entry.check === "page-coverage",
      );
      expect(failure?.message).toContain("content/posts/first-post/index.md");
    } finally {
      await cleanup();
    }
  });

  it("never reports a draft in check 2, because a draft has no manifest row (BR6.2, NFR10)", async () => {
    const { outputRoot, manifestPath, cleanup } = await destination();
    try {
      const report = await runChecks(
        optionsFor("with-draft", outputRoot, manifestPath),
      );

      expect(report.pageCoverageResult).toBe("pass");
      expect(report.failures).toEqual([]);
      expect(
        report.failures.some((failure) =>
          failure.message.includes("hidden-post"),
        ),
      ).toBe(false);
    } finally {
      await cleanup();
    }
  });

  it("fails check 3 naming the page and the dead target (BR6.3)", async () => {
    const { outputRoot, manifestPath, cleanup } = await destination();
    try {
      const report = await runChecks(
        optionsFor("dead-link", outputRoot, manifestPath),
      );

      expect(report.buildResult).toBe("pass");
      expect(report.internalLinkResult).toBe("fail");
      expect(report.blocking).toBe(true);

      const failure = report.failures.find(
        (entry) => entry.check === "internal-links",
      );
      expect(failure?.message).toContain("writing/linking-post/index.html");
      expect(failure?.message).toContain("/writing/no-such-post/");
    } finally {
      await cleanup();
    }
  });

  it("never checks an external link, so somebody else’s outage cannot block (BR6.4, NFR11)", async () => {
    const { outputRoot, manifestPath, cleanup } = await destination();
    try {
      const report = await runChecks(
        optionsFor("dead-link", outputRoot, manifestPath),
      );

      // The same fixture carries a link to a host that does not resolve. It is
      // never mentioned, because it is never checked.
      expect(
        report.failures.some((failure) =>
          failure.message.includes("this-host-does-not-resolve"),
        ),
      ).toBe(false);
    } finally {
      await cleanup();
    }
  });

  it("reports coverage and link failures from the same run together (BR6.1)", async () => {
    const { outputRoot, manifestPath, cleanup } = await destination();
    try {
      // Build a good site, then break it in two different ways at once: delete a
      // page the manifest recorded (check 2) and add a page with a dead internal
      // link (check 3).
      const manifest = await buildSite(
        optionsFor("valid-site", outputRoot, manifestPath),
      );
      await rm(path.join(outputRoot, "writing/first-post"), {
        recursive: true,
        force: true,
      });
      await writeFile(
        path.join(outputRoot, "stray.html"),
        '<a href="/nowhere/">gone</a>',
        "utf8",
      );

      const results = await checkBuiltOutput(outputRoot, manifest);

      expect(results.pageCoverageResult).toBe("fail");
      expect(results.internalLinkResult).toBe("fail");
      // Check 3 ran even though check 2 had already failed: stopping early would
      // hide the second set of failures and turn one fix cycle into two.
      expect(
        results.failures.some((failure) => failure.check === "page-coverage"),
      ).toBe(true);
      expect(
        results.failures.some((failure) => failure.check === "internal-links"),
      ).toBe(true);
    } finally {
      await cleanup();
    }
  });
});

describe("CheckRunner — link classification", () => {
  it("treats only same-site targets as internal (BR6.4)", () => {
    for (const href of [
      "https://example.com/",
      "http://example.com/",
      "mailto:someone@example.com",
      "//cdn.example.com/x.css",
    ]) {
      expect(isExternalLink(href)).toBe(true);
    }
    for (const href of ["/writing/", "diagram.png", "../projects/"]) {
      expect(isExternalLink(href)).toBe(false);
    }
  });

  it("resolves a site path to the files that could serve it", () => {
    expect(candidateTargets("index.html", "/writing/")).toEqual([
      "writing/index.html",
    ]);
    expect(
      candidateTargets("writing/a-post/index.html", "diagram.png"),
    ).toEqual(["writing/a-post/diagram.png"]);
    expect(candidateTargets("index.html", "/404.html")).toEqual(["404.html"]);
    expect(candidateTargets("index.html", "/about")).toEqual([
      "about/index.html",
      "about.html",
      "about",
    ]);
    // A fragment or query is not part of the target.
    expect(candidateTargets("index.html", "/writing/#top")).toEqual([
      "writing/index.html",
    ]);
    expect(candidateTargets("index.html", "#main")).toEqual([]);
  });
});
