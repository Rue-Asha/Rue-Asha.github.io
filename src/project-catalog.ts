/**
 * ProjectCatalog — what a project is, and what order projects come in
 * (BR3.1 to BR3.7).
 *
 * Six required fields, two optional ones whose absence means different things,
 * and one total ordering. As with PostCatalog it reports field errors and never
 * acts on them.
 */

import { fieldError } from "./errors.ts";
import {
  deriveSummary,
  parseIsoDate,
  sortProjects,
} from "./content-transforms.ts";
import type { ContentFile, FieldError, Project } from "./types.ts";

export interface ProjectCatalogResult {
  /** Ordered featured-first, then year descending, then slug ascending (BR3.7). */
  readonly projects: readonly Project[];
  readonly errors: readonly FieldError[];
}

export interface ProjectCatalogOptions {
  /** The build's own date, `YYYY-MM-DD`, injected rather than read from a clock. */
  readonly buildDate: string;
}

/** `entities.md` § Project — the earliest year a project may declare. */
const MIN_YEAR = 1970;

/**
 * The plain-text members of BR3.1's six required fields.
 *
 * `summary`, `year`, `tools` and `repo` are the other four; each has its own
 * shape rule and so its own check below. All six are reported together.
 */
const REQUIRED_TEXT_FIELDS = ["name", "type"] as const;

function requireText(
  frontMatter: Readonly<Record<string, unknown>>,
  field: string,
  sourcePath: string,
): { value: string } | { error: FieldError } {
  const raw = frontMatter[field];
  if (raw === undefined || raw === null) {
    return {
      error: fieldError(sourcePath, field, "is required and is absent."),
    };
  }
  if (typeof raw !== "string") {
    return {
      error: fieldError(sourcePath, field, `must be text, not ${typeof raw}.`),
    };
  }
  const value = raw.trim();
  if (value === "") {
    return {
      error: fieldError(sourcePath, field, "is required and is empty."),
    };
  }
  return { value };
}

/** `year` is a four-digit calendar year within range (BR3.2). */
function requireYear(
  frontMatter: Readonly<Record<string, unknown>>,
  sourcePath: string,
  buildDate: string,
): { value: number } | { error: FieldError } {
  const raw = frontMatter["year"];
  if (raw === undefined || raw === null) {
    return {
      error: fieldError(sourcePath, "year", "is required and is absent."),
    };
  }
  if (typeof raw !== "number" || !Number.isInteger(raw)) {
    return {
      error: fieldError(
        sourcePath,
        "year",
        `must be a four-digit year written as a plain number, for example 2026. ` +
          `Found ${JSON.stringify(raw)}.`,
      ),
    };
  }

  const buildYear = parseIsoDate(buildDate)?.year ?? MIN_YEAR;
  const maxYear = buildYear + 1;
  if (raw < MIN_YEAR || raw > maxYear) {
    return {
      error: fieldError(
        sourcePath,
        "year",
        `must be between ${String(MIN_YEAR)} and ${String(maxYear)}. Found ${String(raw)}.`,
      ),
    };
  }

  return { value: raw };
}

/** `tools` lists at least one non-empty entry (BR3.3). */
function requireTools(
  frontMatter: Readonly<Record<string, unknown>>,
  sourcePath: string,
): { value: string[] } | { error: FieldError } {
  const raw = frontMatter["tools"];
  if (raw === undefined || raw === null) {
    return {
      error: fieldError(sourcePath, "tools", "is required and is absent."),
    };
  }
  if (!Array.isArray(raw)) {
    return {
      error: fieldError(
        sourcePath,
        "tools",
        "must be a list, for example [TypeScript, Postgres].",
      ),
    };
  }
  if (raw.length === 0) {
    // Rejected rather than allowed, because the Projects list row is specified
    // to display tools (FR3.1) and an empty list renders as a gap.
    return {
      error: fieldError(
        sourcePath,
        "tools",
        "must list at least one entry; the list is empty.",
      ),
    };
  }

  const value: string[] = [];
  for (const entry of raw as unknown[]) {
    if (typeof entry !== "string" || entry.trim() === "") {
      return {
        error: fieldError(
          sourcePath,
          "tools",
          `must contain only non-empty text entries. Found ${JSON.stringify(entry)}.`,
        ),
      };
    }
    value.push(entry.trim());
  }

  return { value };
}

/**
 * An absolute `http` or `https` URL. Whether it resolves is deliberately not
 * checked (BR3.4, NFR11).
 *
 * A dead third-party URL is somebody else's outage, and failing on it would stop
 * this site publishing because an unrelated website went down.
 */
