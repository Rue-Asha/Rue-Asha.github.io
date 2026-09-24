/**
 * CheckRunner — one command, all three blocking checks, reported together
 * (BR6.1 to BR6.5).
 *
 * This is what the author runs before a push and what the publishing workflow
 * runs as its remote backstop. One runner, so the local and remote check sets
 * cannot drift (ADR-004).
 *
 * The one thing to notice: **check 3 runs even when check 2 already failed.**
 * Stopping early would hide the second set of failures and turn one fix cycle
 * into two.
 */

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { BuildFailedError, formatFieldError } from "./errors.ts";
import {
  type BuildOptions,
  DEFAULT_OUTPUT_ROOT,
  buildSite,
} from "./site-builder.ts";
import type {
  BuildManifest,
  CheckFailure,
  CheckReport,
  CheckResult,
} from "./types.ts";

export type CheckRunnerOptions = BuildOptions;

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

/** Every `.html` file in the built output, as output-relative paths. */
async function htmlPages(outputRoot: string): Promise<string[]> {
  const found: string[] = [];

  const walk = async (directory: string): Promise<void> => {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
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

/** `href` and `src` values, in document order, from one page's markup. */
function extractLinks(html: string): string[] {
  const links: string[] = [];
  const pattern = /(?:href|src)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    if (match[1] !== undefined) links.push(match[1]);
  }
  return links;
}

/**
 * True when a link's target is not on this site (BR6.4).
 *
 * External links are never checked, at all, on the publish path. A dead
 * third-party URL is somebody else's outage, and failing on it would stop this
 * site publishing because an unrelated website went down (NFR11).
 */
export function isExternalLink(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//");
}

/**
 * The files any one of which would satisfy an internal link.
 *
 * A site path can be served by more than one file — `/writing/` by
 * `writing/index.html`, `/404.html` by itself — so the check asks whether any
 * candidate exists rather than guessing one.
 */
export function candidateTargets(pagePath: string, href: string): string[] {
  const withoutFragment = href.split("#")[0]?.split("?")[0] ?? "";
  if (withoutFragment === "") return [];

  const base = withoutFragment.startsWith("/")
    ? withoutFragment.slice(1)
    : path.posix.join(path.posix.dirname(pagePath), withoutFragment);

  const normalised = path.posix.normalize(base);
  if (normalised.startsWith("..")) return [];

  if (normalised === "" || normalised === "." || normalised.endsWith("/")) {
    return [path.posix.join(normalised, "index.html")];
  }
  if (path.posix.extname(normalised) !== "") return [normalised];
  return [`${normalised}/index.html`, `${normalised}.html`, normalised];
}

/** Check 2 — every non-draft item produced an output page (BR6.2, NFR10). */
async function runPageCoverage(
  outputRoot: string,
  manifest: BuildManifest,
): Promise<CheckFailure[]> {
  const failures: CheckFailure[] = [];

  for (const row of manifest.sourceToOutput) {
    // Drafts have no row, so they are never reported here — which is how check 2
    // ignores them entirely without needing a second draft rule.
    if (!(await exists(path.join(outputRoot, row.outputPath)))) {
      failures.push({
        check: "page-coverage",
        message: `${row.sourcePath} produced no output page (expected ${row.outputPath}).`,
      });
    }
  }

  return failures;
}

/** Check 3 — every internal link in the built output resolves (BR6.3). */
async function runInternalLinks(outputRoot: string): Promise<CheckFailure[]> {
  const failures: CheckFailure[] = [];
  const pages = await htmlPages(outputRoot);

  for (const pagePath of pages) {
    let html: string;
    try {
      html = await readFile(path.join(outputRoot, pagePath), "utf8");
    } catch (cause) {
      failures.push({
        check: "internal-links",
        message: `${pagePath} could not be read: ${cause instanceof Error ? cause.message : String(cause)}`,
      });
      continue;
    }

    for (const href of extractLinks(html)) {
      if (isExternalLink(href) || href.startsWith("#")) continue;

      const candidates = candidateTargets(pagePath, href);
      if (candidates.length === 0) continue;

      let resolved = false;
      for (const candidate of candidates) {
        if (await exists(path.join(outputRoot, candidate))) {
          resolved = true;
          break;
        }
      }

      if (!resolved) {
        failures.push({
          check: "internal-links",
          message: `${pagePath} links to "${href}", which resolves to no page in the built output.`,
        });
      }
    }
  }

  return failures;
}

export interface OutputCheckResults {
  readonly pageCoverageResult: CheckResult;
  readonly internalLinkResult: CheckResult;
  readonly failures: readonly CheckFailure[];
}

/**
 * Checks 2 and 3, run against a built output tree.
 *
 * Separated from {@link runChecks} because these two are the only checks that
 * read what is on disk rather than producing it — which is also what makes them
 * testable against a tree that has been deliberately damaged.
 *
 * Check 3 runs unconditionally, whether or not check 2 passed (BR6.1).
 */
export async function checkBuiltOutput(
  outputRoot: string,
  manifest: BuildManifest,
): Promise<OutputCheckResults> {
  const coverageFailures = await runPageCoverage(outputRoot, manifest);
  const linkFailures = await runInternalLinks(outputRoot);

  return {
    pageCoverageResult: coverageFailures.length === 0 ? "pass" : "fail",
    internalLinkResult: linkFailures.length === 0 ? "pass" : "fail",
    failures: [...coverageFailures, ...linkFailures],
  };
}

/**
 * Run all three checks and report every failure together.
 *
 * A `not-run` result occurs only when the build failed, and it is never treated
 * as a pass (BR6.5). An advisory check is a check that gets ignored on the day
 * it matters.
 */
export async function runChecks(
  options: CheckRunnerOptions,
): Promise<CheckReport> {
  const outputRoot =
    options.outputRoot ?? path.join(options.repoRoot, DEFAULT_OUTPUT_ROOT);
  const failures: CheckFailure[] = [];

  // ---- Check 1: the build ------------------------------------------------
  let manifest: BuildManifest;
  try {
    manifest = await buildSite(options);
  } catch (cause) {
    if (cause instanceof BuildFailedError) {
      for (const error of cause.errors) {
        failures.push({ check: "build", message: formatFieldError(error) });
      }
    } else {
      failures.push({
        check: "build",
        message: cause instanceof Error ? cause.message : String(cause),
      });
    }

    return {
      buildId: randomUUID(),
      buildResult: "fail",
      // Both read the manifest, which a failed build never wrote.
      pageCoverageResult: "not-run",
      internalLinkResult: "not-run",
      failures,
      blocking: true,
    };
  }

  // ---- Checks 2 and 3 ----------------------------------------------------
  const output = await checkBuiltOutput(outputRoot, manifest);
  failures.push(...output.failures);

  return {
    buildId: manifest.buildId,
    buildResult: "pass",
    pageCoverageResult: output.pageCoverageResult,
    internalLinkResult: output.internalLinkResult,
    failures,
    blocking:
      output.pageCoverageResult === "fail" ||
      output.internalLinkResult === "fail",
  };
}

/** Render a report for a terminal, showing all three outcomes together (BR6.1). */
export function formatCheckReport(report: CheckReport): string {
  const lines = [
    `1. The site builds ......................... ${report.buildResult}`,
    `2. Every content file produced a page ...... ${report.pageCoverageResult}`,
    `3. Internal links resolve .................. ${report.internalLinkResult}`,
  ];

  if (report.failures.length > 0) {
    lines.push("", `${String(report.failures.length)} failure(s):`);
    for (const failure of report.failures) {
      lines.push(`  [${failure.check}] ${failure.message}`);
    }
  }

  lines.push(
    "",
    report.blocking
      ? "Blocking. Fix the failures above before pushing."
      : "All three checks passed.",
  );

  return lines.join("\n");
}
