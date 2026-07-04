import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useWallpaperStore } from "../store/wallpaperStore";

function Ring({ radius, z, speed, opacity }: { radius: number; z: number; speed: number; opacity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const neonIntensity = useWallpaperStore((state) => state.neonIntensity);
  const geometry = useMemo(() => new THREE.RingGeometry(radius, radius + 0.018, 160), [radius]);

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    ref.current.rotation.z = clock.elapsedTime * speed;
    ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.7 + radius) * 0.018);
  });

  return (
    <mesh ref={ref} geometry={geometry} position={[0, 0.1, z]}>
      <meshBasicMaterial color="#ff66ad" transparent opacity={opacity + neonIntensity / 300} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

export function NeonRings() {
  return (
    <group position={[0, 0, -1.6]}>
      <Ring radius={1.55} z={-0.2} speed={0.06} opacity={0.32} />
      <Ring radius={2.25} z={-0.45} speed={-0.035} opacity={0.18} />
      <Ring radius={3.15} z={-0.7} speed={0.02} opacity={0.1} />
      <mesh position={[0, -1.15, -0.5]} rotation={[0, 0, 0]}>
        <planeGeometry args={[7.6, 0.018]} />
        <meshBasicMaterial color="#ff7ebb" transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.15, -0.5]} rotation={[0, 0, 0]}>
        <planeGeometry args={[7.6, 0.014]} />
        <meshBasicMaterial color="#ffc6df" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
