import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 光のシャフト1本分のコーン形状メッシュ
function LightShaft({
  xOffset,
  delay,
  width,
  height,
  intensity,
}: {
  xOffset: number;
  delay: number;
  width: number;
  height: number;
  intensity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = clock.elapsedTime + delay;
    // ゆっくり揺れる透明度
    matRef.current.opacity = intensity * (0.6 + Math.sin(t * 0.4) * 0.4);
  });

  // ConeGeometry: 上部(水面)が広く、下部が細い光のシャフト
  return (
    <mesh
      ref={meshRef}
      position={[xOffset, 2.4 - height / 2, -5]}
      rotation={[Math.PI, 0, 0]}
    >
      {/* radiusTop=小, radiusBottom=大 で上から下に広がる */}
      <coneGeometry args={[width * 0.15, height, 6, 1, true]} />
      <meshBasicMaterial
        ref={matRef}
        color={new THREE.Color(0.6, 0.92, 1.0)}
        transparent
        opacity={intensity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function VolumetricLight() {
  const shafts = useMemo(
    () => [
      { xOffset: 0.0,  delay: 0.0, width: 1.0, height: 9,  intensity: 0.06 },
      { xOffset: 1.4,  delay: 1.2, width: 0.7, height: 7,  intensity: 0.04 },
      { xOffset: -1.5, delay: 2.3, width: 0.7, height: 7,  intensity: 0.04 },
      { xOffset: 2.8,  delay: 0.7, width: 0.5, height: 5,  intensity: 0.025 },
      { xOffset: -2.9, delay: 1.8, width: 0.5, height: 5,  intensity: 0.025 },
      { xOffset: 0.6,  delay: 3.1, width: 0.4, height: 6,  intensity: 0.02 },
      { xOffset: -0.7, delay: 2.0, width: 0.4, height: 6,  intensity: 0.02 },
    ],
    [],
  );

  return (
    <group>
      {shafts.map((s, i) => (
        <LightShaft key={i} {...s} />
      ))}
    </group>
  );
}
