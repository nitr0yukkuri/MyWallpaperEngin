import { useMemo, useRef } from "react";
import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

export const terrainSimplex = new SimplexNoise();

function floorHeightLocal(x: number, y: number) {
  const dune = terrainSimplex.noise(x / 20, y / 20);
  const rippleWarp = terrainSimplex.noise(x / 18, y / 12) * 1.6;
  const ripple = Math.sin(x * 1.65 + y * 0.16 + rippleWarp) * 0.035;
  const fineRipple = Math.sin(x * 3.2 + y * 0.08) * 0.012;

  return dune + ripple + fineRipple;
}

export function getTerrainHeight(worldX: number, worldZ: number) {
  const localX = worldX;
  const localY = -15 - worldZ;

  return -2 + floorHeightLocal(localX, localY);
}

export function SeaFloor() {
  const materialRef = useRef<THREE.MeshLambertMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(150, 150, 96, 96);
    const positions = geo.attributes.position;

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const y = positions.getY(index);

      positions.setZ(index, floorHeightLocal(x, y));
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, -2, -15]} rotation={[-Math.PI / 2, 0, 0]}>
      <meshLambertMaterial ref={materialRef} color="#AA9966" flatShading={false} />
    </mesh>
  );
}
