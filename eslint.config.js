/**
 * ESLint, with `typescript-eslint`'s recommended rules and nothing tuned.
 *
 * `team.md` § Code Style: the formatter and linter are chosen alongside the
 * stack with their defaults accepted, because a personal site is not where a
 * lint configuration earns its keep and a config nobody tuned is a config nobody
 * argues with.
 *
 * Linting here is a quality tool, not a security control. The one narrow future
 * security case — hand-written client-side JavaScript reading from the URL or
 * page environment and writing into the DOM — cannot arise yet: the
 * content-security policy this site emits carries `script-src 'none'`, so the
 * site ships no JavaScript at all.
 */

import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "aidlc/**",
      ".claude/**",
      "tests/u1/fixtures/**",
      "tests/u2/fixtures/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
