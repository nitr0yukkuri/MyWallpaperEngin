import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useWallpaperStore } from "../store/wallpaperStore";

const bloomByMode = {
  low: 0.25,
  medium: 0.55,
  high: 0.85,
};

export function Effects() {
  const postProcessing = useWallpaperStore((state) => state.postProcessing);
  const neonIntensity = useWallpaperStore((state) => state.neonIntensity);
  const bloom = bloomByMode[postProcessing] * (0.75 + neonIntensity / 200);

  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={bloom} luminanceThreshold={0.22} luminanceSmoothing={0.72} mipmapBlur />
      <Vignette eskil={false} offset={0.14} darkness={0.45} />
      <Noise opacity={0.035} blendFunction={BlendFunction.SOFT_LIGHT} />
    </EffectComposer>
  );
}
