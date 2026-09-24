/**
 * SiteBuilder — the build. Orders the work, fails loudly, and writes the output
 * (BR4.1 to BR4.5, BR5.11).
 *
 * The fail-loudly contract is the single most important behaviour in this unit,
 * and ADR-001 rejected every off-the-shelf generator to obtain it: a build with
 * any field error reports **every** error, each naming the item's
 * repository-relative path and the offending field name, and writes **nothing at
 * all** — no page, no sitemap, no manifest — leaving any previously written
 * output untouched.
 *
 * That last property is why rendering happens entirely in memory before a single
 * byte is written. By the time the write phase starts, every content fault has
 * already been found, so failure is only reachable before anything is written.
 */

import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import { BuildFailedError, fieldError } from "./errors.ts";
import {
  FEED_OUTPUT_PATH,
  SITEMAP_OUTPUT_PATH,
  buildAtomFeed,
  buildSitemap,
} from "./content-transforms.ts";
import { itemsOfKind, loadContent } from "./content-source.ts";
import { buildPostCatalog } from "./post-catalog.ts";
import { buildProjectCatalog } from "./project-catalog.ts";
import {
  createMarkupRenderer,
  unknownFenceLanguages,
} from "./markup-renderer.ts";
import {
  type PageContext,
  type PageDefinition,
  postOutputPath,
  postPath,
  projectOutputPath,
  renderDocument,
} from "./page-renderer/shell.ts";
import {
  renderAbout,
  renderHome,
  renderNotFound,
  renderPost,
  renderProject,
  renderProjects,
  renderWriting,
} from "./page-renderer/pages.ts";
import type {
  BuildManifest,
  ContentFile,
  FieldError,
  SourceOutputRow,
  SiteMetadata,
} from "./types.ts";

/** Where the build writes, relative to the repository root (CA1). */
export const DEFAULT_OUTPUT_ROOT = "dist";

/**
 * Where the build manifest is recorded.
 *
 * Outside the output tree on purpose: the manifest is a build record, not a page,
 * and writing it into `dist/` would publish it at a real URL.
 */
export const MANIFEST_PATH = ".build/build-manifest.json";

/**
 * The generator's own static assets — the stylesheet and the self-hosted font
 * (U5). Copied into the output root under {@link ASSETS_OUTPUT_DIR}, structure
 * preserved, so the paths the page head references exist in the built site.
 *
 * Resolved from this module rather than from `repoRoot` on purpose: these files
 * belong to the site generator, not to a content tree. Deriving them from
 * `repoRoot` would mean a build of any other tree — every fixture in the test
 * suite — emitted pages linking a stylesheet that was never copied, which is
 * exactly the fault the integration tests exist to catch.
 */
export const ASSETS_SOURCE_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "assets",
);

/** Where those assets land in the output, and what the head's paths start with. */
export const ASSETS_OUTPUT_DIR = "assets";

export interface BuildOptions {
  /** Absolute path of the repository root. */
  readonly repoRoot: string;
  /** Absolute path of the directory to write to. Defaults to `<repoRoot>/dist`. */
  readonly outputRoot?: string;
  /**
   * Absolute path of the build-manifest file. Defaults to
   * `<repoRoot>/.build/build-manifest.json`.
   *
   * Configurable so a test can build a committed fixture tree without writing a
   * build record into it.
   */
  readonly manifestPath?: string;
  readonly site: SiteMetadata;
  /** The sentence Home shows under the site name. */
  readonly homeIntro: string;
  /**
   * The build's own date, `YYYY-MM-DD`. Injected rather than read from a clock so
   * a test suite does not start failing on 1 January (BR3.2 bounds `year` at the
   * build's own year plus one).
   */
  readonly buildDate?: string;
  /** The build's start timestamp. Injected for the same reason. */
  readonly startedAt?: Date;
}

/** Today's date in UTC, as `YYYY-MM-DD`. */
export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** One rendered page, held in memory until the whole site has rendered. */
interface RenderedPage {
  readonly outputPath: string;
  readonly html: string;
}

