**Collaborator:** aidlc-devsecops-agent

## Contribution

Read: the three lead-draft files, `aidlc-state.md`, `scope-document.md`,
`user-flow.md`, `initiative-brief.md`, the active rule bundle, and the
repository itself (`git ls-files`, `.gitignore`, the tracked tree at commit
`dab7edf`).

### 0. What this system actually is, in security terms

Before recommending anything, the honest shape of the thing:

| Asset | Present? | Consequence |
|---|---|---|
| User accounts, sessions, credentials | No | No authentication surface. No session handling. No password storage. |
| User input of any kind | No — no forms, no comments ([Q3] exclusion), no search (deferred) | No injection surface reachable by a visitor. |
| A database, or any server-side code | No — static files served by GitHub | No SQL injection, no SSRF, no deserialisation, no server-side anything. |
| Visitor data collected | No — analytics excluded entirely ([Q3]) | Nothing to breach. The best privacy control is the one already in the scope document: not collecting it. |
| Secrets the *product* needs at runtime | No | There is no runtime to hold them. |

So most of what a DevSecOps review normally produces — auth requirements,
authorization models, data classification tiers, encryption-at-rest policy,
rate limiting, WAF, IAM least-privilege, container scanning, an SBOM — has
**nothing to protect here**, and I am not recommending any of it. Importing it
would produce a practice document the author cannot follow and would not
believe.

Two things *are* worth protecting, and they are the whole security story:

1. **The integrity of what the public sees.** This site is linked from job
   applications under a real name. The realistic attack is not data theft —
   there is no data. It is **defacement, or the site quietly serving something
   the author did not write** (injected spam links, a redirect, a phishing page
   under a real person's name). The impact is reputational and lands squarely
   on the thing the site exists to do.
2. **What ends up in a public repository, permanently.** Every commit to
   `Rue-Asha.github.io` is public the moment it is pushed, and stays reachable
   by SHA afterwards — deleting a file in a later commit does not remove it, and
   forks and archives keep copies. There is no undo.

Everything below follows from those two, and nothing below is recommended for
any other reason.

### 1. The trust boundary the draft has not drawn

`team-practices.md` § Deployment names a **trigger** (push to `main`) and a
**gate** (build must succeed). It does not name the thing in between: **what
has write access to the published output.**

The whole authorization model of this site is one sentence: *anything that can
push to `main`, and anything that runs during the build, can change what the
public sees at the real URL.* That is the trust boundary. It has exactly three
crossings:

| Crossing | Who/what | Control that exists | Control that should exist |
|---|---|---|---|
| Author → `main` | The GitHub account | Whatever protects that account today — unknown | Second factor on the account. Highest-impact item in this entire contribution. |
| `main` → build | The build process | None yet (no stack) | Depends on which publish mechanism is chosen — see §2. |
| Build → live site | The publish step | None yet | Explicit, minimal write permissions if a workflow does it. |

**Crossing 1 is the one that matters and it is free.** If the GitHub account is
protected only by a password, then the site's entire security model is that
password. Every dependency control, lockfile, and pinned action below is
protecting against a supply-chain attacker who has no particular reason to care
about this repository; account compromise is the attack that actually targets
it. A second factor (authenticator app, passkey, or hardware key) closes it in
about ten minutes and costs nothing thereafter. **This should be the first
security question of the interview, and the record should show it was asked.**

Recommended addition to `team-practices.md` § Deployment, in the lead's voice:

> **Who can publish.** One GitHub account can change what the public sees at
> this URL, and nothing else can. That account is therefore the site's entire
> access control, and it is protected by a second factor as well as a password.
> A compromised account is the only realistic way this site gets defaced; no
> other control on this list substitutes for it.

### 2. The publish mechanism is a security decision, not only a mechanism choice

`scope-document.md` § Assumptions defers "GitHub Pages' own build, a workflow in
the repository, or something else" to Construction as a purely technical
choice, and the lead's draft repeats that framing. The two options have
materially different attack surfaces, and Construction should make the choice
knowing that.

| | GitHub's built-in Pages build (source = a branch) | A workflow in the repository (source = GitHub Actions) |
|---|---|---|
| Executable code in the repo that runs on every push | None | Yes — the workflow, plus every action it calls |
| Third-party code with a publish token | None | Each `uses:` step, at whatever version the tag points to *today* |
| Generator choice | Jekyll only, GitHub's plugin allowlist | Anything |
| Failure mode if a dependency is compromised | Not reachable — nothing of the author's runs | The compromised step runs with whatever token the workflow grants |

**Neither is wrong.** The point is that "no workflow" is not the primitive
option — it is the option with the smallest attack surface, and it satisfies
the mandated publishing rule perfectly. If the generator decision lands on
something other than Jekyll and a workflow becomes necessary, four controls
make it proportionate, and they are the *only* four I would ask for:

1. **Declare permissions explicitly.** Top-level `permissions: contents: read`,
   and grant `pages: write` / `id-token: write` on the deploy job alone. Default
   token permissions vary by repository age and org setting; writing them down
   makes the grant a decision rather than an inheritance.
2. **Pin every third-party action to a full commit SHA**, not a tag. Tags are
   mutable and have been retargeted to malicious commits in the wild (the
   `tj-actions/changed-files` compromise in March 2025 moved existing version
   tags onto a commit that dumped runner memory into public build logs — every
   workflow pinned to a tag picked it up automatically). SHA-pinning is one
   line per step and removes the entire class. `actions/*` published by GitHub
   itself carry lower risk, but pinning them costs nothing.
3. **Nothing triggers on `pull_request_target`.** No fork PRs are expected, and
   that trigger runs untrusted code with repository-scoped credentials.
4. **The build fetches nothing at build time that is not in the lockfile.** No
   `curl | sh`, no unpinned installer script.

Recommended addition to `team-practices.md` § Deployment:

> **Whatever publishes the site has write access to what the public sees.** If
> that is a workflow in this repository, it declares its permissions
> explicitly, grants write only to the step that deploys, and pins every
> third-party action it calls to a commit SHA rather than a version tag. If
> publishing needs no workflow at all, that is the smaller surface and we
> prefer it.

### 3. Assessment of the two deployment claims I was asked to review

**"A push to `main` publishes the site" — correct, and I would not change it.**
It is the only trigger compatible with the mandated publishing rule, and it has
a security virtue the draft does not claim for it: there is exactly one path
to the live site, so there is exactly one path to audit. A second publish route
(a manual deploy button, a "publish from a dashboard" escape hatch) would be a
second thing to secure and is correctly excluded by the CMS prohibition anyway.

**"The build must succeed before anything is published" — correct, but the
draft is using one phrase for two different things, and only one of them should
be a gate.**

- **Build integrity** — did the generator produce a complete site? This must
  block. A half-generated site replacing a working one is exactly the integrity
  failure worth preventing, and the lead's framing (failed build publishes
  nothing, previous site stays up) is right.
