/**
 * The `SiteMetadata` singleton — the site-level values no content file carries.
 *
 * It lives at the repository root, outside `content/`, which is assumption CA2
 * and is required by BR1.1: the content walk must never be able to find it.
 *
 * The three editorial values come from [Q3]. The content-security-policy value
 * is not editorial — BR5.10 fixes it character for character, and it is held
 * here, once, so the policy cannot drift between templates.
 */

import type { SiteMetadata } from "./src/types.ts";

export const site: SiteMetadata = {
  siteName: "Rue Asha",
  baseUrl: "https://rue-asha.github.io",
  fallbackDescription: "Writing and projects by Rue Asha.",
  contentSecurityPolicy:
    "default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; " +
    "script-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'",
};

/**
 * The sentence Home shows under the site name.
 *
 * Not part of `SiteMetadata`, whose four attributes `entities.md` closes. It is
 * template copy, and it lives beside the other editorial values rather than
 * inside a template so that changing it is not a code change.
 */
export const homeIntro =
  "I build things and write about what I am currently learning or find interesting.";

export default site;