/**
 * Every code fence naming a language the highlighter does not know (BR8.2).
 *
 * This runs in the **validate** phase rather than inside `MarkupRenderer`, even
 * though BR8.2's `applies_to` names the renderer. The phases run in a fixed order
 * (BR4.1) and validation aborts before anything renders, so a fence fault raised
 * during rendering could only ever be reported in a run where no front-matter
 * error existed: a post with both a missing date and a typo'd fence label would
 * report the date, be fixed, rebuilt, and only then report the fence. That is two
 * fix cycles for one broken file, and it contradicts BR4.2 — one build reports
 * every field error. `MarkupRenderer` owns the predicate; this owns when it runs.
 *
 * It reaches project bodies as well as post bodies (U2CA2). `MarkupRenderer` is
 * one shared boundary (ADR-003) and the rule's trigger is "rendering a fenced
 * code block", not "rendering a post"; splitting the behaviour by kind would put
 * two answers behind one rule.
 */
function fenceLanguageErrors(items: readonly ContentFile[]): FieldError[] {
  const errors: FieldError[] = [];

  for (const item of items) {
    for (const language of unknownFenceLanguages(item.body)) {
      errors.push(
        fieldError(
          item.path,
          "body",
          `has a code fence labelled "${language}", which names no language the ` +
            "highlighter has a grammar for. An unlabelled fence renders as plain code; " +
            "a labelled one is a promise the label is real, and a misspelled label is " +
            "always a mistake (BR8.2).",
        ),
      );
    }
  }

  return errors;
}

/**
 * Run the build.
 *
 * Phases run in the fixed order BR4.1 states — load, validate, render, write —
 * and validation is a phase of this build rather than a separate command. There
 * is no way to invoke a build that skips it, which is the precise failure
 * ADR-004 rejected.
 *
 * @throws BuildFailedError when any field error exists. Nothing is written.
 */
export async function buildSite(options: BuildOptions): Promise<BuildManifest> {
  const repoRoot = options.repoRoot;
  const outputRoot =
    options.outputRoot ?? path.join(repoRoot, DEFAULT_OUTPUT_ROOT);
  const startedAt = options.startedAt ?? new Date();
  const buildDate = options.buildDate ?? todayIso(startedAt);
  const context: PageContext = { site: options.site, buildDate };

  // ---- Phase 1: load -----------------------------------------------------
  const loaded = await loadContent({ repoRoot });

  // ---- Phase 2: validate -------------------------------------------------
  const postFiles = itemsOfKind(loaded.items, "post");
  const projectFiles = itemsOfKind(loaded.items, "project");
  const postCatalog = buildPostCatalog(postFiles, { buildDate });
  const projectCatalog = buildProjectCatalog(projectFiles, { buildDate });

  const errors: FieldError[] = [
    ...loaded.errors,
    ...postCatalog.errors,
    ...projectCatalog.errors,
    ...fenceLanguageErrors(loaded.items),
  ];

  if (errors.length > 0) {
    // Abort before the render phase. No page, no sitemap, no manifest, and any
    // previously written output is left exactly as it was — which is what leaves
    // the previously live site serving (BR4.4, BR4.5).
    throw new BuildFailedError(errors);
  }

  // ---- Phase 3: render ---------------------------------------------------
  const markup = await createMarkupRenderer();
  const pages: RenderedPage[] = [];
  const sourceToOutput: SourceOutputRow[] = [];

  const emit = (page: PageDefinition): void => {
    pages.push({
      outputPath: page.outputPath,
      html: renderDocument(page, context),
    });
  };

  emit(
    renderHome(
      postCatalog.posts,
      projectCatalog.projects,
      options.site.siteName,
      options.homeIntro,
    ),
  );
  emit(renderWriting(postCatalog.posts));
  emit(renderProjects(projectCatalog.projects));
  emit(renderAbout(options.site.siteName));
  emit(renderNotFound());

  for (const post of postCatalog.posts) {
    emit(renderPost(post, await markup.render(post.body)));
    sourceToOutput.push({
      sourcePath: post.sourcePath,
      outputPath: postOutputPath(post.slug),
      kind: "post",
    });
  }

  for (const project of projectCatalog.projects) {
    emit(renderProject(project, await markup.render(project.body)));
    sourceToOutput.push({
      sourcePath: project.sourcePath,
      outputPath: projectOutputPath(project.slug),
      kind: "project",
    });
  }

  // W4 step 5 — the feed is written to the output and recorded in the manifest.
  // It is built after the pages have rendered, and therefore inside the same
  // in-memory set: writing still happens only once every page has rendered
  // successfully, so the fail-loudly contract is unchanged (BR4.4).
  //
  // The post's site path is supplied rather than derived inside
  // `ContentTransforms`, which holds no route knowledge — `postPath` stays the
  // one definition of where a post lives.
  const feed = buildAtomFeed(
    options.site,
    postCatalog.posts.map((post) => ({
      title: post.title,
      summary: post.summary,
      date: post.date,
      path: postPath(post.slug),
    })),
    buildDate,
  );
  pages.push({ outputPath: FEED_OUTPUT_PATH, html: feed });

  // BR5.11 — every page in `pagesWritten` except the sitemap itself. Drafts have
  // no page and therefore no entry, which follows from BR1.7 rather than being
  // re-decided here.
  //
  // Read literally, that puts the feed in the sitemap, because the feed is in
  // `pagesWritten` and the sitemap excludes only itself. This plan follows the
  // rule literally rather than quietly narrowing it — the same choice U1 made for
  // `/404.html`, for the same reason: a Construction artifact is the wrong place
  // to reverse an approved rule on taste. Both cases are one condition of the
  // same one-line change here if Build and Test decides BR5.11 is meant to list
  // pages only.
  const sitemap = buildSitemap(
    options.site.baseUrl,
    pages.map((page) => page.outputPath),
  );
  pages.push({ outputPath: SITEMAP_OUTPUT_PATH, html: sitemap });

  const manifest: BuildManifest = {
    buildId: randomUUID(),
    outputRoot:
      path.relative(repoRoot, outputRoot).split(path.sep).join("/") || ".",
    pagesWritten: pages.map((page) => page.outputPath),
    sourceToOutput,
    startedAt: startedAt.toISOString(),
  };

  // ---- Phase 4: write ----------------------------------------------------
  await writeOutput({
    repoRoot,
    outputRoot,
    manifestPath: options.manifestPath ?? path.join(repoRoot, MANIFEST_PATH),
    pages,
    items: loaded.items,
    manifest,
  });

  return manifest;
}

