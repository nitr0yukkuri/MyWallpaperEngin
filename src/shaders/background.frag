uniform float uTime;
uniform float uNeon;
uniform float uTheme;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float grid(vec2 uv, float scale) {
  vec2 line = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
  float cell = min(line.x, line.y);
  return 1.0 - min(cell, 1.0);
}

void main() {
  vec2 uv = vUv;
  vec2 centered = uv - 0.5;
  float radius = length(centered);
  float n = noise(uv * 5.0 + vec2(uTime * 0.025, -uTime * 0.018));
  float breathe = 0.5 + 0.5 * sin(uTime * 0.7);

  vec3 pink = mix(vec3(1.0, 0.76, 0.88), vec3(1.0, 0.36, 0.68), uTheme * 0.28);
  vec3 ink = mix(vec3(0.11, 0.06, 0.10), vec3(0.02, 0.015, 0.035), step(1.5, uTheme));
  vec3 base = mix(pink, ink, smoothstep(0.18, 0.9, radius + uv.y * 0.22));

  float gridMask = grid(uv + vec2(sin(uTime * 0.05) * 0.01, uTime * 0.01), 18.0);
  float farGrid = grid(uv + vec2(0.0, uTime * 0.004), 44.0);
  float ring = smoothstep(0.016, 0.0, abs(radius - (0.26 + breathe * 0.015)));
  float ringTwo = smoothstep(0.012, 0.0, abs(radius - (0.38 + sin(uTime * 0.31) * 0.01)));
  float centerGlow = smoothstep(0.72, 0.0, radius);
  float sideLeak = smoothstep(0.38, 0.0, abs(uv.x - 0.03)) + smoothstep(0.38, 0.0, abs(uv.x - 0.97));

  vec3 color = base;
  color += vec3(1.0, 0.32, 0.68) * (gridMask * 0.035 + farGrid * 0.018);
  color += vec3(1.0, 0.22, 0.64) * (ring + ringTwo * 0.7) * (0.35 + uNeon * 0.45);
  color += vec3(1.0, 0.58, 0.82) * centerGlow * (0.2 + uNeon * 0.18);
  color += vec3(1.0, 0.22, 0.62) * sideLeak * 0.08;
  color += (n - 0.5) * 0.035;

  gl_FragColor = vec4(color, 1.0);
}
