/**
 * MarkupRenderer — BR8.1, BR8.2, FR2.6, FR2.7, NFR2, NFR3.
 *
 * Real `markdown-it` and real `shiki`, for the reason U1's suite gives: stubbing
 * them would hide the one thing these tests are for, which is that colouring
 * happened at build time and the output carries no script and no external
 * resource (`unit-test-instructions.md` § Mocking and stubbing).
 */

import { beforeAll, describe, expect, it } from "vitest";

import {
  type MarkupRenderer,
  createMarkupRenderer,
  isKnownFenceLanguage,
  unknownFenceLanguages,
} from "../../src/markup-renderer.ts";

let renderer: MarkupRenderer;

beforeAll(async () => {
  renderer = await createMarkupRenderer();
});

describe("The full Markdown set (FR2.6)", () => {
  it("renders headings, links, and both list kinds", async () => {
    const html = await renderer.render(
      [
        "# A title",
        "",
        "## A heading",
        "",
        "### A sub-heading",
        "",
        "- bullet one",
        "- bullet two",
        "",
        "1. step one",
        "2. step two",
        "",
        "Prose with [a link](/writing/) in it.",
      ].join("\n"),
    );

    expect(html).toContain("<h1>A title</h1>");
    expect(html).toContain("<h2>A heading</h2>");
    expect(html).toContain("<h3>A sub-heading</h3>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>bullet one</li>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>step one</li>");
    expect(html).toContain('<a href="/writing/">a link</a>');
  });

  it("passes an image's alt attribute through unchanged in all three states (BR8.1)", async () => {
    const html = await renderer.render(
      [
        "![A sequence diagram of the build phases](diagram.png)",
        "",
        "![](divider.png)",
        "",
        '<img src="raw.png">',
      ].join("\n"),
    );

    // Descriptive, and unmodified — nothing rewrites or truncates it.
    expect(html).toContain('alt="A sequence diagram of the build phases"');
    // Explicitly empty, which is how a decorative image is marked.
    expect(html).toContain('alt=""');
    // BR8.1 is an authoring rule and the build does not enforce it: no error, no
    // warning, no substituted text. A test asserting a build failure here would
    // silently reverse an approved accessibility position — the automated scan
    // was offered at Practices Discovery and declined, so nothing in this system
    // detects a missing alt, and that is the recorded cost rather than a gap.
    expect(unknownFenceLanguages("![](divider.png)")).toEqual([]);
    expect(html).not.toContain("alt-text-missing");
  });
});

describe("Fence languages (BR8.2, FR2.7)", () => {
  it("renders an unlabelled fence as plain code and reports nothing", async () => {
    const source = "```\na < b\n```";
    const html = await renderer.render(source);

    expect(html).toContain('<pre class="code-block"');
    expect(html).toContain("a &lt; b");
    expect(html).not.toContain('<span class="tok-');
    // An unlabelled fence is a choice, not a mistake, so it is never reported.
    expect(unknownFenceLanguages(source)).toEqual([]);
  });

  it("colours a known language with the three token classes and no fourth", async () => {
    const html = await renderer.render(
      '```ts\n// a note\nconst greeting: string = "hello"\n```',
    );

    expect(html).toContain('class="tok-comment"');
    expect(html).toContain('class="tok-string"');
    expect(html).toContain('class="tok-keyword"');

    // Three named classes plus unclassified text is four treatments, which is the
    // ceiling `interaction-spec.md` § Code Block sets. A fourth would be a
    // treatment U5 has no colour for and did not agree to.
    const emitted = new Set(
      [...html.matchAll(/<span class="(tok-[a-z-]+)">/g)].map(
        (match) => match[1] ?? "",
      ),
    );
    expect([...emitted].sort()).toEqual([
      "tok-comment",
      "tok-keyword",
      "tok-string",
    ]);
  });

  it("treats an alias label as known, not as a typo", () => {
    // Shiki carries its aliases alongside its canonical ids, which is what makes
    // BR8.2's PRIMARY resolution route workable without a configured label list
    // (U2CA3). Without aliases, ` ```js ` would fail the build.
    expect(isKnownFenceLanguage("js")).toBe(true);
    expect(isKnownFenceLanguage("ts")).toBe(true);
    expect(isKnownFenceLanguage("javascript")).toBe(true);
    // Case is not what BR8.2 is about: it exists to catch a misspelling.
    expect(isKnownFenceLanguage("TS")).toBe(true);
    expect(isKnownFenceLanguage("")).toBe(false);
  });

  it("reports a labelled unknown language, once, quoting what the author wrote", () => {
    const body = [
      "```rustlang",
      "fn main() {}",
      "```",
      "",
      "```rustlang",
      "fn other() {}",
      "```",
      "",
      "```ts",
      "const x = 1",
      "```",
      "",
      "```",
      "plain",
      "```",
    ].join("\n");

    // The same typo twice is one authoring mistake; two DISTINCT faults are two.
    expect(unknownFenceLanguages(body)).toEqual(["rustlang"]);
    expect(
      unknownFenceLanguages("```nope\nx\n```\n\n```alsonope\ny\n```"),
    ).toEqual(["nope", "alsonope"]);
    expect(unknownFenceLanguages("Prose with `ts` in a code span.")).toEqual(
      [],
    );
  });

  it("refuses to render a labelled unknown language rather than falling back silently", async () => {
    // The build's validate phase has already failed on this, so reaching the
    // renderer means validation was bypassed. Falling back to plain here would
    // publish the post with the typo intact and say nothing — the silent wrong
    // answer BR8.2 exists to replace with a loud one.
    await expect(
      renderer.render("```rustlang\nfn main() {}\n```"),
    ).rejects.toThrow(/rustlang/);
  });
});

describe("Nothing runs in the reader's browser (NFR2, NFR3)", () => {
  it("emits no script, no inline style attribute and no third-party URL", async () => {
    const html = await renderer.render(
      [
        "## Heading",
        "",
        "<script>alert(1)</script>",
        "",
        "![A diagram](diagram.png)",
        "",
        "```ts",
        'const greeting = "hello" // note',
        "```",
      ].join("\n"),
    );

    expect(html).not.toContain("<script");
    // Raw HTML in a post body is escaped rather than rendered.
    expect(html).toContain("&lt;script&gt;");
    // `style-src 'self'` without `unsafe-inline` blocks style attributes as well
    // as style blocks, so a highlighter emitting inline colours would render as
    // plain text in a browser and nothing would say so (BR5.10).
    expect(html).not.toMatch(/style\s*=/);
    expect(html).not.toMatch(/(?:src|href)="https?:\/\//);
  });
});
