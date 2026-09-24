#!/usr/bin/env node
/**
 * `npm run check` — the three blocking checks, in one command.
 *
 * Run this before every push, for content commits as well as code commits
 * (NFR9, `team.md` § Testing Posture). The publishing workflow runs the same
 * command as its remote backstop, so the local and remote check sets cannot
 * drift.
 *
 * Exits non-zero if any check failed. A `not-run` result is never a pass.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { formatCheckReport, runChecks } from "../src/check-runner.ts";
import { homeIntro, site } from "../site.config.ts";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const report = await runChecks({ repoRoot: REPO_ROOT, site, homeIntro });

console.log(formatCheckReport(report));
process.exitCode = report.blocking ? 1 : 0;
