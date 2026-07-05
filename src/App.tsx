import { Canvas } from "@react-three/fiber";
import { WallpaperScene } from "./scene/WallpaperScene";
export default function App() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      camera={{
        position: [0, 0, 13],
        fov: 38,
      }}
    >
      <WallpaperScene />
    </Canvas>
  );
}
