# CONTEXT.md

The domain glossary for this repo — the canonical, shared vocabulary for talking
about the portfolio. A term means exactly what's written here; if you reach for a
synonym, prefer the canonical term or update this file.

This is a glossary, **not a spec**. It deliberately carries no implementation
detail (no file names, no APIs) — those live in `docs/conventions/` and
`docs/adr/`.

## Theme system

**Family**
A complete visual identity — its own page structure _and_ visual language, not
just a color choice. Four exist: Aurora, Neon, Editorial, Blueprint. Choosing a
family changes the whole look and structure.

**Variant**
A named color scheme _within_ a Family (e.g. Aurora's Cobalt or Emerald). A
variant changes the palette only — never the structure.

**Mode**
An orthogonal light/dark axis layered over any Theme — _not_ part of the Theme
itself. Resolved and remembered on its own track (stored → OS preference → the
family's default), per Family.

**Theme**
The look a visitor sees: one Family + one Variant. "The theme" is that pair; "the
theme system" is the machinery that resolves and applies it. Mode is a separate
axis (see Mode), not part of the theme.

**Layout**
A Family's rendering of the home page. Each Family has its own.

**Skin**
A Family's rendering of the chat page — the chat-page counterpart to a Layout.

**Role token**
A semantic appearance slot (e.g. accent, body text, border) that every Theme
re-defines. Components ask for a _role_, never a literal color, so they re-color
automatically when the Theme changes.

**Switcher**
The on-screen control a visitor uses to change Family, Variant, or Mode.

## Content

**Experience**
A role held at one company over a date range. Carries a title, the Positions
held, a description, a tech Stack, and links.

**Position**
A specific job title held _within_ an Experience. One Experience may span several
Positions over time.

**Stack**
The set of technologies associated with an Experience.

**Project link**
An external link to a product or project tied to an Experience.

## Chat

**Assistant**
The chat persona that answers visitors on Sévrain's behalf — bounded by the
Guardrails, drawing only on the Knowledge base, able to offer Actions. There is
exactly **one** Assistant: wherever it is exercised (the live chat, the eval
harness), it is the same Assistant — never a stand-in with different knowledge
or abilities. A Provider executes the Assistant but does not define it.

**Knowledge base**
The fixed set of documents about Sévrain that the assistant may draw on.
Answering only from these is Grounding.

**Context block**
The Knowledge base flattened into the assistant's system prompt. There is no
retrieval — every document is included on every request.

**Provider**
The swappable LLM backend that generates replies (e.g. Groq, Gemini, Ollama).
Chosen by configuration; the chat behaves the same regardless of which is active.

**Message**
A single turn in a chat conversation — from either the user or the assistant.

**Guardrail**
A rule constraining the assistant's behavior. There are two: Scope (should it
engage at all?) and Grounding (if it engages, is every claim supported?). They
are orthogonal — keep them distinct.

**Scope**
The topic boundary of the assistant: Sévrain — his person, experience, skills,
projects, and availability. A question is **in scope** when it is about him
(even if the Knowledge base can't answer it) and **out of scope** when it is a
general-purpose ask (arbitrary code, trivia, homework).
_Avoid_: on-topic/off-topic (use in/out of scope)

**Grounding**
Answering only from the Knowledge base. An in-scope question the Knowledge base
doesn't cover gets an honest "I don't have that" — never an invented fact, and
never a Redirect (missing data is not a Scope problem).

**Redirect**
The canonical reply to an out-of-scope request: one warm sentence declining,
then a nudge back to what the assistant can discuss. The task is not performed,
even partially.
_Avoid_: refusal (a Redirect steers; it doesn't just say no)

**Action**
Something the assistant does for a visitor beyond answering in prose, rendered
as an interactive element in the chat rather than a sentence. Some Actions only
_present_ information (a project summary card); others carry an _effect_ the
visitor can trigger (download the resume, open a pre-filled contact draft, switch
the site's Theme). The assistant offers the affordance; the visitor triggers the
effect — it never forces one. Any copy that introduces an Action on screen is
part of its rendering — presentation, not the Assistant's reply.
_Avoid_: "tool" here — the AI-SDK primitive that produces an Action is an
implementation mechanism, not a domain concept, and lives in `docs/conventions/`
and `docs/adr/`, never in this glossary.
