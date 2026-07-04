import { create } from "zustand";

export type ThemeMode = "sakura" | "night" | "living" | "cyber";
export type ParticleAmount = "low" | "normal" | "high" | "insane";
export type MotionMode = "calm" | "normal" | "active";
export type PostProcessingMode = "low" | "medium" | "high";

export type WallpaperSettings = {
  themeMode: ThemeMode;
  particleAmount: ParticleAmount;
  neonIntensity: number;
  motion: MotionMode;
  showLogo: boolean;
  showCharacters: boolean;
  mouseReaction: boolean;
  postProcessing: PostProcessingMode;
  timeSync: boolean;
  weatherSync: boolean;
};

type WallpaperState = WallpaperSettings & {
  updateSettings: (settings: Partial<WallpaperSettings>) => void;
};

export const useWallpaperStore = create<WallpaperState>((set) => ({
  themeMode: "living",
  particleAmount: "normal",
  neonIntensity: 62,
  motion: "normal",
  showLogo: true,
  showCharacters: true,
  mouseReaction: true,
  postProcessing: "medium",
  timeSync: true,
  weatherSync: false,
  updateSettings: (settings) => set(settings),
}));

export function particleCountFor(amount: ParticleAmount) {
  switch (amount) {
    case "low":
      return 90;
    case "high":
      return 230;
    case "insane":
      return 360;
    default:
      return 160;
  }
}

export function motionScaleFor(motion: MotionMode) {
  switch (motion) {
    case "calm":
      return 0.58;
    case "active":
      return 1.38;
    default:
      return 1;
  }
}
