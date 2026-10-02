---
name: whiteboard-pipeline-tour
description: Turn a repository's real delivery pipeline (how an idea becomes shipped code - capture, specs, agents, reviews, pre-commit and CI gates, release approvals) into a scroll-driven, hand-drawn whiteboard explainer page built from the repo's actual config and docs, with a Plain English / Technical reading toggle, dark mode and mobile layout. Use this whenever someone wants to visualise, explain, document, present, onboard people to or show off how their repo or team ships code - their SDLC, CI/CD pipeline, Claude Code or agentic workflow, agent roster, quality gates or review process - as an interactive page, scrollytelling site, explainer, tour, one-pager or artifact, even if they never say "whiteboard". Also use it to extend, restyle or fix a page previously built this way.
---

# Whiteboard pipeline tour

Builds a single self-contained HTML page that tells the story of one piece of work
travelling through a repo's real delivery pipeline. A hand-drawn blue line runs
down the page like a marker on a whiteboard; a parcel rides it, collecting a stamp
at every gate it clears; each stage pins in place while its drawing plays out as
the reader scrolls.

A finished example: `examples/from-post-it-to-prod.html` (17 stages).

The value of the page is that it is **true**. Everything on it comes from files in
the repo. A beautiful page about a process the team does not actually run is worse
than no page, because people will trust it.

## What is in this skill

| Path | Use it for |
| --- | --- |
| `assets/template.html` | The starting point: the full engine plus 8 sample stages covering every layout and technique. Copy it; never build from scratch. |
| `references/discovery.md` | Mining the repo for the real pipeline; the evidence ledger; what to leave out. |
| `references/engine.md` | Sections, the CFG row per stage, steering the line, beats, parcel stamps, reading levels, layout rules. |
| `references/art.md` | Drawing conventions, colour meanings, the icon vocabulary, traps, a gallery of example stages. |
| `references/copy.md` | Headlines, paragraphs, cards, hero and finale; how to write the Plain English layer without talking down. |
| `references/verification.md` | What `verify.mjs` checks, how to fix each failure, and what only screenshots reveal. |
| `scripts/get-rough.sh` | Fetches the genuine rough.js so drawings render during verification. |
| `scripts/verify.mjs` | Automated QA across 10 viewports, both themes and both reading levels; writes screenshots. |

## Workflow

### 1. Discover (read `references/discovery.md`)

Read the repo's instructions, agent and command definitions, hooks, pre-commit
config, CI workflows, review rules and release scripts. Build an evidence ledger:
each step's trigger, actor, gate, output and the file it comes from. Group it into
4 to 6 phases and 6 to 14 stages, one drawable idea each.

**Checkpoint.** Show the user the outline (title, phases, each stage with its
trigger and whether a person or automation runs it, the gate count, anything you
omitted or were unsure of) and ask about audience and tone if unknown. Build only
after they agree; restructuring a finished page is far more expensive than
restructuring an outline.

### 2. Set up

```bash
cp <skill>/assets/template.html <output>/index.html
<skill>/scripts/get-rough.sh
```

Read the template's banner comment and the PAGE CONFIG block at the top of its
final script. Everything in `<section>`s, cards, outro, footer and parcel stamps is
sample content from someone else's pipeline: all of it gets replaced.

### 3. Build the stages, one at a time

For each stage, in order:

1. Write the drawing's aria-label first: the stage's story in one or two sentences.
2. Draw the art (`art.md`): one idea, 3 to 8 beats in story order, the house icons
   and colours. Agents are robots; people get the person icon.
3. Write the copy (`copy.md`): eyebrow with the correct trigger chip, headline,
   1 to 3 short paragraphs, and a "How it works" card for the depth.
4. Add or update its CFG row and steer the line through the drawing (`engine.md`
   sections 2 and 3). The line should visit objects in story order and wait where
   beats play.
5. Every few stages, run `node <skill>/scripts/verify.mjs <page> --quick` and look
   at the screenshots.

To add a stage, copy the closest sample section of the same layout (L, R or T) and
its CFG row. To remove one, delete the section, its card and its CFG row together,
then re-check the seams on either side.

### 4. Frame it

Hero (title, two sentences, legend, a stats line that matches the page, the
commands a person types), route map, finale, principles, footer. Then the parcel:
one stamp per real gate, `STAMPS`, `BOX_AT` and `STEP_TOTAL` in PAGE CONFIG.

### 5. Plain English layer

Give the hero, every stage, every card and the principles a `data-s` twin
(`engine.md` section 6, `copy.md` section 5). The audience is a capable adult
outside software: keep normal professional words, say "AI agent", translate only
insider jargon, and cut detail rather than talking down.

### 6. Verify (read `references/verification.md`)

```bash
node <skill>/scripts/verify.mjs <page>        # full matrix; run in the background, 1-3 min
```

Fix every FAIL. Then look at the screenshots in `verify-out/`, at least
desktop-light plus a sample of the other three corners: the script cannot tell
whether the line crosses text, the story reads in order, or dark mode hides a shape.

### 7. Deliver

The result is one HTML file that loads rough.js and Google Fonts from public CDNs
and otherwise needs nothing. If you can publish it (for example as a Claude
artifact), do so and give the user the link; otherwise save it and tell them where.
If the page is shared and others can edit it, re-read the live version and diff it
against your copy before every republish.

## Principles

- **True before pretty.** Every sentence maps to a ledger row; numbers come from
  config or documents, never estimates. Leave out secrets, internal hostnames and
  personal data.
- **One idea per stage, told by the drawing.** The copy says why it matters; the card
  carries the depth. If a stage needs more, it is two stages.
- **The line is the narrative.** It enters near where the previous stage left,
  visits things in story order, never crosses text, and waits where something
  happens.
- **Icons tell the truth.** Robots for agents, the person icon for people, red for
  gates, green for cleared. Readers learn these in two stages and trust them after.
- **Leave the engine alone.** Change content and PAGE CONFIG. The CSS and script
  encode fixes for specific failures; if you must change them, re-verify the whole
  matrix.
- **Verify across sizes, not at one.** The page that looks right at your window size
  is the one that collides with the toolbar on a phone.

## Working on a large page

The page will be 80 to 180KB. Edit it with small targeted replacements rather than
rewriting the file: for batches, a short script that replaces exact strings and
asserts each one matched exactly once catches mistakes before they cost a debugging
round. Keep a copy before large edits.
