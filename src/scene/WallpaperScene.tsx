import { Suspense } from "react";
import { AbyssLightRays } from "./AbyssLightRays";
import { BubbleField } from "./BubbleField";
import { CameraRig } from "./CameraRig";
import { DeepSeaBackground } from "./DeepSeaBackground";
import { Effects } from "./Effects";
import { MarineSnowField } from "./MarineSnowField";
import { WakatoBlockText } from "./WakatoBlockText";

export function WallpaperScene() {
  return (
    <>
      <color attach="background" args={["#04111e"]} />
      <fogExp2 attach="fog" args={["#03111d", 0.09]} />
      <ambientLight intensity={0.42} color="#5ac8df" />
      <directionalLight color="#91f2ff" intensity={1.5} position={[-1.8, 4.2, 3.2]} />
      <pointLight color="#29d8ff" intensity={3.2} distance={7.5} position={[0, 0.4, 2.8]} />
      <pointLight color="#0b6cff" intensity={1.2} distance={9} position={[3.2, -1.4, -1.2]} />
      <CameraRig />
      <DeepSeaBackground />
      <AbyssLightRays />
      <MarineSnowField count={320} />
      <BubbleField count={56} />
      <Suspense fallback={null}>
        <WakatoBlockText />
      </Suspense>
      <Effects />
    </>
  );
}
