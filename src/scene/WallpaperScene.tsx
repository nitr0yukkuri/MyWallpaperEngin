import { Suspense } from "react";
import { BackgroundShaderPlane } from "./BackgroundShaderPlane";
import { CameraRig } from "./CameraRig";
import { CharacterStage } from "./CharacterStage";
import { Effects } from "./Effects";
import { NeonRings } from "./NeonRings";
import { SakuraField } from "./SakuraField";
import { particleCountFor, useWallpaperStore } from "../store/wallpaperStore";

export function WallpaperScene() {
  const particleAmount = useWallpaperStore((state) => state.particleAmount);

  return (
    <>
      <color attach="background" args={["#21131d"]} />
      <ambientLight intensity={1.2} />
      <pointLight color="#ff6fab" intensity={4.2} position={[0, 1.4, 3.2]} />
      <CameraRig />
      <BackgroundShaderPlane />
      <NeonRings />
      <SakuraField count={particleCountFor(particleAmount)} />
      <Suspense fallback={null}>
        <CharacterStage />
      </Suspense>
      <Effects />
    </>
  );
}
