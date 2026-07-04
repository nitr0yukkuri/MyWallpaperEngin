import type { WallpaperSettings } from "../store/wallpaperStore";

export type WallpaperPropertyValue =
  | { value: string | number | boolean }
  | string
  | number
  | boolean;

export type WallpaperPropertyPayload = Partial<Record<keyof WallpaperSettings, WallpaperPropertyValue>>;

declare global {
  interface Window {
    wallpaperPropertyListener?: {
      applyUserProperties: (properties: WallpaperPropertyPayload) => void;
    };
  }
}
