/**
 * ContentSource — the one component that knows about the file system, and the
 * one place the content-directory boundary is stated (ADR-007).
 *
 * It walks `content/posts/` and `content/projects/` and nothing else. That is
 * BR1.1, and it is what keeps `aidlc/` and `.claude/` out of the published
 * output by construction rather than by an ignore list somebody has to maintain
 * (FR1.6, constraint C2). This repository is both the Pages publish root and the
 * AI-DLC workspace, which is why that rule is load-bearing rather than tidy.
 *
 * It reports field errors and never decides what to do about them; only
 * SiteBuilder aborts (BR1.9, ADR-007).
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { CORE_SCHEMA, load as loadYaml } from "js-yaml";

import { fieldError } from "./errors.ts";
import { isValidSlug } from "./content-transforms.ts";
import type { ContentFile, ContentKind, FieldError } from "./types.ts";

/** The only directory ever read as a source of pages (BR1.1). */
export const CONTENT_ROOT = "content";

/** The two content kinds, and the directory each is derived from (BR1.3). */
const KIND_DIRECTORIES: ReadonlyArray<{
  directory: string;
  kind: ContentKind;
}> = [
  { directory: "posts", kind: "post" },
  { directory: "projects", kind: "project" },
];

/** The single content file inside an item directory. Everything else is an asset. */
const INDEX_FILE = "index.md";

export interface ContentSourceResult {
  /**
   * Every non-draft item found, in directory order.
   *
   * Drafts are absent because exclusion happens once, here, at the boundary —
   * no downstream consumer has to remember it (BR1.7).
   */
  readonly items: readonly ContentFile[];
  /** Every field error found during the load phase (BR1.2, BR1.4, BR1.5, BR1.6, BR1.9). */
  readonly errors: readonly FieldError[];
}

export interface LoadContentOptions {
  /**
   * Absolute path of the repository root. Every path in a `ContentFile` and in
   * every field error is expressed relative to it, because BR4.3 requires an
   * error to name a path the author can act on.
   */
  readonly repoRoot: string;
}

/** Turn an absolute path into the repository-relative, forward-slash form BR4.3 reports. */
function toRepoRelative(repoRoot: string, absolute: string): string {
  return path.relative(repoRoot, absolute).split(path.sep).join("/");
}

/**
 * Read a directory, distinguishing "it is not there" from "it could not be read".
 *
 * An absent `content/posts/` is the launch-day empty state BR5.5 exists for, not
 * an error. Any other failure is surfaced rather than swallowed: a permissions
 * fault that silently produced zero posts would be the exact silent-drop failure
 * this build is written to prevent.
 */
async function readDirectoryEntries(
  absolutePath: string,
  repoRoot: string,
  errors: FieldError[],
): Promise<{ name: string; isDirectory: boolean }[]> {
  try {
    const entries = await readdir(absolutePath, { withFileTypes: true });
    return entries.map((entry) => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
    }));
  } catch (cause) {
    if (isNotFound(cause)) return [];
    errors.push(
      fieldError(
        toRepoRelative(repoRoot, absolutePath),
        "directory",
        `could not be read: ${describeCause(cause)}`,
      ),
    );
    return [];
  }
}

function isNotFound(cause: unknown): boolean {
  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    (cause as { code?: unknown }).code === "ENOENT"
  );
}

function describeCause(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/**
 * Collect every file inside an item directory other than its `index.md`.
 *
 * Nesting below one level is not content: a directory inside an item directory
 * holds that item's assets, never a second item (`entities.md` § ContentFile
 * entity constraints). They are copied beside the item's page at write time and
 * referenced with relative links from the body (FA2, CA3).
 */
async function collectAssets(
  itemDirectory: string,
  repoRoot: string,
  errors: FieldError[],
): Promise<string[]> {
  const assets: string[] = [];

  const walk = async (directory: string): Promise<void> => {
    const entries = await readDirectoryEntries(directory, repoRoot, errors);
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory) {
        await walk(absolute);
      } else if (!(directory === itemDirectory && entry.name === INDEX_FILE)) {
        assets.push(toRepoRelative(repoRoot, absolute));
      }
    }
  };

  await walk(itemDirectory);
  return assets.sort((a, b) => a.localeCompare(b));
}

