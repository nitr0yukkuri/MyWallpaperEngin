import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import vertexShader from "../shaders/character.vert?raw";
import fragmentShader from "../shaders/character.frag?raw";
import { motionScaleFor, useWallpaperStore } from "../store/wallpaperStore";

export function CharacterStage() {
  const texture = useTexture("/assets/icons/wakato-character-fullbody.png");
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();
  const motion = useWallpaperStore((state) => state.motion);
  const motionScale = motionScaleFor(motion);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [texture],
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    if (groupRef.current) {
      const breathe = 1 + Math.sin(time * 1.15 * motionScale) * 0.012;
      groupRef.current.position.y = -0.2 + Math.sin(time * 0.7 * motionScale) * 0.055;
      groupRef.current.rotation.z = Math.sin(time * 0.45 * motionScale) * 0.018 + pointer.x * 0.035;
      groupRef.current.rotation.x = -pointer.y * 0.025;
      groupRef.current.scale.setScalar(breathe);
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uPointer.value.set(pointer.x, pointer.y);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0.35]}>
      <mesh scale={[3.9, 3.9, 1]}>
        <planeGeometry args={[1, 1, 48, 48]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
