/**
 * Hero WebGL scene: a low-res nebula behind a particle cloud that gathers into a graph of the workflow
 * steps as you scroll, with packets travelling along the pipeline.
 * Loaded lazily (dynamic import) after the page content is interactive.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  HalfFloatType,
  LinearFilter,
  LinearSRGBColorSpace,
  Line,
  LineBasicMaterial,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
} from 'three';
import { sceneState } from './state';
import {
  composeFragment,
  fullscreenVertex,
  nebulaFragment,
  particleFragment,
  particleVertex,
} from './shaders';

/**
 * Shader colours are written straight to the canvas (no colour management in these
 * ShaderMaterials), so they are taken as raw sRGB values to match the CSS palette.
 */
const raw = (hex: string) => new Color().setStyle(hex, LinearSRGBColorSpace);
const ACCENT = raw('#f0895b');
/** For built-in materials, which do their own colour management. */
const ACCENT_MANAGED = new Color('#f0895b');
const DIM = raw('#b3ab9c');
const COOL = raw('#8d9abd');
const BASE = raw('#07080b');
const NEBULA_COOL = raw('#1a2236');
/** The nebula is smooth, so it is rendered at a fraction of the CSS size and upscaled. */
const NEBULA_SCALE = 0.33;

/** One triangle that covers the whole viewport (cheaper than a quad). */
function fullscreenTriangle() {
  const g = new BufferGeometry();
  g.setAttribute(
    'position',
    new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
  );
  return g;
}

export interface LabScene {
  dispose(): void;
}

