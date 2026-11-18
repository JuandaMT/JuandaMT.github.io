/**
 * Generates the Open Graph images (1200×630 PNG) in public/og/ with Playwright.
 *   pnpm og
 * Re-run it after changing the hero title or a project's title/tagline, and commit the PNGs.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'public', 'og');
fs.mkdirSync(outDir, { recursive: true });

const font = (pkg, file) =>
  fs
    .readFileSync(path.join(root, 'node_modules', '@fontsource-variable', pkg, 'files', file))
    .toString('base64');
const geist = font('geist', 'geist-latin-wght-normal.woff2');
const mono = font('jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2');

const copy = {
  en: {
    role: 'Full stack developer · Valencia, Spain',
    caseStudy: 'Case study',
    title: 'I build SaaS products end to end, and ship them with AI agents under review.',
  },
  es: {
    role: 'Desarrollador full stack · Valencia',
    caseStudy: 'Caso de estudio',
    title:
      'Construyo productos SaaS de principio a fin y los entrego con agentes de IA bajo revisión.',
  },
};
const trace = {
  en: ['spec', 'implement', 'review', 'verify'],
  es: ['spec', 'implementar', 'revisar', 'verificar'],
};

/** Minimal frontmatter reader: only the flat string/boolean keys we need. */
function frontmatter(file) {
  const src = fs.readFileSync(file, 'utf8');
  const block = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const get = (key) =>
    block
      .match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]
      .trim()
      .replace(/^['"]|['"]$/g, '');
  return { title: get('title'), tagline: get('tagline'), detailPage: get('detailPage') === 'true' };
}

const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function html({ lang, eyebrow, title, subtitle }) {
  const steps = trace[lang]
    .map(
      (s, i) =>
        `${i ? '<span class="sep">──</span>' : ''}<span class="step"><svg viewBox="0 0 12 12"><path d="M2.5 6.5l2.2 2L9.5 3.5"/></svg>${s}</span>`,
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face{font-family:G;src:url(data:font/woff2;base64,${geist}) format('woff2');font-weight:100 900}
    @font-face{font-family:M;src:url(data:font/woff2;base64,${mono}) format('woff2');font-weight:100 900}
    *{margin:0;box-sizing:border-box}
    body{width:1200px;height:630px;background:#f6f3ee;color:#1b1a1f;font-family:G;position:relative;overflow:hidden}
    .grid{position:absolute;inset:0;background-image:linear-gradient(#e2dccf 1px,transparent 1px),linear-gradient(90deg,#e2dccf 1px,transparent 1px);background-size:36px 36px;-webkit-mask-image:radial-gradient(ellipse 75% 70% at 25% 35%,#000 15%,transparent 75%)}
    .wrap{position:relative;height:100%;padding:72px 80px;display:flex;flex-direction:column}
    .top{display:flex;align-items:center;gap:14px;font-size:26px;font-weight:550;letter-spacing:-.01em}
    .dots{display:flex;gap:5px}.dots i{width:11px;height:11px;border-radius:50%;background:#a3401a}.dots i:nth-child(2){background:#1b1a1f66}.dots i:nth-child(3){background:#1b1a1f33}
    .eyebrow{margin-top:56px;font-family:M;font-size:22px;color:#a3401a}
    h1{margin-top:18px;font-size:${title.length > 70 ? 62 : 72}px;line-height:1.05;letter-spacing:-.035em;font-weight:600;max-width:1000px}
    p.sub{margin-top:20px;font-size:30px;color:#59554e;max-width:900px}
    .bottom{margin-top:auto;display:flex;justify-content:space-between;align-items:center;font-family:M;font-size:19px;color:#59554e}
    .trace{display:flex;align-items:center;gap:10px}.sep{color:#cfc7b8}
    .step{display:flex;align-items:center;gap:8px;border:1px solid #e2dccf;background:#fffdf9;border-radius:999px;padding:6px 14px}
    .step svg{width:16px;height:16px;fill:none;stroke:#a3401a;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  </style></head><body><div class="grid"></div><div class="wrap">
    <div class="top"><span class="dots"><i></i><i></i><i></i></span>Juan David Mayorga</div>
    <div class="eyebrow">${esc(eyebrow)}</div>
    <h1>${esc(title)}</h1>
    ${subtitle ? `<p class="sub">${esc(subtitle)}</p>` : ''}
    <div class="bottom"><div class="trace">${steps}</div><span>juandamt.github.io</span></div>
  </div></body></html>`;
}

const jobs = [];
for (const lang of ['en', 'es']) {
  jobs.push({ file: `home-${lang}.png`, lang, eyebrow: copy[lang].role, title: copy[lang].title });
  const dir = path.join(root, 'src', 'content', 'projects', lang);
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const fm = frontmatter(path.join(dir, f));
    if (!fm.detailPage) continue;
    jobs.push({
      file: `${f.replace(/\.md$/, '')}-${lang}.png`,
      lang,
      eyebrow: copy[lang].caseStudy,
      title: fm.title,
      subtitle: fm.tagline,
    });
  }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const job of jobs) {
  await page.setContent(html(job), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(outDir, job.file) });
  console.log('og:', job.file);
}
await browser.close();
