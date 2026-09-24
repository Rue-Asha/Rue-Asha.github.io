/**
 * MarkupRenderer — NFR2 and NFR3.
 *
 * Real `markdown-it` and real `shiki`. Stubbing them would hide the one thing
 * these tests are for: that colouring happened at build time and the output
 * contains no script and no external resource
 * (`unit-test-instructions.md` § Mocking and stubbing).
 */

import { beforeAll, describe, expect, it } from "vitest";

import {
  type MarkupRenderer,
  createMarkupRenderer,
} from "../../src/markup-renderer.ts";

let renderer: MarkupRenderer;

beforeAll(async () => {
  renderer = await createMarkupRenderer();
});

describe("MarkupRenderer", () => {
  it("renders headings, links, lists and images with alt text (FR2.6)", async () => {
    const html = await renderer.render(
      [
        "## A heading",
        "",
        "- one",
        "- two",
        "",
        "[a link](/writing/)",
        "",
        "![alt text](diagram.png)",
      ].join("\n"),
    );

    expect(html).toContain("<h2>A heading</h2>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain('<a href="/writing/">a link</a>');
    expect(html).toContain('alt="alt text"');
  });

  it("colours a fenced code block at build time (FR2.7)", async () => {
    const html = await renderer.render(
      '```ts\nconst greeting = "hello" // note\n```',
    );

    expect(html).toContain('<pre class="code-block"');
    expect(html).toContain('class="tok-keyword"');
    expect(html).toContain('class="tok-string"');
    expect(html).toContain('class="tok-comment"');
  });

  it("emits no inline style attribute, which the content-security policy would block (BR5.10)", async () => {
    const html = await renderer.render("```ts\nconst x = 1\n```");

    // `style-src 'self'` without `unsafe-inline` blocks style attributes as well
    // as style blocks. A highlighter emitting inline colours would render as
    // plain text in a browser and nothing would say so.
    expect(html).not.toMatch(/style\s*=/);
  });

  it("emits no script and no third-party URL (NFR2, NFR3)", async () => {
    const html = await renderer.render(
      [
        "Some prose.",
        "",
        "<script>alert(1)</script>",
        "",
        "```js",
        "console.log('x')",
        "```",
      ].join("\n"),
    );

    expect(html).not.toContain("<script");
    // Raw HTML in a post body is escaped rather than rendered.
    expect(html).toContain("&lt;script&gt;");
    // Nothing is fetched while a reader is on the page: the only URLs present
    // are the ones the author wrote.
    expect(html).not.toMatch(/src="https?:\/\//);
    expect(html).not.toContain("cdn");
  });

  it("renders an unlabelled fence as plain escaped code, silently", async () => {
    const bare = await renderer.render("```\na < b\n```");

    expect(bare).toContain('<pre class="code-block"');
    expect(bare).toContain("a &lt; b");
    expect(bare).not.toContain('<span class="tok-');
  });

  // This test also covered a LABELLED fence naming an unknown language, which it
  // asserted fell back to plain code silently. U2's BR8.2 settled that case the
  // other way — an unlabelled fence is a choice, a misspelled label is always a
  // mistake, and the build now fails naming the file and the language. That half
  // moved to `tests/u2/markup-renderer.test.ts` and `tests/u2/integration.test.ts`
  // rather than being deleted.
});
