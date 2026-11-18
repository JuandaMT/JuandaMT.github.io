/**
 * Hero WebGL scene: a particle cloud that gathers into a graph of the workflow
 * steps as you scroll, with packets travelling along the pipeline.
 * Loaded lazily (dynamic import) after the page content is interactive.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Line,
  LineBasicMaterial,
  MathUtils,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';
import { sceneState } from './state';

const ACCENT = new Color('#f0895b');
const DIM = new Color('#b3ab9c');

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uGather;
  uniform float uActive;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  attribute vec3 aTarget;
  attribute float aNode;
  attribute float aSeed;
  varying float vGlow;
  varying float vSeed;

  void main() {
    vec3 cloud = position;
    cloud.x += sin(uTime * 0.18 + aSeed * 6.2831) * 0.25;
    cloud.y += cos(uTime * 0.22 + aSeed * 12.566) * 0.25;
    cloud.z += sin(uTime * 0.15 + aSeed * 3.14) * 0.2;

    vec3 target = aTarget;
    target.x += sin(uTime * 0.9 + aSeed * 40.0) * 0.04;
    target.y += cos(uTime * 0.8 + aSeed * 30.0) * 0.04;

    float g = smoothstep(0.0, 1.0, clamp(uGather * (0.7 + aSeed * 0.6), 0.0, 1.0));
    vec3 p = mix(cloud, target, g);

    // Push particles away from the pointer.
    vec2 d = p.xy - uPointer;
    float dist = length(d);
    p.xy += normalize(d + 1e-4) * smoothstep(1.4, 0.0, dist) * 0.45;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float isActive = 1.0 - step(0.5, abs(aNode - uActive));
    vGlow = isActive * g;
    vSeed = aSeed;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9) * (1.0 + vGlow * 0.7) / -mv.z;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uDim;
  uniform vec3 uAccent;
  uniform float uFade;
  uniform float uGather;
  varying float vGlow;
  varying float vSeed;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    float warm = max(vGlow, step(0.93, vSeed) * 0.6);
    vec3 color = mix(uDim, uAccent, warm);
    float alpha = a * (0.4 + vSeed * 0.6 + vGlow * 0.3) * uFade;
    gl_FragColor = vec4(color, alpha);
  }
`;

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
    uPointer: { value: { x: 0, y: 0 } },
    uDim: { value: DIM },
    uAccent: { value: ACCENT },
    uFade: { value: 1 },
  };
  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  scene.add(new Points(geometry, material));

  // ---- Pipeline line + packets ----
  const curve = new CatmullRomCurve3(nodes);
  const lineMaterial = new LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0 });
  scene.add(new Line(new BufferGeometry().setFromPoints(curve.getPoints(160)), lineMaterial));

  const packetCount = 7;
  const packetPositions = new Float32Array(packetCount * 3);
  const packetGeometry = new BufferGeometry();
  packetGeometry.setAttribute('position', new BufferAttribute(packetPositions, 3));
  const packetMaterial = new PointsMaterial({
    color: ACCENT,
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
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfW = halfH * camera.aspect;
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- Loop (eases toward sceneState) ----
  const eased = { gather: 0, release: 0, px: 0, py: 0 };
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

    const gather = eased.gather * (1 - eased.release * 0.75);
    uniforms.uTime.value += dt;
    uniforms.uGather.value = gather;
    uniforms.uActive.value = eased.release > 0.5 ? -1 : sceneState.active;
    uniforms.uFade.value = 1 - eased.release * 0.55;
    uniforms.uPointer.value = { x: eased.px * halfW, y: eased.py * halfH };

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
      renderer.dispose();
    },
  };
}
