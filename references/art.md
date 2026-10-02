# Drawing the art

Every stage has one drawing: inline SVG in the art's viewBox, converted at load into
hand-drawn strokes by rough.js. Consistency comes from using the same few attributes,
colours and symbols everywhere, so a new stage looks like it was drawn by the same
hand as the rest.

## Contents
1. The hand-drawn shapes (`class="r"`)
2. Colour and what it means
3. Text
4. The icon vocabulary
5. Composition
6. Traps (each one shipped once)
7. Gallery: what each example stage demonstrates

---

## 1. The hand-drawn shapes

Give a shape `class="r"` and describe it with `data-*` attributes. Supported elements:
`rect circle ellipse line polyline polygon path`. Not `text`, `use` or `g` (wrap
those around shapes instead).

| Attribute | Values | Default |
| --- | --- | --- |
| `data-stroke` | colour name or hex, or `none` | `ink` |
| `data-sw` | stroke width in viewBox units | `4.5` |
| `data-fill` | colour name or hex; omit for no fill | none |
| `data-fs` | `solid` or `hachure` (rough.js also has `zigzag`, `cross-hatch`, `dots`) | `hachure` **when a fill is set** |
| `data-gap` | hachure line spacing | `8` |
| `data-fw` | hachure line weight | `1.8` |
| `data-rough` | roughness; 1.5 for a deliberately loose string or doodle | `1.05` |

Note the default: a `data-fill` with no `data-fs` is hatched. Solid white cards,
terminals and boxes need `data-fill="white" data-fs="solid"` explicitly.

Other classes on the shape survive conversion (`fine`, `dtl`, `pln`, `stamp`, `lp`
…), and so do `data-at` and `data-off`, so a single shape can be a beat.

Use plain SVG (no `r`) for small exact marks: dots and eyes
(`<circle r="4" fill="#1B1E23"/>`), text, and `<use>` symbols.

## 2. Colour and what it means

Colour names for `data-*`: `ink ink2 blue red green white ghost`. For raw `fill` or
`stroke` attributes use these exact hexes; they are swapped for theme tokens at load,
which is what makes dark mode work. Any other hex stays fixed and will look wrong in
one of the two themes.

| Hex | Token | Name | Means |
| --- | --- | --- | --- |
| `#1B1E23` | `--ink` | ink | structure, outlines, most text |
| `#4E5660` | `--ink-2` | ink2 | secondary text and lines |
| `#2455F0` | `--blue` | blue | the line, automation, the commands people type |
| `#E03A2F` | `--red` | red | gates, barriers, blocks |
| `#C22A20` | `--red-t` | (text) | red text: people, warnings, "BLOCK" |
| `#1F9D5A` | `--green` | green | cleared, passed |
| `#16804A` | `--green-t` | (text) | green text and ticks |
| `#FFFFFF` | `--card` | white | card and object faces |
| `#CBD2D7` | `--ghost` | ghost | inactive things, large structural surfaces |

Keep the meanings. A reader learns in the first two stages that red is a gate and
green is cleared; using red decoratively later reads as a gate that is not there.

## 3. Text

Classes: `t` (ink, handwriting), `t2` (muted handwriting), `tb` (blue), `tr` (red),
`tg` (green), `tm` (muted monospace), `tk` (ink monospace, for commands and IDs),
`tbm` (blue monospace), `stt` (bold display capitals for stamps; set `fill`).

Sizes are viewBox units in a 1000-wide drawing: 20 to 27 for labels people must read,
30 to 34 for one-word headline labels, 12.5 to 17 only for secondary detail marked
`fine` (hidden on phones). On a phone the drawing renders at roughly a third of its
viewBox size, so anything under 20 becomes unreadable there.

## 4. The icon vocabulary

Use the same symbol for the same thing on every stage. Draw what the repo really
has: agents as robots, people as the person icon. Using the person icon for an
agent is a factual error on the page, and readers notice.

**A person** (a symbol already defined on the page):
```html
<use href="#human" x="124" y="284" width="34" height="34" style="color:var(--red-t)"/>
```

**An AI agent** (robot):
```html
<rect class="r" x="860" y="222" width="60" height="46" data-sw="4.5"/>            <!-- head -->
<line class="r" x1="890" y1="222" x2="890" y2="204" data-sw="4"/>                 <!-- antenna -->
<circle class="r" cx="890" cy="200" r="5" data-fill="ink" data-fs="solid" data-sw="2.5"/>
<circle cx="876" cy="244" r="4" fill="#1B1E23"/><circle cx="904" cy="244" r="4" fill="#1B1E23"/>
<line class="r" x1="872" y1="259" x2="908" y2="259" data-sw="3"/>                 <!-- mouth -->
<rect class="r" x="855" y="268" width="70" height="62" data-sw="4.5"/>            <!-- body -->
<text class="t" x="890" y="362" font-size="24" text-anchor="middle">@agent-name</text>
```

