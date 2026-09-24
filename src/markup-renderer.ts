/**
 * MarkupRenderer — Markdown to HTML, with code already coloured.
 *
 * This is the one component wrapping substantial third-party code, kept behind a
 * single boundary so the constraint that nothing runs in the reader's browser is
 * checkable in one place rather than re-verified everywhere (ADR-003).
 *
 * Two properties are load-bearing and neither is a preference:
 *
 * 1. **Colouring happens here, at build time** (FR2.7). A browser-side
 *    highlighter would be both a loading state (NFR2) and, if fetched, a
 *    third-party request (NFR3) — so it does not exist anywhere on this site.
 * 2. **The emitted markup carries no inline `style` attribute.** The
 *    content-security policy BR5.10 fixes is `style-src 'self'` with no
 *    `unsafe-inline`, which blocks style attributes as well as style blocks. A
 *    highlighter emitting inline colours would therefore render as uncoloured
 *    text in a browser and nothing would say so. Tokens are classified by their
 *    TextMate scope into class names instead, which U5's stylesheet colours.
 */

// The default export is the callable class; the named `MarkdownIt` export is the
// instance type, so it is aliased rather than shadowing the class.
import MarkdownIt, {
  type MarkdownIt as MarkdownItInstance,
  type Token,
} from "markdown-it";
import {
  type BundledLanguage,
  type Highlighter,
  bundledLanguages,
  createHighlighter,
} from "shiki";

/**
 * The token classes the emitted markup uses.
 *
 * Three named classes plus unclassified text is four treatments, which is the
 * ceiling `refined-mockups/interaction-spec.md` § Code Block sets. Completing
 * the theme is U2's; emitting classes it can style is this unit's.
 */
const TOKEN_CLASSES = {
  comment: "tok-comment",
  string: "tok-string",
  keyword: "tok-keyword",
} as const;

/** The theme is used only to drive the tokenizer; its colours are discarded. */
const TOKENIZER_THEME = "github-dark";

export interface MarkupRenderer {
  /** Render a Markdown body to HTML, with fenced code already coloured. */
  render(markdown: string): Promise<string>;
}

/**
 * Escape text for HTML content and for double-quoted attribute values.
 *
 * The apostrophe is deliberately left alone. Every attribute this site emits is
 * double-quoted, so `'` needs no escaping in either position — and escaping it
 * would rewrite the content-security-policy value, which BR5.10 fixes
 * character for character and which is full of single quotes. An escaped policy
 * still works in a browser, but it stops being the literal string the rule
 * names and the thing a reader inspects.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Classify a TextMate scope stack into one of the token classes, or none.
 *
 * Scope names rather than colours, because a colour is a theme's opinion and a
 * scope is the grammar's fact — and because a class name is the only form the
 * content-security policy permits.
 */
function classifyScopes(scopeNames: readonly string[]): string | null {
  for (const scope of scopeNames) {
    if (scope.startsWith("comment")) return TOKEN_CLASSES.comment;
  }
  for (const scope of scopeNames) {
    if (scope.startsWith("string") || scope.startsWith("constant.character")) {
      return TOKEN_CLASSES.string;
    }
  }
  for (const scope of scopeNames) {
    if (
      scope.startsWith("keyword") ||
      scope.startsWith("storage") ||
      scope.startsWith("constant.language") ||
      scope.startsWith("variable.language") ||
      scope.startsWith("entity.name.tag") ||
      scope.startsWith("support.type.primitive")
    ) {
      return TOKEN_CLASSES.keyword;
    }
  }
  return null;
}

/** True when shiki ships a grammar for this language name. */
function isBundledLanguage(lang: string): lang is BundledLanguage {
  return Object.hasOwn(bundledLanguages, lang);
}

/**
 * Reduce a fence's language label to the form shiki's grammar ids take.
 *
 * Grammar ids are lowercase, so a label written `TS` would otherwise be reported
 * as a language the highlighter does not know — which under BR8.2 fails the
 * build. Case is not what that rule is about: it exists to catch a misspelled
 * label, and ` ```TS ` is not a misspelling.
 */
function normaliseFenceLanguage(label: string): string {
  return label.trim().toLowerCase();
}

/**
 * True when the highlighter has a grammar for this fence label (BR8.2).
 *
 * This is BR8.2's PRIMARY `known_language_resolution` route: ask the highlighter
 * rather than declare an accepted-label set in configuration. Shiki's
 * `bundledLanguages` carries its aliases alongside its canonical ids — 104 of
 * the 346 keys are aliases — so ` ```js ` and ` ```ts ` resolve as known and the
 * configured-label fallback the rule allows stays unused (U2CA3).
 *
 * An empty label is not "known": an unlabelled fence is a separate branch of
 * BR8.2 and is never reported as an unknown language.
 */
export function isKnownFenceLanguage(label: string): boolean {
  const normalised = normaliseFenceLanguage(label);
  return normalised !== "" && isBundledLanguage(normalised);
}

/** The first word of a fence's info string — its language label, or `""`. */
function fenceLabel(token: Token): string {
  return token.info.trim().split(/\s+/)[0] ?? "";
}

/**
 * The parser configuration, shared by the renderer and the fence scanner.
 *
 * Raw HTML in a post body is not rendered. A post is prose, and the one genuine
 * vulnerability class a static site can have is markup smuggled into a page;
 * `html: false` closes it, and the reusable-include rule (`team.md` § Code Style)
 * is how a post gets a capability the layout lacks.
 */
function createParser(): MarkdownItInstance {
  return new MarkdownIt({ html: false, linkify: false, typographer: false });
}