function requireAbsoluteUrl(
  raw: unknown,
  field: string,
  sourcePath: string,
): { value: string } | { error: FieldError } {
  if (typeof raw !== "string" || raw.trim() === "") {
    return {
      error: fieldError(
        sourcePath,
        field,
        "must be an absolute http or https URL.",
      ),
    };
  }
  const value = raw.trim();
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return {
      error: fieldError(
        sourcePath,
        field,
        `must be an absolute http or https URL, not a relative path or a bare name. ` +
          `Found "${value}".`,
      ),
    };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      error: fieldError(
        sourcePath,
        field,
        `must use the http or https scheme. Found "${parsed.protocol.replace(":", "")}".`,
      ),
    };
  }
  return { value };
}

/** `featured` is an optional boolean defaulting to false (BR3.6). */
function readFeatured(
  frontMatter: Readonly<Record<string, unknown>>,
  sourcePath: string,
): { value: boolean } | { error: FieldError } {
  if (!Object.hasOwn(frontMatter, "featured")) return { value: false };

  const raw = frontMatter["featured"];
  if (typeof raw !== "boolean") {
    return {
      error: fieldError(
        sourcePath,
        "featured",
        `must be true or false, not ${JSON.stringify(raw)}.`,
      ),
    };
  }
  return { value: raw };
}

/**
 * `liveUrl` is optional, and absent means something specific (BR3.5).
 *
 * Absent omits the rail row entirely rather than rendering it empty, which is a
 * documented behaviour and not an error. Present-but-empty is an authoring
 * mistake rather than a deliberate omission, so it is an error.
 */
function readLiveUrl(
  frontMatter: Readonly<Record<string, unknown>>,
  sourcePath: string,
): { value?: string } | { error: FieldError } {
  if (!Object.hasOwn(frontMatter, "liveUrl")) return {};

  const raw = frontMatter["liveUrl"];
  if (raw === null || (typeof raw === "string" && raw.trim() === "")) {
    return {
      error: fieldError(
        sourcePath,
        "liveUrl",
        "is present but empty. Remove the line entirely to omit the Live row; " +
          "an empty value is an authoring mistake rather than a deliberate omission.",
      ),
    };
  }

  const url = requireAbsoluteUrl(raw, "liveUrl", sourcePath);
  if ("error" in url) return { error: url.error };
  return { value: url.value };
}

/**
 * Validate every project and return them in order.
 *
 * Every fault on a project is collected before moving to the next, so a project
 * missing all six required fields reports all six (BR3.1, BR4.2).
 */
export function buildProjectCatalog(
  files: readonly ContentFile[],
  options: ProjectCatalogOptions,
): ProjectCatalogResult {
  const errors: FieldError[] = [];
  const projects: Project[] = [];

  for (const file of files) {
    const fileErrors: FieldError[] = [];
    const values: Record<string, string> = {};

    for (const field of REQUIRED_TEXT_FIELDS) {
      const result = requireText(file.frontMatter, field, file.path);
      if ("error" in result) fileErrors.push(result.error);
      else values[field] = result.value;
    }

    const summary = deriveSummary(file.frontMatter["summary"]);
    if (!summary.ok) {
      fileErrors.push(fieldError(file.path, "summary", `${summary.reason}.`));
    }

    const year = requireYear(file.frontMatter, file.path, options.buildDate);
    if ("error" in year) fileErrors.push(year.error);

    const tools = requireTools(file.frontMatter, file.path);
    if ("error" in tools) fileErrors.push(tools.error);

    const repo = requireAbsoluteUrl(
      file.frontMatter["repo"],
      "repo",
      file.path,
    );
    if ("error" in repo) fileErrors.push(repo.error);

    const liveUrl = readLiveUrl(file.frontMatter, file.path);
    if ("error" in liveUrl) fileErrors.push(liveUrl.error);

    const featured = readFeatured(file.frontMatter, file.path);
    if ("error" in featured) fileErrors.push(featured.error);

    if (fileErrors.length > 0) {
      errors.push(...fileErrors);
      continue;
    }

    const resolvedLiveUrl = (liveUrl as { value?: string }).value;

    projects.push({
      slug: file.slug,
      name: values["name"] ?? "",
      summary: (summary as { ok: true; summary: string }).summary,
      year: (year as { value: number }).value,
      type: values["type"] ?? "",
      tools: (tools as { value: string[] }).value,
      repo: (repo as { value: string }).value,
      ...(resolvedLiveUrl === undefined ? {} : { liveUrl: resolvedLiveUrl }),
      featured: (featured as { value: boolean }).value,
      body: file.body,
      sourcePath: file.path,
    });
  }

  // Ordering is total, never a filter: `featured` decides position and can never
  // remove a project from the list (BR3.7).
  return { projects: sortProjects(projects), errors };
}
