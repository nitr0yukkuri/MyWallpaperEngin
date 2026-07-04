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
    { x: -0.44, y: 0.02, w: 0.15, h: 1.12, r: -0.14 },   // 左外脚（少し外向き）
    { x: 0.44, y: 0.02, w: 0.15, h: 1.12, r: 0.14 },    // 右外脚
    { x: -0.14, y: -0.2, w: 0.14, h: 0.72, r: -0.32 },  // 左内V（より深く）
    { x: 0.14, y: -0.2, w: 0.14, h: 0.72, r: 0.32 },    // 右内V
  ],
  A: [
    { x: -0.27, y: -0.02, w: 0.15, h: 1.12, r: -0.2 },  // 左脚
    { x: 0.27, y: -0.02, w: 0.15, h: 1.12, r: 0.2 },    // 右脚
    { x: 0, y: 0.08, w: 0.44, h: 0.14 },                 // 横棒（中間）
    // 屋根：2脚の頂点（y≈0.53）を塞ぐキャップバー
    { x: 0, y: 0.50, w: 0.28, h: 0.14 },
  ],
  K: [
    { x: -0.32, y: 0, w: 0.16, h: 1.12 },                // 縦スパイン
    // 上アーム: スパイン右端(-0.24)の中間(y=0.05)から右上(0.38, 0.53)へ
    // センター: x=(−0.24+0.38)/2=0.07, y=(0.05+0.53)/2=0.29
    // 長さ: sqrt(0.62²+0.48²)≈0.79, 角度: −atan2(0.62,0.48)≈−52°≈−0.9rad
    { x: 0.07, y: 0.27, w: 0.14, h: 0.72, r: -0.82 },
    // 下アーム: スパイン右端からy=-0.05→右下(0.38, -0.53) 対称
    { x: 0.07, y: -0.27, w: 0.14, h: 0.72, r: 0.82 },
  ],
  T: [
    { x: 0, y: 0.48, w: 0.78, h: 0.16 },                 // 上横棒（少し広く）
    { x: 0, y: -0.04, w: 0.16, h: 1.06 },                // 縦棒
  ],
  O: [
    { x: -0.33, y: 0, w: 0.16, h: 0.98 },                // 左辺
    { x: 0.33, y: 0, w: 0.16, h: 0.98 },                 // 右辺
    { x: 0, y: 0.47, w: 0.58, h: 0.16 },                 // 上辺
    { x: 0, y: -0.47, w: 0.58, h: 0.16 },                // 下辺
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

    // 砂浜の起伏によって端の文字（Wなど）が埋まるのを防ぐため、
    // ロゴが配置されている幅全体（-2.25 ～ 2.25）の地形の最高地点を計算する
    let maxGroundY = -100;
    for (let lx = -2.25; lx <= 2.12; lx += 0.5) {
      const wx = lx * Math.cos(0.35);
      const wz = 0.55 - lx * Math.sin(0.35);
      maxGroundY = Math.max(maxGroundY, getTerrainHeight(wx, wz));
    }

    // Y軸で斜めに向かせているため、底面の計算値(0.53)を最高地点に合わせる
    groupRef.current.position.y = maxGroundY + 0.53 + Math.sin(time * 0.32 * motionScale) * 0.025;
    
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
