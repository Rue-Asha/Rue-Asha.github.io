# Project-Level Rules

> Project-specific specialisation and corrections. Loaded after `org.md` and
> `team.md` as strict-additive guidance; contradictions with broader policy
> are rejected. Populated by practices-discovery and the self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project needs stable, durable guidance beyond the
> team practice (for example, package-specific release checks or an additional
> regression suite for a legacy component).

## Way of Working

<!-- Project-specific specialisation. Example: -->
<!-- This monorepo requires package-scoped branch names and a package owner -->
<!-- review in addition to the team's normal merge policy. -->

## Walking Skeleton

<!-- Project-specific specialisation. Example: -->
<!-- The walking skeleton must exercise the legacy service adapter as well -->
<!-- as the new service boundary. -->

## Testing Posture

<!-- Project-specific specialisation. -->

## Change Control

<!-- Project-specific. Mode: strict or relaxed. Strict here holds for every intent and cannot be changed from chat. -->

## Deployment

<!-- Project-specific specialisation. -->

## Code Style

<!-- Project-specific specialisation. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

- NEVER add comments on posts. Source: (affirmed 2026-09-23)

`ideation/scope-definition/scope-document.md` § Out of Scope ([Q3]). (affirmed 2026-09-23)

- NEVER add an email newsletter or subscriber list. Same source. (affirmed 2026-09-23)

- NEVER add visitor analytics or tracking of any kind. Same source, and (affirmed 2026-09-23)

consistent with the intent statement's decision that no visitor figure is a (affirmed 2026-09-23)

success signal (`ideation/intent-capture/intent-statement.md` § Success (affirmed 2026-09-23)

Metrics). (affirmed 2026-09-23)

- NEVER add a CMS, an admin interface, or any authoring path beyond editing (affirmed 2026-09-23)

files directly. Same source. (affirmed 2026-09-23)

- NEVER design around the four exclusions above or leave hooks, extension (affirmed 2026-09-23)

points, placeholder configuration, or commented-out scaffolding for them. (affirmed 2026-09-23)

Source: the exclusions are stated as "excluded from this initiative entirely, (affirmed 2026-09-23)

not deferred. Later stages must not design around them or leave hooks for (affirmed 2026-09-23)

them" (`ideation/scope-definition/scope-document.md` § Out of Scope). (affirmed 2026-09-23)

- NEVER require an action from the author after `git push` for a published page (affirmed 2026-09-23)

to go live — no publish button, no dashboard, no manual deploy trigger, no (affirmed 2026-09-23)

step to remember. Source: as the Mandated publishing rule above; stated (affirmed 2026-09-23)

negatively here because that is the form a Construction agent can be checked (affirmed 2026-09-23)

against. (affirmed 2026-09-23)

- NEVER let a page of this site load any resource from a third-party server while (affirmed 2026-09-23)

a reader is viewing it — no web fonts, icon sets, stylesheets, scripts, or (affirmed 2026-09-23)

embedded widgets fetched from someone else's domain. Each such request sends (affirmed 2026-09-23)

every reader's IP address and referring page to a company nobody chose, which (affirmed 2026-09-23)

is the substance of the visitor tracking already excluded. Source: (affirmed 2026-09-23)

practices-discovery interview [Q11], answer A. (affirmed 2026-09-23)

## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

- ALWAYS keep publishing to a single act: the author writes a file, commits it, (affirmed 2026-09-23)

and pushes it, and the page is live. Source: "Write a file, commit it, and it (affirmed 2026-09-23)

appears; no further steps" (`ideation/scope-definition/scope-document.md` (affirmed 2026-09-23)

§ Minimum Viable Scope, [Q7]); restated as a first-class user flow in (affirmed 2026-09-23)

`ideation/rough-mockups/user-flow.md` Flow 3. (affirmed 2026-09-23)

- ALWAYS meet WCAG 2.1 AA for keyboard operation and landmark structure on every (affirmed 2026-09-23)

page of this site: a working skip-to-content link, tab order following visual (affirmed 2026-09-23)

order, no focus trap, and a visible focus indicator on every focusable element. (affirmed 2026-09-23)

Source: `ideation/rough-mockups/user-flow.md` § Keyboard Flow and (affirmed 2026-09-23)

`ideation/rough-mockups/wireframes.md` ([Q5]), carried into (affirmed 2026-09-23)

`ideation/approval-handoff/initiative-brief.md` § Concept Visuals. (affirmed 2026-09-23)

- ALWAYS serve this site's pages complete, with no loading state. Source: the (affirmed 2026-09-23)

wireframes mark the loading state not applicable on the stated grounds that (affirmed 2026-09-23)

