import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

// 地形の高さ計算を外部から参照できるように共通インスタンス化
export const terrainSimplex = new SimplexNoise();

export function getTerrainHeight(worldX: number, worldZ: number) {
  const localX = worldX;
  const localY = -15 - worldZ; // position.z = -15, rotation.x = -90deg の逆算
  return -2 + terrainSimplex.noise(localX / 20, localY / 20); // position.y = -2 を加味
}

export function SeaFloor() {
  const materialRef = useRef<THREE.MeshLambertMaterial>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(150, 150, 64, 64);
    const positions = geo.attributes.position;

    for (let index = 0; index < positions.count; index++) {
      const x = positions.getX(index);
      const y = positions.getY(index);
      
      const z = terrainSimplex.noise(x / 20, y / 20);
      positions.setZ(index, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, -2, -15]} rotation={[-Math.PI / 2, 0, 0]}>
      <meshLambertMaterial
        ref={materialRef}
        color="#AA9966" // 記事のFog色および砂浜のトーンを完全に再現
        flatShading={false}
      />
    </mesh>
  );
}
