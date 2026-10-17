export const LIQUID_VERT = /* glsl */ `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/*
 * Two effects share one program:
 *  - Hover: a fluid lens follows the pointer (noise flow + ripple rings),
 *    with chromatic split scaled by pointer velocity.
 *  - Transition A → B: a noisy front spreads from the origin. Ahead of the
 *    front, image A melts outward along the front's normal; behind it,
 *    image B surfaces magnified and swirled, then settles. The front itself
 *    carries a bright meniscus in the accent colour.
 * uIntensity scales every displacement (0 = plain cross-fade, used for
 * reduced motion).
 */
export const LIQUID_FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform vec2 uPlane;
uniform vec2 uSizeA;
uniform vec2 uSizeB;
uniform vec2 uMouse;
uniform float uHover;
uniform float uVelocity;
uniform float uProgress;
uniform vec2 uOrigin;
uniform float uTime;
uniform vec3 uBg;
uniform vec3 uEdge;
uniform float uIntensity;

// Simplex 3D noise — Ashima Arts / Ian McEwan (MIT)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
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
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// object-fit: cover
vec2 cover(vec2 uv, vec2 plane, vec2 img) {
  float rp = plane.x / plane.y;
  float ri = img.x / img.y;
  vec2 s = rp < ri ? vec2(rp / ri, 1.0) : vec2(1.0, ri / rp);
  return (uv - 0.5) * s + 0.5;
}

vec3 sampleImage(sampler2D tex, vec2 uv, vec2 size, vec2 shift) {
  vec2 c = cover(uv, uPlane, size);
  vec4 base = texture2D(tex, c);
  vec3 col = vec3(texture2D(tex, c + shift).r, base.g, texture2D(tex, c - shift).b);
  vec2 inside = step(vec2(0.0), c) * step(c, vec2(1.0));
  return mix(uBg, col, base.a * inside.x * inside.y);
}

void main() {
  vec2 uv = vUv;
  vec2 asp = vec2(uPlane.x / uPlane.y, 1.0);

  // Shared flow field
  vec2 flow = vec2(
    snoise(vec3(uv * asp * 2.6, uTime * 0.28)),
    snoise(vec3(uv * asp * 2.6 + 17.3, uTime * 0.28))
  );

  // ---- Hover lens
  vec2 toMouse = (uv - uMouse) * asp;
  float md = length(toMouse);
  float lens = smoothstep(0.42, 0.0, md) * uHover * uIntensity;
  float ripple = sin(md * 34.0 - uTime * 5.0) * 0.5 + 0.5;
  vec2 hoverOffset = (flow * 0.03 + normalize(toMouse + 1e-5) * ripple * 0.012) * lens * (0.7 + uVelocity * 1.8);
  vec2 duv = (uv - 0.5) * (1.0 - 0.04 * uHover * uIntensity) + 0.5 + hoverOffset / asp;

  // ---- Transition front
  vec2 toOrigin = (uv - uOrigin) * asp;
  vec2 dir = normalize(toOrigin + 1e-5);
  float od = length(toOrigin) / length(asp);
  float tn = snoise(vec3(uv * asp * 3.2, uTime * 0.15 + 4.0));
  float field = od + tn * 0.18 * uIntensity;
  float p = uProgress;
  float width = 0.16;
  float front = p * 1.65 - 0.25;
  float reveal = 1.0 - smoothstep(front - width, front, field);
  float active = step(0.0001, p) * step(p, 0.9999);
  float band = smoothstep(width, 0.0, abs(field - (front - width * 0.5))) * active;

  // A melts outward as the front approaches
  float melt = smoothstep(front + 0.4, front - width, field) * p;
  vec2 uvA = duv - (dir / asp) * melt * 0.11 * uIntensity - (flow / asp) * 0.04 * p * uIntensity;

  // B surfaces magnified and swirled, then relaxes to rest
  float settle = 1.0 - p;
  vec2 uvB = (duv - 0.5) * (1.0 - 0.18 * settle * uIntensity) + 0.5
           + (dir / asp) * band * 0.045 * uIntensity
           + (flow / asp) * 0.03 * settle * uIntensity;

  vec2 ca = (dir / asp) * (band * 0.012 + uVelocity * lens * 0.01) * uIntensity;
  vec3 a = sampleImage(uTexA, uvA, uSizeA, ca) * (1.0 - melt * 0.25 * uIntensity);
  vec3 b = sampleImage(uTexB, uvB, uSizeB, ca);

  vec3 col = mix(a, b, reveal);
  col += uEdge * band * 0.55 * uIntensity;

  gl_FragColor = vec4(col, 1.0);
}
`;
