# WAKATO Living Desktop

WAKATO Living Desktop is a Wallpaper Engine Web Wallpaper that treats the Wakato logo as a living 3D desktop space instead of a flat background image.

It uses React Three Fiber and GLSL to layer the logo, characters, sakura particles, neon rings, developer icons, bloom, vignette, and subtle noise into a pink cyber-sakura scene.

## Stack

- Vite
- React
- TypeScript
- Three.js
- React Three Fiber
- Drei
- React Three Postprocessing
- Zustand
- GLSL shader planes

## Run

```bash
npm install
npm run dev
```

## Build For Wallpaper Engine

```bash
npm run build
```

Then import `dist/index.html` into Wallpaper Engine as a Web Wallpaper. The included `project.json` defines the intended settings:

- Theme Mode
- Particle Amount
- Neon Intensity
- Motion
- Show Logo
- Show Characters
- Mouse Reaction
- Post Processing
- Time Sync
- Weather Sync

## Concept

The v1 scene focuses on:

- GLSL pink-neon background with animated noise and grid lines
- Logo and characters as layered R3F billboards
- Sakura petals rendered with InstancedMesh
- Neon rings and light bands behind the logo
- Floating developer and portfolio symbols
- Bloom, vignette, and noise post-processing
- Wallpaper Engine property listener

The next natural additions are character blinking, logo-edge distortion, time/weather sync, audio-reactive bloom, and GitHub activity mood.
