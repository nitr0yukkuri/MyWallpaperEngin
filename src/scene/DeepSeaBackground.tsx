import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "../shaders/deepSea.vert?raw";
import fragmentShader from "../shaders/deepSea.frag?raw";
import { useWallpaperStore } from "../store/wallpaperStore";

export function DeepSeaBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const neonIntensity = useWallpaperStore((state) => state.neonIntensity);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNeon: { value: neonIntensity / 100 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) {
      return;
    }

    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uNeon.value = neonIntensity / 100;
  });

  return (
    <mesh position={[0, 0, -5.2]}>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
}
