import { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Burst = {
  x: number;
  y: number;
  z: number;
  age: number;
  active: boolean;
  particles: { vx: number; vy: number; vz: number; scale: number }[];
};

const PARTICLE_COUNT = 12;
const MAX_BURSTS = 6;

function createBurst(x: number, y: number, z: number): Burst {
  return {
    x, y, z,
    age: 0,
    active: true,
    particles: Array.from({ length: PARTICLE_COUNT }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.8 + Math.random() * 1.2;
      return {
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.abs(Math.cos(phi)) * speed + 0.5, // 上方向バイアス
        vz: Math.sin(phi) * Math.sin(theta) * speed,
        scale: 0.3 + Math.random() * 0.7,
      };
    }),
  };
}

export function BubbleBurst() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bursts = useRef<Burst[]>([]);
  const { camera, raycaster, size } = useThree();

  // クリック時に3D位置を計算してバースト生成
  const handleClick = useCallback(
    (e: MouseEvent) => {
      // NDC座標に変換
      const ndc = new THREE.Vector2(
        (e.clientX / size.width) * 2 - 1,
        -(e.clientY / size.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      // カメラから5ユニット先の点をバースト位置にする
      const point = raycaster.ray.origin
        .clone()
        .addScaledVector(raycaster.ray.direction, 5);

      // 古いバーストを削除してスロット確保
      if (bursts.current.length >= MAX_BURSTS) {
        bursts.current.shift();
      }
      bursts.current.push(createBurst(point.x, point.y, point.z));
    },
    [camera, raycaster, size],
  );

  // クリックイベントをwindowに登録
  useMemo(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    let instanceIndex = 0;

    bursts.current.forEach((burst) => {
      if (!burst.active) return;
      burst.age += delta;
      if (burst.age > 1.5) {
        burst.active = false;
        return;
      }

      const t = burst.age;
      burst.particles.forEach((p) => {
        if (instanceIndex >= PARTICLE_COUNT * MAX_BURSTS) return;

        // 上方向に浮き上がりながら散らばる
        const px = burst.x + p.vx * t;
        const py = burst.y + p.vy * t - 0.5 * t * t; // 重力
        const pz = burst.z + p.vz * t;
        const fade = Math.max(0, 1 - t / 1.5);
        const scale = 0.04 * p.scale * fade;

        dummy.position.set(px, py, pz);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIndex, dummy.matrix);
        instanceIndex++;
      });
    });

    // 使われていないスロットをスケール0に
    for (let i = instanceIndex; i < PARTICLE_COUNT * MAX_BURSTS; i++) {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, PARTICLE_COUNT * MAX_BURSTS]}
    >
      <ringGeometry args={[0.4, 1, 12]} />
      <meshBasicMaterial
        color="#aaf8ff"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}
