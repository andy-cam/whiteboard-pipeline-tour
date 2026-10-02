# Discovery: finding the real pipeline in a repo

The page's whole claim is "built from the actual code and config, no hypotheticals".
A beautiful page about a process the repo does not actually run is worse than no
page, because readers will trust it. So this phase produces two things before any
drawing starts: an **evidence ledger** and a **stage outline**.

## Contents
1. Where to look
2. What to extract (the ledger)
3. Turning the ledger into stages
4. Honest numbers
5. What to leave out
6. The checkpoint with the user

---

## 1. Where to look

Read broadly first, then deeply where the process actually lives. Not every repo
has all of these; the gaps are themselves findings ("no pre-commit hooks" is a
fact the page can state or simply not claim).

| Area | Typical paths | What it tells you |
| --- | --- | --- |
| Agent/contributor instructions | `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `CONTRIBUTING.md`, `README.md` | The intended workflow, rules, who does what |
| Agent definitions | `.claude/agents*`, `.claude/agents/*.md`, `.github/copilot-*` | Specialists, their boundaries, when each is invoked |
| Skills and commands | `.claude/skills/*/SKILL.md`, `.claude/commands/*.md` | The commands humans actually type, step by step |
| Hooks | `.claude/settings*.json` (`hooks`), `.claude/hooks/*` | What fires automatically, what is blocked |
| Pre-commit | `lefthook.yml`, `.husky/`, `.pre-commit-config.yaml`, `package.json` (`lint-staged`) | Local gates, how many checks, which are custom |
| CI | `.github/workflows/*.yml`, `.gitlab-ci.yml`, `.circleci/`, `buildkite/` | Required checks, path filters, deploy jobs, approvals |
| Review rules | `CODEOWNERS`, PR templates, branch protection notes, review bots config | Who must approve, what blocks a merge |
| Issue flow | `.github/ISSUE_TEMPLATE/`, project field docs, triage scripts | How work is captured, sized, prioritised |
| Decisions | `docs/adr/`, `docs/decisions/`, RFCs | Why the rules exist (great "How it works" material) |
| Release | deploy scripts, `wrangler.toml`/`fly.toml`/`vercel.json`, release workflows, runbooks | The irreversible step and who holds it |
| Lessons | postmortems, `docs/incidents/`, custom lint rules with comments | The feedback loop: incident to rule |

Good first commands: list `.claude/`, `.github/workflows/` and any hook config; grep
for `human`, `approve`, `manual`, `required`, `block`, `gate`, `environment:`,
`needs:`, `if:` in CI; read every skill or command a human is told to run.

## 2. What to extract: the evidence ledger

Write a working table (keep it out of the page, it is for you and the user):

| # | Step | Trigger | Actor | Gate? (blocks what, on what condition) | Output | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Capture | human runs `/idea` | agent | refuses without priority + milestone | placeholder issue | `.claude/skills/idea/SKILL.md:12-40` |
| 2 | Release | human dispatches workflow | person + CI | TOTP code; named approver for migrations | production deploy | `.github/workflows/deploy-production.yml:30` |

Capture, for each step:

- **Trigger**: a person types something, or it fires on its own (hook, CI event,
  another step finishing). This becomes the command chip on the page, marked with
  the person icon or the `↳` auto mark. Get it right; it is the most-read detail.
- **Actor**: a named person role, a named agent, a CI job, a hook. Agents are drawn
  as robots and people as the person icon, so mislabelling here becomes a visible
  error on the page.
- **Gate**: does anything stop the work here? What exactly must be true to pass?
  What happens on failure (blocks, asks a person, loops back)? A gate with no
  written pass condition is worth noticing; it is often a good "How it works" point.
- **Routing**: does size, risk or file path change what happens next? Record the
  rule (e.g. "touches `apps/api/**` → security review fires").
- **Humans in the loop**: every point a person *must* act, separately from where
  they *can*. The page should make the must-act points unmistakable.
- **Evidence**: file and line for every claim. If you cannot point at a file, the
  claim does not go on the page.

## 3. Turning the ledger into stages

- **Phases**: 4 to 6 coarse groups that read left to right (e.g. Idea, Spec, Build,
  Verify, Ship). These become the route-map boxes.
- **Stages**: 6 to 14 sections, each one idea that can be drawn in a single scene.
  Merge trivial steps; split a step only if it holds two distinct ideas.
- **Numbering**: number within phases (`01`, `02a`, `02b`, `03a`...) so the counter
  stays meaningful. A side-quest that is not on the main line (running many changes
  in parallel, say) can take a non-sequential label like `10x`.
- **Order**: the order a single change experiences, not the order of files.
- **One parcel**: the page follows a single piece of work. Pick a realistic example
  item from the repo's actual backlog or recent history (a feature title, an issue
  number) and use it consistently across stages.
- **Stamps**: each real gate the work clears becomes a stamp on the parcel. Count
  them honestly; the hero states the total.

## 4. Honest numbers

Numbers make the page credible and are the easiest thing to get wrong.

- Count from config, not memory: number of pre-commit checks = entries in the hook
  config; number of agents = files in the agents directory; gates = rows in your
  ledger with "Gate?" filled.
- Measured results ("blocking time went from 17.8 to 40.3 minutes") only if a doc,
  issue or commit in the repo says so. Cite where.
- If a number would need a guess, describe qualitatively instead.

## 5. What to leave out

The page will be shared. Never include secret values, credential file contents,
internal hostnames or URLs, customer or employee names, private account IDs, or
anything from `.env`-style files. Name a secret's *purpose* ("a one-time code from
an authenticator app"), never its value or location. When unsure, ask.

## 6. The checkpoint with the user

Before building, show the user a compact outline: title, phases, each stage
(number, name, one-line idea, trigger, human or auto), the gate count, and anything
you were unsure about or chose to omit. Ask about audience and tone if you do not
know them. This costs one message and saves rebuilding a 100KB page around a wrong
premise. Building starts after they agree.
