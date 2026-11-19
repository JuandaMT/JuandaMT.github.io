/**
 * Hero drawing: an elevation of "the stack" as a four-storey building, drawn stroke by
 * stroke by five agents that pull work from a shared queue. Canvas 2D, no dependencies.
 */

type Pt = [number, number];
type Kind = 'line' | 'thin' | 'dash';
type Seg =
  | { type: 'line'; a: Pt; b: Pt; kind: Kind; p: number }
  | { type: 'circle'; c: Pt; r: number; kind: Kind; p: number };
interface Label {
  text: string;
  x: number;
  y: number;
  after: number;
  t: number;
  size: number;
  align?: CanvasTextAlign;
  base?: CanvasTextBaseline;
  soft?: boolean;
}
interface Agent {
  id: string;
  pos: Pt;
  task: number | null;
  mode: 'wait' | 'idle' | 'travel' | 'draw' | 'home';
  delay: number;
  home: Pt;
}

export interface Blueprint {
  /** Screen positions of finished vertices, for cursor snapping. */
  vertices(): Pt[];
  /** Convert screen coordinates to drawing units (for the cursor readout). */
  toWorld(x: number, y: number): Pt;
}

export interface BlueprintOptions {
  levels: string[];
  dimension: string;
  animate: boolean;
  onProgress?: (busy: number, ratio: number) => void;
  onDone?: () => void;
}

const DRAW_SPEED = 62; // drawing units per second
const TRAVEL_SPEED = 150;

function build(levels: string[], dimension: string) {
  const segs: Seg[] = [];
  const labels: Label[] = [];
  const L = (a: Pt, b: Pt, kind: Kind = 'line') =>
    segs.push({ type: 'line', a, b, kind, p: 0 }) - 1;
  const C = (c: Pt, r: number, kind: Kind = 'line') =>
    segs.push({ type: 'circle', c, r, kind, p: 0 }) - 1;
  const T = (text: string, x: number, y: number, after: number, opts: Partial<Label> = {}) =>
    labels.push({ text, x, y, after, t: 0, size: 1.8, ...opts });

  const ground = L([2, 90], [98, 90]);
  for (let x = 5; x <= 96; x += 3) L([x, 90], [x - 2.4, 92.6], 'thin');

  ['A', 'B', 'C', 'D'].forEach((n, i) => {
    const x = 20 + i * 20;
    L([x, 88], [x, 10], 'dash');
    const c = C([x, 7], 2.4);
    T(n, x, 7.1, c, { align: 'center', base: 'middle', size: 1.9 });
  });

  const heights = [90, 72, 54, 36, 22];
  for (let f = 0; f < 4; f++) {
    const y0 = heights[f];
    const y1 = heights[f + 1];
    L([20, y0], [20, y1]);
    L([80, y0], [80, y1]);
    for (const x of [39.4, 40.6, 59.4, 60.6]) L([x, y0], [x, y1], 'thin');
    const edge = f === 3 ? 18 : 20;
    const slab = L([edge, y1], [100 - edge, y1]);
    L([edge, y1 - 1.4], [100 - edge, y1 - 1.4]);
    T(levels[f] ?? '', 50, (y0 + y1) / 2 + 0.6, slab, { align: 'center', size: 1.9 });
    T(`N${f}`, 23, y0 - 2.2, slab, { size: 1.5, soft: true });
  }
  L([18, 20.6], [18, 22]);
  L([82, 20.6], [82, 22]);

  L([50, 20.6], [50, 13]);
  L([46, 20.6], [50, 15.5], 'thin');
  L([54, 20.6], [50, 15.5], 'thin');
  C([50, 11.4], 1.6);

  heights.forEach((y, i) => {
    const h = L([7, y], [17, y], 'thin');
    L([11.5, y - 1.7], [13.5, y - 1.7], 'thin');
    L([11.5, y - 1.7], [12.5, y], 'thin');
    L([13.5, y - 1.7], [12.5, y], 'thin');
    T(i === 0 ? '±0.00' : `+${(i * 3.2).toFixed(2)}`, 7, y - 2.3, h, { size: 1.6 });
  });

  L([20, 91], [20, 98.5], 'thin');
  L([80, 91], [80, 98.5], 'thin');
  const dim = L([20, 97], [80, 97]);
  L([19, 98], [21, 96]);
  L([79, 98], [81, 96]);
  T(dimension, 50, 95.9, dim, { align: 'center', size: 1.7 });

  return { segs, labels, ground };
}

