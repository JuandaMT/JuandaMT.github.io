/**
 * Behaviour for /lab/ ("Plano de obra"). Progressive enhancement throughout:
 * without JS the page is a complete document; with reduced motion the drawing is
 * shown finished and nothing pins or animates.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createBlueprint, type Blueprint } from './blueprint';

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

paperToggle();
sizeSheets();
window.addEventListener('resize', sizeSheets);
if (!reduceMotion) motion();
void document.fonts.ready.then(() => {
  const plan = drawing();
  if (!reduceMotion && finePointer && plan) cursor(plan);
});

/** Blueprint ↔ tracing paper, remembered per visitor. */
function paperToggle() {
  const button = document.querySelector<HTMLButtonElement>('[data-paper-toggle]');
  const name = button?.querySelector<HTMLElement>('[data-paper-name]');
  if (!button || !name) return;
  const render = () => {
    const paper = root.dataset.paper === 'calco' ? 'calco' : 'cyan';
    name.textContent = button.dataset[paper] ?? paper;
    button.setAttribute('aria-pressed', String(paper === 'calco'));
  };
  render();
  button.addEventListener('click', () => {
    const next = root.dataset.paper === 'calco' ? 'cyan' : 'calco';
    root.dataset.paper = next;
    try {
      localStorage.setItem('lab-paper', next);
    } catch {
      /* storage unavailable: the choice lasts for this page view */
    }
    render();
  });
}

function drawing(): Blueprint | null {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-drawing]');
  const data = document.querySelector<HTMLElement>('.bp-drawing-data');
  if (!canvas || !data) return null;
  const log = document.querySelector<HTMLElement>('[data-log]');
  const stamp = document.querySelector<HTMLElement>('[data-stamp]');
  const agentsWord = log?.dataset.agents ?? 'agents';
  const strokesWord = log?.dataset.strokes ?? 'strokes';
  return createBlueprint(canvas, {
    levels: JSON.parse(data.dataset.levels ?? '[]') as string[],
    dimension: data.dataset.dimension ?? '',
    animate: !reduceMotion,
    onProgress: (busy, ratio) => {
      if (log)
        log.textContent = `${agentsWord}: ${busy}/5 · ${strokesWord} ${Math.round(ratio * 100)}%`;
    },
    onDone: () => {
      if (log) log.textContent = `${agentsWord}: 0/5 · ${strokesWord} 100%`;
      window.setTimeout(() => stamp?.classList.add('is-on'), 450);
    },
  });
}

/** Give each project sheet's hover trace (and its agent) the sheet's own outline. */
function sizeSheets() {
  document.querySelectorAll<HTMLElement>('[data-card]').forEach((sheet) => {
    const w = sheet.offsetWidth - 16;
    const h = sheet.offsetHeight - 16;
    const rect = sheet.querySelector('.bp-trace rect');
    rect?.setAttribute('width', String(w));
    rect?.setAttribute('height', String(h));
    const agent = sheet.querySelector<HTMLElement>('.bp-sheet-agent');
    if (agent) agent.style.offsetPath = `path('M 8 8 H ${w + 8} V ${h + 8} H 8 Z')`;
  });
}

function motion() {
  root.classList.add('motion');
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id && id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target);
      target.focus({ preventScroll: true });
    });
  });

  gsap.from('.bp-hero-copy > *', {
    opacity: 0,
    y: 24,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.1,
  });
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 32,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  flow();
}

/** Pin the loop and advance the works schedule with the scroll. */
function flow() {
  const section = document.querySelector<HTMLElement>('[data-flow]');
  if (!section) return;
  const steps = [...section.querySelectorAll<HTMLElement>('[data-step]')];
  const rows = [...section.querySelectorAll<SVGGElement>('[data-row]')];
  const counter = section.querySelector<HTMLElement>('[data-flow-counter]');
  const bar = section.querySelector<HTMLElement>('.bp-flow-bar');
  section.classList.add('is-pinned');

  const pad = (n: number) => String(n).padStart(2, '0');
  const render = (progress: number) => {
    const n = steps.length;
    const active = Math.min(n - 1, Math.floor(progress * n));
    steps.forEach((s, j) => {
      s.classList.toggle('is-active', j === active);
      s.setAttribute('aria-hidden', String(j !== active));
    });
    rows.forEach((row, j) => {
      const local = Math.min(1, Math.max(0, progress * n - j));
      row.classList.toggle('is-active', j === active);
      const line = row.querySelector<SVGLineElement>('.bp-sch-bar');
      const dot = row.querySelector<SVGCircleElement>('.bp-sch-agent');
      if (!line) return;
      line.style.strokeDashoffset = String(1 - local);
      const x1 = Number(line.getAttribute('x1'));
      const x2 = Number(line.getAttribute('x2'));
      dot?.setAttribute('cx', String(x1 + (x2 - x1) * local));
    });
    if (counter) counter.textContent = `${pad(active + 1)} / ${pad(n)}`;
    if (bar) bar.style.transform = `scaleX(${progress})`;
  };
  render(0);

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * steps.length * 0.8}`,
    pin: true,
    scrub: true,
    onUpdate: (self) => render(self.progress),
  });
}

/** CAD cursor: full-screen crosshair, coordinates, and snapping to drawn vertices. */
function cursor(plan: Blueprint) {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-cursor]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const pointer = { x: 0, y: 0, on: false };
  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
  };
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (!pointer.on) root.classList.add('has-cursor');
    pointer.on = true;
  });
  document.addEventListener('pointerleave', () => (pointer.on = false));

  const css = (v: string) => getComputedStyle(root).getPropertyValue(v).trim();
  const fmt = (n: number) => (n * 100).toFixed(0).padStart(5, '0');
  // Redrawn every tick: the drawing underneath keeps changing while the agents work.
  gsap.ticker.add(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (!pointer.on) return;
    let { x, y } = pointer;
    let snapped = false;
    let best = 14;
    for (const [vx, vy] of plan.vertices()) {
      const d = Math.hypot(vx - pointer.x, vy - pointer.y);
      if (d < best) {
        best = d;
        x = vx;
        y = vy;
        snapped = true;
      }
    }
    const ink = css('--rule');
    const accent = css('--accent');
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(W, Math.round(y) + 0.5);
    ctx.moveTo(Math.round(x) + 0.5, 0);
    ctx.lineTo(Math.round(x) + 0.5, H);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = snapped ? accent : ink;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x - 6, y - 6, 12, 12);
    const [wx, wy] = plan.toWorld(x, y);
    ctx.fillStyle = snapped ? accent : ink;
    ctx.font = '500 10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`X ${fmt(wx)}  Y ${fmt(wy)}${snapped ? '  · END' : ''}`, x + 12, y + 10);
  });
}
