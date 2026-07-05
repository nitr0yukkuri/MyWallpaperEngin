import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "../shaders/waterSurface.vert?raw";
import fragmentShader from "../shaders/waterSurface.frag?raw";

export function WaterSurface() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();
  const mouseTimeRef = useRef(0);
  const lastMouseRef = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseTime: { value: 0 },
    }),
    [],
  );

  useFrame(({ clock }, delta) => {
    if (!materialRef.current) return;
    const time = clock.elapsedTime;
    materialRef.current.uniforms.uTime.value = time;

    // マウスが動いたか検出
    const moved =
      Math.abs(pointer.x - lastMouseRef.current.x) > 0.005 ||
      Math.abs(pointer.y - lastMouseRef.current.y) > 0.005;

    if (moved) {
      mouseTimeRef.current = 0;
      lastMouseRef.current.set(pointer.x, pointer.y);
    } else {
      mouseTimeRef.current += delta;
    }

    materialRef.current.uniforms.uMouse.value.set(pointer.x, pointer.y);
    materialRef.current.uniforms.uMouseTime.value = mouseTimeRef.current;
  });

  return (
    // 水面: カメラより少し上（y=2.4）に広い透明プレーン
    <mesh position={[0, 2.4, -5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 30, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
