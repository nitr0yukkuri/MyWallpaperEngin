uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec4 tex = texture2D(uTexture, vUv);

  float maxChannel = max(max(tex.r, tex.g), tex.b);
  float minChannel = min(min(tex.r, tex.g), tex.b);
  float saturation = maxChannel - minChannel;
  float distanceFromWhite = distance(tex.rgb, vec3(1.0));

  float alpha = smoothstep(0.08, 0.24, distanceFromWhite);
  float brightPaper = smoothstep(0.82, 0.98, maxChannel);
  float lowSaturation = 1.0 - smoothstep(0.06, 0.18, saturation);
  alpha *= 1.0 - brightPaper * lowSaturation;

  float glint = smoothstep(0.025, 0.0, abs(vUv.y - (0.62 + sin(uTime * 0.8) * 0.025)));
  glint *= smoothstep(0.2, 0.72, vUv.x) * smoothstep(0.86, 0.42, vUv.x);

  vec3 color = tex.rgb + vec3(1.0, 0.55, 0.78) * glint * 0.08;

  if (alpha < 0.02) {
    discard;
  }

  gl_FragColor = vec4(color, alpha * tex.a);
}
