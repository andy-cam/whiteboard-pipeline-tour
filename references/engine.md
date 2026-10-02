# Engine reference

How `assets/template.html` turns sections, config and drawings into a scroll-driven
whiteboard. Read this before adding or reordering stages, or steering the line.

## Contents
1. Page anatomy
2. The stage row (CFG) field by field
3. Steering the line: pts, hold, entry and exit
4. Beats: things appearing on cue
5. The parcel and its stamps
6. Reading levels (Plain English | Technical)
7. Layout, responsiveness and the fixed controls
8. What you can and cannot touch

---

## 1. Page anatomy

```
<button class="theme">  <div class="lvl">          fixed toolbar (theme, reading level)
<main>
  <section class="st" id="s0" data-lay="L" data-name="Start" style="--len:.9">   hero
    <div class="pin">                       sticky, one viewport tall
      <svg class="ln"></svg>                empty: the engine draws the line here
      <svg class="art" viewBox="0 0 1000 700" role="img" aria-label="…">  your drawing
      <div class="copy"> eyebrow, h1/h2, .sent paragraphs, .how button </div>
  <section class="st" id="smap" …>          route map (one per page)
  <section class="st" id="s1" data-num="01" data-lay="L" data-name="Idea" …>
  …
</main>
<section class="outro">  <svg class="outro-ln">  principles list      engine draws the line's end + marker cap
<svg class="tray">                                                     engine draws the whiteboard pen tray
<footer>
<div id="parcel">  the travelling work item, with stamps
<nav class="rail">  <div class="count">                               built automatically from the sections
<dialog class="card" id="c1">…                                         "How it works" cards
```

Section attributes:

| Attribute | Use |
| --- | --- |
| `id` | Free-form; only `s0` (hero) has special CSS. Per-stage CSS overrides by id are fine. |
| `data-lay` | `L` copy left, art right. `R` copy right, art left. `T` copy top, art below, full width. Must equal the CFG row's `lay`. |
| `data-num` | Eyebrow number and pager text (`03b / 08`). Omit on hero and map. |
| `data-name` | Rail tooltip; pager fallback when there is no number. |
| `style="--len:1.8"` | Scroll length in viewport heights beyond the first. 1.7 to 2 for a full story; more beats need more length. |

## 2. The stage row (CFG)

`CFG` lives in the PAGE CONFIG block at the top of the final script. One row per
`<section class="st">`, in DOM order. A missing or extra row breaks the line for every
stage after it; `verify.mjs` checks the count.

```js
{lay:'L', ex:.55, vb:[1000,700], pts:[[518,110],[500,250],[660,255]], hold:[[0,0],[.3,2],[.74,2],[1,'e']], born:.3, rest:.74}
```

| Field | Meaning |
| --- | --- |
| `lay` | Same as the section's `data-lay`. |
| `vb` | The art's viewBox size. Use `[1000,700]` for L and R, `[1000,460]` for T. Must match the `<svg class="art" viewBox>`. |
| `pts` | Waypoints in the art's viewBox coordinates. The line enters from the top, runs through these in order, and leaves at the bottom. Points may sit outside the box (negative y) to curve in from above. |
| `ex` | Where the line leaves, as a fraction of viewport width (0 to 1). The next stage enters at this x. |
| `hold` | Scroll progress to path position: `[[progress, pointIndex or 'e'], …]`. See section 3. Default `[[0,0],[1,'e']]`. |
| `rest` | The progress the nav buttons jump to and the reduced-motion snapshot uses. Pick the moment the stage's story is complete. |
| `hero:1` | Stage 0 only. The line grows with scroll; no parcel. |
| `nop:1` | No parcel on this stage (the route map). |
| `born:p` | The parcel stays hidden until progress `p`. Use on the first stage the idea appears. |
| `tail:p` | After `p`, draw the rest of the line regardless of `hold`. Finale only. |
| `finale:1` | The parcel grows to show its stamps (between progress .3 and .52). Last stage only. |

## 3. Steering the line

**Coordinates.** Draw the art first, then place `pts` on it in viewBox units. The
art is scaled to fit a box (L: right 54% of the screen; R: left 54%; T: full width
below the copy) and centred, so positions are proportional, not pixel-exact. Tune
by screenshot.

**Entry and exit.** A stage's line enters from the top at the previous stage's
`ex` and leaves at its own `ex`. Choose `ex` so the next stage's first point is
close by and the curve between them stays clear of that stage's copy column (L copy
spans roughly 6% to 39% of the width, R copy 61% to 94%, T copy 6% to 60% at the top).
Good starting values: before an L stage `.55`–`.8`; before an R stage `.2`–`.45`.
On phones every stage enters and exits at 92.5% so the line runs down the right edge.

**hold.** Progress through the stage is 0 to 1. `hold` decides how much of the line
is drawn, and where the parcel sits, at each progress value; positions between
entries are eased. Point indexes count this stage's own `pts` from 0 (the entry stub
is excluded); `'e'` is the exit. Repeat an index at two progress values to make the
parcel **wait** there while beats play:

```js
hold:[[0,0],[.18,2],[.42,2],[.52,4],[1,'e']]   // travel to pt 2, wait from .18 to .42, move on
```

