# 宇宙モチーフ背景演出 設計書

## 背景・目的

Heroセクションの演出強化を目的に、参考サイト(moufdesign.info: 密な幾何学図形が疎に浮遊するマルチカラー背景)からインスピレーションを得て検討を進めた結果、以下の方向に着地した:

- 適用範囲はHero限定ではなく**全ページ**
- 配色は現行の確定パレット(暗背景+アンバー単色)から**マルチカラー**へ意図的に逸脱
- 単なる背景装飾で終わらせず、ポートフォリオの世界観(宇宙旅行のような没入感)と経歴データを結びつけた**星座タイムライン**を追加
- moufdesignの模倣に留まらないよう、色温度・密度をスクロール位置(ページの上から下)で寒色少数→暖色多数へ推移させ、必然性のある演出にする

この変更は`docs/design/portfolio-mockup-v7.html`(確定モックアップ・読み取り専用)からの明確な逸脱。基盤トークン(`--ground` `--surface` `--ink`等)は変更せず、追加要素のみで表現する。

## スコープ

### 削除するもの
- `app/components/HeroEffects.tsx`(Hero限定のアンバー粒子canvas、マウス追従)
- `app/components/AmbientLight.tsx`(知/好/楽で変化する全画面アンバーグラデーション)
- `tests/ambientlight.test.tsx`
- `globals.css`内の`.hero-canvas`関連スタイル、`.ambient-*`ブロック一式

### 追加するもの
1. **CosmicBackground**(新規クライアントコンポーネント) — 全ページ固定の背景演出一式
2. **Experience セクションの星座タイムライン**拡張(既存`Experience.tsx`に装飾レイヤーを追加、既存の実装は維持)
3. `app/shapes.ts` — 図形・星の静的配置データ

## CosmicBackground の構成

`page.tsx`の`<main>`直下、`<Hero />`より前に1箇所だけマウントする、全ページ共通の背景レイヤー。

### レイヤー構成(奥から手前)
| レイヤー | 内容 | z-index | 備考 |
|---|---|---|---|
| 遠景: 星 | 小さい白い点(1〜3px)が瞬く | -1 | 140個、全ページ均一分布 |
| 流れ星 | 時々斜めに光の筋が流れる | -1 | 5本、ランダム間隔でループ |
| 近景: 図形 | マルチカラー幾何学図形10種 | 0 | 合計74個、密度・配色は下表参照 |

### 図形の種類(10種、CSS `clip-path`/`border-radius`/borderトリックで表現)
circle / triangle / square / star / diamond / pentagon / ring / plus / moon(三日月) / sparkle(4方向の煌めき)

### 配色帯(スクロール位置による3帯構成)
図形の`--top`(全ページ分の縦位置)によって以下の帯に属し、色と密度が変化する:

| 帯 | 対象範囲 | 配色 | 個数 |
|---|---|---|---|
| 帯1(上部) | ページ上部1/3 | teal, navy(寒色のみ) | 16 |
| 帯2(中間) | ページ中間1/3 | teal, navy, pink(混色) | 24 |
| 帯3(下部) | ページ下部1/3 | pink, yellow, amber(`--sun`を再利用) | 34 |

これにより「静かな導入→賑やかな着地」というストーリーを持たせる。amber(`--sun`)を下部帯の配色に含めることで、既存のアンバー基調デザインとの接続を保つ。

### Hero専用の装飾
- **nebula**: 2つの`radial-gradient`(pink/teal)を`filter: blur()`でぼかし、ゆっくり呼吸するように拡大縮小する星雲グロー。Hero内のみ、静的マークアップ+CSSアニメーション(JS不要)
- **orbit-ring**: Hero中央に薄い円環と、その縁を回る光点1つ。静的マークアップ+CSSアニメーション(JS不要)

### 視差スクロール(パララックス)
- 近景(図形レイヤー): スクロール量の**1.7倍**の速度で移動
- 遠景(星レイヤー): スクロール量の**0.4倍**の速度で移動
- 実装: `window`の`scroll`イベント + `requestAnimationFrame`スロットリング(1フレーム1回に間引き)、`transform: translateY()`のみを操作(GPU合成、reflowなし)

**アーキテクチャ上の例外事項**: 本サイトは`Reveal`/`PathRail`/(旧)`AmbientLight`をすべて`IntersectionObserver`のみで実装し、scrollイベントリスナーを使わない方針だった。視差スクロールは原理上scrollイベントが必須のため、この演出に限り例外として scrollイベント + rAFスロットリング(既存の`HeroEffects`のmousemoveと同じスロットリングパターン)を採用する。

### リストから除外した案(検討したが不採用)
- **カーソルスポットライト**(マウス周辺の星を照らす演出): 不要と判断し実装しない
- **知/好/楽の文字ラベル表記**: 色温度・密度の推移自体は採用するが、セクション見出し等に「知」「楽」といった文字ラベルは表示しない
- **土星型(輪っか付き円)の図形**: 検討したが不採用
- **半円形の図形**: 不採用、五角形に置き換え済み

## Experience セクション: 星座タイムライン

