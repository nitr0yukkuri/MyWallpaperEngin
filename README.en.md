# WAKATO Abyss Desktop

[日本語](README.md) | [English](README.en.md)

<div align="center">
  <img src="https://img.shields.io/badge/Type-Wallpaper_Engine_Web_Wallpaper-0b6cff?style=for-the-badge" alt="Wallpaper Engine Web Wallpaper" />
  <img src="https://img.shields.io/badge/Stack-Vite_/_React_/_R3F-04111e?style=for-the-badge&logo=react&logoColor=61dafb" alt="Vite React R3F" />
  <img src="https://img.shields.io/badge/Graphics-WebGL_/_GLSL_/_PostFX-29d8ff?style=for-the-badge" alt="WebGL GLSL PostFX" />
</div>

<br />

**WAKATO Abyss Desktop** is an underwater 3D wallpaper built with **React Three Fiber** for Wallpaper Engine.

The project has moved on from its original pink, cherry-blossom, and neon direction. Its current world centers on **the deep sea, surface, seabed, bubbles, marine snow, and an illuminated WAKATO logo**.

Rather than a static image or GIF, it builds an underwater environment in WebGL and aims to become a **Living Desktop** that keeps breathing gently in the background of a PC.

---

## Concept

The central idea is to **turn the PC desktop itself into a quiet underwater space**.

Opening the screen reveals a dark blue deep sea with a gently moving surface above. Caustics drift in the distance, while marine snow and bubbles slowly rise in the foreground. A sandy seabed generated with noise supports the white, glowing **WAKATO** block logo.

The current direction is less “a cute logo wallpaper” and more:

```text
A WAKATO logo resting on the seabed, glowing quietly among blue light and bubbles
```

As a moving Wallpaper Engine background, the scene should remain unobtrusive even when running continuously. Its effects are restrained, while the implementation uses R3F, GLSL, InstancedMesh, and post-processing.

---

## Current features

The current implementation includes:

- Web wallpaper structure built with Vite + React + TypeScript
- 3D scene composition with React Three Fiber
- Deep-sea background rendered with GLSL shaders
- Underwater distortion from a water-surface shader
- Seabed terrain generated with SimplexNoise
- Three-dimensional `WAKATO` block logo
- Marine snow particles rendered with InstancedMesh
- Bubble particles rendered with InstancedMesh
- Bubble-burst effect at the clicked position
- Subtle CameraRig movement based on the mouse position
- Underwater post-processing with Bloom / Chromatic Aberration / Vignette / Noise
- Foundation for a listener that receives Wallpaper Engine property changes

---

## Scene architecture

The scene is assembled from several layers that create an underwater space.

```text
Camera
|
|-- CameraRig
|   `-- subtly adjusts the viewpoint based on mouse position
|
|-- DeepSeaBackground
|   |-- deep blue gradient
|   |-- animated noise
|   |-- caustics-like light
|   `-- subtle neon depth
|
|-- WaterSurface
|   |-- transparent shader plane
|   |-- surface waves
|   `-- mouse-aware ripple base
|
|-- SeaFloor
|   |-- SimplexNoise terrain
|   `-- sand-like bottom mesh
|
|-- MarineSnowField
|   `-- instanced marine-snow particles
|
|-- BubbleField
|   `-- instanced rising bubbles
|
|-- BubbleBurst
|   `-- click-generated bubble particles
|
|-- WakatoBlockText
|   `-- 3D block letters on the seabed
|
`-- Effects
    |-- Bloom
    |-- Chromatic Aberration
    |-- Vignette
    `-- Noise
```

In `WallpaperScene`, the background color, fog, ambient/directional/point lights are set first, followed by the deep-sea background, water surface, seabed, particles, logo, and post-processing.

---

## Rendering design

### DeepSeaBackground

The deep-sea background is rendered as a large GLSL-shader plane rather than CSS.

Time is passed through `uTime`; noise, blue gradients, caustics-like light, and a vignette combine to create a sense of “depth in the water” rather than a still image.

Main files:

- `src/scene/DeepSeaBackground.tsx`
- `src/shaders/deepSea.vert`
- `src/shaders/deepSea.frag`

---

### WaterSurface

A transparent shader plane forms the water surface at the top of the screen.

Mouse coordinates and the time since the mouse last moved are passed as uniforms, making it easier to extend the surface and ripple effects.

Main files:

- `src/scene/WaterSurface.tsx`
- `src/shaders/waterSurface.vert`
- `src/shaders/waterSurface.frag`

---

### SeaFloor

The seabed is not an image. It is a PlaneGeometry whose height is generated with `SimplexNoise`.

`getTerrainHeight()` is exposed for external use. In `WakatoBlockText`, the logo’s Y position is adjusted using the highest point in its placement area so that the letters do not sink into the terrain.

Main file:

- `src/scene/SeaFloor.tsx`

---

### WakatoBlockText

The central logo is not an image. It is **3D block text** assembled from BoxGeometry shapes.

