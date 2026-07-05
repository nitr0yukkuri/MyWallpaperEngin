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

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;

  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(1.3, 0.7);
    a *= 0.5;
  }

  return v;
}

float caustic(vec2 uv, float speed, float scale) {
  vec2 p = uv * scale;
  float a = sin(p.x + sin(p.y + uTime * speed));
  float b = sin(p.y * 1.35 + sin(p.x * 0.75 - uTime * speed * 0.8));
  float c = sin((p.x + p.y) * 0.72 + uTime * speed * 0.55);

  return pow(max(0.0, (a + b + c) / 3.0), 3.0);
}

void main() {
  vec2 uv = vUv;
  vec2 centered = uv - 0.5;
  float depth = uv.y;

  vec3 bottomWater = vec3(0.08, 0.24, 0.28);
  vec3 midWater = vec3(0.03, 0.28, 0.42);
  vec3 deepWater = vec3(0.015, 0.09, 0.22);
  vec3 upperWater = vec3(0.08, 0.42, 0.54);

  vec3 color = bottomWater;
  color = mix(color, midWater, smoothstep(0.0, 0.36, depth));
  color = mix(color, deepWater, smoothstep(0.24, 0.72, depth));
  color = mix(color, upperWater, smoothstep(0.68, 1.0, depth) * 0.72);

  float waterNoise = fbm(uv * 4.0 + vec2(uTime * 0.012, -uTime * 0.018));
  color += (waterNoise - 0.5) * 0.026 * vec3(0.35, 0.9, 1.05);

  float c1 = caustic(uv + vec2(uTime * 0.012, 0.0), 0.72, 20.0);
  float c2 = caustic(uv.yx + vec2(0.0, -uTime * 0.009), 0.45, 30.0);
  float causticMask = smoothstep(0.2, 0.9, depth);
  color += vec3(0.15, 0.72, 0.82) * (c1 * 0.035 + c2 * 0.022) * causticMask;

  float radius = length(centered * vec2(0.9, 0.8));
  float vignette = smoothstep(0.78, 0.18, radius);
  color *= mix(0.68, 1.0, vignette);
  color += vec3(0.0, 0.014, 0.036) * uNeon;

  gl_FragColor = vec4(color, 1.0);
}