既存の`Experience.tsx`(`timeline`配列を`<ul className="timeline">`でリスト表示)は**そのまま維持**する(アクセシビリティ上の主要コンテンツ)。その上に、装飾用の星座マップを追加する。

- 実データ(`content.ts`の`timeline`配列、5件)を星として配置する静的座標データ(`app/shapes.ts`に`constellationLayout`として定義)
- SVGの`<line>`で星同士を時系列順に接続
- 各星はホバー/`:focus-visible`で近傍にツールチップ(when + title)を表示
- **装飾レイヤーは`aria-hidden="true"`**とし、実際に読み上げられる情報は既存の`<ul className="timeline">`のみとする(星座マップは視覚的な付加価値であり、情報の唯一の伝達経路にはしない)

## データ構造

`app/shapes.ts`(新規):
```ts
export type ShapeKind =
  | "circle" | "triangle" | "square" | "star" | "diamond"
  | "pentagon" | "ring" | "plus" | "moon" | "sparkle";
export type ShapeColor = "pink" | "teal" | "yellow" | "navy" | "amber";

export type ShapeConfig = {
  kind: ShapeKind;
  color: ShapeColor;
  top: number;      // % (ページ全体に対する縦位置)
  left: number;      // %
  size: number;      // px
  duration: number;  // s (drift周期)
  delay: number;     // s
  drift: number;     // px (縦移動幅)
  rotate: number;    // deg
};
export const shapeLayout: ShapeConfig[] = [ /* 固定値、帯ごとに密度・配色を変えて事前生成 */ ];

export type StarDotConfig = { top: number; left: number; size: number; duration: number; delay: number };
export const starLayout: StarDotConfig[] = [ /* 固定値 約140件 */ ];

export type ShootingStarConfig = { sy: number; sx: number; angle: number; duration: number; delay: number };
export const shootingStarLayout: ShootingStarConfig[] = [ /* 固定値 5件 */ ];

export type ConstellationPoint = { when: string; title: string; x: number; y: number };
export const constellationLayout: ConstellationPoint[] = [ /* timelineと対応する5件の座標 */ ];
```

配置データはビルド時に固定値として生成し(モックアップで使用した線形合同法による決定論的擬似乱数の出力をそのまま定数化)、実行時の乱数生成は行わない。これによりNext.jsのSSR/CSRハイドレーション不一致を回避する。

## コンポーネント構成とクライアント境界

- `app/shapes.ts`: 純粋なデータ(サーバー/クライアント両方から参照可能)
- `app/components/CosmicBackground.tsx`(新規、`"use client"`): `shapeLayout`/`starLayout`/`shootingStarLayout`をmapして描画し、`useEffect`でscrollイベント(rAFスロットリング)を購読、2つのレイヤーdivに`transform`を適用
- `app/components/Experience.tsx`: 既存のまま。星座マップ描画部分は同ファイル内に追加(データは`constellationLayout`を参照)。装飾のみのため新規クライアントコンポーネント化は不要(ホバー/フォーカスはCSSの`:hover`/`:focus-visible`のみで完結し、JS不要)

### クライアントコンポーネント数の変化
現状6(`Reveal` / `HeroEffects` / `CursorLight` / `ConsoleEgg` / `PathRail` / `AmbientLight`)
→ `HeroEffects`・`AmbientLight`を削除、`CosmicBackground`を追加 →
**5**(`Reveal` / `CursorLight` / `ConsoleEgg` / `PathRail` / `CosmicBackground`)

`CLAUDE.md`のクライアントコンポーネント一覧をこれに合わせて更新する。

## アニメーション・パフォーマンス方針

- アニメーション対象プロパティは`transform`と`opacity`のみ(GPU合成レイヤー、reflow回避)
- `prefers-reduced-motion: reduce`で全アニメーション(drift/twinkle/shoot/nebula-breathe/parallax)を無効化。パララックスはscrollイベント購読自体を行わない
- scrollイベントは`{ passive: true }` + rAFスロットリング必須

## ダーク/ライト対応

新規カラートークン(`--shape-pink` `--shape-teal` `--shape-yellow` `--shape-navy`、amberは既存`--sun`を再利用)を、既存の3段構え(`:root` / `@media(prefers-color-scheme)` / `:root[data-theme]`)で定義する。基盤トークン(`--ground`等)は不変。

## テスト方針

`tests/cosmicbackground.test.tsx`(新規):
- `.cosmic-background`(仮称)が`aria-hidden="true"`でレンダーされる
- `.shape`要素数が`shapeLayout.length`と一致
- `.star-dot`要素数が`starLayout.length`と一致

`tests/experience.test.tsx`(既存があれば更新、なければ新規):
- 星座マップ(`.constellation-map`)が`aria-hidden="true"`
- 既存の`<ul className="timeline">`のリスト項目数が変わらないことを確認(装飾追加が主要コンテンツを破壊していないことの回帰確認)

## ドキュメント更新

- `CLAUDE.md`: クライアントコンポーネント一覧を5個に更新。マルチカラー配色・全ページ宇宙演出・scrollイベント例外について1行ずつ追記
- `README.md`: アーキテクチャ節のコンポーネント一覧を同様に更新
