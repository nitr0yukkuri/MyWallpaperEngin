import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motionScaleFor, useWallpaperStore } from "../store/wallpaperStore";
import { getTerrainHeight } from "./SeaFloor";

type KelpRibbon = {
  x: number;
  z: number;
  height: number;
  width: number;
  phase: number;
  lean: number;
  color: string;
};

const ribbons: KelpRibbon[] = [
  { x: -5.4, z: -3.2, height: 1.45, width: 0.34, phase: 0.2, lean: -0.18, color: "#164a45" },
  { x: -4.75, z: -4.1, height: 1.18, width: 0.28, phase: 1.4, lean: 0.08, color: "#1b5a4d" },
  { x: 5.25, z: -3.4, height: 1.55, width: 0.36, phase: 0.8, lean: 0.2, color: "#153f44" },
  { x: 4.55, z: -4.35, height: 1.1, width: 0.26, phase: 2.1, lean: -0.08, color: "#1c5647" },
];

function createRibbonGeometry(width: number, height: number) {
  const segments = 9;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const y = t * height;
    const centerX = Math.sin(t * Math.PI * 1.55) * width * 0.32;
    const taper = THREE.MathUtils.lerp(1, 0.58, t);
    const halfWidth = (width * taper) / 2;
    const twist = Math.sin(t * Math.PI * 2.1) * 0.055;

    positions.push(centerX - halfWidth, y, twist, centerX + halfWidth, y, -twist);
    uvs.push(0, t, 1, t);

    if (index < segments) {
      const left = index * 2;
      indices.push(left, left + 1, left + 2, left + 1, left + 3, left + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function KelpRibbonMesh({ ribbon }: { ribbon: KelpRibbon }) {
  const ref = useRef<THREE.Mesh>(null);
  const motion = useWallpaperStore((state) => state.motion);
  const motionScale = motionScaleFor(motion);
  const baseY = getTerrainHeight(ribbon.x, ribbon.z) + 0.03;
  const geometry = useMemo(() => createRibbonGeometry(ribbon.width, ribbon.height), [ribbon.width, ribbon.height]);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(ribbon.color),
        roughness: 0.92,
        metalness: 0,
        emissive: new THREE.Color(ribbon.color),
        emissiveIntensity: 0.035,
        side: THREE.DoubleSide,
      }),
    [ribbon.color],
  );

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    const time = clock.elapsedTime * motionScale;
    ref.current.rotation.z = ribbon.lean + Math.sin(time * 0.56 + ribbon.phase) * 0.09;
    ref.current.rotation.y = Math.sin(time * 0.38 + ribbon.phase) * 0.18;
    ref.current.scale.x = 1 + Math.sin(time * 0.72 + ribbon.phase) * 0.035;
  });

  return <mesh ref={ref} geometry={geometry} material={material} position={[ribbon.x, baseY, ribbon.z]} />;
}

export function SeaweedField() {
  return (
    <>
      {ribbons.map((ribbon) => (
        <KelpRibbonMesh key={`${ribbon.x}-${ribbon.z}`} ribbon={ribbon} />
      ))}
    </>
  );
}
