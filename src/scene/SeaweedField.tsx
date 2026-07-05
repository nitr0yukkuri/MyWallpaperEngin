import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motionScaleFor, useWallpaperStore } from "../store/wallpaperStore";
import { getTerrainHeight } from "./SeaFloor";

type Blade = {
  x: number;
  z: number;
  height: number;
  phase: number;
  lean: number;
  color: string;
};

const blades: Blade[] = [
  { x: -5.8, z: -2.4, height: 0.9, phase: 0.2, lean: -0.18, color: "#1f6f6a" },
  { x: -5.4, z: -2.8, height: 0.7, phase: 1.2, lean: 0.12, color: "#2c8a75" },
  { x: -4.9, z: -3.3, height: 1.05, phase: 2.2, lean: -0.08, color: "#1b5c66" },
  { x: 5.4, z: -2.5, height: 0.86, phase: 0.7, lean: 0.2, color: "#256f6d" },
  { x: 5.9, z: -3.0, height: 1.12, phase: 1.6, lean: -0.14, color: "#2d8a72" },
  { x: 4.9, z: -3.5, height: 0.74, phase: 2.8, lean: 0.1, color: "#1f6862" },
  { x: -2.4, z: -6.8, height: 0.62, phase: 3.1, lean: -0.12, color: "#2d8270" },
  { x: 2.7, z: -7.0, height: 0.66, phase: 2.4, lean: 0.16, color: "#226b65" },
];

function SeaweedBlade({ blade }: { blade: Blade }) {
  const ref = useRef<THREE.Mesh>(null);
  const motion = useWallpaperStore((state) => state.motion);
  const motionScale = motionScaleFor(motion);
  const baseY = getTerrainHeight(blade.x, blade.z) + blade.height / 2;
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(blade.color),
        roughness: 0.9,
        metalness: 0,
        emissive: new THREE.Color(blade.color),
        emissiveIntensity: 0.04,
        side: THREE.DoubleSide,
      }),
    [blade.color],
  );

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    const sway = Math.sin(clock.elapsedTime * 0.9 * motionScale + blade.phase) * 0.16;
    ref.current.rotation.z = blade.lean + sway;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.42 * motionScale + blade.phase) * 0.08;
  });

  return (
    <mesh ref={ref} position={[blade.x, baseY, blade.z]} material={material}>
      <planeGeometry args={[0.12, blade.height, 1, 5]} />
    </mesh>
  );
}

export function SeaweedField() {
  return (
    <>
      {blades.map((blade) => (
        <SeaweedBlade key={`${blade.x}-${blade.z}`} blade={blade} />
      ))}
    </>
  );
}
