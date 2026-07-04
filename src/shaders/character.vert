uniform float uTime;
uniform vec2 uPointer;
varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 p = position;
  float upperWeight = smoothstep(0.18, 1.0, uv.y);
  float sideWeight = smoothstep(0.0, 0.5, abs(uv.x - 0.5));

  p.x += sin(uv.y * 8.0 + uTime * 1.15) * 0.016 * upperWeight;
  p.x += uPointer.x * 0.024 * upperWeight;
  p.y += sin(uv.x * 6.0 + uTime * 0.75) * 0.006 * sideWeight;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
