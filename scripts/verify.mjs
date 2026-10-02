#!/usr/bin/env node
/*
 * verify.mjs — automated QA for a whiteboard pipeline tour page.
 *
 *   node scripts/verify.mjs <page.html> [--out DIR] [--quick] [--allow-sample] [--no-shots]
 *
 * Every check here exists because the failure it catches shipped (or nearly
 * shipped) once. Exit code is 1 if any FAIL. Typical run: 1-3 minutes, so run
 * it in the background if your harness has a short command timeout.
 *
 * Needs Playwright with Chromium. Run scripts/get-rough.sh first so drawn
 * shapes render with the genuine rough.js rather than not at all.
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = n => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const PAGE = argv.find(a => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--out' && argv[argv.indexOf(a) - 1] !== '--rough');
if (!PAGE) { console.error('usage: node verify.mjs <page.html> [--out DIR] [--quick] [--allow-sample] [--no-shots]'); process.exit(2); }
const FILE = path.resolve(PAGE);
const OUT = path.resolve(opt('--out', path.join(path.dirname(FILE), 'verify-out')));
const ROUGH = opt('--rough', path.join(HERE, 'rough-init.js'));
const QUICK = flag('--quick'), ALLOW_SAMPLE = flag('--allow-sample'), SHOTS = !flag('--no-shots');
fs.mkdirSync(OUT, { recursive: true });

/* ---------------------------------------------------------------- thresholds */
const MIN_TOP_GAP = 16;   // px between the fixed toolbar and the first line of copy.
                          // 9px was reported as "almost touching"; 20+ reads as intended.
const SETTLE = 90, FADE = 450;

/* Phrases from the template's sample content. If any survive, the page is still
   partly someone else's pipeline. */
const SAMPLE = ['bulk-archive old orders', '#2041', 'post‑it', 'post-it to prod', '@red-team', '@qa-eng',
  '/ticket-build', '/new-ticket', '/wave-planner', 'pop quiz, hotshot', 'breakfast of champions', 'daykept',
  'hirebase', 'one line on what the project is', 'an optional personal note from the author',
  'in january i gave a fully codified'];

/* ---------------------------------------------------------------- playwright */
async function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_MODULE, 'playwright', '@playwright/test'];
  try { tries.push(createRequire(path.join(process.cwd(), 'x.js')).resolve('playwright')); } catch {}
  tries.push('/opt/node22/lib/node_modules/playwright/index.js');
  for (const t of tries.filter(Boolean)) {
    try { const m = await import(t); const pw = m.chromium ? m : (m.default || m); if (pw.chromium) return pw; } catch {}
  }
  console.error('verify: Playwright not found. `npm i -D playwright && npx playwright install chromium`, or set PLAYWRIGHT_MODULE.');
  process.exit(2);
}
const { chromium } = await loadPlaywright();

/* ---------------------------------------------------------------- reporting */
const results = [];
const rec = (level, check, detail) => { results.push({ level, check, detail }); };
const pass = (c, d = '') => rec('PASS', c, d), warn = (c, d) => rec('WARN', c, d), fail = (c, d) => rec('FAIL', c, d), info = (c, d) => rec('INFO', c, d);

const browser = await chromium.launch();
const hasRough = fs.existsSync(ROUGH);
if (!hasRough) warn('rough.js', `no ${path.relative(process.cwd(), ROUGH)}; run scripts/get-rough.sh. Shapes will not render, so visual checks are meaningless.`);

async function open(w, h, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, ...extra });
  const pg = await ctx.newPage();
  pg._errors = []; pg._net = 0;
  pg.on('pageerror', e => pg._errors.push(String(e).slice(0, 300)));
  pg.on('console', m => {
    if (m.type() !== 'error') return;
    if (/ERR_|net::|Failed to load resource/.test(m.text())) pg._net++; else pg._errors.push(m.text().slice(0, 300));
  });
  if (hasRough) await pg.addInitScript({ path: ROUGH });
  await pg.goto(url.pathToFileURL(FILE).href);
  await pg.evaluate(() => Promise.race([document.fonts && document.fonts.ready, new Promise(r => setTimeout(r, 1500))]));
  await pg.waitForTimeout(400);
  return pg;
}
const goStage = (pg, i, f, wait = SETTLE) => pg.evaluate(([i, f]) => {
  const s = document.querySelectorAll('.st')[i]; const r = s.getBoundingClientRect();
  scrollTo(0, r.top + scrollY + (s.offsetHeight - innerHeight) * f);
}, [i, f]).then(() => pg.waitForTimeout(wait));
const setLevel = async (pg, lv) => {
  const b = await pg.$(`.lvl button[data-lv="${lv}"]`); if (!b) return false;
  await b.click(); await pg.waitForTimeout(500); return true;
};

