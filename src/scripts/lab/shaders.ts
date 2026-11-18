/** GLSL for the /lab/ scene. Kept apart from the Three.js wiring in scene.ts. */

/*
 * 3D simplex noise by Ian McEwan & Stefan Gustavson (Ashima Arts), MIT licence.
 * https://github.com/ashima/webgl-noise
 */
const simplex3 = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // Divergence-free flow: curl of a noise vector potential (finite differences).
  vec3 potential(vec3 p) {
    return vec3(snoise(p), snoise(p + vec3(31.4, 12.7, 5.1)), snoise(p + vec3(-8.3, 47.2, 19.9)));
  }
  vec3 curlNoise(vec3 p) {
    const float e = 0.12;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    vec3 px0 = potential(p - dx), px1 = potential(p + dx);
    vec3 py0 = potential(p - dy), py1 = potential(p + dy);
    vec3 pz0 = potential(p - dz), pz1 = potential(p + dz);
    return vec3(
      (py1.z - py0.z) - (pz1.y - pz0.y),
      (pz1.x - pz0.x) - (px1.z - px0.z),
      (px1.y - px0.y) - (py1.x - py0.x)
    ) / (2.0 * e);
  }
`;

export const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uGather;
  uniform float uActive;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uVelocity;
  uniform vec2 uPointer;
  attribute vec3 aTarget;
  attribute float aNode;
  attribute float aSeed;
  varying float vGlow;
  varying float vSeed;
  varying float vHue;
  varying float vSpeed;

  ${simplex3}

  void main() {
    float speed = abs(uVelocity);

    // Loose cloud: slowly turning and carried by a curl-noise current.
    float ang = uTime * 0.025;
    mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    vec3 base = position;
    base.xz = rot * base.xz;
    vec3 flow = curlNoise(base * 0.22 + vec3(0.0, 0.0, uTime * 0.045));
    vec3 cloud = base + flow * (0.55 + speed * 0.5);

    // Gathered: small orbit around the node it belongs to.
    vec3 target = aTarget;
    float orbit = uTime * (0.35 + aSeed * 0.5) + aSeed * 40.0;
    target += vec3(cos(orbit), sin(orbit * 1.3), sin(orbit)) * 0.05;

    float g = smoothstep(0.0, 1.0, clamp(uGather * (0.7 + aSeed * 0.6), 0.0, 1.0));
    vec3 p = mix(cloud, target, g);

    // Scroll inertia: particles trail behind fast scrolling, nearer ones more.
    p.y += uVelocity * (0.15 + aSeed * 0.35) * (1.0 - g * 0.6);

    // Pointer: a soft swirl rather than a plain push.
    vec2 d = p.xy - uPointer;
    float falloff = smoothstep(1.6, 0.0, length(d));
    vec2 dir = normalize(d + 1e-4);
    p.xy += (dir * 0.35 + vec2(-dir.y, dir.x) * 0.25) * falloff;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float isActive = 1.0 - step(0.5, abs(aNode - uActive));
    vGlow = isActive * g;
    vSeed = aSeed;
    // Colour follows the current, so neighbouring particles share a tint.
    vHue = clamp(snoise(base * 0.18 + uTime * 0.03) * 0.5 + 0.5, 0.0, 1.0);
    vSpeed = clamp(length(flow) * 0.35 + speed * 0.4, 0.0, 1.0);
    float twinkle = 0.85 + 0.15 * sin(uTime * (1.5 + aSeed * 3.0) + aSeed * 60.0);
    gl_PointSize = uSize * uPixelRatio * (0.5 + aSeed * 0.9) * (1.0 + vGlow * 0.8) * twinkle / -mv.z;
  }
`;

export const particleFragment = /* glsl */ `
  uniform vec3 uDim;
  uniform vec3 uCool;
  uniform vec3 uAccent;
  uniform float uFade;
  varying float vGlow;
  varying float vSeed;
  varying float vHue;
  varying float vSpeed;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    // Bright core with a soft halo.
    float a = smoothstep(0.5, 0.0, d);
    a = a * a * 0.7 + smoothstep(0.18, 0.0, d) * 0.6;

    vec3 color = mix(uCool, uDim, smoothstep(0.25, 0.75, vHue));
    float warm = max(vGlow, smoothstep(0.78, 1.0, vHue) * step(0.6, vSeed) * 0.75);
    color = mix(color, uAccent, warm);
    color += uAccent * vSpeed * 0.18;

    float alpha = a * (0.35 + vSeed * 0.55 - vGlow * 0.15) * uFade;
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Full-screen triangle helpers: position is already in clip space. */
export const fullscreenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/** Domain-warped fbm nebula, rendered at low resolution into a render target. */
export const nebulaFragment = /* glsl */ `
  precision highp float;
  uniform vec2 uAspect;
  uniform float uTime;
  uniform float uScroll;
  uniform float uVelocity;
  uniform float uGather;
  uniform float uRelease;
  uniform vec2 uPointer;
  uniform vec3 uBase;
  uniform vec3 uCool;
  uniform vec3 uAccent;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uAspect * 2.2;
    // Scrolling moves the camera through the field; fast scrolls stretch it.
    p.y -= uScroll * 2.4;
    p.y *= 1.0 / (1.0 + abs(uVelocity) * 0.25);
    float t = uTime * 0.035;

    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 1.4),
      fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 1.1)
    );
    // The pointer bends the field locally.
    vec2 pp = uPointer * uAspect * 1.1;
    vec2 toP = p + vec2(0.0, uScroll * 2.4) - pp;
    float near = exp(-dot(toP, toP) * 1.4);
    float f = fbm(p + 3.5 * r + near * 0.6);

    float cloud = smoothstep(0.35, 0.95, f);
    float filaments = pow(clamp(r.x * r.y * 2.2, 0.0, 1.0), 3.0);

    vec3 col = uBase;
    col += uCool * cloud * (0.75 - uRelease * 0.25);
    col += uAccent * filaments * (0.16 + uGather * 0.1);
    col += uAccent * near * 0.035;

    // Keep the reading area calm: darken towards the edges and the bottom-left text column.
    float vig = smoothstep(1.35, 0.25, length((vUv - vec2(0.6, 0.6)) * vec2(1.0, 1.3)));
    col = mix(uBase, col, 0.35 + 0.65 * vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Upscales the nebula to the canvas with a little dithering against banding. */
export const composeFragment = /* glsl */ `
  uniform sampler2D uTex;
  varying vec2 vUv;
  float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec3 col = texture2D(uTex, vUv).rgb;
    col += (rand(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;