pages are served complete (`ideation/approval-handoff/initiative-brief.md` (affirmed 2026-09-23)

§ Concept Visuals). This is a constraint on how pages are built, not a styling (affirmed 2026-09-23)

preference: a page that assembles itself client-side breaks it. (affirmed 2026-09-23)

- ALWAYS exclude the AI-DLC workspace (`aidlc/`) and the tooling directories (affirmed 2026-09-23)

(`.claude/`) from this site's published output. They stay in the repository and (affirmed 2026-09-23)

are version-controlled; they must not be reachable as pages on the website, and (affirmed 2026-09-23)

exclusion must be configured in the site generator rather than left to the (affirmed 2026-09-23)

author remembering. Source: practices-discovery interview [Q2], answer A. (affirmed 2026-09-23)

- ALWAYS keep GitHub's secret push protection switched on for this repository, so (affirmed 2026-09-23)

a push containing something that looks like a credential is rejected before it (affirmed 2026-09-23)

reaches the remote. Source: practices-discovery interview [Q10], answer A. (affirmed 2026-09-23)

- ALWAYS revoke a leaked credential at the service that issued it *before* (affirmed 2026-09-23)

touching git history. Rewriting history does not unpublish anything that was (affirmed 2026-09-23)

already fetched, forked, or archived; revocation is the only step that actually (affirmed 2026-09-23)

ends the exposure. Source: practices-discovery interview [Q10], answer A — the (affirmed 2026-09-23)

author explicitly asked for this rule to be recorded. (affirmed 2026-09-23)

- ALWAYS serve this site's fonts, icons, stylesheets, and scripts from files (affirmed 2026-09-23)

copied into this repository, and enforce that with a content-security policy in (affirmed 2026-09-23)

the page head. Source: practices-discovery interview [Q11], answer A. (affirmed 2026-09-23)

## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
- When a free-text answer to a stage question names a complete, unambiguous choice, treat it as the answer rather than reopening the question for discussion; record only what it actually states, and leave anything it does not state as an assumption. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:intent-capture:e761755f21a85af440cd8d16c16a990425ddbd4a92049082a3afbf06bad2f646 -->
- Author stage questions with at most four options plus Other, so each question fits a single interactive prompt instead of being split across two rounds. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:intent-capture:44830d4c77837cb29ff74f5d67198eb1267367026c98911efc872fe4e9e93b23 -->
- When the human explicitly chooses a qualitative success bar, record the absence of a measurable target as a labelled assumption rather than inventing a metric to satisfy a guardrail. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:intent-capture:7f3253aa4fd5dae833a6c3a452ee7a5b62040397230dab98473e6b5b3003c820 -->
- When a capability is neither chosen for the current version nor ruled out, record it as explicitly deferred (MoSCoW "Won't Have (this time)") and keep it visible in the backlog, rather than dropping it silently or treating it as optional-but-in. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:scope-definition:034846528b469a358fe9b26b1b878f7b4a0ec5120e1eb84a01ddadeffd352078 -->
- Sequence a required visual or design treatment after the structural work it applies to, not before it; it stays a must-have and only its position in the build order changes. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:scope-definition:27c2f5c5ed4df263f6b000cfccd375947c8ef33fb07ff9c2349ea93a9b99f4ab -->
- Search the design reference source (Mobbin) before writing design questions, so the options offered are real patterns with their real maintenance costs rather than descriptions of patterns. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:rough-mockups:4da0889c7e3e0452685101788bfbc96bded224a7a5b570c33278320426fa22f3 -->
- When an answer introduces a page type or pattern that was not looked up, go back to the design reference source for it rather than extrapolating from the references already gathered. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:rough-mockups:6293f0b0607afc022a08228067e9a812d12a04995d9034b5a50ea316906a0a41 -->
- Treat the author's own publishing workflow as a first-class user flow to design, not an implementation note; the shape of the site depends on it. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:rough-mockups:d95c7dde1d62c99ec5c3ff87fc27e355d0c5be51fde2c073c696d62db1f57f28 -->
- When a required screen state cannot occur for this system, mark it not applicable with the reason rather than inventing one to fill the slot. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:rough-mockups:dba272aa90fa4e65d3f2d6c71cafec0f2baa50deb706606d1a562cc7fdc5e2ad -->
- When the human reopens a design direction at a later stage, check what they named against what the approved artifact actually decided: if the thing named was deliberately left out of it, carry the reopening as a directive for the stage that settles it rather than jumping back. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:approval-handoff:8ee4ed3ba940009e47e4edafe2faf908de82ebcc689e9e7d84808203fa6657a2 -->
- When a helper that only prints a decision brief fails, present that summary inline and record the confirmation through the ordinary decision/answer pair rather than blocking the checkpoint; the receipt is the authorization, and say plainly that the helper failed. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:approval-handoff:91ec02c2d4289db97c8478aa407eab6db4d893eea2b3e02f5343a84e324c2e48 -->
- When an unresolved item cannot be answered by the people present, hand it to the next phase as named work with what closing it means, rather than resolving it by assumption in the handoff artifact. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:approval-handoff:aa7048b93bcedefe168a7ebb64aa7a5f1cde8a97bf030b0ce427af1067d4ebe5 -->
- When an open item handed to this stage concerns what other people experience, ask it from the human's own experience of being one of those people, and keep an explicit "cannot confirm" option so the item can close as unconfirmed rather than being answered by invention. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:requirements-analysis:1f0b55792fb16ad9bf65b0a5e47a720af0e8f3a6647a695bfdfb92126ce6bf0c -->
- Before authoring a stage's questions, subtract everything the approved upstream artifacts already settle, and ask only what is genuinely open — a question count below the depth range is the correct outcome when prior stages did their work. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:requirements-analysis:096b2c6c9026be0dabb87184764bba146799627524ba553508030d35122d3ee8 -->
- When a question touches a decision the human already made deliberately, offer the option that preserves that decision first, and never lead with the option that would quietly reverse it to satisfy a guardrail. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:requirements-analysis:ec6c99b382c142893a7b6c19d943ed1e66e0b63aa7e0cb7bc25c1d0239b47e6f -->
- When an answer pulls against an already-affirmed practice, ask the targeted follow-up that settles it even if that exceeds the stage's depth range; an unresolved contradiction carried forward costs more than the extra question. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:requirements-analysis:99e529bc5c6c5841ffef6ec9e5e309fd3aa5abbc50ea9de3a0e365f0670c841f -->
- Spend a stage question on where a fail-loudly check runs. It looks like an implementation detail, but a requirement that the build itself must fail naming the file and the field is exactly what stock tooling does badly, so the answer is both a component-boundary decision and a constraint on what can be chosen later. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:domain-design:12c49190a6b4d6bcc91e18a065acf96aaee82b39d9231c9806155fd0cbf0df43 -->
- When a unit-boundary answer favours horizontal layers but the rest of the answers and the affirmed practices favour vertical slices, reconcile them through the walking skeleton rather than picking a winner: a skeleton is thin-but-complete by definition, so the first unit carries every component at minimum depth and the layer view gets a real home inside it. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:units-generation:4b078eeb768eb19259518860b07f67408cf79bad15bfc25c9b9e02416fd4bbbc -->
- When a constraint establishes that there is exactly one deployable, treat the deployment model as settled rather than asking about it, and use independent testability rather than independent deployability as the unit-boundary criterion. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:units-generation:e31f41b634f7d21e230e758a78a8eae922f90b3335a06778e1e564e4cc8d40c5 -->
- Say in the questions file which topics were subtracted because upstream already settled them, and name the artifact and section that settled each. A question count below the depth range then reads as prior stages having done their work rather than as a gap, and a follow-up that resolves a contradiction is not depth padding. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:units-generation:f28f308b7fc08732ac095d43cdfad7e983a519878863ee58f4923ed371a4b0c7 -->
- Leave a classification field empty with a stated reason rather than forcing the nearest available value onto something none of them describes. A wrong tag is something a downstream agent acts on; an empty one with a reason is something it can read. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:units-generation:25f20ac2674b8da4af639de02b40a80774cbc2c3c803a84726b9422df55bc7c1 -->
- When a review raises a gap against a unit that does not own the decision, settle it in the unit that does own it rather than answering it where it was raised; the same gap answered twice in two units drifts apart. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:functional-design:91bc149b57f4267ddbf6ca24e8953234be729e137a276184af742d3b4b9d7550 -->
- When a stage is flagged stale, check whether any upstream input actually changed before treating it as a design fault; if the flag came from a downstream stage writing back into this stage's own artifact, say so plainly before asking what should change. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:domain-design:16479b20f53cd9195a7ee4d137be43b5c81e9b3eaddf3f572f64603cf678fd9a -->
- Scope a Modify re-entry's questions by diffing the existing artifact against the system as built, rather than re-asking the stage's original topic areas against decisions already settled. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:domain-design:99bed85210cb0ed5029ccd034c46e92bd45f13985bcf44ae7af53f3a19e7995d -->
- When a decision widens an affirmed practice rather than matching it literally, record the divergence and its cost in a decision record rather than leaving it to be noticed later. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:domain-design:1f4161885ffd6ddc66d0682d14ef0329dcebc8090ace214f192f155928d9271b -->
- When one unit owns a mechanism that other units' deliverables depend on, record it in the owning unit, in each depending unit, and in the integration-points table, so a failure can be attributed without reading all three. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:units-generation:70f2e5323812af75049bca32778d6fc04ae1801a2bc7e07fc2d8274e1a574279 -->
- A traceability row marked `OK` asserts that some rule establishes every commitment the requirement makes, not merely that the unit works on that requirement. When no rule does, author the missing rule rather than retargeting the row to a nearer one — retargeting only finds another near-miss. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:functional-design:702d262001aa64bb325c02082458162bc4ff8543a6c5cd45157100e959961161 -->
- Never present an approval gate while a Critical finding is open, least of all one just named as the first thing to fix. Fix it, then gate. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:functional-design:c991a0cb3bed39ba2cd8e24b1e7b8fbacc5eaf144edf44794bdab1d0156d2e4e -->
- An approval gate offers exactly two choices, Approve and Request Changes. Do not invent a third bespoke option that narrows the scope of the fix. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:functional-design:6496fde2d32bed7e4bb1a4d2f0461cdb25253d811733dd35656ff407c761e6d5 -->
- When a rule quotes a requirement verbatim, scope that quote against the rules written after the requirement rather than reproducing it unqualified; otherwise the older wording instructs a developer to undo what a newer rule established. (learned 2026-09-23) <!-- cid:260921-portfolio-blog-site:functional-design:85e3df8af7527f01d2786396016136d22e7125f0c5789810f8ce399714785aaa -->
- A unit whose design stage is genuinely not applicable is exempt from inventing content, not from the stage's own machine checks. Record the requirements that constrain the unit's files as N/A coverage rows naming the delivering unit, and explain each borrowed rule ID in the reverse array, rather than leaving an empty coverage array or an invented placeholder rule. (learned 2026-09-24) <!-- cid:260921-portfolio-blog-site:functional-design:8a765a67444ac5e66250f6c077f4afbc1c86acb42616bc20ca39168b1d024e22 -->
- Never clear an automated check by writing something untrue into the artifact. When the check disagrees with the stage contract, leave the finding failing, record why in the artifact, and verify whether sibling units are affected the same way — a check limitation documented is worth more than a green result that makes the file lie. (learned 2026-09-24) <!-- cid:260921-portfolio-blog-site:functional-design:c15075265b6bde7d538d6a091e2b82db5fff2675e72b80d06428873fad0bb3f8 -->
- A requirement that names two distinct things needs two rules, not one. One rule covering both leaves the second half resting on an uncited derivation in an upstream document, where nothing can check it. (learned 2026-09-24) <!-- cid:260921-portfolio-blog-site:functional-design:02b3804d59c177489dc8b4d59715c0503cd121792d8e69f7b51bf39eb64f06f2 -->
- Consult Mobbin before Plan Approval for any Code Generation unit that renders UI, and name in the plan which page types were checked and against which references. The design artifacts are the contract the code implements, but they were written once at Refined Mockups; checking the plan against real patterns at build time is what catches a spec decision that reads worse than it argued. A unit that renders no UI is exempt, and the check never overrides an approved design decision by itself — it produces a finding for the human to weigh. (learned 2026-09-24) <!-- cid:260921-portfolio-blog-site:code-generation:d105cfdc1e99132d8606a6fe010899fb1219373f207434d3601778e688bf0a48 -->
- When a pass carries a fix that did not come from the check the pass exists to run, label its provenance explicitly in the artifact rather than filing it under that check's section; mixing a code-reading finding into a design-reference section makes the section's sourcing untrue. (learned 2026-09-24) <!-- cid:260921-portfolio-blog-site:code-generation:d78b6e78a032575fb5cf2a44b853e43e00f88ef87385707c4f539db61f3e7bc0 -->
- Record a verification-only pass with an empty source-manifest writes array rather than finding something to change so the array is non-empty. A pass that claims a write it did not make is a false record; an empty array with the pass documented is readable. (learned 2026-09-24) <!-- cid:260921-portfolio-blog-site:code-generation:3e6f7fa17975b33acbea66c8bbe22410f8348f7243235013defc5217ae827c43 -->
- When a rule carries an explicit exemption and a unit qualifies for it, record the exemption and its reason in the artifact rather than omitting the section silently. An absence with a stated reason is something a later reader can act on; an absence without one looks like a skipped step. (learned 2026-09-24) <!-- cid:260921-portfolio-blog-site:code-generation:eb9fff7cb9dd4cdbe22a4cfb8e5e3abc214b4eedb7667a090970abb216f5f1b5 -->