interface WriteOutputOptions {
  readonly repoRoot: string;
  readonly outputRoot: string;
  readonly manifestPath: string;
  readonly pages: readonly RenderedPage[];
  readonly items: readonly ContentFile[];
  readonly manifest: BuildManifest;
}

/**
 * Write the rendered site.
 *
 * The output directory is replaced rather than merged, so a page deleted from
 * `content/` stops being served. This happens only after every page has rendered
 * successfully, so a content fault can never leave a half-written tree behind.
 */
async function writeOutput(options: WriteOutputOptions): Promise<void> {
  const { repoRoot, outputRoot, manifestPath, pages, items, manifest } =
    options;

  try {
    await rm(outputRoot, { recursive: true, force: true });
    await mkdir(outputRoot, { recursive: true });

    for (const page of pages) {
      const destination = path.join(outputRoot, page.outputPath);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, page.html, "utf8");
    }

    // The stylesheet and the font (U5). Copied in the write phase, after
    // validation, so a content fault still stops the build before anything is
    // written (U5CA6). A failure here throws and is surfaced by the catch
    // below: a site published without its stylesheet is a visible fault, and a
    // silent one would leave every page unstyled with nothing to say so.
    await cp(ASSETS_SOURCE_DIR, path.join(outputRoot, ASSETS_OUTPUT_DIR), {
      recursive: true,
    });

    // Copy each item's assets beside its page (FA2, CA3). A relative link from
    // a post body therefore resolves in the built output exactly as it does in
    // the source directory.
    for (const item of items) {
      const pageDirectory = path.dirname(
        path.join(
          outputRoot,
          item.kind === "post"
            ? postOutputPath(item.slug)
            : projectOutputPath(item.slug),
        ),
      );
      for (const asset of item.assets) {
        const relative = path.relative(item.directory, asset);
        const destination = path.join(pageDirectory, relative);
        await mkdir(path.dirname(destination), { recursive: true });
        await cp(path.join(repoRoot, asset), destination);
      }
    }

    // The published tree is an artifact, not a Jekyll source. GitHub Pages serves
    // `/404.html` for any unmatched path with no further configuration, which is
    // what makes BR5.6's page the site's own rather than the platform's default.
    await writeFile(path.join(outputRoot, ".nojekyll"), "", "utf8");

    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(
      manifestPath,
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );
  } catch (cause) {
    // A write failure is an infrastructure fault rather than a content fault, and
    // it is out of this unit's scope to recover from. It is surfaced loudly: the
    // half-written output is simply never deployed.
    throw new Error(
      `The site failed to write to ${outputRoot}: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
}
