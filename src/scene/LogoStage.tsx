import { useMemo, useRef } from "react";
import type { Ref } from "react";
import { shaderMaterial, useTexture } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import logoFragmentShader from "../shaders/logoDistortion.frag?raw";
import { useWallpaperStore } from "../store/wallpaperStore";

const passThroughVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LogoMaterial = shaderMaterial(
  {
    uTexture: null,
    uTime: 0,
    uGlow: 0.5,
  },
  passThroughVertex,
  logoFragmentShader,
);

extend({ LogoMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    logoMaterial: {
      ref?: Ref<THREE.ShaderMaterial>;
      transparent?: boolean;
      depthWrite?: boolean;
      uTexture?: THREE.Texture;
      uTime?: number;
      uGlow?: number;
    };
  }
}

type Crop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function croppedTexture(source: THREE.Texture, crop: Crop) {
  const texture = source.clone();
  const imageWidth = 1500;
  const imageHeight = 500;

  texture.repeat.set(crop.width / imageWidth, crop.height / imageHeight);
  texture.offset.set(crop.x / imageWidth, 1 - (crop.y + crop.height) / imageHeight);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return texture;
}

function CroppedBillboard({
  crop,
  position,
  scale,
  emissive = false,
}: {
  crop: Crop;
  position: [number, number, number];
  scale: [number, number, number];
  emissive?: boolean;
}) {
  const source = useTexture("/assets/logo/reference-banner.png");
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useMemo(() => croppedTexture(source, crop), [crop, source]);
  const neonIntensity = useWallpaperStore((state) => state.neonIntensity);

  useFrame(({ clock, pointer }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = pointer.x * 0.035;
      meshRef.current.rotation.x = -pointer.y * 0.018;
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.65 + position[0]) * 0.025;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
      materialRef.current.uniforms.uGlow.value = emissive ? neonIntensity / 80 : neonIntensity / 180;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      {emissive ? (
        <logoMaterial ref={materialRef} uTexture={texture} transparent depthWrite={false} />
      ) : (
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
      )}
    </mesh>
  );
}

function GlowPanel({ position, scale, opacity }: { position: [number, number, number]; scale: [number, number, number]; opacity: number }) {
  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#ff7fbd" transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

export function LogoStage() {
  const showLogo = useWallpaperStore((state) => state.showLogo);
  const showCharacters = useWallpaperStore((state) => state.showCharacters);

  return (
    <group position={[0, -0.12, 0]}>
      {showCharacters && (
        <>
          <GlowPanel position={[-3.28, -0.14, -0.18]} scale={[1.95, 1.95, 1]} opacity={0.08} />
          <GlowPanel position={[3.28, -0.14, -0.18]} scale={[1.95, 1.95, 1]} opacity={0.08} />
          <CroppedBillboard crop={{ x: 0, y: 0, width: 470, height: 500 }} position={[-3.25, -0.2, 0.15]} scale={[1.95, 2.07, 1]} />
          <CroppedBillboard crop={{ x: 1040, y: 0, width: 460, height: 500 }} position={[3.25, -0.2, 0.15]} scale={[1.9, 2.07, 1]} />
        </>
      )}
      {showLogo && (
        <>
          <GlowPanel position={[0, 0.12, 0.24]} scale={[2.75, 1.28, 1]} opacity={0.1} />
          <CroppedBillboard crop={{ x: 455, y: 74, width: 545, height: 310 }} position={[0, 0.16, 0.45]} scale={[2.55, 1.45, 1]} emissive />
        </>
      )}
    </group>
  );
}