/* ================================================================ 1. structure (1280x800) */
const main = await open(1280, 800);
const st = await main.evaluate(() => {
  const secs = [...document.querySelectorAll('.st')];
  return {
    stages: secs.map(s => ({ id: s.id, num: s.dataset.num || '', name: s.dataset.name || '', lay: s.dataset.lay })),
    inks: [...document.querySelectorAll('.st .ln .ink')].map(p => p.getTotalLength ? Math.round(p.getTotalLength()) : 0),
    leftoverRaw: document.querySelectorAll('.r').length,
    cards: [...document.querySelectorAll('[data-card]')].map(b => b.dataset.card),
    dialogs: [...document.querySelectorAll('dialog.card')].map(d => d.id),
    stamps: [...document.querySelectorAll('#parcel [data-stamp]')].map(e => e.dataset.stamp),
    dataS: document.querySelectorAll('[data-s]').length,
    hasLvl: !!document.querySelector('.lvl'),
    html: document.documentElement.outerHTML.toLowerCase(),
    title: document.title,
    fontsOk: document.fonts ? document.fonts.check('16px "Bricolage Grotesque"') : true,
  };
});
const N = st.stages.length;
info('stages', `${N}: ` + st.stages.map(s => `${s.num || s.id}:${s.lay}`).join(' '));
if (!st.fontsOk) info('fonts', 'web fonts did not load here (offline?); measurements use fallback fonts and may be slightly off');
if (main._errors.length) fail('page errors on load', main._errors.slice(0, 3).join(' | ')); else pass('no page errors on load');
if (hasRough) st.leftoverRaw ? fail('hand-drawn conversion', `${st.leftoverRaw} .r shapes never converted (unsupported element or bad data-* attrs)`) : pass('hand-drawn conversion', 'every .r shape converted');
if (st.inks.length !== N) fail('one path per stage', `${N} stages but ${st.inks.length} drawn paths. CFG rows must match sections 1:1.`);
else if (st.inks.some(l => l < 50)) fail('path geometry', `stage(s) ${st.inks.map((l, i) => l < 50 ? i : null).filter(x => x !== null).join(',')} have no drawable path. Check that stage's CFG row.`);
else pass('one path per stage', `${N} stages, all paths drawn`);
const orphanBtn = st.cards.filter(c => !st.dialogs.includes(c)), orphanDlg = st.dialogs.filter(d => !st.cards.includes(d));
if (orphanBtn.length) fail('How it works cards', `buttons point at missing dialogs: ${orphanBtn.join(', ')}`);
else pass('How it works cards', `${st.cards.length} buttons, all resolve`);
if (orphanDlg.length) warn('unused cards', `dialogs nobody opens: ${orphanDlg.join(', ')}`);
const leftovers = SAMPLE.filter(p => st.html.includes(p));
if (leftovers.length && !ALLOW_SAMPLE) fail('sample content removed', `template sample text still present: ${leftovers.map(x => `"${x}"`).join(', ')}`);
else if (!leftovers.length) pass('sample content removed');
else info('sample content', 'present (allowed by --allow-sample)');

/* ================================================================ 2. reading levels */
if (st.hasLvl) {
  if (!st.dataS) warn('Plain English layer', 'toggle present but no element has data-s; Plain English shows the technical text');
  else {
    const before = await main.evaluate(() => [...document.querySelectorAll('[data-s]')].map(e => e.innerHTML));
    await setLevel(main, 'plain');
    const plain = await main.evaluate(snap => {
      const els = [...document.querySelectorAll('[data-s]')];
      return { changed: els.filter((e, i) => e.innerHTML !== snap[i] || e.hidden).length,
        pressed: document.querySelector('.lvl button[data-lv="plain"]').getAttribute('aria-pressed'),
        inks: [...document.querySelectorAll('.st .ln .ink')].every(p => p.getTotalLength() > 50) };
    }, before);
    await setLevel(main, 'tech');
    const restored = await main.evaluate(snap => [...document.querySelectorAll('[data-s]')].every((e, i) => e.innerHTML === snap[i] && !e.hidden), before);
    if (!plain.changed) fail('Plain English layer', 'switching changed nothing');
    else if (!restored) fail('Plain English layer', 'switching back did not restore the technical text exactly');
    else if (plain.pressed !== 'true') fail('Plain English layer', 'toggle aria-pressed not updated');
    else if (!plain.inks) fail('Plain English layer', 'path geometry broke after switching (layoutAll not re-run?)');
    else pass('Plain English layer', `${plain.changed}/${st.dataS} elements swap, round-trip exact, layout rebuilt`);
  }
} else info('Plain English layer', 'no .lvl toggle on this page');