/**
 * Read the draft mark (BR1.6).
 *
 * Absent means not a draft. A `draft` key holding anything other than a boolean
 * is a field error rather than a coerced value: a coerced `draft: "false"` would
 * publish a post the author believes is hidden.
 */
function readDraftMark(
  frontMatter: Record<string, unknown>,
  relativePath: string,
): { isDraft: boolean; error?: FieldError } {
  if (!Object.hasOwn(frontMatter, "draft")) return { isDraft: false };

  const raw = frontMatter["draft"];
  if (typeof raw !== "boolean") {
    return {
      isDraft: false,
      error: fieldError(
        relativePath,
        "draft",
        `must be true or false, not ${JSON.stringify(raw)}. ` +
          "A non-boolean draft mark is rejected rather than coerced, because a coerced " +
          "value would publish an item the author believes is hidden.",
      ),
    };
  }

  return { isDraft: raw };
}

/**
 * The YAML engine gray-matter uses here, pinned to the core schema.
 *
 * This is not a preference. YAML's default schema resolves `2026-03-12` to a
 * date value and `2026-03-12 10:00:00` to a date value as well, which would hand
 * PostCatalog two indistinguishable objects and quietly destroy BR2.3 — the rule
 * that a value carrying a time is rejected. The core schema resolves neither,
 * so the authored text reaches the strict `YYYY-MM-DD` check exactly as written.
 */
const YAML_ENGINE = {
  parse: (input: string): object => {
    const parsed = loadYaml(input, { schema: CORE_SCHEMA });
    return typeof parsed === "object" && parsed !== null
      ? (parsed as object)
      : {};
  },
  stringify: (): string => {
    throw new Error("ContentSource never writes front matter.");
  },
};

/**
 * Split front matter from body and parse it (BR1.9).
 *
 * A block that cannot be parsed is a field error naming the file, never a
 * skipped file — a build that succeeds while dropping a post breaks the site's
 * only mandated publishing rule while reporting green.
 */
function parseFrontMatter(
  raw: string,
  relativePath: string,
): { frontMatter: Record<string, unknown>; body: string; error?: FieldError } {
  try {
    const parsed = matter(raw, { engines: { yaml: YAML_ENGINE } });
    const data = parsed.data as unknown;
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return {
        frontMatter: {},
        body: "",
        error: fieldError(
          relativePath,
          "frontMatter",
          "must be a block of key/value pairs.",
        ),
      };
    }
    return {
      frontMatter: data as Record<string, unknown>,
      body: parsed.content,
    };
  } catch (cause) {
    return {
      frontMatter: {},
      body: "",
      error: fieldError(
        relativePath,
        "frontMatter",
        `could not be parsed: ${describeCause(cause)}`,
      ),
    };
  }
}

/**
 * Load every item under `content/`, in the order W1 specifies.
 *
 * The ordering of the checks below is W1 steps 1 to 7 exactly, and it is
 * load-bearing rather than incidental. Slug validity and front-matter parsing
 * are checked before the draft mark is read, so a malformed draft is still an
 * error; slug uniqueness is checked after drafts are dropped, so a draft never
 * collides with a published item.
 */
