# Writing the copy

The drawing shows *what happens*; the copy says *why it matters*. Readers scroll,
so every stage gets about five seconds of attention before the next one arrives.

## Contents
1. Truth and voice
2. A stage's copy, piece by piece
3. "How it works" cards
4. Hero, route map, finale, principles
5. The Plain English layer
6. A checklist before you move on

---

## 1. Truth and voice

- **Every claim traces to the evidence ledger** (`discovery.md`). If you cannot point
  at a file, soften the claim or cut it. Numbers come from config or documents,
  never estimates.
- **Write in the author's voice**, first person if they are telling their own story.
  Read their README, CLAUDE.md or a few commit messages for tone, or ask for two
  sample sentences. Match their punctuation habits too.
- **Jokes live in subheads.** One dry line under each headline carries the
  personality, so the headline and paragraphs can stay plain and precise.
- **Headings take no trailing full stop.** Subheads and paragraphs do.

## 2. A stage's copy, piece by piece

```html
<div class="copy">
 <p class="eb"><span class="num">02a</span><span data-s="Specify">Specify</span>
   <code><svg class="hu" viewBox="0 0 24 24" aria-hidden="true"><use href="#human" width="24" height="24"/></svg><span class="vh">run by a person: </span>/new-ticket</code></p>
 <h2 data-s="Plain English headline<span class=&quot;subh&quot;>Same joke.</span>">Technical headline<span class="subh">The joke.</span></h2>
 <p class="sent" data-s="Plain English version.">Technical version.</p>
 <button class="how" type="button" data-card="c2">How it works <span>&rarr;</span></button>
</div>
```

| Piece | Rule |
| --- | --- |
| Eyebrow `.eb` | Stage number, a one or two word step name, and the trigger chip. |
| Trigger chip `<code>` | What starts this step. A person typing it: the person icon plus hidden text `run by a person:`. Automatic: `<span class="auto" aria-hidden="true">&#8627;</span><span class="vh">fires automatically: </span>`. A named agent with no command: just `@agent`. The hidden `.vh` text is for screen readers; keep it. |
| Headline `h2` | One claim, 4 to 9 words, active voice, about the outcome rather than the mechanism ("Larger work gets split into child tickets"). |
| Subhead `.subh` | Inside the `h2`. Short, dry, optional. |
| Paragraphs `.sent` | 1 to 3, each 15 to 45 words. First says what happens, second why it is built this way, third the limit or the human role. |
| Button `.how` | Present when the stage has a card. |

Name things the way the repo names them in Technical mode (the real command, the
real agent handle). On a T layout the copy column is wider, so it can carry
slightly more.

## 3. "How it works" cards

The card is where depth lives, so the stage itself can stay short.

```html
<dialog class="card" id="c2" aria-labelledby="c2h"><div class="card-in"><span class="tape"></span>
 <button class="x" type="button" aria-label="Close">&times;</button>
 <p class="k">How it works &middot; 02a Specify</p><h3 id="c2h">An interview, then a specification</h3>
 <p>Mechanism: what runs, in what order, reading what.</p>
 <p>Reasoning: why it is built this way, the failure it prevents.</p>
 <ul class="gates">
  <li><b>Gate name.</b> What must be true to pass, and what happens if not.</li>
  <li class="hm"><b><svg class="hu" …><use href="#human" …/></svg>Human gate.</b> What the person decides.</li>
 </ul>
 <p class="ev">Evidence: a measured result or a real incident, with numbers in <b>bold</b>.</p>
</div></dialog>
```

- Two to four paragraphs. Mechanism first, then reasoning.
- One `li` per gate this step enforces, named the same way as the parcel stamp. Mark
  gates a person holds with `class="hm"` and the person icon.
- `.ev` only when the repo documents a real result. It is the most persuasive part
  of the page, and the most damaging if invented.
- `.chips` (a row of pill labels, e.g. agent handles) for enumerations engineers want.

## 4. Hero, route map, finale, principles

- **Hero**: an eyebrow saying what this is, the title, two sentences (what the
  pipeline does; the human role), a one-line provenance note ("Built from the actual
  code and config in the repo"), the legend, a stats line (`5 PHASES · 8 STEPS · 21
  GATES`), and a note listing the commands a person types. The stats must match the
  stages and stamps on the page.
- **Route map**: the phases as an arrow chain (`Idea → Spec → Build → Verify →
  Ship`), then one sentence on how size or risk changes the route and one on which
  commands are typed by hand.
- **Finale**: a short headline, two sentences summing up what the pipeline
  guarantees. Its drawing lists every gate the parcel cleared.
- **Principles** (outro): 4 to 8 lessons the pipeline embodies, each a short
  imperative title and one or two sentences. Only lessons the repo actually shows.
- **Footer**: what the project is, in one line, and an optional note from the author.

## 5. The Plain English layer

Two audiences read these pages: engineers who want the mechanism, and smart people
outside engineering (managers, founders, recruiters, friends) who want the idea. The
toggle reads **Plain English | Technical**. Do not label it "Plain" or "Simple" on
its own: set against "Technical" it implies the reader is the plain one.

**Write Plain English for a capable adult who does not work in software.** The
first draft of this layer usually goes wrong by talking down, which insults exactly
the readers it is for. Concretely:

- **Keep ordinary professional vocabulary.** Software, code, test, bug, feature,
  ticket, branch, pull request, merge, deploy, production, staging, database,
  security review, dependency, requirement: none of these need translating.
- **Say "AI agent"**, not "assistant" or "bot".
- **Translate only insider jargon**: TOTP becomes "a one-time code from an
  authenticator app"; acceptance criteria become "requirements"; path filters become
  "it looks at which files changed".
- **Cut inside-baseball detail rather than shortening explanations**: drop the branch
  strategy, file-path ownership rules and lists of agent handles; keep every concept.
  Expect 10 to 20% shorter, not half.
- **Keep the voice and the jokes.** They were never what made it hard to read.

| Too far | Right |
| --- | --- |
| "Every promise the job makes gets a matching check" | "Every requirement gets at least one test that proves it" |
| "working off to one side" | "a feature branch" |
| "the assistant asks questions" | "an AI agent asks questions" |
| "a practice copy of the site" | "staging" (it is a normal word) |
| "If one piece has to wait for another" | "Dependencies between those tickets" |

Mechanics (`data-s`, `.dtl`/`.pln`, escaping) are in `engine.md` section 6. Give
the hero, every stage, every card and the principles a Plain English version;
labels inside drawings only where a term would block understanding.

## 6. Before you move on

- Every factual sentence maps to a ledger row.
- Command chips show the right trigger (person or automatic).
- No stage needs more than three paragraphs; anything more went into its card.
- The hero's stats match the page.
- Plain English reads as a peer explaining it, not a teacher simplifying it.
- No secrets, internal hostnames or personal data (`discovery.md` section 5).