- **Quality checks** — dead links, accessibility, formatting. These say nothing
  about whether the published output is *trustworthy*. Wiring them as publish
  gates means a failing accessibility check silently stops a post from going
  live — which reintroduces the mandated rule's forbidden failure ("an action
  required from the author after `git push`") in its worst form: an invisible
  one, discovered weeks later. The draft's own § Deployment flags silent
  publish failure as the risk to avoid, then § Testing Posture proposes a check
  set that would create it.

Proposed wording that keeps both intents and does not weaken anything:

> **What blocks a publish and what does not.** A build that did not produce a
> complete site blocks the publish; the previously live site stays up. Quality
> checks — links, accessibility — run on every push and report, but do not hold
> a post back. The reason is the publishing rule itself: a check that can
> silently stop a post from appearing is the exact failure that rule exists to
> forbid. Reported failures are not optional to fix; they are just not a
> gate between writing a post and it being live.

This is compatible with `org.md` § Testing Posture: the coverage floor and
CI-execution requirement are untouched, and no check is removed. Only the
question of what *blocks publication* is being answered.

**Rollback — one correction.** `git revert` + push is a complete rollback for
site *content*, and the lead's reasoning (no database, no migrations, no state)
is sound. It is **not** a rollback for a leaked credential. Revert leaves the
old blob reachable in history. The order of operations differs and matters:
revoke the key at the issuer first, clean history second, and never rely on the
second step alone. See §5.

### 4. Dependency and supply chain: proportionate answer

The question is real — a build that runs on every push runs whatever those
dependencies became since yesterday. But the size of that exposure is a
**consequence of the stack decision**, which has not been made. That makes it a
security input to a decision currently framed as purely a preference:

| Generator shape | Dependency tree the author owns | Supply-chain exposure |
|---|---|---|
| GitHub's built-in Jekyll build | None — GitHub pins and runs it | Effectively zero |
| A single static binary (e.g. Hugo) | One pinned binary | Very small |
| A Node-based generator (Eleventy, Astro, Next export) | Typically several hundred transitive packages | Real, and it is the author's to manage |

None of these is disqualified. But "how much supply chain am I signing up for"
belongs in the stack conversation, not discovered afterwards.

**What is proportionate, given a solo author and a personal site:**

| Control | Verdict | Why |
|---|---|---|
| Commit the lockfile (`package-lock.json`, `Gemfile.lock`, …) | **Yes — required if any package manager is used** | Without it the statement "the build runs whatever those dependencies became" is literally true. One file, zero maintenance, removes non-determinism from every build. |
| Pin CI actions to SHAs | **Yes — if a workflow exists** | §2. Highest value per unit of effort in the whole list. |
| Dependabot **security** alerts + updates | **Yes** | Free on public repos, tells the author when something in the tree has a known CVE. Without it, nobody is looking. |
| Dependabot **version** updates (routine upgrades) | **Configure it down, or off** | A personal site does not want fifteen PRs a week. Monthly, grouped, or security-only. An ignored bot is worse than no bot. |
| `npm audit` / `bundle audit` as a blocking build gate | **No** | A static site's dependencies are build-time only. A "high severity" advisory in a build tool that never touches a visitor is not a reason to stop publishing a post. Run it, read it, do not gate on it. |
| SBOM generation, Trivy/Snyk/Inspector, container scanning | **No** | No containers, no runtime, no deployment target to scan. These exist for systems that serve requests. |

**One honest caveat about Dependabot here.** With no second reviewer, a
Dependabot PR is merged by the same person who would have written the change —
so the bot tells the author a CVE exists, but nothing reviews the diff that
fixes it. The value is *awareness*, not *safe application*. Worth stating
plainly in `team-practices.md` rather than implying the bot closes the loop.

### 5. Secret scanning: the one control I would insist on

The repository is public and permanent. That makes this the highest-probability
incident class for this project, well above anything in §4 — not because the
author is careless, but because of what this site is *for*. Posts are about
"things I'm currently learning" (`[desc]`), and that genre is full of pasted
terminal output, config snippets, and half-redacted examples.

Realistic ways a secret lands here, in descending order of likelihood:

1. **A draft post containing a real token in an example.** A tutorial writeup
   quotes a working `curl` command, or a screenshot of a config file. This is
   the common one and it does not feel like a mistake while it is happening.
2. **A tutorial project's `.env` or credentials file committed alongside site
   content**, because it was sitting in the working tree.
3. **A private email address or physical location in front-matter or the About
   page.** Not a breach — a *decision*. It should be a deliberate one rather
   than a default from a template. Worth noting the git commit metadata already
   publishes an email address on every commit; if that is a corporate address
   and the author would rather it were not, GitHub's noreply commit email is a
   one-setting fix and is worth mentioning at the interview.
4. **A key pasted into a conversation that this workflow then writes into an
   artifact.** Specific to this project: `aidlc/` — including every artifact
   and the full audit trail — is committed to this public repository. Anything
   the workflow records is published. This is not hypothetical, it is the
   current arrangement.

**The practical control for a solo author is one repository setting.** GitHub's
secret scanning with **push protection** is free on public repositories
(Settings → Code security). It matches known provider credential formats and
**rejects the push before the secret ever reaches the remote** — which is the
only intervention that actually helps, because once it is pushed the options
are all bad. No tooling to install, no config to maintain, no false positives
in the author's face day to day. Confirm the setting is on rather than assuming
it; defaults have changed over time.

