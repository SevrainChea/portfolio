import { marked } from "marked";
import DOMPurify from "dompurify";

// The assistant is prompted to answer with structure (paragraphs, bullets, and
// the occasional table). Rendering that markdown is a presentation concern owned
// by the chat skins, so the parse + sanitize step lives here as one auto-imported
// helper they all share. See docs/conventions/components.md.

// GFM gives us tables/strikethrough/autolinks; `breaks` maps a single newline to
// <br>, which matches how a chat reply is written. Set once at module load.
marked.setOptions({ gfm: true, breaks: true });

// Open links in a new tab without leaking the opener. Registered on the client
// only (DOMPurify needs a DOM) and guarded so HMR re-eval can't stack hooks.
if (import.meta.client) {
  DOMPurify.removeHook("afterSanitizeAttributes");
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
}

/**
 * Parse assistant markdown into sanitized HTML for v-html.
 *
 * marked emits raw HTML untouched (the model sometimes writes literal <br> in
 * table cells), so DOMPurify is what makes the output safe to inject — it strips
 * scripts/handlers while keeping the formatting tags. The chat routes are
 * client-only (`ssr: false`), so the sanitize step only ever runs in the
 * browser; on the server we never reach a v-html render, but guard regardless.
 */
export function renderMarkdown(src: string): string {
  if (!src) return "";
  const html = marked.parse(src, { async: false }) as string;
  return import.meta.client ? DOMPurify.sanitize(html) : html;
}