**Shapes of path.** The line is a Catmull-Rom curve through your points:
- Two identical neighbours give a sharp cusp, which reads as a bounce or a rejection.
- Revisiting a region on a slightly different y gives a visible loop; for
  back-and-forth journeys, offset each leg (e.g. 40 units) so the strands do not
  overlap and the return trip is legible.
- The line is painted *beneath* the art. Solid drawn shapes cover it. Route it
  through gaps in barriers and around objects rather than across them.

**Keep it off the text.** The line passes behind the copy's text, which has no
background. Never route it through the copy column.

## 4. Beats

Any element inside a section with `data-at="p"` (appear at progress p) and/or
`data-off="p"` (disappear at p) becomes a beat. Shapes with `class="r"` keep their
beat after the hand-drawn conversion.

- Unfilled strokes draw themselves on when they appear.
- One window per element. To show something, hide it, then show it again, duplicate
  it (this is how a document "moves" between two places on cue).
- Entrance styles, by class on the beat:
  - `stamp` slams in with a rotation: `style="--r:-8deg"`
  - `pop` springs up from small
  - `fd` fades only (no stroke draw-on)
  - `rot keep` rotates between `--a0` and `--a1` around `transform-origin` (a boom gate opening): `style="--a0:0deg;--a1:-74deg;transform-origin:475px 122px"`
- Continuous loops while the stage is on screen: put `lp` plus one of `a-pulse
  a-blink a-sway a-spin a-bob a-scan a-scanx a-bounce a-wiggle a-flash a-slide a-fall
  a-roll a-tick a-glow` on a `<g>`. Loops pause off-screen.

Spread a stage's beats between about .05 and .75 progress, in story order, and have
the story finished by `rest`.

## 5. The parcel and its stamps

`#parcel` is one SVG (viewBox 220×190) the engine moves along every stage's line.
It starts as an idea spark (`.pspark`) and becomes a crate (`.pbox`) at `BOX_AT`.
Each `.pst[data-stamp="key"]` inside it is a small label that appears once earned
and stays:

```js
const STAMPS={plan:[5,.56], approved:[7,.6], closed:[8,.56]};   // key: [stage index, progress]
```

To add a stamp: copy one `<g transform="translate(x,y) rotate(r)"><g class="pst"
data-stamp="key">…</g></g>` line, give it a new key, label and position on the
crate face, and add the key to `STAMPS`. Every stamp in the markup needs a `STAMPS`
entry (the page throws otherwise) and every stamp should be earned by the finale;
`verify.mjs` checks both. Keep labels to a few characters; there is little room.

`STEP_TOTAL` sets the pager's denominator (`03b / 08`).

## 6. Reading levels

The toolbar toggle switches between **Plain English** and **Technical**. Technical
is the markup as written. Plain English swaps content in place:

- Any HTML element with `data-s="…"` shows that HTML instead. `data-s=""` hides the
  element. Inside the attribute, write `&quot;` for quotes and double-escape
  entities (`&amp;rarr;` renders →, because the attribute is decoded once and the
  result is parsed as HTML).
- In SVG art, write a pair: `<text class="dtl t" …>technical</text><text class="pln t" …>plain</text>`.
  `.dtl` hides in Plain English; `.pln` hides in Technical. `.dtl` also works on any
  element (e.g. a list of agent handles that only matters to engineers).

Switching re-runs layout because copy height drives the line's geometry. The choice
persists per visitor. What to write in each level is in `copy.md`.

## 7. Layout and the fixed controls

- **Phones and portrait** (under 761px wide, or aspect under 4/5): one column. Copy
  on top, art below, line down the right edge. If less than 18% of the screen is left
  for art, the art is dropped for that stage. Elements with class `fine` hide here;
  use it for secondary labels.
- **Toolbar clearance.** The theme button and reading-level toggle are fixed at the
  top. Copy is held below them: centred L/R copy uses
  `translateY(max(-50%, calc(72px - 50vh)))` (centred when it fits, never above
  72px), T copy uses `top:max(6vh,72px)`, phones `top:max(6vh,68px)`. If you add
  controls, keep at least 16px between them and the first line of copy.
- **Short screens** compress progressively: under 860px tall the hero's key folds
  into a button; under 700px and 620px headings and paragraphs shrink. If a stage
  still overflows, shorten its copy before adding more CSS.
- The reading toggle fades to 40% once the page is scrolled and returns on hover or
  keyboard focus.
- **Dark mode** comes from tokens. Never hard-code a colour in CSS. In SVG use the
  palette hexes listed in `art.md` (they are converted to tokens automatically) or
  the text classes.

## 8. What you can and cannot touch

Edit freely: everything inside sections, the outro, footer, cards, parcel stamps,
the PAGE CONFIG block, the `<title>`, and per-stage CSS overrides by id.

Leave alone unless you know why: the engine script below PAGE CONFIG, the token
blocks, the responsive and reduced-motion rules. Each of those encodes a fix for a
specific failure (see `verification.md`). If you must change one, re-run
`verify.mjs` across the full matrix, not just the size you were looking at.
