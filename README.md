# WAKATO Abyss Desktop

<div align="center">
  <img src="https://img.shields.io/badge/Type-Wallpaper_Engine_Web_Wallpaper-0b6cff?style=for-the-badge" alt="Wallpaper Engine Web Wallpaper" />
  <img src="https://img.shields.io/badge/Stack-Vite_/_React_/_R3F-04111e?style=for-the-badge&logo=react&logoColor=61dafb" alt="Vite React R3F" />
  <img src="https://img.shields.io/badge/Graphics-WebGL_/_GLSL_/_PostFX-29d8ff?style=for-the-badge" alt="WebGL GLSL PostFX" />
</div>

<br />

**WAKATO Abyss Desktop** は、Wallpaper Engine 向けに作っている **React Three Fiber 製の海中3D壁紙**です。

もともとの「ピンク・桜・ネオン」方向から、現在は **深海 / 水面 / 海底 / 泡 / マリンスノー / 発光するWAKATOロゴ** を中心にした海系の世界観へ寄せています。

単なる静止画やGIF壁紙ではなく、WebGL空間の中に水中環境を構築し、PCの背景でゆっくり呼吸し続ける **Living Desktop** を目指しています。

---

## Concept

この壁紙の軸は、**自分のPCの背景そのものを、静かな海中空間にすること**です。

画面を開くと、暗いブルーの深海が広がり、上部には揺れる水面があります。  
奥には光のカースティクスが漂い、手前にはマリンスノーと泡がゆっくり上昇します。  
海底にはノイズで生成した砂地があり、その上に白く発光する **WAKATO** のブロックロゴが立っています。

かわいいロゴ壁紙というより、今の方向性はこれです。

```text
海底に沈んだWAKATOロゴが、青い光と泡の中で静かに光っているデスクトップ空間
```

Wallpaper Engine 的な「動く背景」として、常時動いていても作業を邪魔しないように、演出は派手すぎず、でも中身の実装は R3F / GLSL / InstancedMesh / postprocessing で尖らせています。

---

## Current Features

現在の実装に入っている主な要素です。

- Vite + React + TypeScript による Web Wallpaper 構成
- React Three Fiber による3Dシーン構築
- GLSL shader による深海背景
- 水面 shader による水中の揺らぎ表現
- SimplexNoise で生成した海底地形
- 立体的な `WAKATO` ブロックロゴ
- InstancedMesh によるマリンスノー粒子
- InstancedMesh による泡パーティクル
- クリック位置に発生する泡のバースト演出
- マウス位置に応じた軽い CameraRig
- Bloom / Chromatic Aberration / Vignette / Noise による水中ポストエフェクト
- Wallpaper Engine のプロパティ変更を受け取る listener の土台

---

## Scene Architecture

現在のシーン構成は、海中空間を複数のレイヤーとして組み立てています。

```text
Camera
|
|-- CameraRig
|   `-- mouse position に応じて視点を微調整
|
|-- DeepSeaBackground
|   |-- deep blue gradient
|   |-- animated noise
|   |-- caustics-like light
|   `-- subtle neon depth
|
|-- WaterSurface
|   |-- transparent shader plane
|   |-- surface wave
|   `-- mouse-aware ripple base
|
|-- SeaFloor
|   |-- SimplexNoise terrain
|   `-- sand-like bottom mesh
|
|-- MarineSnowField
|   `-- instanced marine snow particles
|
|-- BubbleField
|   `-- instanced rising bubbles
|
|-- BubbleBurst
|   `-- click-generated bubble particles
|
|-- WakatoBlockText
|   `-- 3D block letters on sea floor
|
`-- Effects
    |-- Bloom
    |-- Chromatic Aberration
    |-- Vignette
    `-- Noise
```

`WallpaperScene` 側では、背景色、fog、ambient / directional / point light を置いたうえで、深海背景、水面、海底、粒子、ロゴ、ポストエフェクトを順番に重ねています。

---

## Rendering Design

### DeepSeaBackground

深海背景は CSS ではなく、GLSL shader の大きな Plane として描画しています。

`uTime` で時間変化を渡し、ノイズ、青系グラデーション、カースティクス風の光、ビネットを組み合わせて、静止画ではない「水の奥行き」を作っています。

主なファイル:

- `src/scene/DeepSeaBackground.tsx`
- `src/shaders/deepSea.vert`
- `src/shaders/deepSea.frag`

---

### WaterSurface

画面上部には、透明な shader plane として水面を置いています。

マウス座標と最後にマウスが動いてからの時間を uniform として渡しており、水面や揺らぎの拡張がしやすい構成です。

主なファイル:

- `src/scene/WaterSurface.tsx`
- `src/shaders/waterSurface.vert`
- `src/shaders/waterSurface.frag`

---

### SeaFloor

海底は画像ではなく、`SimplexNoise` で高さを生成した PlaneGeometry です。

`getTerrainHeight()` を外部に公開しており、`WakatoBlockText` 側では文字が地形に埋まらないように、ロゴ配置範囲の最高地点を見てY座標を補正しています。

主なファイル:

- `src/scene/SeaFloor.tsx`

---

### WakatoBlockText