/* ================================================================ 3. theme toggle */
const mode0 = await main.evaluate(() => document.documentElement.getAttribute('data-mode'));
await main.click('#theme'); await main.waitForTimeout(200);
const mode1 = await main.evaluate(() => document.documentElement.getAttribute('data-mode'));
mode0 !== mode1 ? pass('theme toggle', `${mode0} -> ${mode1}`) : fail('theme toggle', 'data-mode did not change');
await main.click('#theme'); await main.waitForTimeout(200);

/* ================================================================ 4. scroll sweep: parcel + stamps */
const nan = [];
for (let i = 0; i < N; i++) for (const f of [.02, .3, .6, .98]) {
  await goStage(main, i, f, 40);
  const t = await main.evaluate(() => document.getElementById('parcel').style.transform);
  if (/NaN|Infinity/.test(t)) nan.push(`${st.stages[i].id}@${f}`);
}
nan.length ? fail('parcel path', `invalid transform at ${nan.join(', ')}`) : pass('parcel path', 'valid at every sampled point');
await goStage(main, N - 1, 1, 400);
const unearned = await main.evaluate(() => [...document.querySelectorAll('#parcel .pst')].filter(e => !e.classList.contains('got')).map(e => e.dataset.stamp));
unearned.length ? fail('parcel stamps', `never earned by the end: ${unearned.join(', ')} (missing or wrong STAMPS entry)`) : pass('parcel stamps', `all ${st.stamps.length} earned by the finale`);
if (main._errors.length) fail('page errors while scrolling', main._errors.slice(0, 3).join(' | '));
await main.context().close();

/* ================================================================ 5. reduced motion */
{
  const rm = await open(1280, 800, { reducedMotion: 'reduce' });
  const r = await rm.evaluate(() => ({ rm: document.documentElement.classList.contains('rm'), statics: document.querySelectorAll('.pstatic').length }));
  if (rm._errors.length) fail('reduced motion', rm._errors[0]);
  else if (!r.rm) fail('reduced motion', '.rm class not applied');
  else pass('reduced motion', `static layout, ${r.statics} parcel snapshots`);
  await rm.context().close();
}