/**
 * The scanner used by {@link unknownFenceLanguages}.
 *
 * Built once and reused. It is a parser rather than a regular expression on
 * purpose: a bare ``` inside an indented block, a code span, or a blockquote is
 * not a fence, and a scan that failed the build on one would stop the site
 * publishing over prose that was never a code block.
 */
let fenceScanner: MarkdownItInstance | undefined;

/**
 * Every labelled fence in a body whose language the highlighter does not know
 * (BR8.2).
 *
 * Returns the labels exactly as the author wrote them, so the field error quotes
 * the typo rather than a normalised form of it. An unlabelled fence contributes
 * nothing — it is a choice, not a mistake.
 *
 * Repeated labels are reported once: three fences carrying the same typo are one
 * authoring mistake, and BR4.2's "report every error" is about not hiding
 * *distinct* faults behind the first one.
 *
 * This is the predicate; the build is what fails on it. The check runs in
 * SiteBuilder's validate phase rather than here, because rendering happens after
 * validation has already aborted — a fence fault raised during rendering could
 * only ever be reported in a run where no front-matter error existed, which
 * would make a post with both faults take two fix cycles and would contradict
 * BR4.2.
 */
export function unknownFenceLanguages(markdown: string): string[] {
  fenceScanner ??= createParser();

  const unknown: string[] = [];
  for (const token of fenceScanner.parse(markdown, {})) {
    if (token.type !== "fence") continue;
    const label = fenceLabel(token);
    if (label === "" || isKnownFenceLanguage(label)) continue;
    if (!unknown.includes(label)) unknown.push(label);
  }
  return unknown;
}

/** The `<pre>` wrapper, shared by the coloured and the plain paths. */
function wrapCodeBlock(inner: string, lang: string): string {
  const languageClass =
    lang === "" ? "" : ` class="language-${escapeHtml(lang)}"`;
  // `tabindex="0"` makes a horizontally scrolling code block reachable by
  // keyboard, which NFR1 requires of anything a reader has to scroll.
  return `<pre class="code-block" tabindex="0"><code${languageClass}>${inner}</code></pre>\n`;
}

/**
 * Colour one fenced block into class-carrying spans.
 *
 * Two plain paths remain, and one path that used to be plain is now a fault:
 *
 * - An **unlabelled** fence renders as a plain code block, silently. That is a
 *   choice an author makes, not a mistake (BR8.2).
 * - A grammar that resolves and then fails to tokenize falls back to plain
 *   rather than taking the site down. Unreachable in practice.
 * - A **labelled** fence naming a language the highlighter does not know no
 *   longer falls back silently. BR8.2 makes it a build failure, and SiteBuilder's
 *   validate phase has already reported it — so reaching here means validation
 *   was bypassed, which is an invariant violation rather than an authoring fault.
 */
function renderCode(
  highlighter: Highlighter,
  code: string,
  lang: string,
): string {
  const language = normaliseFenceLanguage(lang);

  if (language === "") return wrapCodeBlock(escapeHtml(code), "");

  if (!isBundledLanguage(language)) {
    throw new Error(
      `A fenced code block is labelled "${lang}", which names no grammar the highlighter has. ` +
        "BR8.2 makes this a field error reported by the build's validate phase, so it should " +
        "never reach rendering; reaching it means the validate phase was bypassed.",
    );
  }

  let lines;
  try {
    lines = highlighter.codeToTokens(code, {
      lang: language,
      theme: TOKENIZER_THEME,
      includeExplanation: "scopeName",
    }).tokens;
  } catch {
    return wrapCodeBlock(escapeHtml(code), language);
  }

  const rendered = lines
    .map((line) =>
      line
        .map((token) => {
          const parts = token.explanation;
          if (!parts || parts.length === 0) return escapeHtml(token.content);
          return parts
            .map((part) => {
              const className = classifyScopes(
                part.scopes.map((scope) => scope.scopeName),
              );
              const text = escapeHtml(part.content);
              return className === null
                ? text
                : `<span class="${className}">${text}</span>`;
            })
            .join("");
        })
        .join(""),
    )
    .join("\n");

  return wrapCodeBlock(rendered, language);
}

/** Every fence language used in a document, so grammars can be loaded before rendering. */
function fenceLanguages(tokens: readonly Token[]): BundledLanguage[] {
  const languages = new Set<BundledLanguage>();
  for (const token of tokens) {
    if (token.type !== "fence") continue;
    const lang = normaliseFenceLanguage(fenceLabel(token));
    if (lang !== "" && isBundledLanguage(lang)) languages.add(lang);
  }
  return [...languages];
}

/**
 * Create the renderer.
 *
 * Asynchronous because grammars are loaded on demand: loading all 300-odd
 * bundled languages up front would make every build pay for languages no post
 * uses.
 */
export async function createMarkupRenderer(): Promise<MarkupRenderer> {
  const highlighter = await createHighlighter({
    themes: [TOKENIZER_THEME],
    langs: [],
  });

  const md = createParser();

  md.renderer.rules["fence"] = (tokens, index) => {
    const token = tokens[index];
    if (!token) return "";
    return renderCode(highlighter, token.content, fenceLabel(token));
  };

  return {
    async render(markdown: string): Promise<string> {
      const env = {};
      const tokens = md.parse(markdown, env);

      for (const lang of fenceLanguages(tokens)) {
        if (highlighter.getLoadedLanguages().includes(lang)) continue;
        try {
          await highlighter.loadLanguage(lang);
        } catch {
          // Leave it unloaded; renderCode falls back to plain escaped code.
        }
      }

      return md.renderer.render(tokens, md.options, env);
    },
  };
}