中央のロゴは画像ではなく、BoxGeometry の組み合わせで組んだ **3Dブロック文字**です。

`W / A / K / A / T / O` をバーの集合として定義し、白い発光マテリアルを付けています。  
海底の上に立つオブジェクトとして存在するので、壁紙というより「海底に置かれた看板」に近い見え方になります。

主なファイル:

- `src/scene/WakatoBlockText.tsx`

---

### MarineSnowField

マリンスノーは `InstancedMesh` で描画しています。

1粒ごとに位置、奥行き、速度、揺れ、phase、scale を持たせ、`useFrame` 内で直接 instanceMatrix を更新します。React state を毎フレーム更新しないため、壁紙として常時動かす前提でも比較的軽く扱えます。

主なファイル:

- `src/scene/MarineSnowField.tsx`

---

### BubbleField / BubbleBurst

泡は2種類あります。

- `BubbleField`: 常時ゆっくり上昇する泡
- `BubbleBurst`: クリック位置付近に一瞬発生する泡のバースト

どちらも InstancedMesh ベースで、DOMや大量のReactコンポーネントを増やさずに描画します。

主なファイル:

- `src/scene/BubbleField.tsx`
- `src/scene/BubbleBurst.tsx`

---

### Effects

ポストエフェクトでは、水中の光とレンズっぽさを足しています。

- Bloom: ロゴや水中光の発光
- Chromatic Aberration: 水中の屈折感
- Vignette: 深海っぽい暗さ
- Noise: 完全なベタ塗り感を消す粒状感

主なファイル:

- `src/scene/Effects.tsx`

---

## Tech Stack

| Area | Tech |
| --- | --- |
| Framework | Vite |
| UI | React |
| Language | TypeScript |
| 3D | Three.js, React Three Fiber |
| Helper | Drei |
| Shader | GLSL |
| State | Zustand |
| Post Effect | @react-three/postprocessing, postprocessing |
| Target | Wallpaper Engine Web Wallpaper |

---

## Directory Guide

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

## Wallpaper Engine Settings

`project.json` には、Wallpaper Engine 側から設定を変更するためのプロパティ定義を置いています。

現在の描画に直接効いている主な値は次の通りです。

| Setting | Role |
| --- | --- |
| Neon Intensity | 深海背景やロゴ発光、Bloom の強度に影響 |
| Motion | マリンスノーやロゴの揺れの強さに影響 |
| Mouse Reaction | CameraRig のマウス追従 ON/OFF |
| Post Processing | Bloom 強度の Low / Medium / High 切り替え |

次の項目は、今後の拡張用の土台です。

| Setting | Future Role |
| --- | --- |
| Theme Mode | Abyss / Lagoon / Night Ocean などへのテーマ切り替え |
| Particle Amount | マリンスノーや泡の量の切り替え |
| Time Sync | 時刻で海の明るさを変える |
| Weather Sync | 天気で雨・波・水中光を変える |
| Show Logo / Show Characters | 表示要素の切り替え用 |

---

## Getting Started

依存関係をインストールします。

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで表示します。

```text
http://127.0.0.1:5173
```

---

## Build For Wallpaper Engine

静的ファイルをビルドします。

```bash
npm run build
```

生成された `dist/index.html` を Wallpaper Engine の Web Wallpaper として読み込みます。

---

## Development Notes

このプロジェクトは、壁紙として常時起動することを前提にしています。

そのため、演出を増やす場合も次の方針を優先します。

- React state を毎フレーム更新しない
- 粒子はできるだけ InstancedMesh でまとめる
- shader のPlaneを増やしすぎない
- Bloomを強くしすぎない
- 4K環境で重くなりすぎないように `dpr` を抑える
- 「派手さ」より「長時間見ても疲れない動き」を優先する

`App.tsx` では `dpr={[1, 1.5]}` にしており、壁紙用途として負荷を上げすぎない構成にしています。

---

## Roadmap

### v1

- 深海背景の完成度を上げる
- 水面 shader の揺らぎを強化する
- 泡とマリンスノーの量を Wallpaper Engine 設定と連動させる
- `project.json` のテーマ名を海系に整理する
- README用のプレビュー画像を追加する

### v2

- `Abyss / Lagoon / Night Ocean / Cyber Aquarium` のテーマ切り替え
- 時間帯で海の明るさを変える
- 雨の日は水面の揺れや泡を強める
- ロゴの周囲に青いネオンリングを追加する
- 小さい魚影やクラゲのシルエットを追加する

### v3

- GitHub activity に応じて海中の光量や泡の量を変える
- `wakato.tech` の Living Planet 的な同期思想を共有する
- 音楽再生時だけ水中光がゆっくり脈打つ
- Wallpaper Engine 上でプリセットを切り替えられるようにする

---

## Note

このプロジェクトは、完成品というより **WAKATO のデスクトップ空間をR3Fで育てていくための実験場**です。

現在は、桜とピンクネオンの方向から離れて、深海・水面・海底・泡・発光ロゴを中心にした海系へ移行しています。

最初の目標は、見た目は静かで使いやすく、実装の中身は WebGL / GLSL / InstancedMesh / postprocessing でちゃんと尖っている **海中Wallpaper Engine作品** にすることです。
