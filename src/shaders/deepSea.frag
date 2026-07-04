uniform float uTime;
uniform float uNeon;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float caustic(vec2 uv, float speed, float scale) {
  vec2 p = uv * scale;
  float a = sin(p.x + sin(p.y + uTime * speed));
  float b = sin(p.y * 1.35 + sin(p.x * 0.75 - uTime * speed * 0.8));
  float c = sin((p.x + p.y) * 0.72 + uTime * speed * 0.55);
  return pow(max(0.0, (a + b + c) / 3.0), 4.0);
}

void main() {
  vec2 uv = vUv;
  vec2 centered = uv - 0.5;
  float depth = smoothstep(0.0, 1.0, uv.y);
  float radius = length(centered);

  vec3 trench = vec3(0.005, 0.018, 0.042);
  vec3 midWater = vec3(0.015, 0.12, 0.20);
  vec3 surface = vec3(0.08, 0.36, 0.48);

  vec3 color = mix(trench, midWater, smoothstep(0.05, 0.72, depth));
  color = mix(color, surface, smoothstep(0.78, 1.0, depth) * 0.55);

  float n = noise(uv * 5.0 + vec2(uTime * 0.018, -uTime * 0.027));
  float c1 = caustic(uv + vec2(uTime * 0.01, 0.0), 0.75, 18.0);
  float c2 = caustic(uv.yx + vec2(0.0, -uTime * 0.008), 0.42, 27.0);
  float vignette = smoothstep(0.82, 0.28, radius);

  color += vec3(0.08, 0.48, 0.62) * (c1 * 0.018 + c2 * 0.012) * smoothstep(0.12, 0.82, uv.y);
  color += (n - 0.5) * 0.028;
  color *= vignette;
  color += vec3(0.0, 0.035, 0.055) * smoothstep(0.55, 0.0, uv.y);

  gl_FragColor = vec4(color, 1.0);
}
