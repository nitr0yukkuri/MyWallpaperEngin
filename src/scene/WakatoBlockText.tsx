import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { motionScaleFor, useWallpaperStore } from "../store/wallpaperStore";
import { getTerrainHeight } from "./SeaFloor";

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
      <boxGeometry args={[spec.w, spec.h, 0.8, 3, 3, 3]} />
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
        color: new THREE.Color("#ffffff"),
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: 0.8,
        metalness: 0.1,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    material.emissiveIntensity = 0.8 + neonIntensity / 300 + Math.sin(time * 0.75) * 0.05;

    if (!groupRef.current) {
      return;
    }

    // 砂浜の正確な高さを取得して、テキストの底面をぴったり合わせる
    const groundY = getTerrainHeight(0, 0.55);
    // Y軸で斜めに向かせているため、底面の計算値(0.53)はほぼそのまま適用可能
    groupRef.current.position.y = groundY + 0.53 + Math.sin(time * 0.32 * motionScale) * 0.025;
    
    // 後ろへの倒れ込みを緩やかにし、Y軸で斜め右(0.35)を向かせて3D感を強調
    groupRef.current.rotation.x = -0.15 + Math.sin(time * 0.24) * 0.012;
    groupRef.current.rotation.y = 0.35 + Math.sin(time * 0.18) * 0.025;
    groupRef.current.rotation.z = 0.02 + Math.sin(time * 0.16) * 0.006;
  });

  return (
    <group ref={groupRef} position={[0, 0.2, 0.55]} scale={[1.02, 1.02, 1.02]}>
      <Letter char="W" x={-2.25} material={material} />
      <Letter char="A" x={-1.35} material={material} />
      <Letter char="K" x={-0.48} material={material} />
      <Letter char="A" x={0.42} material={material} />
      <Letter char="T" x={1.28} material={material} />
      <Letter char="O" x={2.12} material={material} />
    </group>
  );
}
