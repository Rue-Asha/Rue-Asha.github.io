# Practices Discovery — Questions

Eleven questions across the five practice areas. That is above the usual count
for this depth, and the reason is on the record: `aidlc/spaces/default/memory/team.md`
is empty, so nothing here is confirmation of an existing habit — every answer
becomes a practice by decision. The three independent reviews also surfaced
material that the lead draft did not carry, and two of those items are cheap now
and expensive later.

Answer format: write the option letter in the `[Answer]:` tag. `X` means
something else — say what.

---

## Way of Working

### Q1. How should changes reach `main`?

There is one person on this project, so a pull request has no reviewer on the
other end. What it still buys is that the automatic checks finish *before* the
live site changes, at the cost of a few extra steps per change. Your own scope
document requires that writing a post has no ceremony attached — so code and
content may not want the same answer.

- A. Everything goes straight onto `main`. Checks run after the push.
- B. Site code, layout, and build configuration go on a short-lived branch you merge yourself; posts and project write-ups commit straight to `main`.
- C. Everything goes through a branch, posts included.
- D. Decide per change by what it can break: anything that could break a page other than the one you are editing goes on a branch; anything that can only affect its own page goes straight to `main`.
- X. Other (please specify)

[Answer]: B

---

## Walking Skeleton

### Q2. This repository is public, and it already holds the whole AI-DLC workspace and its audit trail. With some site generators those files would also be served as pages on the website itself. What should happen?

This is a new finding — it was not in any earlier artifact. The files are
already publicly readable in the repository, which is a separate matter; the
question is whether they end up on the *website*, indexed by search engines,
under your name. The first piece of work is where this is cheap to get right.

- A. Keep them in the repository, exclude them from the website, and make "nothing I did not intend to publish is reachable" part of what the first piece of work has to prove.
- B. Keep them in the repository, exclude them from the website — no explicit check needed.
- C. Move the AI-DLC workspace out of this repository entirely.
- D. Publish everything; it does not matter.
- X. Other (please specify)

[Answer]: A

---

## Testing Posture

### Q3. Which automatic checks should run on each change?

The failures that would actually hurt this site are not the ones unit tests
catch: the build breaks and the site stops updating, a link goes dead, a page
stops being keyboard-navigable, or a post is published with broken front-matter
and silently never appears.

- A. The site builds.
- B. Build, plus every content file actually produced a page (catches a post that silently vanishes), plus no dead links between your own pages.
- C. Everything in B, plus an automated accessibility check against the WCAG 2.1 AA bar you already committed to.
- D. Everything in C, plus unit tests on any hand-written code that is genuinely logic.
- X. Other (please specify)

[Answer]: B

---

### Q4. When a check fails, what should happen?

The draft contains a contradiction that has to be settled here: it says checks
run before a change is live, and also that a post going live must never depend
on an action from you. If a failing accessibility check can silently stop a post
appearing, that is the exact failure your publishing rule exists to forbid — you
would find out weeks later from a reader.

A broken build always stops the publish; that is not negotiable and the
previously live site stays up. The question is what the *other* checks do.

- A. Only a broken build stops publishing. Links and accessibility report what is wrong but do not hold a post back.
- B. A broken build or a dead link stops publishing; accessibility reports.
- C. Any failed check stops the post going live until it is fixed.
- X. Other (please specify)

[Answer]: C

---

### Q5. You committed to WCAG 2.1 AA keyboard and landmark behaviour. An automated scan only covers part of that — tab order and visible focus need a person. How should the rest be verified?

- A. A keyboard walkthrough of each page type, once when its layout is built and again after the visual styling is applied.
- B. The automated scan only; accept that tab order and focus are unverified.
- C. One keyboard walkthrough by hand before launch, not per change.
- D. A keyboard walkthrough on every change.
- X. Other (please specify)

[Answer]: A

---

## Deployment

### Q6. If publishing breaks after you push — the site stops updating — how should you find out?

This has now been deferred twice: the user flow flagged it, and the initiative
brief carried it forward as a medium risk. A publishing path whose failure is
silent stops working quietly.

- A. GitHub emails you when the build fails.
- B. You check the live site yourself after each post.
- C. A build-status badge in the README that you check.
- D. You do not need a signal.
- X. Other (please specify)

[Answer]: B

---

### Q7. If a published change is wrong, the plan is: undo that commit, push, and the site rebuilds to the previous state. Should that be proven once before the site carries real content?

It is proposed, not tested. No deployment has happened yet.

- A. Yes — do one deliberate break-and-undo as part of the first piece of work.
- B. Yes, but later, once there is real content on the site.
- C. No — undoing a commit is obviously enough; no rehearsal.
- X. Other (please specify)

[Answer]: A

---

## Code Style

### Q8. How should code formatting work, and should it touch the text of your posts?

For one person, a style rule that requires remembering is a style rule that
erodes. The separate question is whether a formatter is allowed to rewrap
paragraphs and normalise punctuation in prose you wrote deliberately — this
becomes infuriating at about post five, and a formatter rewriting a post's
front-matter can break how the post is published.

- A. A formatter runs automatically on save and the build checks it; it formats site code only and never touches post text.
- B. A formatter runs automatically on save; it formats everything, posts included.
- C. A formatter runs automatically on save for site code only; the build does not check formatting.
- D. No tool rewrites your files; formatting is by hand.
- X. Other (please specify)

