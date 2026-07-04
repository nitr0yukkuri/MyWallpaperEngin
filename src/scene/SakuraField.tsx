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
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
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
    rotX: random(0, Math.PI * 2),
    rotY: random(0, Math.PI * 2),
    rotZ: random(0, Math.PI * 2),
    rotSpeedX: random(-1.2, 1.2),
    rotSpeedY: random(-1.2, 1.2),
    rotSpeedZ: random(-1.2, 1.2),
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
      // 1. より有機的な落下速度とXYZ軸での揺らぎ（Sway）
      petal.y -= petal.speed * delta * motionScale;
      
      const swayX = Math.sin(time * petal.windSpeed + petal.phase) * 0.003;
      const swayZ = Math.cos(time * petal.windSpeed * 0.8 + petal.phase) * 0.002;
      petal.x += swayX * motionScale;
      petal.z += swayZ * motionScale;

      // 2. 3D空間での自然な舞い（XYZ各軸の独立した回転）
      petal.rotX += petal.rotSpeedX * delta * motionScale;
      petal.rotY += petal.rotSpeedY * delta * motionScale;
      petal.rotZ += petal.rotSpeedZ * delta * motionScale;

      if (petal.y < -3.9) {
        petal.y = 4;
        petal.x = random(-6.2, 6.2);
        petal.z = random(-2.2, 1.8);
      }

      const depthScale = THREE.MathUtils.mapLinear(petal.z, -2.2, 1.8, 0.6, 1.45);
      dummy.position.set(petal.x, petal.y, petal.z);
      dummy.rotation.set(petal.rotX, petal.rotY, petal.rotZ);
      
      // 3. 花びららしい縦横比への調整
      dummy.scale.set(0.08 * petal.scale * depthScale, 0.14 * petal.scale * depthScale, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        color="#ffb7c5" 
        transparent 
        opacity={0.85} 
        depthWrite={false} 
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
