// Access log — one structured JSON line per API request, written to stdout and
// captured by Vercel's function logs. A classic access log: method, path,
// status, duration. Scoped to /api/** so page renders and static assets don't
// spam the stream. Deliberately logs no client IP or user-agent — zero PII, so
// there's no retention/consent story to maintain.
//
// Two streaming caveats, specific to /api/chat (the AI SDK route, ADR-0002):
//  - durationMs reflects true generation time only when the response streams
//    over a real Node socket (local dev). On a socketless web runtime, h3's
//    sendStream resolves before the stream drains, so durationMs collapses to
//    roughly time-to-headers. Same code, different number local vs. prod.
//  - The AI SDK streams model errors as data (onError) instead of throwing, so
//    a failed chat completion still logs status 200. This log won't catch model
//    errors — it answers "was the endpoint hit, how fast," not "did the LLM ok."
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    if (!event.path.startsWith("/api/")) return;
    event.context.accessLogStart = performance.now();
  });

  nitroApp.hooks.hook("afterResponse", (event) => {
    const start = event.context.accessLogStart;
    if (start === undefined) return; // not an /api/** request
    console.log(
      JSON.stringify({
        method: event.method,
        path: event.path,
        status: event.node.res.statusCode,
        durationMs: Math.round(performance.now() - start),
      }),
    );
  });
});
