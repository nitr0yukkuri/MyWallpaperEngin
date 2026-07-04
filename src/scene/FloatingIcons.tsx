import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { motionScaleFor, useWallpaperStore } from "../store/wallpaperStore";

type IconDatum = {
  label: string;
  position: [number, number, number];
  scale: number;
  phase: number;
};

const labels = ["< />", "{ }", "PC", "W", "0st_ts", "cloud", "cursor", "wakato.tech", "API", "GLSL", "check", "planet"];

function makeIcons(): IconDatum[] {
  return labels.map((label, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const lane = Math.floor(index / 2);

    return {
      label,
      position: [side * (1.8 + (lane % 3) * 0.85), 1.12 - lane * 0.38, -0.35 - (index % 4) * 0.18],
      scale: 0.12 + (index % 3) * 0.015,
      phase: index * 0.77,
    };
  });
}

function FloatingIcon({ icon }: { icon: IconDatum }) {
  const groupRef = useRef<THREE.Group>(null);
  const motion = useWallpaperStore((state) => state.motion);
  const neonIntensity = useWallpaperStore((state) => state.neonIntensity);
  const motionScale = motionScaleFor(motion);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.position.y = icon.position[1] + Math.sin(clock.elapsedTime * 0.6 * motionScale + icon.phase) * 0.06;
    groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.35 + icon.phase) * 0.04;
  });

  return (
    <group ref={groupRef} position={icon.position}>
      <mesh scale={[0.62, 0.24, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#ff65a8" transparent opacity={0.1 + neonIntensity / 900} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <Text
        color="#fff0f8"
        anchorX="center"
        anchorY="middle"
        fontSize={icon.scale}
        outlineColor="#6b344f"
        outlineWidth={0.008}
        maxWidth={1.1}
      >
        {icon.label}
      </Text>
    </group>
  );
}

export function FloatingIcons() {
  const icons = useMemo(() => makeIcons(), []);

  return (
    <group position={[0, 0, 0.1]}>
      {icons.map((icon) => (
        <FloatingIcon key={icon.label} icon={icon} />
      ))}
    </group>
  );
}
