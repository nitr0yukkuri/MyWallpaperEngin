# WAKATO Living Desktop

<div align="center">
  <img src="public/assets/logo/reference-banner.png" alt="WAKATO Living Desktop preview" width="800" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Type-Web_Wallpaper-ff8fc7?style=for-the-badge" alt="Web Wallpaper" />
  <img src="https://img.shields.io/badge/Stack-Vite_/_React_/_R3F-black?style=for-the-badge&logo=react&logoColor=61dafb" alt="Vite React R3F" />
  <img src="https://img.shields.io/badge/Graphics-WebGL_/_GLSL-f06292?style=for-the-badge" alt="WebGL GLSL" />
</div>

<br />

**WAKATO Living Desktop** は、WAKATO のロゴとキャラクターを、単なる静止画ではなく「PCの背景で常駐する3Dブランド空間」として再構築する Wallpaper Engine 向け Web Wallpaper です。

React Three Fiber と GLSL を使い、ロゴ、キャラクター、桜、ネオン、開発アイコン、粒子、ポストエフェクトを3Dレイヤーとして配置しています。

`wakato.tech` の **Living Planet** が Web 上にある生きたポートフォリオだとしたら、このプロジェクトはデスクトップ上に常駐する **Living Desktop** です。

---

## Concept

この壁紙の目的は、「かわいいピンクの背景を作ること」だけではありません。

中心にあるのは、WAKATO のロゴやキャラクターを、技術によって息づく空間にすることです。

普通の壁紙であれば、ロゴ画像、桜のGIF、ピンクの背景を置くだけで成立します。  
しかしこのプロジェクトでは、それらを React Three Fiber の3D空間内にレイヤーとして配置し、GLSL の背景、InstancedMesh の桜、Bloom のネオン、時間ベースのモーションによって「動いている作品」にしています。

目指しているのは、次のような体験です。

- ロゴとキャラクターが、平面画像ではなく3D空間内のビルボードとして存在する
- 背景そのものがシェーダーでゆっくり呼吸する
- 桜が奥行きを持って舞う
- ネオンリングや開発アイコンが、ポートフォリオの文脈を記号として漂う
- PCを開いている間、WAKATO の世界が背景で静かに動き続ける

---

## Why

`wakato.tech` では、作品一覧をただ並べるのではなく、天候、時間、季節、音、3D表現を組み合わせて「探索する体験」にしています。

この壁紙も同じ思想で作っています。

情報を置くだけではなく、環境として存在させる。  
ロゴを貼るだけではなく、ロゴが住んでいる空間を作る。  
かわいい見た目を保ちながら、内側では WebGL、GLSL、particle system、postprocessing を使う。

そのため、このプロジェクトは「自分のロゴを壁紙にしたもの」ではなく、**自分のPCに常駐する Living Portfolio** を目指しています。

---

## Current Features

現在の v1 では、次の要素を実装しています。

- Vite + React + TypeScript による Web Wallpaper 構成
- React Three Fiber による3Dシーン
- GLSL によるピンクネオン背景
- バナー画像からロゴ・左右キャラクターをUV切り出し
- ロゴとキャラクターを3D空間内のビルボードとして配置
- 桜の花びらを InstancedMesh として描画
- 奥行きのあるネオンリング
- `< />`、`GLSL`、`API`、`wakato.tech` などの浮遊アイコン
- Bloom / Vignette / Noise によるポストプロセス
- Wallpaper Engine のプロパティ変更を受け取る listener

---

## Scene Architecture

シーンは、背景から前景までを3Dレイヤーとして分けています。

```text
Camera
|
|-- BackgroundShaderPlane
|   |-- pink / black gradient
|   |-- animated noise
|   |-- grid lines
|   `-- center glow
|
|-- NeonRings
|   |-- logo back rings
|   `-- horizontal light bands
|
|-- SakuraField
|   `-- instanced sakura petals
|
|-- LogoStage
|   |-- left character billboard
|   |-- center logo billboard
|   `-- right character billboard
|
|-- FloatingIcons
|   `-- developer / portfolio symbols
|
`-- Effects
    |-- Bloom
    |-- Vignette
    `-- Noise