[Answer]: A

---

## Security

### Q9. Anyone who can sign in to your GitHub account can change what the public sees on your site. That account is the site's entire access control. Is it protected by more than a password?

This site gets linked from job applications under your real name. The realistic
attack is not data theft — there is no data — it is the site quietly serving
something you did not write. Every other control on this list is smaller than
this one.

- A. Already set up (authenticator app, passkey, or security key).
- B. Not yet — I will set it up before the site goes live.
- C. No, and I do not want to.
- X. Other (please specify)

[Answer]: A

---

### Q10. GitHub can check every push for things that look like passwords or API keys and refuse the push if it finds one. It is free on public repositories and takes about a minute to switch on. Turn it on?

It matters here specifically: posts about things you are currently learning tend
to carry pasted terminal output and config snippets. Anything pushed to a public
repository is public immediately and stays reachable afterwards — deleting it
later does not take it back.

The second part is a rule to write down: if a key ever does leak, cancel it at
the service that issued it *first*, before trying to clean git history. Cleaning
history does not un-publish something already copied, forked, or archived.

- A. Yes to both — turn the check on now, and record the cancel-it-first rule.
- B. Turn the check on now; do not record the rule.
- C. Turn it on later, before the first real post; record the rule.
- D. No to both.
- X. Other (please specify)

[Answer]: A

---

### Q11. Should your site load anything from other companies' servers while a reader is viewing it — web fonts, icon sets, a stylesheet from a CDN?

Each of those sends the IP address and referring page of everyone who reads your
site to a third party, which is the substance of the visitor tracking you already
ruled out of scope — arriving through the back door, usually inside a theme. The
alternative is copying those files into your own repository, which also makes the
site faster.

- A. Nothing third-party. Copy fonts and assets into the repository, and enforce it with a content-security policy in the page head so a theme that quietly adds one breaks visibly instead of leaking.
- B. Nothing third-party, as a rule you follow — no technical enforcement.
- C. Web fonts from a third party are fine; nothing else.
- D. Decide case by case later.
- X. Other (please specify)

[Answer]: A

---

## Follow-up — Contradiction Between Q4, Q6, and the Mandated Publishing Rule

### Q12. Your answers to Q4 and Q6 combine into the failure the record has already flagged twice. Which should give?

- Q4 answer (`C`): any failed check stops the post going live until it is fixed.
- Q6 answer (`B`): you find out about publishing problems by looking at the live site yourself. No automatic notification.
- The approved scope document's rule: "write a file, commit it, and it appears; no further steps."

Together those mean: a post with a dead link or a bad front-matter field never
appears, and nothing tells you. You find out whenever you next happen to look —
which is the silent publish failure the user flow and the initiative brief both
carried as a medium risk, arriving through a different door.

The two answers are individually reasonable; it is the combination that breaks.
Either the blocking has to be paired with a signal, or the blocking has to
soften.

- A. Keep the blocking, add the signal: any failed check still stops the post, and GitHub emails you when it happens. (Changes the Q6 answer.)
- B. Keep manual checking, soften the blocking: only a broken build stops the publish; a dead link or a missing page publishes anyway and is recorded for you to fix. (Changes the Q4 answer.)
- C. Keep the blocking, keep manual checking, and accept the risk knowingly: it is recorded as a deliberate choice and the Construction phase does not try to solve it.
- D. Keep the blocking, and the check runs on your machine before you push rather than after, so a failure is in front of you at the moment you would have pushed.
- X. Other (please specify)

[Answer]: D

---

## Consolidated Summary Confirmation

**Way of Working** — Site code, layout, and build configuration go on a
short-lived branch you merge yourself; posts and project write-ups commit
straight to `main`. [Q1]

**Walking Skeleton** — The AI-DLC workspace and audit trail stay in the
repository but are excluded from the built website, and "nothing I did not
intend to publish is reachable" becomes part of what the first piece of work has
to prove. A deliberate break-and-undo is rehearsed as part of that same first
piece of work. [Q2], [Q7]

**Testing Posture** — Methodology stays `test-after`. The automatic checks are:
the site builds, every content file actually produced a page, and no dead links
between your own pages. No automated accessibility scan. Any failed check stops
the post going live, and those checks run on your machine before you push, so a
failure is in front of you at the moment you would have pushed. WCAG 2.1 AA
keyboard and landmark behaviour is verified by a keyboard walkthrough of each
page type — once when its layout is built, again after the visual styling is
applied. [Q3], [Q4], [Q5], [Q12]

**Deployment** — A push to `main` publishes the site; a broken build publishes
nothing and the previously live site stays up. You find out about publishing
problems by checking the live site yourself; there is no automatic notification.
Rollback is `git revert` plus a push, rehearsed once before the site carries real
content. Nothing at page load comes from a third party: fonts and assets are
copied into the repository and a content-security policy in the page head
enforces it. [Q6], [Q7], [Q11]

**Code Style** — A formatter runs automatically on save and the build checks it.
It formats site code only and never touches the text of your posts. [Q8]

**Security** — The GitHub account already has a second factor. Secret push
protection gets switched on now, and the rule "cancel a leaked credential at the
service that issued it before touching git history" is recorded. [Q9], [Q10]

- Looks correct
- Request changes

[Answer]: Looks correct

---
