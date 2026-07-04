import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "../shaders/background.vert?raw";
import fragmentShader from "../shaders/background.frag?raw";
import { useWallpaperStore } from "../store/wallpaperStore";

const themeValue = {
  sakura: 0,
  living: 1,
  night: 2,
  cyber: 3,
};

export function BackgroundShaderPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const themeMode = useWallpaperStore((state) => state.themeMode);
  const neonIntensity = useWallpaperStore((state) => state.neonIntensity);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNeon: { value: neonIntensity / 100 },
      uTheme: { value: themeValue[themeMode] },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) {
      return;
    }

    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uNeon.value = neonIntensity / 100;
    materialRef.current.uniforms.uTheme.value = themeValue[themeMode];
  });

  return (
    <mesh position={[0, 0, -4.2]}>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
}
