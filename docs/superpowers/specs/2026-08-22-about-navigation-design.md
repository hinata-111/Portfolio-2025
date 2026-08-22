# サイドナビ刷新 + About セクション拡張 設計書

作成日: 2026-08-22

## 目的

1 ページ構成のポートフォリオで、閲覧者が「どこに何があるか」を把握し、任意のセクションへ即座に移動できるようにする。あわせて About セクションを、外部リンクとプロジェクト索引を備えた「入口」として機能させる。

参考にした挙動: <https://yunative.net/about/>（常時見えるナビと、アイコンによる外部リンク）

## 現状

- `PathRail` が左に固定されている。6px のドット列で、スクロール到達済みセクションが点灯し、彗星ヘッドが現在地を示す。ラベルはホバー時のみ表示。860px 以下は非表示
- 到達済み判定は `Math.max` による単調増加。一度点灯したドットは上スクロールしても消えない（進度演出のため意図的）
- `About` は SectionHead / `about-grid`（左 = `about-info` 4 行、右 = `about-story` 段落）/ `motto` の 3 ブロック
- `content.ts` の `contact` は `github` と `email` のみ
- `Projects` の各 `article` に id はなく、個別のアンカーが存在しない

## スコープ外

- モバイル（860px 以下）のセクションナビ。現状どおり非表示のままとする。1 ページが短く、スクロールで読み通せるため
- 既存の 10 件のテスト失敗（後述「既知の失敗」）の修正

## 設計

### 1. サイドナビ（`PathRail` の置き換え）

`app/components/PathRail.tsx` を `app/components/SideNav.tsx` に置き換える。ドット、彗星ヘッド、`rail-track`（進度バー）は撤去する。

構造:

```
<nav class="side-nav" aria-label="セクションナビゲーション">
  <a href="#hero">   <span class="mono">00</span> Top </a>
  <a href="#about">  <span class="mono">01</span> About </a>
  ...
</nav>
```

- 番号は `SectionHead` の `num` と一致させる。`hero` のみ SectionHead を持たないため `00 / Top` とする
- ラベルは既存の `railSections` の文言をそのまま使う。`Life & Creative Practice` は幅に収まらないため 2 行折り返しを許容する（文言は変更しない）
- クリック領域は行全体。`:focus-visible` によるフォーカスリング必須
- 860px 以下は `display: none`

現在地判定:

- IntersectionObserver のみを使う。scroll イベントは使わない
- **単調増加ロジックを廃止する。** 交差中のセクションのうち最も上にあるものを毎回 active にする。上スクロールで前のセクションに戻れる必要があるため
- active な行に `aria-current="true"` を付ける（同一ページ内の位置を示すため `"page"` ではなく `"true"`）。視覚的にはサンカラー + 太字 + 左バー

CSS: `.path-rail` / `.rail-track` / `.path-label` 系のルールを削除し、`.side-nav` 系に置き換える。`prefers-reduced-motion: reduce` でトランジションを無効化する。

### 2. About のアイコンリンク

`about-info` リストの直下（`about-grid` 左カラム内）に配置する。

`content.ts` に追加:

```ts
export type Social = { label: string; href: string };
export const socials: Social[] = [
  { label: "GitHub", href: "https://github.com/hinata-111" },
  { label: "X", href: "" },
];
```

- アイコンは `app/components/icons.tsx` にインライン SVG で定義する。GitHub と X の 2 つのみ。外部ライブラリは追加しない
- `href` が空文字の項目は**リンクにせず** `<span>` として描画し、`要確認` バッジを添える。X の URL が未提供のため。URL が判明したら `content.ts` に入れるだけで自動的にリンク化される
- 各リンクに `aria-label`（例: `GitHub を開く`）。外部リンクは `target="_blank" rel="noreferrer"`

### 3. About のプロジェクト索引

`about-grid` の下、`motto` の上に全幅で配置する。

- `content.ts` の `projects` 配列から自動生成する。件数はハードコードしない（セクション追加 = データ 1 要素の方針を維持）
- 各行: `PROJECT 01`（mono・小）/ タイトル / 要約
- 要約は `p.summary` をそのまま使い、CSS の `line-clamp: 2` で 2 行に収める。短文専用フィールドは作らない（文言を新規に創作しないため）
- リンク先は `href={`#project-${index}`}`

`Projects.tsx` 側:

- 各 `article` に `id={`project-${index}`}` を付与する
- `.project` に `scroll-margin-top` を設定し、着地時に上端が切れないようにする

### 4. 付随修正

`Contact.tsx` の Email リンクが `href={contact.email}` となっており `mailto:` が抜けている。相対 URL として解釈されリンクが機能しない。`mailto:` を付けて修正する。

## テスト方針

TDD。各項目テスト先行。

- `tests/sidenav.test.tsx`（`pathrail.test.tsx` を置き換え）
  - 7 リンクと href の並び
  - `navigation` ランドマークが `セクションナビゲーション` という名前を持つ
  - 番号とラベルが両方描画される
  - IntersectionObserver のモックで、交差セクションが後ろに進むと `aria-current` が移動する
  - **交差セクションが前に戻ると `aria-current` も前に戻る**（単調増加の廃止を保証する回帰テスト）
- `tests/about-skills.test.tsx` に追記
  - アイコンリンクが 2 件描画される
  - `href` が空の項目はリンクにならず `要確認` を伴う
  - プロジェクト索引の件数が `projects.length` と一致し、href が `#project-0` から順に並ぶ
- `tests/sections.test.tsx` に追記
  - `Projects` の各 `article` に `project-{index}` の id がある
  - Contact の Email が `mailto:` で始まる
- `tests/content.test.ts` に追記
  - `socials` の形状（`label` と `href` を持つ）

## 既知の失敗（本設計の着手前から存在）

着手時点で 10 件のテストが失敗している。すべて `content.ts` の編集にテストが追随していないことによるもので、本設計とは無関係。実装中に新規の破壊と混同しないため記録しておく。

- `about-skills.test.tsx` — `stack` が 5 行期待に対し実データ 4 行
- `content.test.ts` — 5 件（コレクション件数、Tabime のスタック、シルクロード旅、Tabime の紹介文、インターンの記述）
- `sections.test.tsx` — 3 件（timeline 6 件期待、Projects の文言 2 件）
- `shapes.test.ts` — `constellationLayout` の長さが `timeline.length` と不一致

これらの修正は別作業とする。

## 品質要件（プロジェクト共通）

- `:focus-visible` によるフォーカス表示
- `prefers-reduced-motion: reduce` で全アニメーション無効化
- クライアント処理は `SideNav` に閉じる。About / Projects はサーバーコンポーネントのまま
- 素の CSS のみ。Tailwind 不使用