/* ================================================================ 6. layout matrix */
const DESKTOP = QUICK ? [[1280, 800]] : [[1600, 900], [1280, 800], [1024, 768], [900, 650], [780, 600]];
const MOBILE = QUICK ? [[390, 844]] : [[430, 932], [390, 844], [360, 740], [320, 568], [768, 1024]];
const layoutRows = [];
for (const [w, h] of [...DESKTOP, ...MOBILE]) {
  const pg = await open(w, h);
  for (const lv of st.hasLvl ? ['tech', 'plain'] : ['tech']) {
    if (st.hasLvl) await setLevel(pg, lv);
    let worstGap = 1e9, gapAt = '', worstOver = -1e9, overAt = '', pager = [], artHidden = 0;
    for (let i = 0; i < N; i++) {
      await goStage(pg, i, .5);
      const m = await pg.evaluate(idx => {
        const s = document.querySelectorAll('.st')[idx], c = s.querySelector('.copy').getBoundingClientRect();
        const bar = Math.max(...['.lvl', '.theme'].map(q => document.querySelector(q)).filter(Boolean).map(e => e.getBoundingClientRect().bottom));
        const pg = document.querySelector('.count'); const p = pg ? pg.getBoundingClientRect() : null;
        const hit = p && c.left < p.right && c.right > p.left && c.top < p.bottom && c.bottom > p.top - 6;
        return { gap: c.top - bar, over: c.bottom - innerHeight, hit: !!hit, art: s.querySelector('.art').style.visibility === 'hidden',
          hs: document.documentElement.scrollWidth > innerWidth + 1 };
      }, i);
      if (m.gap < worstGap) { worstGap = m.gap; gapAt = st.stages[i].id; }
      if (m.over > worstOver) { worstOver = m.over; overAt = st.stages[i].id; }
      if (m.hit) pager.push(st.stages[i].id);
      if (m.art) artHidden++;
      if (m.hs) fail('no sideways scroll', `${w}x${h} ${lv}: page scrolls horizontally at ${st.stages[i].id}`);
    }
    const tag = `${w}x${h} ${lv}`;
    layoutRows.push(`${tag.padEnd(16)} gap ${String(Math.round(worstGap)).padStart(4)}px (${gapAt})  bottom ${String(Math.round(worstOver)).padStart(5)}px (${overAt})${pager.length ? '  PAGER:' + pager.join(',') : ''}${artHidden ? `  art hidden on ${artHidden}` : ''}`);
    if (worstGap < MIN_TOP_GAP) fail('copy clears the toolbar', `${tag}: ${Math.round(worstGap)}px at ${gapAt} (need >= ${MIN_TOP_GAP})`);
    if (worstOver > 0) fail('copy fits the screen', `${tag}: runs ${Math.round(worstOver)}px past the bottom at ${overAt}`);
    if (pager.length) fail('copy clears the pager', `${tag}: overlaps the bottom pager at ${pager.join(', ')}`);
    if (artHidden && w >= 360 && h >= 700) warn('illustrations shown', `${tag}: art dropped on ${artHidden} stage(s) for lack of room`);
  }
  if (pg._errors.length) fail('page errors', `${w}x${h}: ${pg._errors[0]}`);
  await pg.context().close();
}
if (!results.some(r => r.level === 'FAIL' && /copy (clears|fits)/.test(r.check))) pass('layout matrix', `${DESKTOP.length + MOBILE.length} viewports x ${st.hasLvl ? 2 : 1} reading levels, every stage`);

/* ================================================================ 7. screenshots: four corners */
if (SHOTS) {
  const corners = [['desktop-light', 1280, 800, false], ['desktop-dark', 1280, 800, true], ['mobile-light', 390, 844, false], ['mobile-dark', 390, 844, true]];
  for (const [name, w, h, dark] of corners) {
    const dir = path.join(OUT, name); fs.mkdirSync(dir, { recursive: true });
    const pg = await open(w, h);
    if (dark && (await pg.evaluate(() => document.documentElement.getAttribute('data-mode'))) !== 'dark') { await pg.click('#theme'); await pg.waitForTimeout(300); }
    const idx = QUICK ? [0, N - 1] : [...Array(N).keys()];
    for (const i of idx) {
      await goStage(pg, i, i === 0 ? 0 : .55, FADE);
      await pg.screenshot({ path: path.join(dir, `${String(i).padStart(2, '0')}-${st.stages[i].id}.png`) });
    }
    await pg.evaluate(() => scrollTo(0, document.body.scrollHeight)); await pg.waitForTimeout(FADE);
    await pg.screenshot({ path: path.join(dir, `99-outro.png`) });
    await pg.context().close();
  }
  info('screenshots', `${path.relative(process.cwd(), OUT)}/{desktop,mobile}-{light,dark}/ — look at them; the checks above cannot judge drawing quality`);
}
await browser.close();

/* ================================================================ report */
const order = { FAIL: 0, WARN: 1, PASS: 2, INFO: 3 };
results.sort((a, b) => order[a.level] - order[b.level]);
const icon = { FAIL: '✗', WARN: '!', PASS: '✓', INFO: '·' };
console.log(`\nverify: ${path.basename(FILE)}  "${st.title}"\n`);
for (const r of results) console.log(`${icon[r.level]} ${r.level.padEnd(4)} ${r.check}${r.detail ? ' — ' + r.detail : ''}`);
console.log('\nlayout (worst stage per viewport):\n  ' + layoutRows.join('\n  '));
const fails = results.filter(r => r.level === 'FAIL').length, warns = results.filter(r => r.level === 'WARN').length;
console.log(`\n${fails ? 'FAILED' : 'PASSED'}: ${fails} fail, ${warns} warn`);
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ page: FILE, title: st.title, stages: st.stages, results, layout: layoutRows }, null, 2));
process.exit(fails ? 1 : 0);
