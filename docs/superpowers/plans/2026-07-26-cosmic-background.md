# 宇宙モチーフ背景演出 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `docs/superpowers/specs/2026-07-26-cosmic-background-design.md` の設計どおり、既存の`HeroEffects`(Hero限定アンバー粒子canvas)と`AmbientLight`(知/好/楽アンバーグラデーション)を、全ページ共通のマルチカラー宇宙背景(遠景の瞬く星+近景の浮遊図形+視差スクロール+流れ星+Heroの星雲/軌道リング)に置き換え、Experienceセクションに実データを使った星座タイムライン装飾を追加する。

**Architecture:** 図形・星の配置データは`app/shapes.ts`に決定論的擬似乱数(線形合同法)で生成した固定配列としてモジュール評価時に1回だけ算出し、実行時の乱数生成は行わない(SSR/CSRハイドレーション不一致を回避)。描画とスクロール視差の適用は新規クライアントコンポーネント`CosmicBackground`1つに集約。Experienceの星座マップは既存の`Experience.tsx`にCSSのみの装飾として追加し、アクセシビリティ上の主要コンテンツ(`<ul className="timeline">`)はそのまま維持する。

**Tech Stack:** Next.js 16(App Router, TypeScript)/ 素のCSS / Vitest + React Testing Library

## Global Constraints

- 文言・データは`app/content.ts`の`timeline`をそのまま使う(重複定義しない)
- `:focus-visible`スタイル必須(星座マップの各星は`tabIndex`+`:focus-visible`でツールチップ表示)
- アニメーション対象プロパティは`transform`と`opacity`のみ(GPU合成、reflow回避)
- `prefers-reduced-motion: reduce`で全アニメーション(drift/twinkle/shoot/nebula-breathe/視差スクロール)を無効化。パララックスはこの場合scrollイベント購読自体を行わない
- scrollイベントは`{ passive: true }` + `requestAnimationFrame`スロットリング必須(1フレーム1回に間引く)。既存の`HeroEffects`/`CursorLight`のmousemoveスロットリングと同じパターン
- 星座マップなど装飾専用の要素は`aria-hidden="true"`を必ず付与
- 外部ライブラリ追加なし(YAGNI)
- コミットメッセージ末尾: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: 図形・星の配置データ(`app/shapes.ts`)

**Files:**
- Create: `app/shapes.ts`
- Test: `tests/shapes.test.ts`

**Interfaces:**
- Consumes: `app/content.ts`の`timeline`(件数の整合性確認用)
- Produces: `ShapeKind` `ShapeColor` `ShapeConfig` `shapeLayout: ShapeConfig[]`(74件)、`StarDotConfig` `starLayout: StarDotConfig[]`(140件)、`ShootingStarConfig` `shootingStarLayout: ShootingStarConfig[]`(5件)、`ConstellationPoint` `constellationLayout: ConstellationPoint[]`(timeline.lengthと同数)

- [ ] **Step 1: 失敗するテストを書く**

`tests/shapes.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { timeline } from "@/app/content";
import {
  shapeLayout,
  starLayout,
  shootingStarLayout,
  constellationLayout,
} from "@/app/shapes";

describe("shapes data", () => {
  it("has the expected element counts", () => {
    expect(shapeLayout).toHaveLength(74);
    expect(starLayout).toHaveLength(140);
    expect(shootingStarLayout).toHaveLength(5);
  });

  it("keeps constellationLayout aligned with the timeline data", () => {
    expect(constellationLayout).toHaveLength(timeline.length);
  });

  it("only uses defined shape kinds and colors", () => {
    const kinds = new Set([
      "circle", "triangle", "square", "star", "diamond",
      "pentagon", "ring", "plus", "moon", "sparkle",
    ]);
    const colors = new Set(["pink", "teal", "yellow", "navy", "amber"]);
    for (const shape of shapeLayout) {
      expect(kinds.has(shape.kind)).toBe(true);
      expect(colors.has(shape.color)).toBe(true);
    }
  });

  it("keeps shape positions within the page bounds", () => {
    for (const shape of shapeLayout) {
      expect(shape.top).toBeGreaterThanOrEqual(4);
      expect(shape.top).toBeLessThanOrEqual(96);
      expect(shape.left).toBeGreaterThanOrEqual(4);
      expect(shape.left).toBeLessThanOrEqual(92);
    }
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm test -- tests/shapes.test.ts`
Expected: FAIL(`app/shapes.ts` が存在しない)

- [ ] **Step 3: `app/shapes.ts` を実装**

