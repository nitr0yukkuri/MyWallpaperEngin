import { useFrame, useThree } from "@react-three/fiber";
import { useWallpaperStore } from "../store/wallpaperStore";

export function CameraRig() {
  const { camera, pointer } = useThree();
  const mouseReaction = useWallpaperStore((state) => state.mouseReaction);

  useFrame(() => {
    const targetX = mouseReaction ? pointer.x * 0.2 : 0;
    const targetY = mouseReaction ? pointer.y * 0.12 : 0;

    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