**What I would not recommend:** a `gitleaks`/`trufflehog` pre-commit hook as
the starting point. It catches more (internal hostnames, private emails,
high-entropy strings GitHub's provider patterns miss) but it costs a hook on
every commit, tuning, and a false-positive budget that a solo author will
eventually bypass with `--no-verify`. Revisit if drafts start carrying pasted
config regularly; do not start there.

**Proposed rule for the interview** (I have deliberately *not* written it into
`discovered-rules.md`, per the lead's admission test — it is agent-proposed, not
human-stated, and only becomes a rule if the author says so):

> ALWAYS revoke a leaked credential at the service that issued it *before*
> touching git history. Rewriting history does not unpublish anything that was
> already fetched, forked, or archived; revocation is the only step that
> actually ends the exposure.

### 6. SAST and DAST: plainly

**DAST — does not apply, and will not within this scope.** DAST works by
sending crafted requests to a running application and watching how it responds:
it needs request handling, parameters that change behaviour, sessions,
authentication, error paths. This system has none of them. It is files on a CDN.
Pointing a scanner at the live URL would be scanning GitHub's infrastructure,
which is neither the author's to test nor the author's to fix. The lead's smoke
check (home page returns 200 at the public URL over HTTPS, the new page is
reachable) is the correct and complete substitute, and it is already in the
draft.

**SAST — does not apply now; one specific thing would change that.** With no
server-side code, no user input, and a single trusted content author, static
analysis has nothing to find and would produce noise. It becomes relevant the
moment **hand-written client-side JavaScript reads from the URL or the page
environment and writes into the DOM** — `location.hash`, `location.search`,
`document.referrer`, `postMessage` → `innerHTML` / `insertAdjacentHTML` /
`document.write`. That is the one genuine vulnerability class a static site can
have (DOM-based XSS), and it is exactly what a client-side search box or a
"share this" widget tends to introduce. Topic search is deferred rather than
excluded (`discovered-rules.md` § Scope Note), so this is a live future
trigger, not a theoretical one.

Proportionate response when that day comes: **one lint rule set**
(`eslint-plugin-no-unsanitized`, or the equivalent for whatever stack is
chosen), not a scanning platform. Until then, no SAST.

### 7. Lint and format as a security surface: honestly, almost none

Asked directly, so answered directly.

- **Formatting has zero security value.** Prettier, `gofmt`, line width, quote
  style — none of it protects anything. It should be argued for on its own
  merits (and the lead's argument, that a rule requiring memory erodes for a
  solo author, is the right one). I would not let a security framing be used to
  justify it.
- **Linting has one narrow case**, and it is §6: the DOM-sink rules, and only
  if hand-written JS appears. General code linting on a static content site is
  a quality tool.
- **Markdown/prose linting has none.** Related: the lead is right that a
  formatter must not reflow prose the author wrote deliberately — and there is
  a small correctness angle beneath the ergonomic one, in that a formatter
  rewriting front-matter can break how a post is parsed and published.

**The useful reframing for the lead:** the draft treats § Code Style as the
place where automated checks live, and then spends that whole budget on
linting. The checks in this repository that would actually protect something
are not linters — they are push protection for secrets (§5), a committed
lockfile (§4), and pinned actions (§2). Same shape (automatic, runs without
being remembered, blocks or warns), enormously different value. I would move
that budget.

### 8. Security headers and the limits of GitHub Pages

**What cannot be done, and should stop being considered:** GitHub Pages serves
static files and gives you **no control over HTTP response headers**. There is
no `_headers` file (unlike Netlify or Cloudflare Pages), no `.htaccess`, no
server config. So `Strict-Transport-Security`, `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` are simply
not settable from this repository. Recommending them would be recommending
something the author cannot do.

**What is already handled:** HTTPS. GitHub serves `*.github.io` over HTTPS and
redirects plain HTTP; the author does nothing. (This changes if a custom domain
is added later — certificate provisioning and HTTPS enforcement become a
setting to check, and it is worth revisiting then, not now.)

**What cannot be set and does not matter here:** clickjacking protection
(`frame-ancestors` / `X-Frame-Options`). Clickjacking is an attack on
state-changing actions — a click that transfers money, changes a setting,
grants a permission. A read-only site has no such action. Someone framing this
site is a nuisance, not a vulnerability. Marking this **not applicable, with
the reason**, rather than listing it as an unmet control.

**The one header-shaped thing worth doing, and it is worth doing.** A
`<meta http-equiv="Content-Security-Policy">` tag in the page `<head>` does
work on GitHub Pages (with known limits: `frame-ancestors`, `report-uri`, and
`sandbox` are ignored in meta form — which is fine, since those are exactly the
ones that do not matter here). A policy as simple as `default-src 'self'` turns
a stated rule into an enforced one:

- `[Q3]` **forbids visitor analytics or tracking of any kind**, and
  `discovered-rules.md` records it as a hard rule. Right now that rule is
  enforced by the author remembering it.
- The rule is easy to break **without noticing**, because tracking arrives
  disguised as convenience: a theme that pulls a webfont from a third-party
  CDN, an icon set loaded from a CDN, an embedded widget. Every one of those
  sends every reader's IP address and referring page to a third party — which
  is the substance of what `[Q3]` excluded, arriving through the back door. In
  Germany specifically, third-party webfont loading has already been litigated
  as a privacy violation on exactly this reasoning.
- A `default-src 'self'` CSP makes the browser block any such request, so the
  rule is enforced by machinery rather than memory, and a violation shows up as
  something visibly broken rather than something silently leaking.

Cost: one line, plus the discipline of vendoring fonts and assets into the
repository (which also makes the site faster and removes a third-party outage
from the critical path). Risk: it can break something for visitors silently if
it is set too tight and never tested — so it belongs in the walking skeleton,
where the author is already checking the live URL, not bolted on later.

**Proposed practice** (again, interview material, not a discovered rule):

> **Nothing at page load comes from someone else's server.** Fonts, icons,
> stylesheets, and scripts are copied into this repository and served from it.
> A content-security policy in the page head enforces this, so a theme or
> snippet that quietly adds a third-party request breaks visibly instead of
> leaking every reader's IP address to a company we never chose. This is the
> technical form of the decision to have no tracking.

### 9. A present finding in this repository, worth one line in the draft

Not a recommendation — an observation about the current state, since the site
does not exist yet and this is cheap to get right the first time.

`git ls-files` shows 301 tracked files, all of them under `aidlc/` and
`.claude/`. That includes every workflow artifact, the memory files, and the
audit trail (`audit/rayliettp-a6d8c47271d7.md` — the machine hostname is in the
filename). **The repository is public, so all of this is already publicly
readable**, and that is a pre-existing condition rather than something this
stage creates. Two consequences that do belong in the practice record:

1. **Whatever the workflow writes, gets published.** Artifacts and the audit
   log are committed by design (`.gitignore` says so explicitly). If a
   credential, a private URL, or an internal hostname enters a conversation and
   an artifact quotes it, it is pushed to a public repository. This is an
   argument for push protection (§5) that has nothing to do with blog posts.
2. **`aidlc/` must be excluded from the *published site output*, and which
   config does that is stack-dependent.** Jekyll copies non-underscore,
   non-dot directories into `_site` unless `_config.yml` excludes them —
   `aidlc/` would be served as pages under the site URL. Eleventy, with its
   default input directory of `.`, would go further and *render* every Markdown
   file in the tree as a page. Hugo, which publishes only from its own content
   directories, would not. So this is a concrete build-configuration
   requirement for the walking skeleton, and the skeleton's definition of done
   ("a committed file becomes a live page") should be paired with its negative:
   *and nothing else became a live page.*

Suggested one-line addition to the skeleton's done criteria in
`team-practices.md` § Walking Skeleton:

> …and nothing the author did not intend to publish is reachable on the site —
> the AI-DLC workspace and tooling directories are excluded from the build
> output, not merely ignored by the author.

### 10. Gaps the Step 4 interview must resolve

Written for someone who is not a security specialist, with no term they have no
reason to know. Ranked, because the interview has four other areas to cover and
these should not crowd it out. Each is one question with a small option set,
consistent with the project's four-options-plus-`X. Other (please specify)`
rule.

**Must ask — these two carry almost all the value:**

1. **Account protection.** "Anyone who can sign in to your GitHub account can
   change what the public sees on your site — that account *is* the site's
   security. Is it protected by more than a password (a code from an app, a
   passkey, or a security key)?" → already set up / I'll set it up before the
   site goes live / no, and I don't want to. *(If the answer is the third, the
   record should say so plainly rather than quietly assuming the first.)*

