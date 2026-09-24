#!/usr/bin/env node
/**
 * `npm run build` — run the build once and report what it did.
 *
 * A build that found any field error prints every one of them, each naming the
 * file and the field, and exits non-zero having written nothing (BR4.2 to BR4.4).
 * Obtaining exactly that message is the reason this build exists instead of an
 * off-the-shelf generator (ADR-001).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { BuildFailedError, formatFieldError } from "../src/errors.ts";
import { buildSite } from "../src/site-builder.ts";
import { homeIntro, site } from "../site.config.ts";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

async function main(): Promise<number> {
  try {
    const manifest = await buildSite({ repoRoot: REPO_ROOT, site, homeIntro });
    console.log(
      `Built ${String(manifest.pagesWritten.length)} pages into ${manifest.outputRoot}/ ` +
        `(${String(manifest.sourceToOutput.length)} from content files).`,
    );
    return 0;
  } catch (cause) {
    if (cause instanceof BuildFailedError) {
      console.error(`${cause.message} Nothing was written.\n`);
      for (const error of cause.errors) {
        console.error(`  ${formatFieldError(error)}`);
      }
      console.error("");
      return 1;
    }
    console.error(
      cause instanceof Error ? (cause.stack ?? cause.message) : String(cause),
    );
    return 1;
  }
}

process.exitCode = await main();
