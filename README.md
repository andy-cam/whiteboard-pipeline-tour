# Whiteboard pipeline tour

A [Claude](https://claude.com) skill that turns a repository's real delivery pipeline
(how an idea becomes shipped code) into a scroll-driven, hand-drawn whiteboard explainer
page, built from the repo's actual config and docs.

## What it does

1. Reads your repo's contributor and agent instructions, commands, hooks, pre-commit and CI
   config, review rules and release scripts, and logs every step it finds against the file
   it came from.
2. Shows you an outline of the stages to agree before it builds anything.
3. Builds one self-contained HTML page from the bundled template: a marker line that runs
   down the page, a parcel that collects a stamp at every gate it clears, a drawing per
   stage, "How it works" cards for the detail, a Plain English | Technical reading toggle,
   dark mode and a phone layout.
4. Checks the page at 10 screen sizes, in both themes and both reading levels, and writes
   screenshots for you to look over.

## Install

**Claude Code:** clone it into your skills folder, either for you or for one repo:

```bash
git clone https://github.com/andy-cam/whiteboard-pipeline-tour ~/.claude/skills/whiteboard-pipeline-tour
# or: git clone https://github.com/andy-cam/whiteboard-pipeline-tour .claude/skills/whiteboard-pipeline-tour
```

**claude.ai:** download the ZIP (green **Code** button, then **Download ZIP**) and upload it
as a skill.

Then ask Claude something like *"Make a whiteboard tour of how this repo ships code."*

## Before you run it

As with anything that runs code on your machine, review and make sure you understand
everything it's doing before running. Even when it's from a trustworthy kinda fella you
know, like me.

What actually executes:

| File | What it does |
| --- | --- |
| `scripts/get-rough.sh` | Runs `npm pack roughjs@4.6.6` (falling back to a download from jsDelivr), unpacks the bundled `rough.js`, and writes it to `scripts/rough-init.js`. Nothing is installed globally. |
| `scripts/verify.mjs` | Opens the generated page in headless Chromium through Playwright, scrolls through it, and writes screenshots plus a `report.json` into a `verify-out/` folder next to the page. Needs Playwright with Chromium. |
| The generated page | When opened, loads rough.js from jsDelivr and fonts from Google Fonts. Nothing else. |

Everything else is instructions and reference material for Claude (`SKILL.md`,
`references/`) and the page template (`assets/template.html`). Claude reads your repo and
writes one HTML file; it does not need to change your code.

`examples/from-post-it-to-prod.html` is a complete worked example, used as a gallery of
drawing ideas.

## Licence

MIT. See [LICENSE](LICENSE).
