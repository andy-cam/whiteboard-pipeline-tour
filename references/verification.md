# Verification

A page that looks right at the size you happened to test is the most common way
this goes wrong. Every check in `scripts/verify.mjs` exists because its failure
shipped, or nearly shipped, at least once.

## Contents
1. Running it
2. What each check means and how to fix a failure
3. What the script cannot see (look at the screenshots)
4. Environment traps

---

## 1. Running it

```bash
scripts/get-rough.sh                                   # once: genuine rough.js for faithful renders
node scripts/verify.mjs path/to/page.html              # full run, 1-3 minutes
node scripts/verify.mjs path/to/page.html --quick      # two viewports, for fast iteration
```

Options: `--out DIR` (default `verify-out/` next to the page), `--no-shots`,
`--allow-sample` (only for checking the template itself). Exit code 1 means at least
one FAIL. Needs Playwright with Chromium; set `PLAYWRIGHT_MODULE` if it is installed
somewhere unusual.

The full run can exceed a short command timeout. Run it in the background and wait
for it to finish rather than polling.

Iterate with `--quick`, then do a full run before calling the page done.

## 2. Checks

| Check | Fails when | Usual fix |
| --- | --- | --- |
| no page errors | Any script error on load or while scrolling | Read the message. A stamp with no `STAMPS` entry throws a TypeError in `earned`; a malformed CFG row throws inside `build`. |
| hand-drawn conversion | `.r` shapes left unconverted | The element type is unsupported (`text`, `g`, `use`), or rough.js did not load (run `get-rough.sh`). |
| one path per stage | Path count differs from section count, or a path has no length | CFG must have exactly one row per `<section class="st">`, in DOM order, with at least two `pts`. |
| How it works cards | A `data-card` button points at a missing dialog | Match the ids. |
| sample content removed | Template sample text survives | Replace it. Search the page for the phrase quoted in the failure. |
| Plain English layer | Switching changes nothing, does not round-trip, or breaks the line | Add `data-s`; check attribute escaping; never edit the engine's `applyLevel`. |
| theme toggle | `data-mode` does not change | The toolbar markup was edited; restore it from the template. |
| parcel path | The parcel's transform is NaN somewhere | A `hold` index past the end of `pts`, or `pts` with non-numbers. |
| parcel stamps | A stamp is never earned by the finale | Its `STAMPS` entry points at a stage index or progress that is never reached, or is missing. |
| reduced motion | Errors, or the static layout does not apply | Reduced motion lays every stage out at its `rest` at once, so a broken stage often surfaces here first. Read the error. |
| copy clears the toolbar | Less than 16px between the fixed toolbar and the first line of copy | Do not lower the copy floors (`engine.md` section 7). Shorten the eyebrow if it wraps. |
| copy fits the screen | Copy runs past the bottom at some viewport | Shorten that stage's copy, or move detail to its card. Adding CSS should be the last resort. |
| copy clears the pager | Copy overlaps the bottom-right pager | Same: the stage has too much copy for short screens. |
| no sideways scroll | The page scrolls horizontally | Something is wider than the viewport, usually a long unbroken word or code chip. |
| illustrations shown (warn) | Art dropped on a normal phone for lack of room | Expected occasionally on small phones. If it happens on many stages, the copy is too long. |

The layout matrix covers five desktop sizes (1600×900 down to 780×600), four phones
(430×932 to 320×568) and a tablet in portrait, in both reading levels, scrolling to
the middle of every stage. A failure names the viewport and the stage.

## 3. What the script cannot see

It writes screenshots of every stage at four corners (desktop and phone, light and
dark) into `verify-out/`. Look at them, at least the desktop-light set plus a few of
the others. Things only a look catches:

- The line crossing text or ducking under a solid shape where it should be visible.
- A beat sequence that does not tell the story in order, or ends after `rest`.
- Labels too small on the phone shots.
- Anything invisible or wrong-coloured in dark mode (a hex outside the palette).
- Hatching that reads as noise; large shapes that vanish into the board.
- An icon that lies: a person drawn for an agent, or the reverse.
- The seam between two stages: the line should arrive near where the new stage's
  path starts, not sweep across the screen.

## 4. Environment traps

- **The CDN is often blocked** in sandboxes and CI, so rough.js never loads and
  nothing is drawn. `get-rough.sh` fetches it from the npm registry instead (usually
  reachable) and wraps it as an init script. The bundle declares `var rough`, which
  does not reach `window` inside an init script; the wrapper exports it explicitly.
- **Never verify against a hand-written stub.** It renders fills as flat blocks, so a
  full-width hatched band that looks terrible for real looks fine on the stub.
- **Web fonts may not load offline.** The script reports this; measurements then use
  fallback fonts and can be a few pixels off. Re-check borderline results online.
- **Screenshots after a scroll need a moment.** Beats fade over 0.35s. The script
  waits; if you take your own, wait at least 450ms after scrolling.
- **Published pages may be edited by others.** If the page lives somewhere shared
  (for example a Claude artifact), re-read the live version and diff it against your
  copy before every publish, or you will overwrite someone's change.
