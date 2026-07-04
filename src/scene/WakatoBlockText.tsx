import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { motionScaleFor, useWallpaperStore } from "../store/wallpaperStore";

type BarSpec = {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
};

const LETTERS: Record<string, BarSpec[]> = {
  W: [
    { x: -0.42, y: 0, w: 0.16, h: 1.1, r: -0.13 },
    { x: 0.42, y: 0, w: 0.16, h: 1.1, r: 0.13 },
    { x: -0.12, y: -0.16, w: 0.14, h: 0.72, r: -0.24 },
    { x: 0.12, y: -0.16, w: 0.14, h: 0.72, r: 0.24 },
  ],
  A: [
    { x: -0.28, y: 0, w: 0.16, h: 1.12, r: -0.18 },
    { x: 0.28, y: 0, w: 0.16, h: 1.12, r: 0.18 },
    { x: 0, y: 0.12, w: 0.58, h: 0.14 },
    { x: 0, y: 0.52, w: 0.36, h: 0.14 },
  ],
  K: [
    { x: -0.32, y: 0, w: 0.16, h: 1.12 },
    { x: 0.12, y: 0.2, w: 0.16, h: 0.72, r: -0.72 },
    { x: 0.16, y: -0.22, w: 0.16, h: 0.82, r: 0.68 },
  ],
  T: [
    { x: 0, y: 0.48, w: 0.75, h: 0.16 },
    { x: 0, y: -0.05, w: 0.17, h: 1.04 },
  ],
  O: [
    { x: -0.32, y: 0, w: 0.16, h: 0.95 },
    { x: 0.32, y: 0, w: 0.16, h: 0.95 },
    { x: 0, y: 0.46, w: 0.55, h: 0.16 },
    { x: 0, y: -0.46, w: 0.55, h: 0.16 },
  ],
};

function Bar({ spec, material }: { spec: BarSpec; material: THREE.Material }) {
  return (
    <mesh position={[spec.x, spec.y, 0]} rotation={[0, 0, spec.r ?? 0]} material={material}>
      <boxGeometry args={[spec.w, spec.h, 0.22, 3, 3, 2]} />
    </mesh>
  );
}

function Letter({ char, x, material }: { char: string; x: number; material: THREE.Material }) {
  return (
    <group position={[x, 0, 0]}>
      {LETTERS[char].map((spec, index) => (
        <Bar key={`${char}-${index}`} spec={spec} material={material} />
      ))}
    </group>
  );
}

export function WakatoBlockText() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const motion = useWallpaperStore((state) => state.motion);
  const neonIntensity = useWallpaperStore((state) => state.neonIntensity);
  const motionScale = motionScaleFor(motion);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#7eeeff"),
        emissive: new THREE.Color("#073b55"),
        emissiveIntensity: 0.4,
        metalness: 0.05,
        roughness: 0.12,
        transmission: 0.62,
        thickness: 1.8,
        ior: 1.33,
        transparent: true,
        opacity: 0.82,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    material.emissiveIntensity = 0.35 + neonIntensity / 180 + Math.sin(time * 1.1) * 0.04;

    if (!groupRef.current) {
      return;
    }

    groupRef.current.position.y = Math.sin(time * 0.46 * motionScale) * 0.075;
    groupRef.current.rotation.x = -0.08 + pointer.y * 0.08 + Math.sin(time * 0.32) * 0.018;
    groupRef.current.rotation.y = pointer.x * 0.16 + Math.sin(time * 0.24) * 0.045;
    groupRef.current.rotation.z = Math.sin(time * 0.2) * 0.01;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0.25]} scale={[0.98, 0.98, 0.98]}>
      <Letter char="W" x={-2.25} material={material} />
      <Letter char="A" x={-1.35} material={material} />
      <Letter char="K" x={-0.48} material={material} />
      <Letter char="A" x={0.42} material={material} />
      <Letter char="T" x={1.28} material={material} />
      <Letter char="O" x={2.12} material={material} />
    </group>
  );
}