The letters `W / A / K / A / T / O` are defined as collections of bars and use a white emissive material. Since the logo stands on the seabed, it looks more like a sign placed underwater than a conventional wallpaper logo.

Main file:

- `src/scene/WakatoBlockText.tsx`

---

### MarineSnowField

Marine snow is rendered with `InstancedMesh`.

Each particle has a position, depth, velocity, sway, phase, and scale. Its instance matrix is updated directly inside `useFrame`. This avoids updating React state every frame and keeps the continuous motion relatively lightweight for wallpaper use.

Main file:

- `src/scene/MarineSnowField.tsx`

---

### BubbleField / BubbleBurst

There are two types of bubbles:

- `BubbleField`: bubbles that rise slowly all the time
- `BubbleBurst`: a brief burst of bubbles near the clicked position

Both use InstancedMesh, avoiding a large number of DOM elements or React components.

Main files:

- `src/scene/BubbleField.tsx`
- `src/scene/BubbleBurst.tsx`

---

### Effects

Post-processing adds underwater light and a lens-like quality:

- Bloom: glow from the logo and underwater light
- Chromatic Aberration: a sense of underwater refraction
- Vignette: deep-sea darkness
- Noise: subtle grain to avoid a flat, solid-color look

Main file:

- `src/scene/Effects.tsx`

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Vite |
| UI | React |
| Language | TypeScript |
| 3D | Three.js, React Three Fiber |
| Helpers | Drei |
| Shaders | GLSL |
| State | Zustand |
| Post-processing | @react-three/postprocessing, postprocessing |
| Target | Wallpaper Engine Web Wallpaper |

---

## Directory guide

```text
src/
  App.tsx
  main.tsx
  styles.css

  scene/
    WallpaperScene.tsx
    CameraRig.tsx
    DeepSeaBackground.tsx
    WaterSurface.tsx
    SeaFloor.tsx
    MarineSnowField.tsx
    BubbleField.tsx
    BubbleBurst.tsx
    WakatoBlockText.tsx
    Effects.tsx

  shaders/
    deepSea.vert
    deepSea.frag
    waterSurface.vert
    waterSurface.frag

  store/
    wallpaperStore.ts

  wallpaper-engine/
    listener.ts
    types.ts

project.json
package.json
```

---

## Wallpaper Engine settings

`project.json` defines properties that can be changed from Wallpaper Engine.

The main values currently affecting rendering are:

| Setting | Effect |
| --- | --- |
| Neon Intensity | Affects the deep-sea background, logo glow, and Bloom intensity |
| Motion | Affects marine-snow movement and logo sway |
| Mouse Reaction | Turns CameraRig mouse tracking on or off |
| Post Processing | Switches Bloom intensity between Low / Medium / High |

The following settings are foundations for future extensions:

| Setting | Future role |
| --- | --- |
| Theme Mode | Switch among themes such as Abyss / Lagoon / Night Ocean |
| Particle Amount | Adjust the amount of marine snow and bubbles |
| Time Sync | Change sea brightness by time of day |
| Weather Sync | Change rain, waves, and underwater light based on weather |
| Show Logo / Show Characters | Toggle visual elements |

---

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app in a browser:

```text
http://127.0.0.1:5173
```

---

## Build for Wallpaper Engine

Build the static files:

```bash
npm run build
```

Load the generated `dist/index.html` in Wallpaper Engine as a Web Wallpaper.

---

## Development notes

This project is designed to run continuously as a wallpaper.

When adding effects, prioritize these principles:

- Do not update React state every frame
- Batch particles with InstancedMesh where possible
- Avoid adding too many shader planes
- Do not make Bloom too strong
- Keep `dpr` low enough to avoid excessive load at 4K
- Prioritize motion that remains comfortable to look at for a long time over visual spectacle

`App.tsx` sets `dpr={[1, 1.5]}` to keep rendering load reasonable for wallpaper use.

---

## Roadmap

### v1

- Improve the deep-sea background
- Enhance the waves in the water-surface shader
- Connect bubble and marine-snow counts to Wallpaper Engine settings
- Update the theme names in `project.json` to ocean themes
- Add preview images for the README

### v2

- Switch among `Abyss / Lagoon / Night Ocean / Cyber Aquarium` themes
- Change sea brightness by time of day
- Increase surface movement and bubbles on rainy days
- Add a blue neon ring around the logo
- Add small fish silhouettes or jellyfish

### v3

- Change underwater light and bubble counts based on GitHub activity
- Share the Living Planet synchronization concept from `wakato.tech`
- Let underwater light pulse slowly only when music is playing
- Switch presets within Wallpaper Engine

---

## Note

This project is an **experimental space for developing WAKATO’s desktop environment with R3F**, rather than a finished product.

It has moved on from cherry blossoms and pink neon and is now transitioning to an ocean world centered on the deep sea, water surface, seabed, bubbles, and illuminated logo.

The first goal is an **underwater Wallpaper Engine experience** that looks calm and is comfortable to use, while its implementation is meaningfully built with WebGL / GLSL / InstancedMesh / post-processing.
