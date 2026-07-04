import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Bubble = {
  x: number;
  y: number;
  z: number;
  speed: number;
  phase: number;
  scale: number;
};

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createBubbles(count: number): Bubble[] {
  return Array.from({ length: count }, () => ({
    x: random(-5.8, 5.8),
    y: random(-4.4, 4.3),
    z: random(-2.4, 1.4),
    speed: random(0.08, 0.32),
    phase: random(0, Math.PI * 2),
    scale: random(0.45, 1.35),
  }));
}

export function BubbleField({ count = 48 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bubbles = useMemo(() => createBubbles(count), [count]);

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    bubbles.forEach((bubble, index) => {
      bubble.y += bubble.speed * delta;
      bubble.x += Math.sin(time * 0.7 + bubble.phase) * 0.003;

      if (bubble.y > 4.5) {
        bubble.y = -4.5;
        bubble.x = random(-5.8, 5.8);
      }

      dummy.position.set(bubble.x, bubble.y, bubble.z);
      dummy.scale.setScalar(0.055 * bubble.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <ringGeometry args={[0.45, 1, 16]} />
      <meshBasicMaterial color="#d8fbff" transparent opacity={0.24} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}
