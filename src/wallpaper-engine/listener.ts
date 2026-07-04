import { useWallpaperStore, type WallpaperSettings } from "../store/wallpaperStore";
import type { WallpaperPropertyPayload, WallpaperPropertyValue } from "./types";

function unwrapProperty(value: WallpaperPropertyValue | undefined) {
  if (value && typeof value === "object" && "value" in value) {
    return value.value;
  }

  return value;
}

function boolValue(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

window.wallpaperPropertyListener = {
  applyUserProperties(properties: WallpaperPropertyPayload) {
    const next: Record<string, unknown> = {};

    for (const key of Object.keys(properties) as Array<keyof WallpaperSettings>) {
      const raw = unwrapProperty(properties[key]);

      if (raw === undefined) {
        continue;
      }

      if (key === "neonIntensity") {
        next.neonIntensity = Number(raw);
      } else if (key === "showLogo" || key === "showCharacters" || key === "mouseReaction" || key === "timeSync" || key === "weatherSync") {
        next[key] = boolValue(raw);
      } else {
        next[key] = raw;
      }
    }

    useWallpaperStore.getState().updateSettings(next as Partial<WallpaperSettings>);
  },
};
