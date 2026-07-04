import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motionScaleFor, useWallpaperStore } from "../store/wallpaperStore";

type Petal = {
  x: number;
  y: number;
  z: number;
  speed: number;
  windSpeed: number;
  phase: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
};

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createPetals(count: number): Petal[] {
  return Array.from({ length: count }, () => ({
    x: random(-6.2, 6.2),
    y: random(-3.5, 4.2),
    z: random(-2.2, 1.6),
    speed: random(0.14, 0.48),
    windSpeed: random(0.35, 1.2),
    phase: random(0, Math.PI * 2),
    rotation: random(0, Math.PI * 2),
    rotationSpeed: random(-1.2, 1.2),
    scale: random(0.45, 1.8),
  }));
}

export function SakuraField({ count = 160 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const petals = useMemo(() => createPetals(count), [count]);
  const motion = useWallpaperStore((state) => state.motion);
  const motionScale = motionScaleFor(motion);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    petals.forEach((petal, index) => {
      petal.y -= petal.speed * delta * motionScale;
      petal.x += Math.sin(time * petal.windSpeed + petal.phase) * 0.003 * motionScale;
      petal.rotation += petal.rotationSpeed * delta * motionScale;

      if (petal.y < -3.9) {
        petal.y = 4;
        petal.x = random(-6.2, 6.2);
        petal.z = random(-2.2, 1.8);
      }

      const depthScale = THREE.MathUtils.mapLinear(petal.z, -2.2, 1.8, 0.6, 1.45);
      dummy.position.set(petal.x, petal.y, petal.z);
      dummy.rotation.set(petal.rotation, petal.rotation * 0.4, petal.rotation * 0.8);
      dummy.scale.set(0.08 * petal.scale * depthScale, 0.18 * petal.scale * depthScale, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#ffd0e7" transparent opacity={0.78} depthWrite={false} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}
