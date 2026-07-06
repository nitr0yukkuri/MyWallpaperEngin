import { useMemo } from "react";
import * as THREE from "three";

const rocks = [
  { x: -6.2, y: -1.25, z: -10.8, scale: [1.6, 0.42, 0.55] },
  { x: -4.1, y: -1.05, z: -11.4, scale: [1.25, 0.34, 0.5] },
  { x: -1.7, y: -1.18, z: -10.9, scale: [1.85, 0.48, 0.65] },
  { x: 1.9, y: -1.12, z: -11.2, scale: [1.55, 0.4, 0.58] },
  { x: 4.2, y: -1.28, z: -10.6, scale: [1.35, 0.36, 0.52] },
  { x: 6.4, y: -1.08, z: -11.6, scale: [1.75, 0.45, 0.6] },
] satisfies Array<{
  x: number;
  y: number;
  z: number;
  scale: [number, number, number];
}>;

export function DistantRockShadows() {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#0a3442"),
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        fog: true,
      }),
    [],
  );

  return (
    <group>
      {rocks.map((rock) => (
        <mesh key={`${rock.x}-${rock.z}`} position={[rock.x, rock.y, rock.z]} scale={rock.scale} material={material}>
          <sphereGeometry args={[1, 18, 8]} />
        </mesh>
      ))}
    </group>
  );
}