**A reviewer or scanner** (magnifying eye; add `class="lp a-scan"` on a wrapping `g` to make it search):
```html
<circle class="r" cx="340" cy="170" r="58" data-fill="white" data-fs="solid" data-sw="6"/>
<ellipse class="r" cx="340" cy="170" rx="32" ry="18" data-sw="3.5"/>
<circle cx="340" cy="170" r="8" fill="#1B1E23"/>
<line class="r" x1="298" y1="128" x2="258" y2="88" data-sw="10"/>
```

**A gate** (boom barrier that lifts on cue):
```html
<g class="rot keep" data-at=".25" style="--a0:0deg;--a1:-74deg;transform-origin:475px 122px">
  <rect class="r" x="336" y="113" width="140" height="19" data-fill="white" data-fs="solid" data-sw="3.5"/>
  <rect class="r" x="346" y="113" width="24" height="19" data-fill="red" data-fs="solid" data-stroke="none"/>
  <rect class="r" x="394" y="113" width="24" height="19" data-fill="red" data-fs="solid" data-stroke="none"/>
</g>
```

Others in the example: a terminal with a blinking cursor (a command), a ticket card
with a checklist (a plan), stamped boxes (a verdict), a dashed red line (a context
barrier), lamps turning green (checks passing), parallel tracks (concurrent work).

## 5. Composition

- **One idea per stage**, told in 3 to 8 beats: cause, then effect. The aria-label is
  that story in one or two sentences; write it first, then draw it.
- **Plan the line with the drawing.** The parcel will travel through the scene and
  wait where beats play. Leave a clear corridor for it, and put the thing it waits
  beside where the eye should be.
- **Stay inside the viewBox** (`0..1000` by `0..700`, or `0..460` for T stages). Art
  outside it is clipped on some screens.
- **Leave white space.** These scenes are sparse line drawings on a board, not
  infographics. If a stage needs more than about eight labels, it is two stages, or
  the detail belongs in its "How it works" card.

## 6. Traps

- **Hatching is an accent.** Hachure across a large area (a full-width band, a big
  box) reads as noise. Use it on small faces only: the shaded side of a crate, a felt
  eraser base, a marker's ink window.
- **Big white shapes vanish.** The board is near-white, so a large white-filled shape
  is visible only by its outline and reads as a few parallel rules. Give large
  surfaces a `ghost` fill.
- **Never judge drawings against a stub.** If you verify with a fake rough.js, fills
  render as flat blocks and the result looks fine when it is not. Run
  `scripts/get-rough.sh` and look at real renders.
- **The line is under the art.** Solid shapes hide it. Route paths through gaps.
- **One appearance per beat element.** Duplicate the element to show it twice.
- **Check dark mode.** A hex outside the palette, or a colour set in CSS, will be wrong
  in one theme.

## 7. Gallery

`examples/from-post-it-to-prod.html` is a complete 17-stage page. Use it for drawing
ideas, not as a base (build from `assets/template.html`). Open a stage with
`grep -n 'id="s7"' examples/from-post-it-to-prod.html` and read just that section.

| Stage | Layout | What the drawing shows | Technique worth borrowing |
| --- | --- | --- | --- |
| `s0` | L | an uncapped whiteboard marker starting the line | the hero |
| `smap` | T | five phase boxes on the line, steps listed in each | route map, boxes appearing in turn |
| `s1` | L | an idea typed in a terminal, checked against a backlog for duplicates | blinking cursor, search beat, pop |
| `s2` | R | intake questions, a person answering; the idea drops into the large of three boxes | stamps for size and type |
| `s3` | L | a boom gate checks the parent exists; the epic splits into three children tied by a string | `rot` gate, swaying dependency string |
| `s4` | R | a ticket: requirements as bullets, then a test checklist, one item left for a person | checklist rows appearing in sequence |
| `s5` | T | a red context barrier between author and reviewer; the plan crosses, is rejected, returns, passes | ping-pong path, duplicated beats, BLOCK and PASS stamps |
| `s6` | R | a railway switch sends the change down the S, M or L track | `rot` lever, branching tracks |
| `s7` | T | three review booths; one fires, one is skipped, one checks coverage | conditional beats |
| `s8` | L | a pre-commit arch with twelve lamps turning green | many small timed beats |
| `s9` | R | "trust me" crossed out; six gauges read facts; the merge door stays locked | crossing out a claim |
| `s10` | L | changed files through path filters; four suites light up into one required check | greyed-out "skipped" state |
| `s11` | R | four screens, phone and desktop in light and dark, each ticked | grid of variants |
| `s12` | T | parallel tracks in three waves; a clash bumps one to a later wave | multiple lanes |
| `s13` | L | a one-time code entered digit by digit; a named person signs; a rollback clock starts | the human step |
| `s14` | R | a crack in the track patched; guard posts planted along the line | before/after |
| `s15` | L | the parcel grows to show every stamp; the list of gates cleared | the finale |