export async function loadContent(
  options: LoadContentOptions,
): Promise<ContentSourceResult> {
  const { repoRoot } = options;
  const errors: FieldError[] = [];
  const items: ContentFile[] = [];

  for (const { directory, kind } of KIND_DIRECTORIES) {
    // W1 step 1 — walk only `content/`, one level deep (BR1.1).
    const kindRoot = path.join(repoRoot, CONTENT_ROOT, directory);
    const entries = await readDirectoryEntries(kindRoot, repoRoot, errors);

    for (const entry of entries) {
      if (!entry.isDirectory) continue;

      const itemDirectory = path.join(kindRoot, entry.name);
      const relativeDirectory = toRepoRelative(repoRoot, itemDirectory);
      const indexPath = path.join(itemDirectory, INDEX_FILE);
      const relativeIndexPath = toRepoRelative(repoRoot, indexPath);

      // W1 step 2 — an item is a directory containing an `index.md` (BR1.2).
      let rawContent: string;
      try {
        const indexStat = await stat(indexPath);
        if (!indexStat.isFile()) {
          errors.push(
            fieldError(
              relativeDirectory,
              INDEX_FILE,
              "exists but is not a file.",
            ),
          );
          continue;
        }
        rawContent = await readFile(indexPath, "utf8");
      } catch (cause) {
        errors.push(
          fieldError(
            relativeDirectory,
            INDEX_FILE,
            isNotFound(cause)
              ? "is missing. Every item directory must contain an index.md."
              : `could not be read: ${describeCause(cause)}`,
          ),
        );
        continue;
      }

      // W1 steps 3 — kind is derived, never declared (BR1.3); slug is the item
      // directory's own name and must already be canonical (BR1.4, NFR8).
      const slug = entry.name;
      if (!isValidSlug(slug)) {
        errors.push(
          fieldError(
            relativeDirectory,
            "slug",
            "must be lowercase, kebab-case, ASCII only — it is the published URL " +
              "segment and never changes once live.",
          ),
        );
        continue;
      }

      // W1 step 4 — split and parse the front matter (BR1.9).
      const parsed = parseFrontMatter(rawContent, relativeIndexPath);
      if (parsed.error) {
        errors.push(parsed.error);
        continue;
      }

      // W1 step 5 — read the draft mark (BR1.6).
      const draft = readDraftMark(parsed.frontMatter, relativeIndexPath);
      if (draft.error) {
        errors.push(draft.error);
        continue;
      }

      // W1 step 6 — drop every draft from everything downstream (BR1.7).
      if (draft.isDraft) continue;

      const assets = await collectAssets(itemDirectory, repoRoot, errors);

      items.push({
        path: relativeIndexPath,
        directory: relativeDirectory,
        kind,
        slug,
        frontMatter: parsed.frontMatter,
        body: parsed.body,
        isDraft: false,
        assets,
      });
    }
  }

  // W1 step 7 — slug uniqueness within a kind (BR1.5). Letting one silently win
  // would publish one of two posts and say nothing.
  errors.push(...findDuplicateSlugs(items));

  return { items, errors };
}

/**
 * Report every slug shared by two items of the same kind, naming both
 * directories (BR1.5).
 *
 * Exported because it cannot be reached from a fixture: a slug is its own
 * directory name, so two same-kind items sharing one would have to be the same
 * directory. The rule is still implemented and still tested — it is the guard
 * that stays correct if a future change ever lets a slug be declared rather than
 * derived.
 */
export function findDuplicateSlugs(
  items: readonly ContentFile[],
): FieldError[] {
  const seen = new Map<string, ContentFile[]>();
  for (const item of items) {
    const key = `${item.kind}:${item.slug}`;
    const group = seen.get(key);
    if (group) group.push(item);
    else seen.set(key, [item]);
  }

  const errors: FieldError[] = [];
  for (const group of seen.values()) {
    if (group.length < 2) continue;
    const directories = group
      .map((item) => item.directory)
      .sort((a, b) => a.localeCompare(b));
    for (const item of group) {
      errors.push(
        fieldError(
          item.directory,
          "slug",
          `is used by more than one ${item.kind}: ${directories.join(", ")}. ` +
            "Two items of the same kind may not share a slug, because the slug is the URL.",
        ),
      );
    }
  }
  return errors;
}

/** Select the items of one kind. Used by the two catalogues (W1 step 8). */
export function itemsOfKind(
  items: readonly ContentFile[],
  kind: ContentKind,
): readonly ContentFile[] {
  return items.filter((item) => item.kind === kind);
}
