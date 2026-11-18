/**
 * Motion layer for /lab/. Everything here is progressive enhancement:
 * without JS, or with prefers-reduced-motion, the page is a readable static document.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { sceneState } from './state';

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reduceMotion) init();

function init() {
  root.classList.add('motion');
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.1 });
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

  kineticTitle();
  reveals();
  flow();
  work(lenis);
  if (finePointer) {
    cursor();
    magnetic();
    tilt();
  }
  window.addEventListener('pointermove', (e) => {
    sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    sceneState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });

  loadScene();
}

/** Split the hero name into characters and raise them line by line. */
function kineticTitle() {
  const title = document.querySelector<HTMLElement>('[data-kinetic]');
  if (!title) return;
  title.querySelectorAll<HTMLElement>('.line > span').forEach((word) => {
    const text = word.textContent ?? '';
    word.textContent = '';
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? ' ' : ch;
      word.appendChild(span);
    }
  });
  gsap.from(title.querySelectorAll('.char'), {
    yPercent: 115,
    rotate: 6,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.035,
    delay: 0.15,
  });
  gsap.from('[data-hero-fade]', {
    opacity: 0,
    y: 16,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.7,
  });
}

function reveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 48,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
}

/** Pin the workflow section and step through it with the scroll. */
function flow() {
  const section = document.querySelector<HTMLElement>('[data-flow]');
  if (!section) return;
  const steps = [...section.querySelectorAll<HTMLElement>('[data-step]')];
  const counter = section.querySelector<HTMLElement>('[data-flow-counter]');
  const bar = section.querySelector<HTMLElement>('.lab-flow-bar');
  section.classList.add('is-pinned');

  const setActive = (i: number) => {
    steps.forEach((s, j) => {
      const on = i === j;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', String(!on));
    });
    if (counter)
      counter.textContent = `${String(i + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    sceneState.active = i;
  };
  setActive(0);
  sceneState.active = -1;

  // Particles gather while the section scrolls into view.
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'top top',
    scrub: true,
    onUpdate: (self) => {
      sceneState.gather = self.progress;
    },
  });

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * steps.length * 0.85}`,
    pin: true,
    scrub: true,
    onUpdate: (self) => {
      setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length)));
      if (bar) bar.style.transform = `scaleX(${self.progress})`;
    },
    onLeaveBack: () => {
      sceneState.active = -1;
    },
  });

  // Released after the workflow: particles drift away while the projects scroll in.
  ScrollTrigger.create({
    trigger: '[data-work]',
    start: 'top bottom',
    end: 'top 20%',
    scrub: true,
    onUpdate: (self) => {
      sceneState.release = self.progress;
    },
  });
}

/** Desktop: pin the projects and translate the track horizontally. */
function work(lenis: Lenis) {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', () => {
    const section = document.querySelector<HTMLElement>('[data-work]');
    const track = section?.querySelector<HTMLElement>('.lab-track');
    if (!section || !track) return;
    section.classList.add('is-horizontal');
    const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    // Keyboard: bring a focused card into view by scrolling to its position.
    const onFocus = (e: FocusEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-card]');
      const st = tween.scrollTrigger;
      if (!card || !st || distance() === 0) return;
      const ratio = Math.min(1, card.offsetLeft / distance());
      lenis.scrollTo(st.start + (st.end - st.start) * ratio, { immediate: true });
    };
    track.addEventListener('focusin', onFocus);

    return () => {
      track.removeEventListener('focusin', onFocus);
      section.classList.remove('is-horizontal');
    };
  });
}

function cursor() {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'lab-cursor-dot';
  ring.className = 'lab-cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  document.body.append(dot, ring);
  // Stay hidden until the first pointer move so nothing sits at (0, 0).
  gsap.set([dot, ring], { autoAlpha: 0 });
  window.addEventListener(
    'pointermove',
    () => {
      root.classList.add('has-cursor');
      gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
    },
    { once: true },
  );

  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX);
    ry(e.clientY);
  });
  document.addEventListener('pointerover', (e) => {
    const interactive = (e.target as HTMLElement).closest('a, button');
    ring.classList.toggle('is-hover', !!interactive);
  });
}

function magnetic() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.35);
      y((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });
}

/** Spotlight + 3D tilt on project cards. */
function tilt() {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
    gsap.set(card, { transformPerspective: 900 });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      ry((px - 0.5) * 8);
      rx((0.5 - py) * 8);
    });
    card.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  });
}

/** Load Three.js only once the page is idle, so it never delays the content. */
function loadScene() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-scene]');
  if (!canvas) return;
  const steps = Number(canvas.dataset.steps ?? 5);
  const start = () =>
    import('./scene').then(({ createScene }) => {
      const scene = createScene(canvas, steps);
      root.dataset.webgl = scene ? 'on' : 'fallback';
    });
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => void start(), { timeout: 1500 });
  } else {
    setTimeout(() => void start(), 600);
  }
}
