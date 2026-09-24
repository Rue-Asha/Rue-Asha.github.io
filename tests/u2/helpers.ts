/**
 * Shared test helpers for U2.
 *
 * Only what U1's helpers do not already provide. `TEST_SITE`, `TEST_BUILD_DATE`,
 * `aPost`, `temporaryOutputRoot` and `expectBuildFailure` are imported from
 * `../u1/helpers.ts`; duplicating them here would let the two copies drift, and
 * the content-security-policy string in `TEST_SITE` is deliberately written out
 * so a drift from BR5.10 fails a test.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  FEED_OUTPUT_PATH,
  type FeedPost,
} from "../../src/content-transforms.ts";
import { postPath } from "../../src/page-renderer/shell.ts";
import type { Post } from "../../src/types.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path of a committed U2 fixture tree, used as a repository root. */
export function fixture(name: string): string {
  return path.join(HERE, "fixtures", name);
}

/**
 * The feed's entry shape for a post.
 *
 * `buildAtomFeed` takes the post's site path rather than deriving it, so
 * `ContentTransforms` holds no route knowledge and does not import
 * `PageRenderer` — which would be a cycle, since the shell already imports this
 * module. The mapping lives here and in SiteBuilder, both using `postPath`.
 */
export function aFeedPost(post: Post): FeedPost {
  return {
    title: post.title,
    summary: post.summary,
    date: post.date,
    path: postPath(post.slug),
  };
}

/** Read a built `feed.xml` out of an output tree. */
export async function readFeed(outputRoot: string): Promise<string> {
  return readFile(path.join(outputRoot, FEED_OUTPUT_PATH), "utf8");
}

/** The text of every `<entry>` in a feed document, in document order. */
export function feedEntries(feed: string): string[] {
  return [...feed.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(
    (match) => match[1] ?? "",
  );
}

/** The value of the first `<id>` inside one entry. */
export function entryId(entry: string): string {
  return /<id>([^<]*)<\/id>/.exec(entry)?.[1] ?? "";
}
