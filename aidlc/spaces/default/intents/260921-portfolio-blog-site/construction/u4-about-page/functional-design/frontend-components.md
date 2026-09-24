# Frontend Components — U4 About Page

One page template and nothing else. Build-time markup structure, not a
client-side component tree.

## Sources

- [upstream] `inception/units-generation/unit-of-work.md` § U4 — the boundary and
  the warning that this unit's main risk is being treated as trivial
- [upstream] `inception/units-generation/unit-of-work-story-map.md` § U4 — the
  single requirement, FR4.1
- [upstream] `inception/requirements-analysis/requirements.md` — FR4.1, FR4.2,
  FR4.5, NFR1, NFR2, NFR6
- [upstream] `inception/domain-design/components.md` — `PageRenderer`, which owns
  this template along with the other six
- [upstream] `construction/u1-publishable-site-shell/functional-design/frontend-components.md`
  — the shell this page inherits and the skeleton version of this template
- [upstream] `inception/refined-mockups/mockups.md` — the technical register
- [Q1] `functional-design-questions.md`

The declared `contract-summary` input is absent: Contract Design is SKIP in this
scope.

---

## Hierarchy

Slots into the `Main` element of U1's `BaseDocument`; the shell, head metadata
and content-security policy are inherited unchanged.

```
AboutPage
 +- PageHeading
 +- AboutProse          (held in this template — BR10.1)
 +- ContactLinks
     +- ContactLink*    (plain outbound links, named for their destination)
```

No reusable include is introduced. `PageHeading` and the shell come from U1;
`AboutProse` and `ContactLinks` exist on this page only, and making either one
reusable would be building a general capability for a single use.

---

## Props and branches

| Template | Props | Branches |
|---|---|---|
| AboutPage | — | none |
| AboutProse | — | none |
| ContactLinks | — | none |
| ContactLink | `label`, `href` | none |

**No branches anywhere, and no props above the leaf — that is the point of
[Q1]'s answer.** The prose is in the template, so nothing is passed into the
page and nothing on it can be absent.

The one exception is in the table above and is worth naming rather than glossing:
`ContactLink` takes `label` and `href`, because it is instantiated once per link.
Those values are literals written in `ContactLinks`, not data arriving from a
content file or a catalogue — so the page still takes no input, and there is
still no branch to get wrong. `AboutPage`, `AboutProse` and `ContactLinks`
themselves take nothing.

Every other page type in the site takes data from a catalogue and has at least
one branch; this one takes none, which is why it is the cheapest page to build
and the easiest to forget to test.

### This signature supersedes U1's skeleton `AboutPage`

**Read this before building from U1's component contract.** U1's
`frontend-components.md` lists `AboutPage` with a `renderedBody` prop and a
hierarchy of `PageHeading + RenderedBody` — the same data-driven shape as
`PostPage` and `ProjectPage`. That was the skeleton's placeholder, written when
About was assumed to arrive as rendered content from a content file.

[Q1] settled it the other way, and this is where that lands:

| | U1 skeleton | U4 final |
|---|---|---|
| Props | `renderedBody` | none |
| Children | `PageHeading + RenderedBody` | `PageHeading + AboutProse + ContactLinks` |
| Source of the prose | a content file | this template |

**U4's signature is the final one. `renderedBody` is dropped and `RenderedBody`
is not used by this page at all.** U2 and U3 deepen `PostPage`/`ProjectPage`
while keeping U1's prop shape; U4 is the one template whose contract actually
changes, so it is stated here rather than left for a developer to discover.
Without this note, someone reading U1 in isolation would wire About to a data
source that does not exist.

The reason is [Q1]'s: keeping the content model at exactly two kinds (post and
project) rather than adding a third kind, or a general page capability, for one
page. The cost is recorded in `functional-spec.md` — editing About is a code
change on the branch path rather than a content commit direct to `main`, and the
formatter will rewrite that prose.

`RenderedBody` itself is untouched and still serves `PostPage` and `ProjectPage`.

---

## Interaction flows

| Flow | Trigger | Result |
|---|---|---|
| Reach About | The About link in the shell's navigation, on any page | The About page, one click from anywhere (U1 BR5.7) |
| Leave for a profile | Any contact or profile link | Off site, to that destination |
| Leave for elsewhere on the site | Any other shell navigation link | That page |

No flow involves JavaScript. There is no focus management, no disclosure, and
nothing that can trap focus.

**Contact links are plain links** (BR10.2). Not an embedded profile widget, not a
third-party icon set, not a `mailto:` obscured behind a script. An embedded
widget would load from another server, which U1's content-security policy breaks
outright — visibly, which is the point of having the policy.

---

## Form validation

**Not applicable.** This page has no form, and specifically **no contact form** —
that would be an authoring or interaction path the initiative excluded, and U1's
policy carries `form-action 'none'`, so the absence is enforced rather than
merely intended. Contact happens through the links, which is what FR4.1 asks for.

## API integration points

**None.** The page is static markup with outbound links. Nothing is fetched at
build time or at page load.

---

## Responsive behaviour

The page is prose and a short list of links in a single column, so it contracts
to phone width without a layout rule of its own (NFR6). Two commitments:

- **Each contact link is its own element**, sized to clear the 44px phone
  minimum on its own (NFR7). A row of icon-sized links side by side is the
  failure mode to avoid.
- **The prose sits in the same measure as every other technical-register page**,
  so U5 styles it with the rules it already has rather than adding a case.

---

## The keyboard walkthrough this page will try to skip

`unit-of-work.md` says it plainly: this unit is small enough that its main risk
is being treated as trivial. The walkthrough runs on this page type when it is
built and again after U5's styling, exactly as on the other six. On a page with
no branches and no data, it is around two minutes:

1. Tab once — the skip link is first and becomes visible on focus.
2. Tab on — the shell's navigation, with About marked as the current page.
3. Tab on — each contact link in turn, each with a visible focus outline.
4. Confirm tab order matches visual order and nothing swallows focus.

A page type whose walkthrough has not been done is not finished, and this is the
page type most likely to reach the gate without one.
