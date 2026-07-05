import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { motionScaleFor, useWallpaperStore } from "../store/wallpaperStore";

type SnowParticle = {
  x: number;
  y: number;
  z: number;
  speed: number;
  drift: number;
  phase: number;
  scale: number;
};

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createParticles(count: number): SnowParticle[] {
  return Array.from({ length: count }, () => ({
    x: random(-7.2, 7.2),
    y: random(-4.2, 4.4),
    z: random(-3.8, 2.0),
    speed: random(0.05, 0.26),
    drift: random(0.22, 0.86),
    phase: random(0, Math.PI * 2),
    scale: random(0.35, 1.6),
  }));
}

export function MarineSnowField({ count = 260 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => createParticles(count), [count]);
  const { pointer } = useThree();
  const lastPointer = useRef(new THREE.Vector2(0, 0));
  const flow = useRef(new THREE.Vector2(0, 0));
  const motion = useWallpaperStore((state) => state.motion);
  const motionScale = motionScaleFor(motion);

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    flow.current.x = flow.current.x * 0.92 + (pointer.x - lastPointer.current.x) * 0.08;
    flow.current.y = flow.current.y * 0.92 + (pointer.y - lastPointer.current.y) * 0.08;
    lastPointer.current.set(pointer.x, pointer.y);

    particles.forEach((particle, index) => {
      particle.y += particle.speed * delta * motionScale;
      particle.x += Math.sin(time * particle.drift + particle.phase) * 0.0025 * motionScale;
      particle.x += pointer.x * 0.0009 * (2.0 - particle.z);
      particle.x += flow.current.x * 0.045 * (2.2 - particle.z);
      particle.y += flow.current.y * 0.018;

      if (particle.y > 4.5) {
        particle.y = -4.4;
        particle.x = random(-7.2, 7.2);
        particle.z = random(-3.8, 2.0);
      }

      const depthScale = THREE.MathUtils.mapLinear(particle.z, -3.8, 2.0, 0.55, 1.55);
      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.scale.setScalar(0.018 * particle.scale * depthScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#b7f5ff" transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}
