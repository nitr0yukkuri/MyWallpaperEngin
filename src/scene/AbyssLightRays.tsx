import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Ray({ x, width, phase }: { x: number; width: number; phase: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    ref.current.position.x = x + Math.sin(clock.elapsedTime * 0.13 + phase) * 0.16;
    ref.current.rotation.z = -0.15 + Math.sin(clock.elapsedTime * 0.18 + phase) * 0.06;
  });

  return (
    <mesh ref={ref} position={[x, 1.2, -1.8]} rotation={[0, 0, -0.15]}>
      <planeGeometry args={[width, 7.2]} />
      <meshBasicMaterial color="#6defff" transparent opacity={0.045} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function AbyssLightRays() {
  return (
    <group>
      <Ray x={-2.8} width={0.6} phase={0.2} />
      <Ray x={-1.25} width={0.42} phase={1.3} />
      <Ray x={0.1} width={0.72} phase={2.4} />
      <Ray x={1.7} width={0.48} phase={3.1} />
      <Ray x={3.0} width={0.36} phase={4.2} />
    </group>
  );
}