function gaussian() {
  // Box–Muller, good enough for scattering points.
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function createScene(canvas: HTMLCanvasElement, steps: number): LabScene | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const portrait = window.innerWidth / window.innerHeight < 0.9;
  const count = window.innerWidth < 768 ? 1400 : 3400;

  // Workflow nodes: a gentle wave, horizontal on landscape, vertical on portrait.
  const nodes: Vector3[] = [];
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0.5 : i / (steps - 1);
    nodes.push(
      portrait
        ? new Vector3(Math.sin(t * Math.PI * 1.4) * 0.9, MathUtils.lerp(3.9, 1.6, t), 0)
        : new Vector3(MathUtils.lerp(-3.8, 3.8, t), Math.sin(t * Math.PI * 1.25) * 0.45 + 1.75, 0),
    );
  }

  // ---- Nebula background (low-res render target, upscaled) ----
  const triangle = fullscreenTriangle();
  const nebulaTarget = new WebGLRenderTarget(1, 1, {
    type: HalfFloatType,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  });
  const nebulaUniforms = {
    uAspect: { value: new Vector2(1, 1) },
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uVelocity: { value: 0 },
    uGather: { value: 0 },
    uRelease: { value: 0 },
    uPointer: { value: new Vector2() },
    uBase: { value: BASE },
    uCool: { value: NEBULA_COOL },
    uAccent: { value: ACCENT },
  };
  const nebulaMaterial = new ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: nebulaFragment,
    uniforms: nebulaUniforms,
    depthTest: false,
    depthWrite: false,
  });
  const nebulaScene = new Scene();
  const nebulaMesh = new Mesh(triangle, nebulaMaterial);
  nebulaMesh.frustumCulled = false;
  nebulaScene.add(nebulaMesh);

  const composeMaterial = new ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: composeFragment,
    uniforms: { uTex: { value: nebulaTarget.texture } },
    depthTest: false,
    depthWrite: false,
  });
  const backdrop = new Mesh(triangle, composeMaterial);
  backdrop.frustumCulled = false;
  backdrop.renderOrder = -1;
  scene.add(backdrop);

  // ---- Particles ----
  const positions = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const nodeIndex = new Float32Array(count);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * 7 * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * 4.2 * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * 3 * Math.cos(phi);

    const seed = Math.random();
    seeds[i] = seed;
    if (seed < 0.82) {
      const n = Math.floor(Math.random() * steps);
      nodeIndex[i] = n;
      const spread = 0.28;
      targets[i * 3] = nodes[n].x + gaussian() * spread;
      targets[i * 3 + 1] = nodes[n].y + gaussian() * spread;
      targets[i * 3 + 2] = gaussian() * spread;
    } else {
      // Wanderers stay loose around the graph.
      nodeIndex[i] = -10;
      targets[i * 3] = positions[i * 3] * 0.75;
      targets[i * 3 + 1] = positions[i * 3 + 1] * 0.6;
      targets[i * 3 + 2] = positions[i * 3 + 2] * 0.5;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aTarget', new BufferAttribute(targets, 3));
  geometry.setAttribute('aNode', new BufferAttribute(nodeIndex, 1));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));

  const uniforms = {
    uTime: { value: 0 },
    uGather: { value: 0 },
    uActive: { value: -1 },
    uSize: { value: 75 },
    uPixelRatio: { value: pixelRatio },
    uVelocity: { value: 0 },
    uPointer: { value: new Vector2() },
    uDim: { value: DIM },
    uCool: { value: COOL },
    uAccent: { value: ACCENT },
    uFade: { value: 1 },
  };
  const material = new ShaderMaterial({
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  scene.add(new Points(geometry, material));

  // ---- Pipeline line + packets ----
  const curve = new CatmullRomCurve3(nodes);
  const lineMaterial = new LineBasicMaterial({
    color: ACCENT_MANAGED,
    transparent: true,
    opacity: 0,
  });
  scene.add(new Line(new BufferGeometry().setFromPoints(curve.getPoints(160)), lineMaterial));

  const packetCount = 7;
  const packetPositions = new Float32Array(packetCount * 3);
  const packetGeometry = new BufferGeometry();
  packetGeometry.setAttribute('position', new BufferAttribute(packetPositions, 3));
  const packetMaterial = new PointsMaterial({
    color: ACCENT_MANAGED,
    size: 0.11,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  scene.add(new Points(packetGeometry, packetMaterial));

  // ---- Sizing ----
  let halfW = 1;
  let halfH = 1;
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    nebulaTarget.setSize(Math.ceil(w * NEBULA_SCALE), Math.ceil(h * NEBULA_SCALE));
    const aspect = w / h;
    nebulaUniforms.uAspect.value.set(Math.max(aspect, 1), Math.max(1 / aspect, 1));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfW = halfH * camera.aspect;
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- Loop (eases toward sceneState) ----
  const eased = { gather: 0, release: 0, px: 0, py: 0, velocity: 0, scroll: 0 };
  const tmp = new Vector3();
  let frame = 0;
  let last = performance.now();
  let running = true;

  function tick(now: number) {
    if (!running) return;
    // rAF timestamps can precede performance.now(): clamp to avoid negative steps.
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
    last = now;
    const k = 1 - Math.pow(0.002, dt); // frame-rate independent easing

    eased.gather += (sceneState.gather - eased.gather) * k;
    eased.release += (sceneState.release - eased.release) * k;
    eased.px += (sceneState.pointer.x - eased.px) * k * 1.5;
    eased.py += (sceneState.pointer.y - eased.py) * k * 1.5;
    // Scroll speed (px/frame from Lenis) normalised to roughly -1.5..1.5, eased softly.
    const v = MathUtils.clamp(sceneState.velocity / 40, -1.5, 1.5);
    eased.velocity += (v - eased.velocity) * k * 0.6;
    sceneState.velocity *= 1 - k; // Lenis may stop emitting before velocity reaches 0
    eased.scroll += (sceneState.progress - eased.scroll) * k;

    const gather = eased.gather * (1 - eased.release * 0.75);
    uniforms.uTime.value += dt;
    uniforms.uGather.value = gather;
    uniforms.uActive.value = eased.release > 0.5 ? -1 : sceneState.active;
    uniforms.uFade.value = 1 - eased.release * 0.55;
    uniforms.uPointer.value.set(eased.px * halfW, eased.py * halfH);
    uniforms.uVelocity.value = eased.velocity;

    nebulaUniforms.uTime.value = uniforms.uTime.value;
    nebulaUniforms.uScroll.value = eased.scroll;
    nebulaUniforms.uVelocity.value = eased.velocity;
    nebulaUniforms.uGather.value = gather;
    nebulaUniforms.uRelease.value = eased.release;
    nebulaUniforms.uPointer.value.set(eased.px, eased.py);

    lineMaterial.opacity = gather * 0.35;
    packetMaterial.opacity = gather;
    const t = uniforms.uTime.value * 0.08;
    for (let i = 0; i < packetCount; i++) {
      curve.getPointAt((((t + i / packetCount) % 1) + 1) % 1, tmp);
      packetPositions[i * 3] = tmp.x;
      packetPositions[i * 3 + 1] = tmp.y;
      packetPositions[i * 3 + 2] = tmp.z;
    }
    packetGeometry.attributes.position.needsUpdate = true;

    camera.position.x += (eased.px * 0.5 - camera.position.x) * k;
    camera.position.y += (eased.py * 0.3 - camera.position.y) * k;
    camera.lookAt(0, 0, 0);

    renderer.setRenderTarget(nebulaTarget);
    renderer.render(nebulaScene, camera);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  }

  function onVisibility() {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(frame);
    } else if (!running) {
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  frame = requestAnimationFrame(tick);
  canvas.classList.add('is-ready');

  return {
    dispose() {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      geometry.dispose();
      material.dispose();
      triangle.dispose();
      nebulaMaterial.dispose();
      composeMaterial.dispose();
      nebulaTarget.dispose();
      renderer.dispose();
    },
  };
}
