# 就活ポートフォリオサイト Implementation Plan(v7対応)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 確定モックアップ `docs/design/portfolio-mockup-v7.html` どおりの1ページポートフォリオサイトを Next.js で実装し、Vercel で公開できる状態にする。

**Architecture:** Next.js App Router の単一ページ構成。全コンテンツは型付きデータモジュール(`app/content.ts`)に集約し、各セクションは配列を map する独立コンポーネント(プロジェクト・経歴の追加=データ1要素の追加で完結)。スタイルは v7 モックアップの CSS を `app/globals.css` にそのまま移植(Tailwind 不使用 — 完成済み CSS の忠実移植が最軽量)。動きはスクロールリビール(IntersectionObserver フック)+ Hero 演出(Canvas 粒子・カーソルライト・ティッカー)。クライアント処理は `Reveal` / `HeroEffects` / `CursorLight` / `ConsoleEgg` の4コンポーネントに隔離し、それ以外はサーバーコンポーネント。

**Tech Stack:** Next.js 15+(App Router, TypeScript)/ 素の CSS(デザイントークン)/ Vitest + React Testing Library / Vercel

## Global Constraints

- 文言・色・数値はすべて `docs/design/portfolio-mockup-v7.html` から**そのまま**転記。勝手に創作・補完しない
- 未確定情報はプレースホルダーのまま(`【氏名】`、`【趣味・特技 要記入】`、`(記載予定)`、`要確認`バッジ、`素材待ち`写真枠)
- アクセント `#FFC53D` / `#E8A013`、ダーク地 `#0F1522`(トークン全値は v7 の `:root` 群)
- 全アニメーションは `prefers-reduced-motion: reduce` で無効化(コンテンツは即表示)
- **品質要件(コードレビュー対策)**: ①`:focus-visible` スタイル必須 ②Canvas は画面外で rAF 停止 ③mousemove は rAF スロットリング ④resize は debounce
- 外部ライブラリ追加は本計画記載分のみ(YAGNI)
- コミットメッセージ末尾: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: Next.js scaffold + テスト基盤

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`(create-next-app 生成)
- Create: `vitest.config.mts`, `vitest.setup.ts`
- Test: `tests/smoke.test.tsx`

**Interfaces:**
- Consumes: なし
- Produces: `npm run dev` / `npm run build` / `npm test` が動く土台

- [x] **Step 1: create-next-app 実行**

リポジトリ直下で:

```bash
npx create-next-app@latest . --ts --app --no-tailwind --no-eslint --no-src-dir --import-alias "@/*" --use-npm
```

プロンプト: Turbopack → Yes。既存 `docs/` `.gitignore` が上書きされたら `git checkout -- docs` で復元し、.gitignore は両方の内容をマージ。

- [x] **Step 2: ビルド確認**

Run: `npm run build`
Expected: 終了コード 0

- [x] **Step 3: テスト基盤インストール**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [x] **Step 4: Vitest 設定**

`vitest.config.mts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

`vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

`package.json` scripts に `"test": "vitest run"` を追加。

- [x] **Step 5: スモークテスト**

`tests/smoke.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home", () => {
  it("renders without crashing", () => {
    render(<Home />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
```

`app/page.tsx` を最小シェルに置換:

```tsx
export default function Home() {
  return <main />;
}
```

Run: `npm test`
Expected: PASS (1 passed)

- [x] **Step 6: コミット**

```bash
git add -A ':!.playwright-mcp'
git commit -m "chore: Next.js scaffold と Vitest テスト基盤をセットアップ

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: グローバル CSS 移植+品質強化

**Files:**
- Modify: `app/globals.css`(全置換)
- Modify: `app/layout.tsx`(全置換)

**Interfaces:**
- Consumes: Task 1
- Produces: v7 モックアップと同一のクラス群(`.hero` `.hero-canvas` `.cursor-light` `.ticker` `.ticker-track` `.glow` `.glow-a` `.glow-b` `.hero-inner` `.hero-eyebrow` `.hl` `.role-line` `.hero-sub` `.name` `.scroll-cue` `.sec-head` `.sec-num` `.sec-label` `.about-grid` `.about-photo` `.about-info` `.motto` `.vow` `.stack` `.stack-row` `.cat` `.chip` `.stack-pills` `.timeline` `.when` `.dot` `.what` `.project` `.prs` `.tags` `.tag` `.todo` `.beyond-grid` `.beyond` `.ph` `.body` `.contact-row` `.btn` `.btn-primary` `.btn-ghost` `.arr` `.contact-fab` `.wrap` `.serif` `.mono` `.center` `.lede` `.rv` `.rv-d1..3` `.in`)

- [x] **Step 1: CSS 移植**

`docs/design/portfolio-mockup-v7.html` の `<style>...</style>` の中身全体を `app/globals.css` にコピー(既存内容は全削除)し、以下だけ修正:

1. `.proposal-bar { ... }` ルールを削除
2. 冒頭にコメント `/* Design tokens & styles — ported from docs/design/portfolio-mockup-v7.html */`
3. 末尾に品質要件①のフォーカススタイルを追加:

```css
/* keyboard focus */
a:focus-visible, button:focus-visible {
  outline: 2px solid var(--sun);
  outline-offset: 3px;
  border-radius: 6px;
}
```

それ以外は1文字も変えない。

- [x] **Step 2: layout.tsx**

`app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "【氏名】 | Portfolio",
  description:
    "人を笑顔にし、心を動かすものを生み出す。PdM × Engineer × Creator のポートフォリオ。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

create-next-app 生成のフォント読み込み(next/font の Geist 等)は削除。

- [x] **Step 3: 確認+コミット**

Run: `npm run build && npm test`
Expected: 成功

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: v7モックアップのデザイントークンとスタイルを移植、focus-visible追加

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: コンテンツデータモジュール

**Files:**
- Create: `app/content.ts`
- Test: `tests/content.test.ts`

**Interfaces:**
- Consumes: なし
- Produces: 全コンポーネントが import する型と定数(下記コードが正)

- [x] **Step 1: 失敗するテスト**

`tests/content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  profile, aboutInfo, aboutParagraphs, motto, stack, timeline, projects, beyond, tickerWords,
} from "@/app/content";

describe("content", () => {
  it("has the catch phrase parts", () => {
    expect(profile.catchTop).toBe("笑顔");
    expect(profile.catchBottom).toBe("心を動かす");
  });
  it("has expected collection sizes", () => {
    expect(aboutInfo).toHaveLength(4);
    expect(aboutParagraphs).toHaveLength(2);
    expect(stack).toHaveLength(5);
    expect(timeline).toHaveLength(5);
    expect(projects).toHaveLength(3);
    expect(beyond).toHaveLength(3);
    expect(tickerWords).toHaveLength(4);
  });
  it("has the Confucius motto", () => {
    expect(motto.quote).toContain("之を楽しむ者に如かず");
    expect(motto.cite).toBe("— 論語・雍也");
  });
});
```

Run: `npm test` → Expected: FAIL(module not found)

- [x] **Step 2: content.ts 実装**

`app/content.ts`(文言は v7 モックアップから転記):

```ts
export type InfoItem = { k: string; v: string };
export type StackRow = { chip: string; cat: string; note?: string; pills: string[] };
export type TimelineItem = { when: string; title: string; desc: string; todo?: string };
export type ProjectRow = { label: string; value: string };
export type Project = { title: string; todoBadge?: string; meta: string; rows: ProjectRow[]; tags: string[] };
export type BeyondItem = { phLabel: string; title: string; desc: string };
export type TickerWord = { text: string; fill?: boolean };

export const profile = {
  name: "【氏名】",
  grad: "Portfolio — 2028卒",
  catchTop: "笑顔",
  catchBottom: "心を動かす",
  roleLine: "PdM × ENGINEER × CREATOR",
  affiliations: ["慶應義塾大学 環境情報学部", "42Tokyo"],
};

export const aboutInfo: InfoItem[] = [
  { k: "名前", v: "【氏名】" },
  { k: "所属", v: "慶應義塾大学 環境情報学部" },
  { k: "研究", v: "古谷知之研究室 — 大規模言語モデル-LLM" },
  { k: "趣味", v: "【趣味・特技 要記入】" },
];

export const aboutParagraphs = [
  "慶應義塾大学 環境情報学部(2023年9月入学)。古谷知之研究室にて自然言語処理における感情分析を研究。2024年8月、42Tokyo Piscineに合格し入学。現在は長期インターンでAIエージェントのR&DとWebアプリ開発に携わる。",
  "ラジオ、漫才、旅、そしてソフトウェア。手段は違っても、つくる理由はいつも同じ——目の前の人を笑顔にすること。クリエイターとして価値を生むことを大切にしている。",
];

export const motto = {
  quote: "之を知る者は之を好む者に如かず、之を好む者は之を楽しむ者に如かず",
  cite: "— 論語・雍也",
  vowBefore: "知る者より、好む者。好む者より、楽しむ者。だから私は、誰よりも",
  vowStrong: "「楽しむ者」",
  vowAfter: "としてつくる。",
};

export const stack: StackRow[] = [
  { chip: "Py", cat: "Python / NLP", note: "インターン・研究で使用", pills: ["Python", "PyTorch", "MeCab", "GiNZA"] },
  { chip: "AI", cat: "LLM応用", note: "個人開発・R&D", pills: ["RAG", "ベクトルDB", "AIエージェント"] },
  { chip: "TS", cat: "Web開発", note: "インターンで使用", pills: ["TypeScript", "React", "Node.js"] },
  { chip: "Ops", cat: "Infra / Tools", pills: ["Docker", "Git / GitHub"] },
];

export const timeline: TimelineItem[] = [
  { when: "2023.09", title: "慶應義塾大学 環境情報学部 入学", desc: "古谷知之研究室 — 自然言語処理・感情分析" },
  { when: "2024.08", title: "42Tokyo Piscine 合格・入学", desc: "4週間の選抜課程を経てエンジニア教育機関へ" },
  { when: "2025.07 –", title: "長期インターン | エンジニア・ITコンサルタント", desc: "AIエージェントR&D、Webアプリ開発(現在も継続中)" },
  { when: "2025.08 – 2026.03", title: "福島県復興地プロジェクト", desc: "県内高校にてAIワークショップを実施(古谷研究室)" },
  { when: "要確認", todo: "期間", title: "学生FMラジオ局「レディオ湘南」マネージャー", desc: "役割配置・スキル育成・知識継承の仕組みづくり" },
];

export const projects: Project[] = [
  {
    title: "履歴書解析AIエージェント R&D",
    todoBadge: "公開可否 要確認",
    meta: "長期インターン / 2025.07 – 2025.10",
    rows: [
      { label: "課題", value: "(会社確認後に記載 — 抽象化の可能性あり)" },
      { label: "役割", value: "R&D担当エンジニア" },
      { label: "技術選定", value: "なぜLLM/このアプローチか(記載予定)" },
      { label: "工夫", value: "LLMによるスキル抽出・構造化のアプローチ設計" },
      { label: "成果と学び", value: "(数値・導入状況・得た学びを確認後に記載)" },
    ],
    tags: ["Python", "LLM", "NLP"],
  },
  {
    title: "Webアプリ開発",
    todoBadge: "公開可否 要確認",
    meta: "長期インターン / 2025.11 – 現在",
    rows: [
      { label: "課題", value: "(会社確認後に記載)" },
      { label: "役割", value: "開発エンジニア" },
      { label: "技術選定", value: "React / Node.js / PostgreSQL の選定理由(記載予定)" },
      { label: "工夫", value: "(記載予定)" },
      { label: "成果と学び", value: "(記載予定)" },
    ],
    tags: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Discord Bot(個人開発)",
    meta: "個人開発 / GitHub公開",
    rows: [
      { label: "課題", value: "コミュニティ内の知識散逸 — 過去ログから答えられる仕組みがない" },
      { label: "役割", value: "企画・設計・実装すべて" },
      { label: "技術選定", value: "RAG+ベクトルDBを選んだ理由(記載予定)" },
      { label: "工夫", value: "文脈を保った検索・応答パイプラインの設計" },
      { label: "成果と学び", value: "(利用数など数値を追記予定)" },
    ],
    tags: ["RAG", "ベクトルDB", "Python"],
  },
];

export const beyond: BeyondItem[] = [
  { phLabel: "素材待ち:旅の写真", title: "海外一人旅 2ヶ月", desc: "陸路での国境越え。現地住民へのインタビュー。Instagram動画は1万いいねを超えた。" },
  { phLabel: "素材待ち:ステージ写真", title: "漫才ステージ", desc: "脚本から立ち姿まで、自分でつくって舞台に立つ。笑いは最速で人を笑顔にする手段。" },
  { phLabel: "素材待ち:ワークショップ写真", title: "福島 AIワークショップ", desc: "福島の高校生へAIの面白さを届ける。テクノロジーを「体験」してもらう試み。" },
];

export const tickerWords: TickerWord[] = [
  { text: "MAKE THEM SMILE" },
  { text: "笑顔", fill: true },
  { text: "MOVE THEIR HEART" },
  { text: "心", fill: true },
];

export const contact = {
  github: "hinata-111", // TODO: GitHubプロフィールURL
  email: "yos570038@gmail.com", // TODO: mailto:
};
```

- [x] **Step 3: テスト実行+コミット**

Run: `npm test` → Expected: PASS

```bash
git add app/content.ts tests/content.test.ts
git commit -m "feat: 全文言を型付きコンテンツモジュールに集約

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Reveal フック+セクション見出し

**Files:**
- Create: `app/components/Reveal.tsx`, `app/components/SectionHead.tsx`
- Test: `tests/reveal.test.tsx`

**Interfaces:**
- Consumes: globals.css の `.rv` `.in` `.rv-dN` `.sec-head` クラス
- Produces: `<Reveal as="li" delay={2} className="...">{children}</Reveal>`(クライアント)、`<SectionHead num="01" label="About" />`(サーバー)

- [x] **Step 1: 失敗するテスト**

`tests/reveal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Reveal from "@/app/components/Reveal";
import SectionHead from "@/app/components/SectionHead";

describe("Reveal", () => {
  it("renders children with given tag and className", () => {
    render(
      <Reveal as="section" className="foo" data-testid="rv">
        <p>hello</p>
      </Reveal>
    );
    const el = screen.getByTestId("rv");
    expect(el.tagName).toBe("SECTION");
    expect(el).toHaveClass("foo");
  });
});

describe("SectionHead", () => {
  it("renders number and label", () => {
    render(<SectionHead num="01" label="About" />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });
});
```

Run: `npm test` → FAIL

- [x] **Step 2: Reveal.tsx**

`app/components/Reveal.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, type ElementType, type ComponentPropsWithoutRef } from "react";

type RevealProps<T extends ElementType> = {
  as?: T;
  delay?: 0 | 1 | 2 | 3;
} & ComponentPropsWithoutRef<T>;

export default function Reveal<T extends ElementType = "div">({
  as,
  delay = 0,
  className = "",
  children,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (
      typeof IntersectionObserver === "undefined" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return; // 即表示
    }
    setActive(true);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = [
    className,
    active ? "rv" : "",
    active && delay > 0 ? `rv-d${delay}` : "",
    inView ? "in" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag ref={ref} className={cls} {...rest}>
      {children}
    </Tag>
  );
}
```

- [x] **Step 3: SectionHead.tsx**

`app/components/SectionHead.tsx`:

```tsx
export default function SectionHead({ num, label }: { num: string; label: string }) {
  return (
    <div className="sec-head">
      <span className="sec-num mono">{num}</span>
      <span className="sec-label mono">{label}</span>
    </div>
  );
}
```

- [x] **Step 4: テスト+コミット**

Run: `npm test` → PASS

```bash
git add app/components/Reveal.tsx app/components/SectionHead.tsx tests/reveal.test.tsx
git commit -m "feat: スクロールリビールとセクション見出しコンポーネント

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Hero(演出込み)

**Files:**
- Create: `app/components/Hero.tsx`(サーバー), `app/components/HeroEffects.tsx`(クライアント), `app/components/CursorLight.tsx`(クライアント)
- Test: `tests/hero.test.tsx`

**Interfaces:**
- Consumes: `content.ts` の `profile` `tickerWords`
- Produces: `<Hero />`(内部で HeroEffects を配置)、`<CursorLight />`(page.tsx が body 直下相当に配置)

**品質要件②③④をここで実装**: Canvas は IntersectionObserver で画面外時に rAF 停止 / mousemove は rAF スロットリング / resize は 150ms debounce。

- [x] **Step 1: 失敗するテスト**

`tests/hero.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Hero from "@/app/components/Hero";

describe("Hero", () => {
  it("renders catch phrase with two highlighted words", () => {
    render(<Hero />);
    expect(screen.getByText("笑顔")).toHaveClass("hl");
    expect(screen.getByText("心を動かす")).toHaveClass("hl");
    expect(screen.getByText("【氏名】")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
  it("renders ticker words", () => {
    render(<Hero />);
    expect(screen.getAllByText("MAKE THEM SMILE").length).toBeGreaterThanOrEqual(4);
  });
});
```

Run: `npm test` → FAIL

- [x] **Step 2: Hero.tsx**

`app/components/Hero.tsx`:

```tsx
import { profile, tickerWords } from "@/app/content";
import HeroEffects from "@/app/components/HeroEffects";

export default function Hero() {
  const repeats = 4; // シームレスループ用に4回繰り返し(トラックを-50%移動)
  return (
    <header className="hero">
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <HeroEffects />
      <div className="hero-inner">
        <div className="hero-eyebrow mono">{profile.grad}</div>
        <h1 className="serif">
          人を<span className="hl">{profile.catchTop}</span>にし、
          <br />
          <span className="hl">{profile.catchBottom}</span>ものを生み出す。
        </h1>
        <div className="role-line mono">{profile.roleLine}</div>
        <div className="hero-sub">
          <span className="name">{profile.name}</span>
          {profile.affiliations.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true" />
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {Array.from({ length: repeats }).flatMap((_, r) =>
            tickerWords.map((w, i) => (
              <span key={`${r}-${i}`} className={w.fill ? "fill" : undefined}>
                {w.text}
              </span>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
```

- [x] **Step 3: HeroEffects.tsx(Canvas 粒子)**

`app/components/HeroEffects.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number; y: number; r: number;
  vx: number; vy: number;
  tw: number; tws: number; depth: number;
};

export default function HeroEffects() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let mx = 0.5, my = 0.5;
    let raf = 0;
    let visible = true;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150); // 品質要件④ debounce
    };
    window.addEventListener("resize", onResize);

    const parts: Particle[] = Array.from({ length: 55 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 2.2 + 0.6,
      vy: -(Math.random() * 0.012 + 0.004),
      vx: (Math.random() - 0.5) * 0.008,
      tw: Math.random() * Math.PI * 2,
      tws: Math.random() * 0.03 + 0.01,
      depth: Math.random() * 0.7 + 0.3,
    }));

    let mouseQueued = false;
    const onMouse = (e: MouseEvent) => {
      if (mouseQueued) return; // 品質要件③ rAFスロットリング
      mouseQueued = true;
      requestAnimationFrame(() => {
        mx = e.clientX / window.innerWidth;
        my = e.clientY / window.innerHeight;
        mouseQueued = false;
      });
    };
    document.addEventListener("mousemove", onMouse);

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y += p.vy * p.depth;
        p.x += p.vx * p.depth;
        p.tw += p.tws;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        const px = (p.x + (mx - 0.5) * 0.04 * p.depth) * W;
        const py = (p.y + (my - 0.5) * 0.04 * p.depth) * H;
        const a = (0.25 + Math.sin(p.tw) * 0.2) * p.depth;
        ctx.beginPath();
        ctx.arc(px, py, p.r * p.depth, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,197,61,${a.toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    // 品質要件② 画面外では rAF 停止
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(tick);
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouse);
      clearTimeout(resizeTimer);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />;
}
```

- [x] **Step 4: CursorLight.tsx**

`app/components/CursorLight.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

export default function CursorLight() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(pointer: fine)").matches) return;

    let queued = false;
    const onMouse = (e: MouseEvent) => {
      if (queued) return; // rAFスロットリング
      queued = true;
      requestAnimationFrame(() => {
        el.classList.add("on");
        el.style.background = `radial-gradient(circle 260px at ${e.clientX}px ${e.clientY}px, rgba(255,197,61,.07), transparent 70%)`;
        queued = false;
      });
    };
    document.addEventListener("mousemove", onMouse);
    return () => document.removeEventListener("mousemove", onMouse);
  }, []);

  return <div ref={ref} className="cursor-light" aria-hidden="true" />;
}
```

- [x] **Step 5: テスト+コミット**

Run: `npm test` → PASS

```bash
git add app/components/Hero.tsx app/components/HeroEffects.tsx app/components/CursorLight.tsx tests/hero.test.tsx
git commit -m "feat: Hero(粒子・ティッカー・カーソルライト演出込み)を実装

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: About(座右の銘込み)+ Skills

**Files:**
- Create: `app/components/About.tsx`, `app/components/Skills.tsx`
- Test: `tests/about-skills.test.tsx`

**Interfaces:**
- Consumes: `content.ts` の `aboutInfo` `aboutParagraphs` `motto` `stack`、`SectionHead`、`Reveal`
- Produces: `<About />`(section#about)、`<Skills />`(section#skills)

- [x] **Step 1: 失敗するテスト**

`tests/about-skills.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";

describe("About", () => {
  it("renders info list, story and motto", () => {
    render(<About />);
    expect(document.getElementById("about")).not.toBeNull();
    expect(document.querySelectorAll(".about-info li")).toHaveLength(4);
    expect(screen.getByText(/之を楽しむ者に如かず/)).toBeInTheDocument();
    expect(screen.getByText("「楽しむ者」")).toBeInTheDocument();
    expect(screen.getByText("素材待ち:プロフィール写真")).toBeInTheDocument();
  });
});

describe("Skills", () => {
  it("renders 5 stack rows with pills", () => {
    render(<Skills />);
    expect(document.getElementById("skills")).not.toBeNull();
    expect(document.querySelectorAll(".stack-row")).toHaveLength(5);
    expect(screen.getByText("PyTorch")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });
});
```

Run: `npm test` → FAIL

- [x] **Step 2: About.tsx**

`app/components/About.tsx`:

```tsx
import { aboutInfo, aboutParagraphs, motto } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function About() {
  return (
    <section id="about" style={{ padding: "72px 0 64px" }}>
      <Reveal>
        <SectionHead num="01" label="About" />
      </Reveal>
      <Reveal as="h2">ものづくりの原点は、目の前の人の反応。</Reveal>
      <Reveal className="about-grid">
        <div>
          <div className="about-photo mono">素材待ち:プロフィール写真</div>
          <ul className="about-info">
            {aboutInfo.map((item) => (
              <li key={item.k}>
                <span className="k mono">{item.k}</span>
                <span className="v">{item.v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="about-story">
          {aboutParagraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Reveal>
      <Reveal className="motto">
        <blockquote className="serif">
          {motto.quote.split("、")[0]}、<br />
          {motto.quote.split("、")[1]}
        </blockquote>
        <cite className="mono">{motto.cite}</cite>
        <p className="vow">
          {motto.vowBefore}
          <b>{motto.vowStrong}</b>
          {motto.vowAfter}
        </p>
      </Reveal>
    </section>
  );
}
```

- [x] **Step 3: Skills.tsx**

`app/components/Skills.tsx`:

```tsx
import { stack } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function Skills() {
  return (
    <section id="skills">
      <Reveal>
        <SectionHead num="02" label="Skills" />
      </Reveal>
      <Reveal as="h2">技術スタック</Reveal>
      <div className="stack">
        {stack.map((row, i) => (
          <Reveal key={row.cat} className="stack-row" delay={(i % 4) as 0 | 1 | 2 | 3}>
            <div className="cat">
              <span className="chip mono">{row.chip}</span>
              <span>
                <b>{row.cat}</b>
                {row.note && <i>{row.note}</i>}
              </span>
            </div>
            <div className="stack-pills">
              {row.pills.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [x] **Step 4: テスト+コミット**

Run: `npm test` → PASS

```bash
git add app/components/About.tsx app/components/Skills.tsx tests/about-skills.test.tsx
git commit -m "feat: About(座右の銘込み)とSkillsセクションを実装

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Experience + Projects + Beyond

**Files:**
- Create: `app/components/Experience.tsx`, `app/components/Projects.tsx`, `app/components/Beyond.tsx`
- Test: `tests/sections.test.tsx`

**Interfaces:**
- Consumes: `content.ts` の `timeline` `projects` `beyond`、`SectionHead`、`Reveal`
- Produces: `<Experience />`(#experience)、`<Projects />`(#projects)、`<Beyond />`(#beyond)

- [x] **Step 1: 失敗するテスト**

`tests/sections.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";

describe("Experience", () => {
  it("renders 5 timeline items with todo badge on radio", () => {
    render(<Experience />);
    expect(document.querySelectorAll(".timeline li")).toHaveLength(5);
    expect(screen.getByText("期間")).toHaveClass("todo");
  });
});

describe("Projects", () => {
  it("renders 3 projects with rows and tags", () => {
    render(<Projects />);
    expect(document.querySelectorAll(".project")).toHaveLength(3);
    expect(screen.getAllByText("公開可否 要確認")).toHaveLength(2);
    expect(screen.getAllByText("課題")).toHaveLength(3);
  });
});

describe("Beyond", () => {
  it("renders 3 cards with photo placeholders", () => {
    render(<Beyond />);
    expect(document.querySelectorAll(".beyond")).toHaveLength(3);
    expect(screen.getByText("素材待ち:旅の写真")).toBeInTheDocument();
  });
});
```

Run: `npm test` → FAIL

- [x] **Step 2: Experience.tsx**

`app/components/Experience.tsx`:

```tsx
import { timeline } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function Experience() {
  return (
    <section id="experience">
      <Reveal>
        <SectionHead num="03" label="Experience" />
      </Reveal>
      <Reveal as="h2">経歴</Reveal>
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

- [x] **Step 3: Projects.tsx**

`app/components/Projects.tsx`:

```tsx
import { projects } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function Projects() {
  return (
    <section id="projects">
      <Reveal>
        <SectionHead num="04" label="Projects" />
      </Reveal>
      <Reveal as="h2">プロジェクト</Reveal>
      {projects.map((p) => (
        <Reveal as="article" key={p.title} className="project">
          <h3>
            {p.title}
            {p.todoBadge && <span className="todo">{p.todoBadge}</span>}
          </h3>
          <div className="meta mono">{p.meta}</div>
          <dl className="prs">
            {p.rows.map((r) => (
              <div key={r.label} style={{ display: "contents" }}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
          <div className="tags">
            {p.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      ))}
      <Reveal
        as="p"
        className="lede center"
        style={{ color: "var(--muted)", fontSize: 14, marginTop: 28 }}
      >
        その他の制作物は GitHub を参照 →
      </Reveal>
    </section>
  );
}
```

- [x] **Step 4: Beyond.tsx**

`app/components/Beyond.tsx`:

```tsx
import { beyond } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function Beyond() {
  return (
    <section id="beyond">
      <Reveal>
        <SectionHead num="05" label="Beyond Code" />
      </Reveal>
      <Reveal as="h2">コードの外側でも、人を笑顔に。</Reveal>
      <div className="beyond-grid">
        {beyond.map((b, i) => (
          <Reveal key={b.title} className="beyond" delay={(i % 4) as 0 | 1 | 2 | 3}>
            <div className="ph mono">{b.phLabel}</div>
            <div className="body">
              <b>{b.title}</b>
              <p>{b.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [x] **Step 5: テスト+コミット**

Run: `npm test` → PASS

```bash
git add app/components/Experience.tsx app/components/Projects.tsx app/components/Beyond.tsx tests/sections.test.tsx
git commit -m "feat: Experience・Projects・Beyond Codeセクションを実装

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Contact・ConsoleEgg・ページ組み立て

**Files:**
- Create: `app/components/Contact.tsx`, `app/components/ContactFab.tsx`, `app/components/ConsoleEgg.tsx`
- Modify: `app/page.tsx`(全置換)
- Test: `tests/page.test.tsx`

**Interfaces:**
- Consumes: 全コンポーネント、`content.ts` の `contact` `profile` `motto`
- Produces: 完成した 1 ページ

- [x] **Step 1: 失敗するテスト**

`tests/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("renders all sections, fab and footer", () => {
    render(<Home />);
    ["about", "skills", "experience", "projects", "beyond", "contact"].forEach((id) =>
      expect(document.getElementById(id)).not.toBeNull()
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("笑顔");
    expect(screen.getByText("一緒に楽しみましょう")).toBeInTheDocument();
    expect(document.querySelector(".contact-fab")).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
  it("logs the console easter egg on mount", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<Home />);
    const logged = spy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(logged).toContain("SPOTLIGHT ON");
    spy.mockRestore();
  });
});
```

Run: `npm test` → FAIL

- [x] **Step 2: Contact.tsx / ContactFab.tsx**

`app/components/Contact.tsx`:

```tsx
import { contact } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function Contact() {
  return (
    <section id="contact">
      <Reveal>
        <SectionHead num="06" label="Contact" />
      </Reveal>
      <Reveal as="h2">一緒に楽しみましょう</Reveal>
      <Reveal className="contact-row">
        <a className="btn btn-primary" href={contact.github}>
          GitHub <span className="arr">→</span>
        </a>
        <a className="btn btn-ghost" href={contact.email}>
          Email <span className="arr">→</span>
        </a>
      </Reveal>
    </section>
  );
}
```

`app/components/ContactFab.tsx`:

```tsx
export default function ContactFab() {
  return (
    <a className="contact-fab mono" href="#contact">
      Contact <span className="arr">→</span>
    </a>
  );
}
```

- [x] **Step 3: ConsoleEgg.tsx**

`app/components/ConsoleEgg.tsx`:

```tsx
"use client";

import { useEffect } from "react";

export default function ConsoleEgg() {
  useEffect(() => {
    const amber = "color:#FFC53D; font-weight:bold;";
    const dim = "color:#93A0B4;";
    const strong = "color:#FFFFFF; font-weight:bold;";
    console.log(
      "%c\n   \\ | /\n  ─ ◯ ─   %cSPOTLIGHT ON.%c\n   / | \\\n",
      amber, strong, ""
    );
    console.log(
      "%c「之を知る者は之を好む者に如かず、\n 之を好む者は之を楽しむ者に如かず」 %c— 論語\n",
      amber, dim
    );
    console.log(
      "%c知っているだけの人より、好きな人。好きな人より、楽しんでいる人にはかなわない。\n私は「楽しむ者」としてコードを書き、モノをつくる。\nそしてつくったもので、目の前の人を笑顔にする。\n",
      "color:#E8EAF0;"
    );
    console.log("%cこのソースを読みに来たあなたへ — 話しましょう。→ #contact", dim);
  }, []);

  return null;
}
```

- [x] **Step 4: page.tsx 組み立て**

`app/page.tsx`:

```tsx
import Hero from "@/app/components/Hero";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
import Contact from "@/app/components/Contact";
import ContactFab from "@/app/components/ContactFab";
import CursorLight from "@/app/components/CursorLight";
import ConsoleEgg from "@/app/components/ConsoleEgg";
import { profile } from "@/app/content";

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="wrap">
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Beyond />
        <Contact />
        <footer className="mono">© 2026 {profile.name} — built with Next.js</footer>
      </div>
      <ContactFab />
      <CursorLight />
      <ConsoleEgg />
    </main>
  );
}
```

- [x] **Step 5: テスト+ビルド+目視**

Run: `npm test && npm run build`
Expected: 全 PASS・ビルド成功

Run: `npm run dev`(バックグラウンド)→ `http://localhost:3000` をブラウザで確認:
- モックアップ v7 と見た目一致(開幕点灯・粒子・ティッカー・カーソルライト・マーカースイープ)
- F12 コンソールに隠しメッセージ
- モバイル幅(375px)崩れなし、ライト/ダーク両テーマ
- Tab キーでフォーカスリング表示

- [x] **Step 6: コミット**

```bash
git add app/components/Contact.tsx app/components/ContactFab.tsx app/components/ConsoleEgg.tsx app/page.tsx tests/page.test.tsx
git commit -m "feat: Contact・console隠しメッセージ・ページ組み立てで1ページ完成

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: README+デプロイ準備

**Files:**
- Modify: `README.md`(全置換)

- [ ] **Step 1: README.md**

内容(コードフェンスは通常のバッククォート3つ):

```markdown
# Portfolio 2025

就活用ポートフォリオサイト。「人を笑顔にし、心を動かすものを生み出す」。

## Tech Stack
- Next.js (App Router) + TypeScript
- 素の CSS(デザイントークン、ダーク/ライト対応)— 外部 UI ライブラリなし
- Canvas API による Hero 演出(画面外では rAF 停止、reduced-motion 対応)
- Vitest + React Testing Library

## Development
npm install / npm run dev / npm test / npm run build

## Architecture
- `app/content.ts` — 全コンテンツを型付きデータで集約。プロジェクト・経歴の追加はデータ1要素の追加のみ
- `app/components/` — セクション単位の独立コンポーネント。クライアント処理は Reveal / HeroEffects / CursorLight / ConsoleEgg に隔離
- 設計書: `docs/superpowers/specs/2026-07-07-portfolio-design.md`
- モックアップ: `docs/design/portfolio-mockup-v7.html`

## Deploy
Vercel にインポートしてデフォルト設定でデプロイ。
```

- [ ] **Step 2: 最終確認+コミット**

Run: `npm test && npm run build` → 成功

```bash
git add README.md
git commit -m "docs: READMEを追加

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 3: デプロイ(ユーザー作業)**

GitHub push・Vercel 連携は本人が実施(アカウント認証は代行不可):
1. `gh repo create` または GitHub 上で作成して push
2. vercel.com → Add New Project → リポジトリ選択 → Deploy
3. 発行 URL 確認

---

## 残タスク(素材が届き次第 content.ts を差し替え)

- `【氏名】`(content.ts と layout.tsx の title)
- `【趣味・特技 要記入】`
- `contact.github` / `contact.email`
- インターン2案件の課題/技術選定/工夫/成果(公開可否確認後)
- レディオ湘南の期間
- 写真4枚(プロフィール・旅・漫才・福島)→ `.ph`/`.about-photo` を `next/image` に置換
- OGP 画像(`app/opengraph-image.png` 配置のみ)
