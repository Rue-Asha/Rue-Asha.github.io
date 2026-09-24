/**
 * Field errors and the one exception type the build entry points catch.
 *
 * `rules.md` defines a field error as a message naming the offending file path
 * and the offending field name (BR4.3). Everything that can reject content
 * constructs one through {@link fieldError} so that shape is guaranteed rather
 * than remembered.
 */

import type { FieldError } from "./types.ts";

/**
 * Build a field error. Both `path` and `field` are required by BR4.3, so the
 * signature makes omitting either impossible rather than merely discouraged.
 */
export function fieldError(
  path: string,
  field: string,
  message: string,
): FieldError {
  if (path.trim() === "") {
    throw new Error(
      "fieldError requires a non-empty path: BR4.3 names the file.",
    );
  }
  if (field.trim() === "") {
    throw new Error(
      "fieldError requires a non-empty field: BR4.3 names the field.",
    );
  }
  return { path, field, message };
}

/**
 * Render one field error as a single line, for a terminal.
 *
 * The file and the field lead the line because they are what the author needs
 * in order to act; ADR-001 records that obtaining exactly this message is the
 * reason we write the build instead of adopting a generator.
 */
export function formatFieldError(error: FieldError): string {
  return `${error.path} [${error.field}] ${error.message}`;
}

/**
 * Sort field errors into a stable, readable order: by file, then by field.
 *
 * Reporting order is not a rule, but an unstable order makes a build's output
 * differ run to run for the same fault, which makes a diff of two failures
 * useless.
 */
export function sortFieldErrors(errors: readonly FieldError[]): FieldError[] {
  return [...errors].sort(
    (a, b) => a.path.localeCompare(b.path) || a.field.localeCompare(b.field),
  );
}

/**
 * Thrown by the build and check entry points when they abort. Carries the field
 * errors so a caller can report every one of them (BR4.2) rather than a summary.
 */
export class BuildFailedError extends Error {
  readonly errors: readonly FieldError[];

  constructor(errors: readonly FieldError[]) {
    super(
      `Build failed with ${String(errors.length)} field error${errors.length === 1 ? "" : "s"}.`,
    );
    this.name = "BuildFailedError";
    this.errors = sortFieldErrors(errors);
  }
}