2. **Blocking accidental secrets.** "GitHub can check every push for things
   that look like passwords or API keys and refuse the push if it finds one.
   It's free on public repositories and takes about a minute to switch on. It
   matters here because anything pushed to a public repository is public
   immediately and stays reachable afterwards — deleting it later does not
   take it back. Turn it on?" → yes, now / yes, before the first real post /
   no.

**Should ask — each settles something the draft currently leaves undecided:**

3. **Third-party content at page load.** "Should your site load anything from
   other companies' servers while a reader is viewing it — web fonts, icon
   sets, a stylesheet from a CDN? Each of those tells that company the IP
   address of everyone who reads your site, which is close to the visitor
   tracking you already ruled out. The alternative is copying those files into
   your own repository." → nothing third-party, copy everything in
   (recommended) / fonts are fine, nothing else / decide case by case later.

4. **What a failed check should do.** "When an automatic check fails — a broken
   link, or a page that fails the accessibility check — should that stop the
   post from going live, or should the post go live and the check tell you what
   is wrong?" → stop publishing until it's fixed / publish and notify me /
   only a broken *build* stops publishing, everything else notifies
   (recommended — see §3).

5. **If a key ever does leak.** "Can we write down one rule now: if a password
   or key ever ends up in the repository, the first thing to do is cancel it at
   the service that issued it — before any attempt to clean it out of git.
   Cleaning history does not un-publish something that has already been copied
   or archived." → yes, record it / no.