```ts
export type ShapeKind =
  | "circle" | "triangle" | "square" | "star" | "diamond"
  | "pentagon" | "ring" | "plus" | "moon" | "sparkle";
export type ShapeColor = "pink" | "teal" | "yellow" | "navy" | "amber";

export type ShapeConfig = {
  kind: ShapeKind;
  color: ShapeColor;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotate: number;
};

export type StarDotConfig = {
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
};

export type ShootingStarConfig = {
  sy: number;
  sx: number;
  angle: number;
  duration: number;
  delay: number;
};

export type ConstellationPoint = { x: number; y: number };

/** 線形合同法による決定論的擬似乱数。同じseedなら常に同じ数列を返す。 */
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const KINDS: ShapeKind[] = [
  "circle", "triangle", "square", "star", "diamond",
  "pentagon", "ring", "plus", "moon", "sparkle",
];

type Band = { top: [number, number]; colors: ShapeColor[]; count: number };

const BANDS: Band[] = [
  { top: [4, 34], colors: ["teal", "navy"], count: 16 },
  { top: [34, 66], colors: ["teal", "navy", "pink"], count: 24 },
  { top: [66, 96], colors: ["pink", "yellow", "amber"], count: 34 },
];

function buildShapeLayout(): ShapeConfig[] {
  const rand = createRng(7);
  const shapes: ShapeConfig[] = [];
  for (const band of BANDS) {
    for (let i = 0; i < band.count; i++) {
      const [lo, hi] = band.top;
      shapes.push({
        kind: KINDS[Math.floor(rand() * KINDS.length)],
        color: band.colors[Math.floor(rand() * band.colors.length)],
        top: lo + rand() * (hi - lo),
        left: 4 + rand() * 88,
        size: 14 + rand() * 34,
        duration: 18 + rand() * 14,
        delay: rand() * -20,
        drift: 20 + rand() * 40,
        rotate: rand() * 24 - 12,
      });
    }
  }
  return shapes;
}

function buildStarLayout(): StarDotConfig[] {
  const rand = createRng(21);
  const stars: StarDotConfig[] = [];
  for (let i = 0; i < 140; i++) {
    stars.push({
      top: rand() * 100,
      left: rand() * 100,
      size: 1 + rand() * 2,
      duration: 2 + rand() * 4,
      delay: rand() * -6,
    });
  }
  return stars;
}

function buildShootingStarLayout(): ShootingStarConfig[] {
  const rand = createRng(55);
  const shooters: ShootingStarConfig[] = [];
  for (let i = 0; i < 5; i++) {
    shooters.push({
      sy: rand() * 70,
      sx: 30 + rand() * 65,
      angle: 150 + rand() * 20,
      duration: 7 + rand() * 6,
      delay: rand() * -12,
    });
  }
  return shooters;
}

export const shapeLayout: ShapeConfig[] = buildShapeLayout();
export const starLayout: StarDotConfig[] = buildStarLayout();
export const shootingStarLayout: ShootingStarConfig[] = buildShootingStarLayout();

/** Experienceの星座マップ用座標。app/content.ts の timeline と同じ並び順・同じ件数を前提とする。 */
export const constellationLayout: ConstellationPoint[] = [
  { x: 8, y: 70 },
  { x: 26, y: 30 },
  { x: 46, y: 65 },
  { x: 68, y: 25 },
  { x: 90, y: 55 },
];
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test -- tests/shapes.test.ts`
Expected: PASS(4 passed)

- [ ] **Step 5: コミット**

```bash
git add app/shapes.ts tests/shapes.test.ts
git commit -m "$(cat <<'EOF'
feat: 宇宙背景演出用の図形・星配置データを追加

決定論的擬似乱数(線形合同法)で図形74件・星140件・流れ星5件の
配置を固定生成。実行時ランダムを排除しハイドレーション不一致を回避。

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `CosmicBackground` コンポーネント

**Files:**
- Create: `app/components/CosmicBackground.tsx`
- Test: `tests/cosmicbackground.test.tsx`

**Interfaces:**
- Consumes: `app/shapes.ts` の `shapeLayout` `starLayout` `shootingStarLayout`(Task 1)
- Produces: デフォルトエクスポート `CosmicBackground()`(`"use client"`)。ルート要素として`.starfield` `.shooting-stars` `.floating-shapes` の3つのaria-hidden層をFragmentで返す

- [ ] **Step 1: 失敗するテストを書く**

`tests/cosmicbackground.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CosmicBackground from "@/app/components/CosmicBackground";
import { shapeLayout, starLayout, shootingStarLayout } from "@/app/shapes";

