import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motionScaleFor, useWallpaperStore } from "../store/wallpaperStore";

type Fish = {
  offset: THREE.Vector3;
  scale: number;
  speed: number;
  phase: number;
  color: string;
};

function createFish(): Fish[] {
  return Array.from({ length: 34 }, (_, index) => {
    const row = Math.floor(index / 11);
    const column = index % 11;

    return {
      offset: new THREE.Vector3(
        column * 0.58 + Math.sin(index * 1.31) * 0.22,
        Math.sin(index * 1.7) * 0.42 - row * 0.12,
        -row * 0.55 + Math.cos(index * 0.83) * 0.28,
      ),
      scale: 0.5 + ((index * 19) % 10) * 0.035,
      speed: 0.45 + ((index * 11) % 8) * 0.04,
      phase: index * 0.69,
      color: index % 5 === 0 ? "#75e6ff" : index % 7 === 0 ? "#d7f7ff" : "#082638",
    };
  });
}

function FishSilhouette({ fish }: { fish: Fish }) {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(fish.color),
        transparent: true,
        opacity: fish.color === "#082638" ? 0.58 : 0.42,
        depthWrite: false,
      }),
    [fish.color],
  );

  return (
    <group position={fish.offset} scale={fish.scale}>
      <mesh material={material} scale={[1.45, 0.58, 0.32]}>
        <sphereGeometry args={[0.12, 12, 8]} />
      </mesh>
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={material}>
        <coneGeometry args={[0.085, 0.16, 3]} />
      </mesh>
      <mesh position={[0.08, 0.085, 0]} rotation={[0, 0, 0.2]} material={material}>
        <coneGeometry args={[0.035, 0.08, 3]} />
      </mesh>
    </group>
  );
}

export function FishSchool() {
  const groupRef = useRef<THREE.Group>(null);
  const fish = useMemo(createFish, []);
  const motion = useWallpaperStore((state) => state.motion);
  const motionScale = motionScaleFor(motion);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const time = clock.elapsedTime * motionScale;
    const travel = ((time * 0.42) % 16) - 8;

    groupRef.current.position.set(travel - 3.5, 0.72 + Math.sin(time * 0.2) * 0.08, -5.7);
    groupRef.current.rotation.y = Math.sin(time * 0.18) * 0.08;

    groupRef.current.children.forEach((child, index) => {
      const item = fish[index];
      child.position.x = item.offset.x + Math.sin(time * item.speed + item.phase) * 0.09;
      child.position.y = item.offset.y + Math.cos(time * item.speed * 0.8 + item.phase) * 0.055;
      child.rotation.z = Math.sin(time * item.speed + item.phase) * 0.08;
    });
  });

  return (
    <group ref={groupRef}>
      {fish.map((item, index) => (
        <FishSilhouette key={index} fish={item} />
      ))}
    </group>
  );
}