**Worth asking once, low cost:**

6. **What gets published versus what is merely in the repository.** "The
   repository currently holds the whole AI-DLC workspace and its audit trail.
   That is already publicly readable, which is fine — but when we pick the site
   generator, those directories must be kept *off the website itself*, or parts
   of them get served as pages and picked up by search engines. Happy for them
   to stay in the repository as long as they're excluded from the site?" →
   yes, keep in repo and exclude from the site / move them out of this
   repository / publish everything, don't care.

7. **Commit email.** Optional and only if it matters to the author: "Every
   commit you make publishes the email address configured in git. Yours is
   currently a work address. GitHub offers a no-reply address instead if you'd
   rather that were not on a public portfolio repository." → switch it / leave
   it.

**Deliberately not asked**, because they have no answer worth the question's
cost here: penetration testing, security scanning platforms, an incident
response runbook, data classification, encryption policy, access reviews,
compliance framework mapping. There is one person, no data, and no regulated
processing. Asking would imply the answers matter.

## Positions

- AGREE: **"A push to `main` publishes the site"** — the right trigger, and it
  has the security virtue of leaving exactly one path to the live site, so
  there is exactly one path to audit.
- AGREE: **"The build must succeed before anything is published"** — a failed
  build publishing nothing while the previous site stays up is the correct
  failure mode for a system whose only rollback is git.
- AGREE: **Refusing to invent a manual approval gate** — a gate whose approver
  is the author records nothing and prevents nothing; saying so beats staging a
  ceremony.
- AGREE: **`git revert` + push as the rollback for site content** — the
  reasoning (no database, no migrations, no state outside the repository) holds
  exactly as stated, for content.
- AGREE: **The smoke check ("the live URL serves the expected page")** — this is
  the correct and sufficient substitute for dynamic security testing on a system
  with no request handling to test.
- AGREE: **The admission discipline in `discovered-rules.md`** — nothing
  agent-proposed is promoted to a rule. I have followed it: every control above
  is interview material, not a rule, including the ones I would argue hardest
  for.
- AGREE: **Carrying the publish-failure signal forward as unresolved** — a
  publishing path whose failure is silent is the one genuine availability
  problem this system can have, and the draft is right to refuse to invent an
  answer.
- OBJECT: **§ Deployment names a trigger and a gate but never names what has
  write access to the published output** — the choice between GitHub's own
  Pages build and a workflow in the repository decides how much third-party
  executable code runs with a publish token on every push, and the draft files
  it as a neutral Construction mechanism (§1, §2).
- OBJECT: **"Green before publish" conflates build integrity with quality
  checks** — wiring link and accessibility checks as publish gates recreates the
  invisible-blocked-publish failure that the mandated publishing rule exists to
  forbid, and that the same section flags as a Medium risk (§3).
- OBJECT: **§ Code Style spends the whole automated-check budget on linting** —
  for this system linting is a quality tool with one narrow security case, while
  the checks that would actually protect something (secret push protection, a
  committed lockfile, SHA-pinned actions) appear nowhere in the draft (§4, §5,
  §7). A gap, not a contradiction.
- OBJECT: **`evidence.md` § What Could Not Be Established contains no security
  row** — so the interview as drafted would not ask the two questions with the
  highest impact per minute spent: is the GitHub account protected by a second
  factor, and is secret push protection switched on (§10, items 1–2).
- OBJECT: **Neither draft notes that this repository is public and already
  carries the full AI-DLC workspace and audit trail** — which makes "anything
  the workflow writes is published" a live property of this project, and makes
  excluding `aidlc/` from the built site a concrete walking-skeleton requirement
  whose correct configuration differs per generator (§9).