const segLen = (s: Seg) =>
  s.type === 'line' ? Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) : 2 * Math.PI * s.r;
const segStart = (s: Seg): Pt => (s.type === 'line' ? s.a : [s.c[0], s.c[1] - s.r]);
function segPoint(s: Seg, p: number): Pt {
  if (s.type === 'line') return [s.a[0] + (s.b[0] - s.a[0]) * p, s.a[1] + (s.b[1] - s.a[1]) * p];
  const ang = -Math.PI / 2 + p * 2 * Math.PI;
  return [s.c[0] + s.r * Math.cos(ang), s.c[1] + s.r * Math.sin(ang)];
}

export function createBlueprint(canvas: HTMLCanvasElement, opts: BlueprintOptions): Blueprint {
  const ctx = canvas.getContext('2d')!;
  const { segs, labels, ground } = build(opts.levels, opts.dimension);

  // Shared queue: the ground first, then everything from the bottom up.
  const queue = segs
    .map((_, i) => i)
    .sort((i, j) => {
      if (i === ground) return -1;
      if (j === ground) return 1;
      return segStart(segs[j])[1] - segStart(segs[i])[1];
    });
  const agents: Agent[] = Array.from({ length: 5 }, (_, i) => ({
    id: `ag-0${i + 1}`,
    pos: [50 + (i - 2) * 10, 104],
    home: [50 + (i - 2) * 10, 104],
    task: null,
    mode: 'wait',
    delay: 0.4 + i * 0.25,
  }));

  let W = 0;
  let H = 0;
  let dpr = 1;
  let view = { s: 1, ox: 0, oy: 0 };
  let done = 0;
  let finished = false;
  let benchAlpha = 1;

  if (!opts.animate) {
    segs.forEach((s) => (s.p = 1));
    labels.forEach((l) => (l.t = 1));
    done = segs.length;
    finished = true;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const box =
      W < 760
        ? { x: W * 0.06, y: H * 0.09, w: W * 0.88, h: H * 0.42 }
        : { x: W * 0.46, y: H * 0.07, w: W * 0.5, h: H * 0.66 };
    const s = Math.min(box.w / 100, box.h / 104);
    view = { s, ox: box.x + (box.w - 100 * s) / 2, oy: box.y + (box.h - 104 * s) / 2 };
  }
  resize();
  window.addEventListener('resize', resize);

  const parallax = () => window.scrollY * 0.35;
  const toScreen = ([x, y]: Pt): Pt => [view.ox + x * view.s, view.oy + y * view.s - parallax()];
  const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function step(dt: number) {
    if (finished) {
      for (const l of labels) l.t = Math.min(1, l.t + dt * 2);
      // On narrow screens the bench would sit on the copy below: let the agents leave.
      if (W < 760) benchAlpha = Math.max(0, benchAlpha - dt);
      for (const a of agents) {
        a.pos[0] += (a.home[0] - a.pos[0]) * Math.min(1, dt * 3);
        a.pos[1] += (a.home[1] - a.pos[1]) * Math.min(1, dt * 3);
      }
      return;
    }
    for (const a of agents) {
      if (a.mode === 'wait') {
        a.delay -= dt;
        if (a.delay > 0) continue;
        a.mode = 'idle';
      }
      if (a.task == null) {
        const next = queue.shift();
        if (next == null) continue;
        a.task = next;
        a.mode = 'travel';
      }
      const s = segs[a.task];
      if (a.mode === 'travel') {
        const target = segStart(s);
        const dx = target[0] - a.pos[0];
        const dy = target[1] - a.pos[1];
        const d = Math.hypot(dx, dy);
        const mv = TRAVEL_SPEED * dt;
        if (d <= mv) {
          a.pos = [target[0], target[1]];
          a.mode = 'draw';
        } else {
          a.pos = [a.pos[0] + (dx / d) * mv, a.pos[1] + (dy / d) * mv];
        }
      } else if (a.mode === 'draw') {
        s.p = Math.min(1, s.p + (DRAW_SPEED * dt) / segLen(s));
        a.pos = segPoint(s, s.p);
        if (s.p >= 1) {
          a.task = null;
          a.mode = 'idle';
          done++;
        }
      }
    }
    for (const l of labels) if (segs[l.after].p >= 1) l.t = Math.min(1, l.t + dt * 2);
    opts.onProgress?.(agents.filter((a) => a.task != null).length, done / segs.length);
    if (done === segs.length) {
      finished = true;
      agents.forEach((a) => (a.mode = 'home'));
      opts.onDone?.();
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const fade = Math.max(0, 1 - window.scrollY / (H * 0.9));
    if (fade <= 0) return;
    const ink = css('--rule');
    const accent = css('--accent');
    ctx.lineCap = 'round';

    for (const s of segs) {
      if (s.p <= 0) continue;
      ctx.strokeStyle = ink;
      ctx.lineWidth = s.kind === 'line' ? 1.4 : 0.8;
      ctx.setLineDash(s.kind === 'dash' ? [7, 6] : []);
      ctx.globalAlpha = fade * (s.kind === 'line' ? 1 : s.kind === 'dash' ? 0.35 : 0.6);
      ctx.beginPath();
      if (s.type === 'line') {
        const a = toScreen(s.a);
        const b = toScreen(segPoint(s, s.p));
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      } else {
        const c = toScreen(s.c);
        ctx.arc(c[0], c[1], s.r * view.s, -Math.PI / 2, -Math.PI / 2 + s.p * Math.PI * 2);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.fillStyle = ink;
    for (const l of labels) {
      if (l.t <= 0) continue;
      const [x, y] = toScreen([l.x, l.y]);
      ctx.globalAlpha = fade * l.t * (l.soft ? 0.6 : 0.95);
      ctx.font = `500 ${Math.max(9, l.size * view.s)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = l.align ?? 'left';
      ctx.textBaseline = l.base ?? 'alphabetic';
      ctx.fillText(l.text, x, y);
    }

    if (opts.animate) {
      for (const a of agents) {
        if (a.mode === 'wait') continue;
        const [x, y] = toScreen(a.pos);
        if (a.mode === 'travel' && a.task != null) {
          const [tx, ty] = toScreen(segStart(segs[a.task]));
          ctx.globalAlpha = fade * 0.45;
          ctx.strokeStyle = accent;
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = accent;
        ctx.globalAlpha = fade * benchAlpha;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = fade * benchAlpha * 0.3;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = fade * benchAlpha * 0.85;
        ctx.font = '500 9px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.id, x + 10, y - 9);
      }
    }
    ctx.globalAlpha = 1;
  }

  let last = performance.now();
  let frame = 0;
  let running = true;
  function tick(now: number) {
    if (!running) return;
    // rAF timestamps can precede performance.now(): clamp to avoid negative steps.
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
    last = now;
    step(dt);
    draw();
    frame = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(frame);
    } else if (!running) {
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  });
  if (opts.animate) {
    frame = requestAnimationFrame(tick);
  } else {
    // Static: redraw only when something changes.
    draw();
    const redraw = () => requestAnimationFrame(draw);
    window.addEventListener('scroll', redraw, { passive: true });
    window.addEventListener('resize', redraw);
    new MutationObserver(redraw).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  return {
    vertices() {
      const out: Pt[] = [];
      if (window.scrollY > H * 0.9) return out;
      for (const s of segs) {
        if (s.p < 1 || s.type !== 'line') continue;
        out.push(toScreen(s.a), toScreen(s.b));
      }
      return out;
    },
    toWorld(x, y) {
      return [(x - view.ox) / view.s, (y + parallax() - view.oy) / view.s];
    },
  };
}
