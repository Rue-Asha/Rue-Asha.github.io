# Rough Mockups & Concept Visualization — Questions

**Mode:** guided

## Sources

- [desc] Initial description: "I want to build a Github.io Blog site to present my work and make blog posts about things I currently learning or I find to be interesting. For UX/UI I want you to use Mobbin"
- [scope] Workflow-selected scope: `feature`.
- [upstream] `ideation/intent-capture/intent-statement.md`, `ideation/scope-definition/scope-document.md`, `ideation/scope-definition/intent-backlog.md`

## Mobbin references consulted

Pulled before writing these questions, per the initial description's direction
to use Mobbin for UX/UI. [desc]

Typographic list pattern — no per-post imagery:
- OpenAI, "Recent Highlights" — https://mobbin.com/sites/sections/9106767d-eaf5-4f29-b125-2dd3b9524c85
- Webflow, "Dream big" index — https://mobbin.com/sites/sections/449c340b-b013-4e4d-bb1b-25b405b4644a
- Hex, post list — https://mobbin.com/sites/sections/5a127a64-fafd-4405-8f58-a7b5e5bf466a
- Nite Riot, project index — https://mobbin.com/sites/sections/1aa05a05-6920-4f35-a581-3dcf42634162

Card-grid pattern — one header image per post:
- Codecademy — https://mobbin.com/screens/941b094b-b438-43f2-9764-90b765c02183
- Ghost — https://mobbin.com/screens/756cbee5-cff7-4fe2-9b56-0c6d4e5a6baf
- Podia — https://mobbin.com/screens/bf514c3d-f4b0-4eb4-ab46-c9019efa474e
- Hashnode — https://mobbin.com/screens/d922b22f-ad50-4703-bfe2-b94425ca5064

Person-then-writing pattern:
- Intercom author page — https://mobbin.com/sites/sections/70d72d58-9e5a-4aef-b775-7d88195c2586
- GitHub ReadME profile — https://mobbin.com/sites/sections/10928b8e-852d-4424-b248-8028e8ff92d5

Project-detail pattern with a metadata rail — pulled after the Q6 answer:
- basement.studio — https://mobbin.com/sites/sections/6ac71d72-4d9d-4e61-b9f0-df8432c83237
- Tailscale case study — https://mobbin.com/sites/sections/84f94fa1-216c-40e9-aa21-d4b6e8039f5b
- Obvious, contents rail for long pieces — https://mobbin.com/screens/48ebdb36-0d47-4585-8e92-fee7b45133f8

Long-form reading page:
- Substack — https://mobbin.com/screens/748e369a-1f0e-444f-a010-dd66dafd23bb

---

## Q1. What does a first-time visitor land on?

Both halves are weighted equally [upstream], so the home page has to carry both
without one obviously winning. These are the four ways that resolves.

A. A short intro, then recent posts and selected projects together on one page
B. An intro only, with clear routes to Writing and Projects
C. Projects lead the page, with recent writing below
D. Writing leads the page, with selected projects below
X. Other (please specify)

[Answer]: A. A short intro, then recent posts and selected projects together on one page

---

## Q2. How should posts be listed?

This is the main choice the Mobbin references surfaced, and it has a real
maintenance cost attached. A card grid needs a header image for every post; a
typographic list needs none and holds up at two posts.

A. Typographic list — title, date, one-line summary, no images
B. Card grid — each post gets a header image
C. Mixed — newest post shown large, the rest as a list
D. No preference — recommend one and tell me why
X. Other (please specify)

[Answer]: A. Typographic list — title, date, one-line summary, no images

---

## Q3. What shape should the navigation take?

Three sections is few enough that a heavy navigation would be more structure
than the site needs. [upstream]

A. Top bar with Home, Writing, Projects, About
B. Minimal top bar — name on the left, two or three links on the right
C. No persistent navigation — the home page is the hub, with back links
D. No preference
X. Other (please specify)

[Answer]: B. Minimal top bar — name on the left, two or three links on the right

---

## Q4. Which screen size should the design be resolved for first?

Not which is supported — both are — but which one gets designed properly and
which one adapts.

A. Mobile first — design for the phone, expand to desktop
B. Desktop first — design for the wide screen, contract to phone
C. Both equally — resolve both layouts at the same fidelity
D. No preference
X. Other (please specify)

[Answer]: B. Desktop first — design for the wide screen, contract to phone

---

## Q5. What accessibility bar should this site meet?

The design guidance in this workflow targets WCAG 2.1 AA by default. This
question is whether to hold that line or set a different one.

A. WCAG 2.1 AA — contrast, keyboard, landmarks, alt text, focus indicators
B. Sensible basics — readable contrast, keyboard access, alt text; no formal standard
C. Not a concern for this site
D. No preference
X. Other (please specify)

[Answer]: A. WCAG 2.1 AA — contrast, keyboard, landmarks, alt text, focus indicators

---

## Q6. What does one project entry show?

The projects half has to be credible to a recruiter scanning quickly.
[upstream]

A. Title, one-line summary, the tools used, and a link out to the repo or live thing
B. All of the above plus a screenshot
C. A full write-up page per project
D. Just a title and a link
X. Other (please specify)

[Answer]: X. Other — "When talking abou the full entry a short sumary, as well as a link ot the repo and tools, but also in edpth documentation about the project how I see fit". This combines A and C: the projects list shows a short summary, the tools used, and a link to the repo; each project additionally has its own in-depth page whose content the author decides per project.

---

## Q7. What sits alongside a post when someone is reading it?

A. Nothing — title, date, and the post body
B. The post plus a way back to the list of posts
C. The post plus links to other posts at the end
D. No preference
X. Other (please specify)

[Answer]: D. No preference — recommendation recorded and confirmed in Q8

---

## Q8. Post page recommendation, for you to confirm

You had no preference on Q7, so here is the recommendation with its reasoning.

**Recommended: the post, plus a way back to the list.** With one or two posts
at launch [upstream], "links to other posts at the end" has nothing to link
to and reads as a gap. A route back to the writing index always works, and
"links to other posts" can be added later once there are posts worth
surfacing — the same deferred-not-excluded treatment topic navigation got.

A. Confirm — the post plus a way back to the list
B. Nothing alongside the post at all
C. Add links to other posts now anyway
X. Other (please specify)

[Answer]: A. Confirm — the post plus a way back to the list

---

## Consolidated Summary Confirmation

Summary of all answers:

- Home page (Q1): a short intro, then recent posts and selected projects
  together on one page
- Post list (Q2): typographic list — title, date, one-line summary, no per-post
  images; chosen over a card grid because a grid needs artwork for every post
  and looks thin at launch volume
- Navigation (Q3): minimal top bar — name on the left, two or three links on
  the right
- Screen size (Q4): desktop first, contracting to phone; both supported
- Accessibility (Q5): WCAG 2.1 AA — contrast, keyboard access, landmarks, alt
  text, visible focus indicators
- Project entries (Q6): the projects list shows a short summary, the tools
  used, and a link to the repo; each project also has its own in-depth page
  whose content you decide per project
- Post page (Q7, Q8): the post plus a way back to the list; related-post links
  deferred until there are posts worth surfacing

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
