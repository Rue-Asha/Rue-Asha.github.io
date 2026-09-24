# Security Test Instructions

Reviewed with the security engineer's hat on. Test Strategy is `Standard`,
which makes security tests conditional on NFR security requirements existing.
Three do — `NFR3`, `NFR4`, and the credential rules in `project.md` § Mandated —
so this file is written rather than marked not applicable.

## The threat model, briefly

This is a static site. No server code runs, no user input is accepted, no
session exists, no data is stored. That removes injection, authentication
bypass, authorization flaws, and session fixation from the attack surface
entirely — not by mitigation but by absence.

What remains is genuinely three things, and `team.md` § Code Style is explicit
that the automated checks which actually protect something here are not
linters:

| Risk | Control | How it is checked |
|---|---|---|
| A compromised GitHub account defaces the site | One account can publish, protected by a second factor | Repository setting; confirmed at practices-discovery |
| A credential is committed and becomes public immediately | GitHub secret push protection | Repository setting; a push carrying a credential is rejected before it reaches the remote |
| A dependency carries a known vulnerability | Committed lockfile, `npm ci` on the publish path, security-only dependency alerts | `npm audit`, run below |
| Third-party resource loading leaks reader IPs | Self-hosted assets plus a content-security policy | Static checks below |
| A malicious action version is pulled into the publish workflow | Every action pinned to a full commit SHA | Static check below |

## Dependency scan

```sh
npm audit
```

Run on every dependency change. `team.md` § Deployment is honest about what the
alerting buys: with no second reviewer, the same person who merges the fix
wrote it, so the value is *awareness* that a known vulnerability exists, not
safe application of the patch.

## Third-party request check (NFR3)

The stated criterion is to load each page type with the network panel open and
confirm every request goes to this site's own origin. Two static checks
approximate it and are cheap enough to run on every build:

```sh
grep -rl "<script" dist/ || echo "no scripts"
grep -rhoE 'https?://[a-z0-9.-]+' dist/ --include="*.html" | sort -u
```

The first must find nothing. The second must return only `rue-asha.github.io`
and outbound link targets — a link *href* is not a resource load. Any other
origin appearing as the `src` or `href` of a `script`, `link`, `img`, or
`@font-face` is a violation.

## Content-security policy check (NFR4)

```sh
grep -c 'http-equiv="Content-Security-Policy"' dist/*.html dist/**/*.html
```

Every page must carry exactly one. The policy is fixed character for character
in `site.config.ts` so it cannot drift between templates:

```
default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:;
script-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'
```

`script-src 'none'` is the load-bearing directive. It is also why the DOM-based
XSS class that `team.md` § Code Style names as this site's one genuine
vulnerability class cannot currently fire: there is no script to be vulnerable.
If hand-written client-side JavaScript is ever added — the trigger named there
is code reading `location.hash`, `location.search`, `document.referrer`, or
`postMessage` and writing into the DOM — then `eslint-plugin-no-unsanitized` or
its equivalent becomes the proportionate response, and this section is where
its rule set belongs.

`frame-ancestors`, `report-uri`, and `sandbox` are ignored in meta form. That
is accepted: GitHub Pages cannot set response headers at all, and none of the
three matter for a read-only site.

## Workflow supply-chain check

```sh
grep -nE "uses:" .github/workflows/publish.yml
```

Every `uses:` must name a full 40-character commit SHA, never a tag. Tags are
mutable and have been retargeted to malicious commits in the wild. The trailing
comment records which release each SHA was, so the pin stays auditable.

Also confirm, by reading the file: top-level `permissions: contents: read`,
`pages: write` and `id-token: write` granted on the deploy job alone, no
`pull_request_target` trigger, and no build-time fetch outside `npm ci`.

## SAST and DAST

Not run, deliberately. There is no server, no request handling, and no
user input to fuzz, so a dynamic scanner has no surface to test; and with
`script-src 'none'` and no client-side code, a static analyser has no
vulnerability class to find. Adding either would produce findings about the
build tooling, which is not what is exposed to a reader. This is the same
reasoning `team.md` applies to linting: on this system it is a quality tool,
not a security control, and no security framing should be used to justify it.