describe("CosmicBackground", () => {
  it("renders background layers as aria-hidden with counts matching shapes.ts data", () => {
    const { container } = render(<CosmicBackground />);
    expect(container.querySelector(".starfield")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".shooting-stars")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".floating-shapes")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".star-dot")).toHaveLength(starLayout.length);
    expect(container.querySelectorAll(".shooting-star")).toHaveLength(shootingStarLayout.length);
    expect(container.querySelectorAll(".shape")).toHaveLength(shapeLayout.length);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm test -- tests/cosmicbackground.test.tsx`
Expected: FAIL(`app/components/CosmicBackground.tsx` が存在しない)

- [ ] **Step 3: `CosmicBackground.tsx` を実装**

```tsx
"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { shapeLayout, starLayout, shootingStarLayout } from "@/app/shapes";

const NEAR_FACTOR = 1.7;
const FAR_FACTOR = 0.4;

export default function CosmicBackground() {
  const shapesRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const shapesEl = shapesRef.current;
    const starsEl = starsRef.current;
    if (!shapesEl || !starsEl) return;

    let queued = false;
    const onScroll = () => {
      if (queued) return; // rAFスロットリング
      queued = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        shapesEl.style.transform = `translateY(${-y * NEAR_FACTOR}px)`;
        starsEl.style.transform = `translateY(${-y * FAR_FACTOR}px)`;
        queued = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div ref={starsRef} className="starfield" aria-hidden="true">
        {starLayout.map((s, i) => (
          <div
            key={i}
            className="star-dot"
            style={
              {
                "--top": `${s.top}%`,
                "--left": `${s.left}%`,
                "--size": `${s.size}px`,
                "--duration": `${s.duration}s`,
                "--delay": `${s.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="shooting-stars" aria-hidden="true">
        {shootingStarLayout.map((sh, i) => (
          <div
            key={i}
            className="shooting-star-wrap"
            style={
              {
                "--sy": `${sh.sy}%`,
                "--sx": `${sh.sx}%`,
                "--angle": `${sh.angle}deg`,
              } as CSSProperties
            }
          >
            <div
              className="shooting-star"
              style={
                {
                  "--sdur": `${sh.duration}s`,
                  "--sdelay": `${sh.delay}s`,
                } as CSSProperties
              }
            />
          </div>
        ))}
      </div>
      <div ref={shapesRef} className="floating-shapes" aria-hidden="true">
        {shapeLayout.map((sh, i) => (
          <div
            key={i}
            className={`shape shape-${sh.kind} shape-${sh.color}`}
            style={
              {
                "--top": `${sh.top}%`,
                "--left": `${sh.left}%`,
                "--size": `${sh.size}px`,
                "--duration": `${sh.duration}s`,
                "--delay": `${sh.delay}s`,
                "--drift": sh.drift,
                "--rotate": `${sh.rotate}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test -- tests/cosmicbackground.test.tsx`
Expected: PASS(1 passed)

- [ ] **Step 5: コミット**

```bash
git add app/components/CosmicBackground.tsx tests/cosmicbackground.test.tsx
git commit -m "$(cat <<'EOF'
feat: 全ページ宇宙背景CosmicBackgroundコンポーネントを追加

遠景の瞬く星+近景のマルチカラー図形+流れ星を描画し、scrollイベント
(rAFスロットリング)で近景1.7倍・遠景0.4倍の視差を適用する。
prefers-reduced-motionではリスナー自体を張らない。

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `globals.css` — 配色トークン追加 + 宇宙背景スタイル

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: Task 2 が出力するクラス名(`.starfield` `.star-dot` `.shooting-stars` `.shooting-star-wrap` `.shooting-star` `.floating-shapes` `.shape` `.shape-{kind}` `.shape-{color}`)
- Produces: 上記クラス名すべてに対応するCSSルール、新規トークン `--shape-pink` `--shape-teal` `--shape-yellow` `--shape-navy`

- [ ] **Step 1: 配色トークンを4つのルートブロックに追加**

`app/globals.css` の `:root {` ブロック(ファイル冒頭)を置換:

old:
```css
:root {
  --sun: #FFC53D;
  --sun-deep: #E8A013;
  --on-sun: #131B29;
  --hl-ink: #FFF6DE;
  --ink: #E8EAF0;
  --ink-strong: #FFFFFF;
  --ground: #0F1522;
  --surface: #1A2333;
  --muted: #93A0B4;
  --line: #2B3750;
  --radius-lg: 22px;
  --radius-md: 16px;
  --card-shadow: 0 2px 6px rgba(0,0,0,.22), 0 14px 36px rgba(0,0,0,.24);
  --glow-1: rgba(255,197,61,.16);
  --glow-2: rgba(84,110,180,.25);
}
@media (prefers-color-scheme: light) {
  :root {
    --on-sun: #131B29;
    --hl-ink: #131B29;
    --ink: #232D3F;
    --ink-strong: #131B29;
    --ground: #FAF8F2;
    --surface: #FFFFFF;
    --muted: #66707F;
    --line: #E5E1D5;
    --card-shadow: 0 1px 3px rgba(27,42,65,.05), 0 10px 28px rgba(27,42,65,.07);
    --glow-1: rgba(255,197,61,.3);
    --glow-2: rgba(120,140,200,.14);
    }
}
:root[data-theme="dark"] {
  --sun: #FFC53D;
  --sun-deep: #E8A013;
  --on-sun: #131B29;
  --hl-ink: #FFF6DE;
  --ink: #E8EAF0;
  --ink-strong: #FFFFFF;
  --ground: #0F1522;
  --surface: #1A2333;
  --muted: #93A0B4;
  --line: #2B3750;
  --card-shadow: 0 2px 6px rgba(0,0,0,.22), 0 14px 36px rgba(0,0,0,.24);
  --glow-1: rgba(255,197,61,.16);
  --glow-2: rgba(84,110,180,.25);
}
:root[data-theme="light"] {
  --sun: #FFC53D;
  --sun-deep: #E8A013;
  --on-sun: #131B29;
  --hl-ink: #131B29;
  --ink: #232D3F;
  --ink-strong: #131B29;
  --ground: #FAF8F2;
  --surface: #FFFFFF;
  --muted: #66707F;
  --line: #E5E1D5;
  --card-shadow: 0 1px 3px rgba(27,42,65,.05), 0 10px 28px rgba(27,42,65,.07);
  --glow-1: rgba(255,197,61,.3);
  --glow-2: rgba(120,140,200,.14);
}
```

new(各ブロックの閉じ`}`直前に`--shape-*`4行を追加。ダーク系2箇所は同じ値、ライト系2箇所は同じ値):
```css
:root {
  --sun: #FFC53D;
  --sun-deep: #E8A013;
  --on-sun: #131B29;
  --hl-ink: #FFF6DE;
  --ink: #E8EAF0;
  --ink-strong: #FFFFFF;
  --ground: #0F1522;
  --surface: #1A2333;
  --muted: #93A0B4;
  --line: #2B3750;
  --radius-lg: 22px;
  --radius-md: 16px;
  --card-shadow: 0 2px 6px rgba(0,0,0,.22), 0 14px 36px rgba(0,0,0,.24);
  --glow-1: rgba(255,197,61,.16);
  --glow-2: rgba(84,110,180,.25);
  --shape-pink: #E8639B;
  --shape-teal: #4FC1B0;
  --shape-yellow: #F5D547;
  --shape-navy: #6C8FCC;
}
@media (prefers-color-scheme: light) {
  :root {
    --on-sun: #131B29;
    --hl-ink: #131B29;
    --ink: #232D3F;
    --ink-strong: #131B29;
    --ground: #FAF8F2;
    --surface: #FFFFFF;
    --muted: #66707F;
    --line: #E5E1D5;
    --card-shadow: 0 1px 3px rgba(27,42,65,.05), 0 10px 28px rgba(27,42,65,.07);
    --glow-1: rgba(255,197,61,.3);
    --glow-2: rgba(120,140,200,.14);
    --shape-pink: #D14D85;
    --shape-teal: #2E9C8C;
    --shape-yellow: #E0BC1F;
    --shape-navy: #35578A;
    }
}
:root[data-theme="dark"] {
  --sun: #FFC53D;
  --sun-deep: #E8A013;
  --on-sun: #131B29;
  --hl-ink: #FFF6DE;
  --ink: #E8EAF0;
  --ink-strong: #FFFFFF;
  --ground: #0F1522;
  --surface: #1A2333;
  --muted: #93A0B4;
  --line: #2B3750;
  --card-shadow: 0 2px 6px rgba(0,0,0,.22), 0 14px 36px rgba(0,0,0,.24);
  --glow-1: rgba(255,197,61,.16);
  --glow-2: rgba(84,110,180,.25);
  --shape-pink: #E8639B;
  --shape-teal: #4FC1B0;
  --shape-yellow: #F5D547;
  --shape-navy: #6C8FCC;
}
:root[data-theme="light"] {
  --sun: #FFC53D;
  --sun-deep: #E8A013;
  --on-sun: #131B29;
  --hl-ink: #131B29;
  --ink: #232D3F;
  --ink-strong: #131B29;
  --ground: #FAF8F2;
  --surface: #FFFFFF;
  --muted: #66707F;
  --line: #E5E1D5;
  --card-shadow: 0 1px 3px rgba(27,42,65,.05), 0 10px 28px rgba(27,42,65,.07);
  --glow-1: rgba(255,197,61,.3);
  --glow-2: rgba(120,140,200,.14);
  --shape-pink: #D14D85;
  --shape-teal: #2E9C8C;
  --shape-yellow: #E0BC1F;
  --shape-navy: #35578A;
}
```

- [ ] **Step 2: `.hero-canvas` ルールを削除**(`HeroEffects` はTask 4で削除するため不要になる)

old:
```css
.hero { position: relative; padding: 130px 0 0; text-align: center; overflow: hidden; }
.hero-canvas { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.cursor-light {
```

new:
```css
.hero { position: relative; padding: 130px 0 0; text-align: center; overflow: hidden; }
.cursor-light {
```

- [ ] **Step 3: 旧 `AmbientLight` 用CSSブロックを宇宙背景CSSに置換**

`/* ---------- Stage ambience: 知 -> 好 -> 楽 ---------- */` から始まりファイル末尾までのブロック全体(`.ambient-light` `.ambient-layer` `.ambient-layer-chi/ko/raku` とそのライト/ダーク上書き、末尾の `@media (prefers-reduced-motion: reduce)` ブロック)を、以下に置換する:

```css
/* ---------- Cosmic background: starfield / floating shapes ---------- */
.starfield {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 480vh;
  z-index: -1;
  pointer-events: none;
  will-change: transform;
}
.star-dot {
  position: absolute;
  top: var(--top);
  left: var(--left);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: #fff;
  opacity: .5;
  animation: twinkle var(--duration) ease-in-out var(--delay) infinite;
}
@keyframes twinkle {
  0%, 100% { opacity: .15; }
  50% { opacity: .9; }
}
.shooting-stars { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.shooting-star-wrap {
  position: absolute;
  top: var(--sy);
  left: var(--sx);
  transform: rotate(var(--angle));
}
.shooting-star {
  position: relative;
  width: 2px; height: 2px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 6px 1px rgba(255,255,255,.9);
  animation: shoot var(--sdur) linear var(--sdelay) infinite;
}
.shooting-star::before {
  content: "";
  position: absolute; top: 50%; right: 0;
  width: 110px; height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,.85), transparent);
  transform: translateY(-50%);
}
@keyframes shoot {
  0% { transform: translate(0, 0); opacity: 0; }
  3% { opacity: 1; }
  14% { opacity: 1; }
  22% { transform: translate(-280px, 0); opacity: 0; }
  100% { transform: translate(-280px, 0); opacity: 0; }
}
.floating-shapes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 480vh;
  z-index: 0;
  pointer-events: none;
  will-change: transform;
}
.shape {
  position: absolute;
  top: var(--top);
  left: var(--left);
  width: var(--size);
  height: var(--size);
  opacity: .55;
  animation: drift var(--duration) ease-in-out var(--delay) infinite;
  will-change: transform;
}
.shape-circle { border-radius: 50%; }
.shape-square { border-radius: 4px; }
.shape-star { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
.shape-triangle {
  background: transparent !important;
  width: 0; height: 0;
  border-left: calc(var(--size) / 2) solid transparent;
  border-right: calc(var(--size) / 2) solid transparent;
  border-bottom: calc(var(--size) * .86) solid var(--sc);
}
.shape-diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
.shape-pentagon { clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); }
.shape-ring {
  background: transparent !important;
  border-radius: 50%;
  border: calc(var(--size) * .16) solid var(--sc);
}
.shape-plus { background: transparent !important; }
.shape-plus::before, .shape-plus::after {
  content: ""; position: absolute; background: var(--sc);
  top: 50%; left: 50%;
}
.shape-plus::before { width: 100%; height: calc(var(--size) * .22); transform: translate(-50%, -50%); }
.shape-plus::after { width: calc(var(--size) * .22); height: 100%; transform: translate(-50%, -50%); }
.shape-moon {
  border-radius: 50%;
  box-shadow: calc(var(--size) * .3) calc(var(--size) * -.18) 0 0 var(--ground);
}
.shape-sparkle {
  clip-path: polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%);
}
.shape-pink { --sc: var(--shape-pink); background: var(--shape-pink); }
.shape-teal { --sc: var(--shape-teal); background: var(--shape-teal); }
.shape-yellow { --sc: var(--shape-yellow); background: var(--shape-yellow); }
.shape-navy { --sc: var(--shape-navy); background: var(--shape-navy); }
.shape-amber { --sc: var(--sun); background: var(--sun); }
@keyframes drift {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(calc(var(--drift) * -1px)) rotate(var(--rotate)); }
}
.nebula {
  position: absolute;
  inset: -20% -10%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 45% 40% at 28% 30%, color-mix(in srgb, var(--shape-pink) 22%, transparent), transparent 70%),
    radial-gradient(ellipse 40% 45% at 72% 62%, color-mix(in srgb, var(--shape-teal) 20%, transparent), transparent 70%);
  filter: blur(40px);
  animation: nebula-breathe 14s ease-in-out infinite;
}
@keyframes nebula-breathe {
  0%, 100% { transform: scale(1); opacity: .8; }
  50% { transform: scale(1.08); opacity: 1; }
}
.orbit-ring {
  position: absolute;
  top: 50%; left: 50%;
  width: 620px; height: 620px;
  border: 1px solid color-mix(in srgb, var(--muted) 35%, transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(-8deg);
  z-index: 0;
  pointer-events: none;
}
.orbit-ring::before {
  content: "";
  position: absolute;
  top: -4px; left: 50%;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--shape-yellow);
  box-shadow: 0 0 10px 2px var(--shape-yellow);
  transform: translateX(-50%);
}
@media (prefers-reduced-motion: reduce) {
  .path-rail a { transition: none; }
  .star-dot, .shooting-star, .shape, .nebula { animation: none; }
}
```

- [ ] **Step 4: ビルドとテストを確認**

Run: `npm run build && npm test`
Expected: どちらも終了コード0(この時点ではCSSのみでコンポーネント側は未接続なので、既存テストのみ対象)

- [ ] **Step 5: コミット**

```bash
git add app/globals.css
git commit -m "$(cat <<'EOF'
style: 宇宙背景用CSSを追加、旧AmbientLightのCSSを置換

マルチカラー配色トークン(--shape-pink/teal/yellow/navy)を追加。
知/好/楽アンバーグラデーションのCSSを、星・流れ星・浮遊図形・
星雲・軌道リングのCSSに置き換え。

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: 旧コンポーネント削除 + Hero/page配線 + stage-*クリーンアップ

**Files:**
- Delete: `app/components/HeroEffects.tsx`
- Delete: `app/components/AmbientLight.tsx`
- Delete: `tests/ambientlight.test.tsx`
- Modify: `app/components/Hero.tsx`
- Modify: `app/page.tsx`
- Modify: `app/components/About.tsx`, `app/components/Skills.tsx`, `app/components/Beyond.tsx`, `app/components/Contact.tsx`, `app/components/Projects.tsx`(いずれも`className="stage-chi/ko/raku"`を削除。`Experience.tsx`はTask 5で扱う)

**Interfaces:**
- Consumes: Task 2 の `CosmicBackground`
- Produces: `page.tsx` が `CosmicBackground` を1回だけマウントする状態

- [ ] **Step 1: 不要ファイルを削除**

```bash
rm app/components/HeroEffects.tsx app/components/AmbientLight.tsx tests/ambientlight.test.tsx
```

- [ ] **Step 2: `Hero.tsx` を更新**(`HeroEffects`削除、nebula/orbit-ring追加)

old:
```tsx
import { profile } from "@/app/content";
import HeroEffects from "@/app/components/HeroEffects";

export default function Hero() {
  return (
    <header className="hero" id="hero">
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <HeroEffects />
      <div className="hero-inner">
```

new:
```tsx
import { profile } from "@/app/content";

export default function Hero() {
  return (
    <header className="hero" id="hero">
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <div className="nebula" aria-hidden="true" />
      <div className="orbit-ring" aria-hidden="true" />
      <div className="hero-inner">
```

- [ ] **Step 3: `page.tsx` を更新**(`AmbientLight` → `CosmicBackground`)

old:
```tsx
import ConsoleEgg from "@/app/components/ConsoleEgg";
import PathRail from "@/app/components/PathRail";
import AmbientLight from "@/app/components/AmbientLight";
import { profile } from "@/app/content";

export default function Home() {
  return (
    <main>
      <AmbientLight />
      <Hero />
```

new:
```tsx
import ConsoleEgg from "@/app/components/ConsoleEgg";
import PathRail from "@/app/components/PathRail";
import CosmicBackground from "@/app/components/CosmicBackground";
import { profile } from "@/app/content";

export default function Home() {
  return (
    <main>
      <CosmicBackground />
      <Hero />
```

- [ ] **Step 4: `stage-chi/ko/raku` の付いた5コンポーネントから該当className削除**

`app/components/About.tsx`:

old: `<section id="about" className="stage-chi" style={{ padding: "72px 0 64px" }}>`
new: `<section id="about" style={{ padding: "72px 0 64px" }}>`

`app/components/Skills.tsx`:

old: `<section id="skills" className="stage-ko">`
new: `<section id="skills">`

`app/components/Beyond.tsx`:

old: `<section id="beyond" className="stage-raku">`
new: `<section id="beyond">`

`app/components/Contact.tsx`:

old: `<section id="contact" className="stage-raku">`
new: `<section id="contact">`

`app/components/Projects.tsx`:

old: `<section id="projects" className="stage-raku">`
new: `<section id="projects">`

- [ ] **Step 5: テストとビルドを確認**

Run: `npm test && npm run build`
Expected: どちらも終了コード0(既存の`hero.test.tsx` `page.test.tsx` 等が引き続きPASSすること、`AmbientLight`/`HeroEffects`への参照が残っていないこと)

- [ ] **Step 6: コミット**

```bash
git add -A ':!.playwright-mcp'
git commit -m "$(cat <<'EOF'
refactor: HeroEffects/AmbientLightをCosmicBackgroundに置き換え

Hero限定のcanvas粒子演出と知/好/楽アンバーグラデーションを削除し、
全ページ共通のCosmicBackgroundに一本化。Heroには星雲(nebula)と
軌道リング(orbit-ring)を静的マークアップで追加。AmbientLightの
ステージ判定にのみ使われていたstage-chi/ko/rakuクラスも削除。

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Experience セクションの星座タイムライン

**Files:**
- Modify: `app/components/Experience.tsx`
- Modify: `app/globals.css`(星座マップCSS追加)
- Modify: `tests/sections.test.tsx`

**Interfaces:**
- Consumes: `app/shapes.ts` の `constellationLayout`(Task 1)、`app/content.ts` の `timeline`
- Produces: `Experience.tsx` 内に `.constellation-map`(aria-hidden、SVG線+`.const-star`)を追加。既存 `<ul className="timeline">` はそのまま維持

- [ ] **Step 1: 失敗するテストを書く**

`tests/sections.test.tsx` の `describe("Experience", ...)` ブロックを置換:

old:
```tsx
describe("Experience", () => {
  it("renders 5 timeline items", () => {
    render(<Experience />);
    expect(document.querySelectorAll(".timeline li")).toHaveLength(5);
  });
});
```

new:
```tsx
describe("Experience", () => {
  it("renders 5 timeline items", () => {
    render(<Experience />);
    expect(document.querySelectorAll(".timeline li")).toHaveLength(5);
  });

  it("renders a decorative constellation map matching the timeline length", () => {
    render(<Experience />);
    const map = document.querySelector(".constellation-map");
    expect(map).toHaveAttribute("aria-hidden", "true");
    const stars = document.querySelectorAll(".const-star");
    expect(stars).toHaveLength(5);
    expect(document.querySelectorAll(".constellation-map svg line")).toHaveLength(4);
  });

  it("gives each constellation star a focusable tooltip with the matching timeline entry", () => {
    render(<Experience />);
    const stars = document.querySelectorAll(".const-star");
    stars.forEach((star, i) => {
      expect(star).toHaveAttribute("tabIndex", "0");
      const tip = star.querySelector(".tip");
      expect(tip).not.toBeNull();
      expect(tip?.textContent).toContain(timeline[i].title);
      expect(tip?.textContent).toContain(timeline[i].when);
    });
  });
});
```

このテストは`timeline`を参照するため、`tests/sections.test.tsx`冒頭のimportに追加する:

old:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
```

new:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
import { timeline } from "@/app/content";
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm test -- tests/sections.test.tsx`
Expected: FAIL(`.constellation-map` が存在しない)

- [ ] **Step 3: `Experience.tsx` を実装**

装飾レイヤーは`aria-hidden="true"`だが、各星は`tabIndex={0}`+ホバー/`:focus-visible`でツールチップ(when + title)を表示する。ツールチップの文言自体はスクリーンリーダーに二重に読み上げられないよう、親の`aria-hidden`によって装飾全体がアクセシビリティツリーから除外される(主要な情報源は下の`<ul className="timeline">`)。

```tsx
import { timeline } from "@/app/content";
import { constellationLayout } from "@/app/shapes";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function Experience() {
  return (
    <section id="experience">
      <Reveal>
        <SectionHead num="03" label="Experience" />
      </Reveal>
      <Reveal as="h2">経歴</Reveal>
      <div className="constellation-map" aria-hidden="true">
        <svg>
          {constellationLayout.slice(1).map((pt, i) => {
            const prev = constellationLayout[i];
            return (
              <line
                key={i}
                x1={`${prev.x}%`}
                y1={`${prev.y}%`}
                x2={`${pt.x}%`}
                y2={`${pt.y}%`}
              />
            );
          })}
        </svg>
        {constellationLayout.map((pt, i) => (
          <div
            key={i}
            className="const-star"
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            tabIndex={0}
          >
            <div className="tip">
              <span className="when">{timeline[i].when}</span>
              {timeline[i].title}
            </div>
          </div>
        ))}
      </div>
      <ul className="timeline">
        {timeline.map((t) => (
          <Reveal as="li" key={t.title}>
            <div className="when mono">
              {t.when}
              {t.todo && <span className="todo">{t.todo}</span>}
            </div>
            <div className="dot" />
            <div className="what">
              <b>{t.title}</b>
              <span>{t.desc}</span>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: 星座マップCSSを追加**

`app/globals.css` の `/* ---------- Timeline ---------- */` セクション直前に追加:

```css
/* ---------- Experience: 星座タイムライン(装飾) ---------- */
.constellation-map { position: relative; height: 220px; margin: 0 auto 32px; max-width: 720px; }
.constellation-map svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.constellation-map svg line {
  stroke: color-mix(in srgb, var(--muted) 45%, transparent);
  stroke-width: 1;
}
.const-star {
  position: absolute;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--shape-yellow);
  box-shadow: 0 0 10px 2px color-mix(in srgb, var(--shape-yellow) 60%, transparent);
  transform: translate(-50%, -50%);
  cursor: pointer;
}
.const-star:hover, .const-star:focus-visible {
  background: var(--sun);
  box-shadow: 0 0 16px 4px color-mix(in srgb, var(--sun) 70%, transparent);
  outline: none;
}
.const-star .tip {
  position: absolute;
  bottom: 20px; left: 50%;
  transform: translateX(-50%);
  width: max-content; max-width: 220px;
  background: var(--surface);
  border: 1px solid color-mix(in srgb, var(--muted) 30%, transparent);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px; line-height: 1.6; color: var(--ink);
  opacity: 0; pointer-events: none;
  transition: opacity .2s;
}
.const-star:hover .tip, .const-star:focus-visible .tip { opacity: 1; }
.const-star .tip .when {
  color: var(--muted); display: block; margin-bottom: 2px;
  font-family: ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace;
  font-size: 11px;
}
@media (max-width: 620px) {
  .constellation-map { display: none; }
}
```

- [ ] **Step 5: テストが通ることを確認**

Run: `npm test -- tests/sections.test.tsx`
Expected: PASS(2 passed)

- [ ] **Step 6: 全体テストとビルドを確認**

Run: `npm test && npm run build`
Expected: どちらも終了コード0

- [ ] **Step 7: コミット**

```bash
git add app/components/Experience.tsx app/globals.css tests/sections.test.tsx
git commit -m "$(cat <<'EOF'
feat: Experienceセクションに星座タイムラインの装飾を追加

timelineの実データに対応する5点をSVGの線で結んだ星座マップを、
既存のul.timelineの上に装飾(aria-hidden)として追加。アクセシビリティ
上の主要コンテンツは既存のリストのまま変更しない。

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: ドキュメント更新 + 最終確認

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: Task 1〜5 の全成果物
- Produces: なし(ドキュメント整合性のみ)

- [ ] **Step 1: `CLAUDE.md` のクライアントコンポーネント一覧を更新**

old:
```
- クライアント処理は `Reveal` / `HeroEffects` / `CursorLight` / `ConsoleEgg` / `PathRail` / `AmbientLight` の 6 コンポーネントに隔離。他はサーバーコンポーネント
```

new:
```
- クライアント処理は `Reveal` / `CursorLight` / `ConsoleEgg` / `PathRail` / `CosmicBackground` の 5 コンポーネントに隔離。他はサーバーコンポーネント
- 背景演出は全ページ共通の `CosmicBackground`(マルチカラー図形+星+視差スクロール)。配置データは `app/shapes.ts` に決定論的擬似乱数で固定生成し実行時乱数は使わない
- 視差スクロールのみ scroll イベント(rAFスロットリング)を使用 — 他の演出([Reveal]/[PathRail]等)は IntersectionObserver のみで実装する方針の例外
```

- [ ] **Step 2: `README.md` のコンポーネント一覧を更新**

old:
```
- `app/components/` — セクション単位の独立コンポーネント。クライアント処理は Reveal / HeroEffects / CursorLight / ConsoleEgg / PathRail に隔離
```

new:
```
- `app/components/` — セクション単位の独立コンポーネント。クライアント処理は Reveal / CursorLight / ConsoleEgg / PathRail / CosmicBackground に隔離
```

- [ ] **Step 3: 最終確認**

Run: `npm test && npm run build`
Expected: どちらも終了コード0、`HeroEffects` / `AmbientLight` / `ambient-light` / `hero-canvas` / `stage-chi` / `stage-ko` / `stage-raku` への参照が残っていないこと(`grep -rn` で確認)

```bash
grep -rn "HeroEffects\|AmbientLight\|hero-canvas\|stage-chi\|stage-ko\|stage-raku" app/ tests/ || echo "no matches"
```

Expected: `no matches`

- [ ] **Step 4: コミット**

```bash
git add CLAUDE.md README.md
git commit -m "$(cat <<'EOF'
docs: CosmicBackground導入に合わせてCLAUDE.md/READMEを更新

クライアントコンポーネント一覧を5個に更新し、視差スクロールが
scrollイベントを使う唯一の例外であることを明記。

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```
