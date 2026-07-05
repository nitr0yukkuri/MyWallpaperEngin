uniform float uTime;
uniform vec2 uMouse;       // ワールド座標でのマウス位置 (x, z)
uniform float uMouseTime;  // マウスが動いてからの経過時間
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vec2 uv = vUv;

  // === 常時アンビエント波紋（水面の自然な揺れ） ===
  float wave1 = sin(uv.x * 18.0 + uTime * 1.2) * sin(uv.y * 14.0 - uTime * 0.9) * 0.022;
  float wave2 = sin((uv.x + uv.y) * 12.0 + uTime * 0.8) * 0.015;
  float wave3 = cos(uv.x * 24.0 - uv.y * 10.0 + uTime * 1.5) * 0.010;
  float ambient = wave1 + wave2 + wave3;

  // === マウスインタラクション波紋 ===
  // マウス位置からの距離（UV空間）
  vec2 mouseUV = uMouse * 0.5 + 0.5; // -1~1 → 0~1
  float mouseDist = length(uv - mouseUV);
  // 外側に広がる波紋リング
  float rippleAge = uMouseTime;
  float rippleRadius = rippleAge * 0.35;
  float rippleWidth = 0.04;
  float rippleAmp = max(0.0, 1.0 - rippleAge * 0.8) * 0.06;
  float mouseRipple = rippleAmp * smoothstep(rippleWidth, 0.0, abs(mouseDist - rippleRadius))
                    * sin((mouseDist - rippleRadius) / rippleWidth * 3.14159);

  float totalAlpha = (0.10 + abs(ambient) * 1.5 + abs(mouseRipple) * 2.0);
  totalAlpha = clamp(totalAlpha, 0.0, 0.35);

  // 波紋の強い部分を白く光らせ、平静部分は透明に
  vec3 surfaceColor = mix(
    vec3(0.3, 0.7, 0.9),
    vec3(1.0, 1.0, 1.0),
    clamp(abs(mouseRipple) * 12.0 + abs(ambient) * 3.0, 0.0, 1.0)
  );

  gl_FragColor = vec4(surfaceColor, totalAlpha);
}
