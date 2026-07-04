uniform sampler2D uTexture;
uniform float uTime;
uniform float uGlow;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float wave = sin((uv.y + uTime * 0.08) * 16.0) * 0.0018;
  uv.x += wave;

  vec4 tex = texture2D(uTexture, uv);
  float edge = smoothstep(0.12, 0.0, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
  vec3 glow = vec3(1.0, 0.36, 0.68) * edge * uGlow * 0.18;

  gl_FragColor = vec4(tex.rgb + glow, tex.a);
}
