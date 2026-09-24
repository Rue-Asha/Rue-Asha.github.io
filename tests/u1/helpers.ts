/**
 * Shared test helpers for U1.
 *
 * Fixtures are real content trees on disk rather than mocks: this build's whole
 * job is reading files and failing correctly on what it finds, so a mocked file
 * system would test the mock rather than the rule
 * (`unit-test-instructions.md` § Mocking and stubbing).
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BuildFailedError } from "../../src/errors.ts";
import type {
  FieldError,
  Post,
  Project,
  SiteMetadata,
} from "../../src/types.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path of a committed fixture tree, used as a repository root. */
export function fixture(name: string): string {
  return path.join(HERE, "fixtures", name);
}

/**
 * A temporary output directory, removed by the returned cleanup.
 *
 * Tests never write to the real `dist/`: a test run must not leave the author's
 * working tree carrying a half-built site.
 */
export async function temporaryOutputRoot(): Promise<{
  dir: string;
  cleanup: () => Promise<void>;
}> {
  const dir = await mkdtemp(path.join(tmpdir(), "u1-site-"));
  return {
    dir,
    cleanup: async () => {
      await rm(dir, { recursive: true, force: true });
    },
  };
}

/**
 * The site metadata used across the suite.
 *
 * The content-security-policy value is the exact string BR5.10 fixes. It is
 * written out here rather than imported from `site.config.ts` so that a test
 * would fail if the shipped configuration ever drifted from the rule.
 */
export const TEST_SITE: SiteMetadata = {
  siteName: "Rue Asha",
  baseUrl: "https://rue-asha.github.io",
  fallbackDescription: "Writing and projects by Rue Asha.",
  contentSecurityPolicy:
    "default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; " +
    "script-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'",
};

/**
 * The build date every test injects.
 *
 * BR3.2 bounds `year` at the build's own year plus one, so a suite that read the
 * clock would begin failing on 1 January
 * (`unit-test-instructions.md` § Mocking and stubbing).
 */
export const TEST_BUILD_DATE = "2026-09-23";

/** Build a valid post, overriding only what a test is about. */
export function aPost(overrides: Partial<Post> = {}): Post {
  return {
    slug: "a-post",
    title: "A post",
    summary: "A one-line summary.",
    date: "2026-03-12",
    body: "Body text.",
    sourcePath: "content/posts/a-post/index.md",
    ...overrides,
  };
}

/** Build a valid project, overriding only what a test is about. */
export function aProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: "a-project",
    name: "A project",
    summary: "A one-line summary.",
    year: 2026,
    type: "CLI",
    tools: ["TypeScript"],
    repo: "https://github.com/Rue-Asha/a-project",
    featured: false,
    body: "Body text.",
    sourcePath: "content/projects/a-project/index.md",
    ...overrides,
  };
}

/** True when some error names this field on a path ending with `pathSuffix`. */
export function hasError(
  errors: readonly FieldError[],
  pathSuffix: string,
  field: string,
): boolean {
  return errors.some(
    (error) => error.path.endsWith(pathSuffix) && error.field === field,
  );
}

/**
 * Await a build that must fail, and hand back its field errors.
 *
 * A build that unexpectedly succeeds is itself a test failure — the fail-loudly
 * contract is the behaviour under test, so "it did not throw" must never be
 * mistaken for a pass.
 */
export async function expectBuildFailure(
  promise: Promise<unknown>,
): Promise<BuildFailedError> {
  try {
    await promise;
  } catch (thrown) {
    if (thrown instanceof BuildFailedError) return thrown;
    throw thrown;
  }
  throw new Error(
    "Expected the build to fail with field errors, but it succeeded.",
  );
}
