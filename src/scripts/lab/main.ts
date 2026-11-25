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

themeColor();
if (!reduceMotion) motion();
void document.fonts.ready.then(() => {
  const plan = drawing();
  if (!reduceMotion && finePointer && plan) cursor(plan);
});

/** Browser UI colour follows the chosen theme, not only the system one. */
function themeColor() {
  const sync = () => {
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((m) => m.setAttribute('content', bg));
  };
  sync();
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
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
  work();
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

/**
 * Projects: on desktop the section is pinned and the scroll swaps the project; each
 * scene's drawing draws itself in. On small screens scenes stack and draw as they enter.
 */
function work() {
  const section = document.querySelector<HTMLElement>('[data-work]');
  if (!section) return;
  const scenes = [...section.querySelectorAll<HTMLElement>('[data-scene]')];
  const ticks = [...section.querySelectorAll<HTMLElement>('[data-tick]')];
  const counter = section.querySelector<HTMLElement>('[data-work-counter]');
  const pad = (n: number) => String(n).padStart(2, '0');
  // Strokes are drawn in by dashoffset, which needs a normalised path length.
  scenes.forEach((scene) =>
    scene
      .querySelectorAll(
        '.pv :is(path, line, rect, circle, polyline, ellipse):not(.dash, .flow, .ring)',
      )
      .forEach((el) => el.setAttribute('pathLength', '1')),
  );

  const roomy = matchMedia('(min-width: 901px) and (min-height: 620px)').matches;
  if (!roomy) {
    scenes.forEach((scene) =>
      ScrollTrigger.create({
        trigger: scene,
        start: 'top 75%',
        onEnter: () => scene.classList.add('is-active'),
      }),
    );
    return;
  }

  section.classList.add('is-pinned');
  const render = (progress: number) => {
    const n = scenes.length;
    const active = Math.min(n - 1, Math.floor(progress * n));
    scenes.forEach((s, j) => {
      s.classList.toggle('is-active', j === active);
      s.setAttribute('aria-hidden', String(j !== active));
    });
    ticks.forEach((t, j) => {
      t.classList.toggle('is-active', j === active);
      t.classList.toggle('is-on', j < active);
    });
    if (counter) counter.textContent = `${pad(active + 1)} / ${pad(n)}`;
  };
  render(0);
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * scenes.length * 0.7}`,
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