```

2Dイラストをそのまま背景に貼るのではなく、3D空間内の板ポリゴンとして扱っています。  
これにより、背景、桜、ロゴ、キャラクター、手前の粒子に奥行きが生まれます。

---

## Rendering Design

### BackgroundShaderPlane

背景は CSS ではなく GLSL の shader plane として作っています。

時間で動くノイズ、薄いグリッド、中央の発光、画面端のライトリークを組み合わせ、静止画ではなく「呼吸している背景」にしています。

主なファイル:

- `src/scene/BackgroundShaderPlane.tsx`
- `src/shaders/background.vert`
- `src/shaders/background.frag`

### LogoStage

ロゴとキャラクターは、`public/assets/logo/reference-banner.png` を1枚のテクスチャとして読み込み、Three.js の `offset` / `repeat` を使って必要な範囲を切り出しています。

現時点ではキャラクターを3Dモデル化しているわけではなく、2Dイラストを3D空間内のビルボードとして配置しています。

主なファイル:

- `src/scene/LogoStage.tsx`
- `src/shaders/logoDistortion.frag`

### SakuraField

桜は Canvas 2D ではなく、Three.js の `InstancedMesh` で描画しています。

花びらごとに位置、奥行き、速度、回転、揺れを持たせ、`useFrame` 内で直接更新しています。React state を毎フレーム更新しないことで、壁紙として常時動かしても重くなりすぎない構成にしています。

主なファイル:

- `src/scene/SakuraField.tsx`

### Effects

Bloom、Vignette、Noise を重ねて、ピンクネオンの空気感を作っています。

Bloom は強くしすぎるとロゴが読みにくくなるため、Wallpaper Engine の設定から強度を調整できる前提にしています。

主なファイル:

- `src/scene/Effects.tsx`

---

## Wallpaper Engine Settings

`project.json` では、Wallpaper Engine 側から変更できる設定を定義しています。

| Setting | Description |
| --- | --- |
| Theme Mode | Sakura Light / Neon Night / Living Planet Pink / Cyber Dark |
| Particle Amount | 桜の量を Low / Normal / High / Insane で切り替え |
| Neon Intensity | ネオンの強度 |
| Motion | Calm / Normal / Active |
| Show Logo | ロゴ表示のON/OFF |
| Show Characters | キャラクター表示のON/OFF |
| Mouse Reaction | マウス反応のON/OFF |
| Post Processing | Bloomなどの強度 |
| Time Sync | 時刻連動用の設定 |
| Weather Sync | 天気連動用の設定 |

v1では主に描画設定の切り替えを想定しています。  
Time Sync / Weather Sync は、今後 `wakato.tech` の思想に近づけるための拡張ポイントです。

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
| Post Effect | @react-three/postprocessing |
| Target | Wallpaper Engine Web Wallpaper |

---

## Directory Guide

```text
public/
  assets/
    logo/
      reference-banner.png

src/
  App.tsx
  main.tsx
  styles.css

  scene/
    WallpaperScene.tsx
    CameraRig.tsx
    BackgroundShaderPlane.tsx
    LogoStage.tsx
    SakuraField.tsx
    FloatingIcons.tsx
    NeonRings.tsx
    Effects.tsx

  shaders/
    background.vert
    background.frag
    logoDistortion.frag

  store/
    wallpaperStore.ts

  wallpaper-engine/
    listener.ts
    types.ts
```

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

## Roadmap

今後追加したい要素です。

### v2

- キャラクターの瞬き
- 目線の微移動
- ロゴ周辺の shader distortion
- マウス連動の CameraRig 強化
- 時間帯による背景変化
- 天気による演出切り替え

### v3

- 今日コミットしたらロゴが少し明るくなる演出
- 雨の日は桜ではなく雨粒に変化
- 夜は Neon Night へ自動移行
- `wakato.tech` と同じ Living Planet 的な同期思想の共有

---

## Note

このプロジェクトは、現時点では v1 のプロトタイプです。

完成された Wallpaper Engine 作品というより、WAKATO のロゴ空間を R3F / GLSL で育てていくための土台です。

最初の目標は、かわいい見た目を保ちながら、実装の中身では WebGL、shader、InstancedMesh、postprocessing を使った「ちゃんと尖った壁紙」にすることです。
