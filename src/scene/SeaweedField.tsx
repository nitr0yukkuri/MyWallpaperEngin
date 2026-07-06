import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
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
  { x: -5.9, z: -5.4, height: 1.18, width: 0.36, phase: 0.2, lean: -0.14, color: "#113d3c" },
  { x: -5.1, z: -6.2, height: 0.96, width: 0.3, phase: 1.4, lean: 0.06, color: "#15483f" },
  { x: 5.8, z: -5.6, height: 1.24, width: 0.38, phase: 0.8, lean: 0.16, color: "#10383d" },
  { x: 4.9, z: -6.45, height: 0.92, width: 0.28, phase: 2.1, lean: -0.06, color: "#16463c" },
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
  const { pointer } = useThree();
  const lastPointer = useRef(new THREE.Vector2(0, 0));
  const flow = useRef(new THREE.Vector2(0, 0));
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
        transparent: true,
        opacity: 0.72,
        emissiveIntensity: 0.018,
        side: THREE.DoubleSide,
      }),
    [ribbon.color],
  );

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    const time = clock.elapsedTime * motionScale;
    flow.current.x = flow.current.x * 0.95 + (pointer.x - lastPointer.current.x) * 0.05;
    flow.current.y = flow.current.y * 0.95 + (pointer.y - lastPointer.current.y) * 0.05;
    lastPointer.current.set(pointer.x, pointer.y);

    ref.current.rotation.z = ribbon.lean + Math.sin(time * 0.28 + ribbon.phase) * 0.055 + flow.current.x * 0.08;
    ref.current.rotation.y = Math.sin(time * 0.2 + ribbon.phase) * 0.11 + flow.current.y * 0.04;
    ref.current.scale.x = 1 + Math.sin(time * 0.34 + ribbon.phase) * 0.018;
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
