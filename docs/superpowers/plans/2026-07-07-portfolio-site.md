# 就活ポートフォリオサイト Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 設計書(`docs/superpowers/specs/2026-07-07-portfolio-design.md`)と確定モックアップ(`docs/design/portfolio-mockup-v4.html`)どおりの1ページポートフォリオサイトを Next.js で実装し、Vercel で公開できる状態にする。

**Architecture:** Next.js App Router の単一ページ構成。コンテンツは型付きデータモジュール(`content.ts`)に集約し、各セクションは独立した React コンポーネント。スタイルはモックアップ v4 の CSS(デザイントークン+クラス)を `globals.css` にそのまま移植する(Tailwind は使わない — v4 の CSS が完成品でありそのまま移植が最も忠実・軽量なため。スクロール演出は IntersectionObserver のカスタムフック)。

**Tech Stack:** Next.js 15+(App Router, TypeScript)/ 素の CSS(デザイントークン)/ Vitest + React Testing Library / Vercel

## Global Constraints

- コンテンツの文言・色・数値はすべてモックアップ `docs/design/portfolio-mockup-v4.html` と設計書から**そのまま**転記する。勝手に創作・補完しない
- 未確定情報はモックアップどおりプレースホルダー(`【氏名】`、`(記載予定)`、`要確認` バッジ)のまま実装する
- アクセント色 `#FFC53D` / `#E8A013`、ダーク地 `#101722`、角丸 32/22/16px・ピル 999px(トークン全値は v4 の `<style>` 冒頭 `:root` 群)
- 全アニメーションは `prefers-reduced-motion: reduce` で無効化
- 外部ライブラリ追加は本計画記載分のみ(YAGNI)
- コミットメッセージ末尾: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: Next.js プロジェクト scaffold + テスト基盤

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`(create-next-app 生成)
- Create: `vitest.config.mts`, `vitest.setup.ts`
- Test: `tests/smoke.test.tsx`

**Interfaces:**
- Consumes: なし(最初のタスク)
- Produces: `npm run dev` / `npm run build` / `npm test` が動く土台。後続タスクは `app/` 配下と `tests/` 配下に追加していく

- [ ] **Step 1: create-next-app 実行**

リポジトリ直下(`C:\Users\yos57\home\myApp\Portfolio-2025`)で:

```bash
npx create-next-app@latest . --ts --app --no-tailwind --no-eslint --no-src-dir --import-alias "@/*" --use-npm --skip-install=false
```

対話プロンプトが出たら: Turbopack → Yes。既存 `docs/` `.gitignore` は上書きされない(された場合は `git checkout -- .gitignore docs` で復元し、create-next-app が生成した `.gitignore` の内容を既存に追記)。

- [ ] **Step 2: 動作確認**

Run: `npm run build`
Expected: `✓ Compiled successfully` で終了コード 0

- [ ] **Step 3: テスト基盤インストール**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 4: Vitest 設定ファイル作成**

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

`package.json` の scripts に追加:

```json
"test": "vitest run"
```

- [ ] **Step 5: 失敗するスモークテストを書く**

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

Run: `npm test`
Expected: FAIL(create-next-app デフォルトの page.tsx に `<main>` はあるので PASS する場合もある。PASS したらそのまま次へ — 基盤動作確認が目的)

- [ ] **Step 6: page.tsx を最小シェルに置換**

`app/page.tsx`:

```tsx
export default function Home() {
  return <main />;
}
```

Run: `npm test`
Expected: PASS (1 passed)

- [ ] **Step 7: コミット**

```bash
git add -A ':!.playwright-mcp'
git commit -m "chore: Next.js scaffold と Vitest テスト基盤をセットアップ

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: デザイントークンとグローバル CSS の移植

**Files:**
- Modify: `app/globals.css`(全置換)
- Modify: `app/layout.tsx`(全置換)
- Test: `npm run build` + 目視(このタスクは CSS のためユニットテストなし)

**Interfaces:**
- Consumes: Task 1 の scaffold
- Produces: v4 モックアップと同一のクラス群(`.hero` `.panelbox` `.sec-head` `.sec-num` `.sec-label` `.skill` `.chip` `.timeline` `.when` `.dot` `.what` `.project` `.prs` `.tags` `.tag` `.todo` `.beyond-grid` `.beyond` `.ph` `.body` `.contact-row` `.btn` `.btn-primary` `.btn-ghost` `.arr` `.nav` `.nav-pill` `.cta` `.hl` `.hero-eyebrow` `.role-line` `.hero-sub` `.name` `.wrap` `.serif` `.mono` `.center` `.lede` `.rv` `.rv-d1..3` `.in`)。後続の全コンポーネントはこのクラスを className で使う

- [ ] **Step 1: globals.css へ CSS を移植**

`docs/design/portfolio-mockup-v4.html` の `<style>...</style>` の中身**全体**を `app/globals.css` にコピーし(既存内容は全削除)、以下だけ修正:

1. `.proposal-bar { ... }` のルールを削除(提案用バーは本番に載せない)
2. 冒頭に `/* Design tokens & styles — ported from docs/design/portfolio-mockup-v4.html */` のコメントを追加

それ以外は 1 文字も変えない。

- [ ] **Step 2: layout.tsx を作成**

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

create-next-app が生成したフォント読み込み(`next/font` の Geist 等)は削除(システムフォントスタックを使うため)。

- [ ] **Step 3: ビルド確認**

Run: `npm run build && npm test`
Expected: 両方成功

- [ ] **Step 4: コミット**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: v4モックアップのデザイントークンとスタイルを移植

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: コンテンツデータモジュール

**Files:**
- Create: `app/content.ts`
- Test: `tests/content.test.ts`

**Interfaces:**
- Consumes: なし
- Produces: 後続コンポーネントが import する型と定数。`profile`(name, grad, catchTop, catchBottom, roleLine, affiliations: string[]), `aboutParagraphs: string[]`, `skills: Skill[]`(chip, title, desc), `timeline: TimelineItem[]`(when, title, desc, todo?), `projects: Project[]`(title, todoBadge?, meta, rows: {label, value}[], tags: string[]), `beyond: BeyondItem[]`(phLabel, title, desc), `contact`(github, email), `navItems: {href, label, cta?}[]`

- [ ] **Step 1: 失敗するテストを書く**

`tests/content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  profile, aboutParagraphs, skills, timeline, projects, beyond, navItems,
} from "@/app/content";

describe("content", () => {
  it("has the value phrase split for marker highlight", () => {
    expect(profile.catchTop).toBe("笑顔");
    expect(profile.catchBottom).toBe("心を動かす");
  });
  it("has 5 skills, 5 timeline items, 3 projects, 3 beyond items", () => {
    expect(skills).toHaveLength(5);
    expect(timeline).toHaveLength(5);
    expect(projects).toHaveLength(3);
    expect(beyond).toHaveLength(3);
  });
  it("has 6 nav items ending with Contact CTA", () => {
    expect(navItems).toHaveLength(6);
    expect(navItems[5]).toMatchObject({ label: "Contact", cta: true });
  });
  it("about has 2 paragraphs", () => {
    expect(aboutParagraphs).toHaveLength(2);
  });
});
```

Run: `npm test`
Expected: FAIL — `Cannot find module '@/app/content'`

- [ ] **Step 2: content.ts を実装**

`app/content.ts`(文言はモックアップ v4 から転記):

```ts
export type Skill = { chip: string; title: string; desc: string };
export type TimelineItem = { when: string; title: string; desc: string; todo?: string };
export type ProjectRow = { label: string; value: string };
export type Project = { title: string; todoBadge?: string; meta: string; rows: ProjectRow[]; tags: string[] };
export type BeyondItem = { phLabel: string; title: string; desc: string };
export type NavItem = { href: string; label: string; cta?: boolean };

export const profile = {
  name: "【氏名】",
  grad: "Portfolio — 2028卒",
  catchTop: "笑顔",
  catchBottom: "心を動かす",
  roleLine: "PdM × ENGINEER × CREATOR",
  affiliations: ["慶應義塾大学 環境情報学部", "42Tokyo"],
};

export const aboutParagraphs = [
  "慶應義塾大学 環境情報学部(2023年9月入学)。古谷知之研究室にて自然言語処理における感情分析を研究。2024年8月、42Tokyo Piscineに合格し入学。",
  "ラジオ、漫才、旅、そしてソフトウェア。手段は違っても、つくる理由はいつも同じ——目の前の人を笑顔にすること。",
];

export const skills: Skill[] = [
  { chip: "Py", title: "Python — LLM / NLP", desc: "PyTorch・MeCab・GiNZA。インターン・研究で使用" },
  { chip: "AI", title: "LLM応用", desc: "RAG・ベクトルDB・AIエージェント開発" },
  { chip: "TS", title: "TypeScript", desc: "React・Node.js によるWebアプリ開発" },
  { chip: "DB", title: "Database", desc: "PostgreSQL" },
  { chip: "Ops", title: "Infra / Tools", desc: "Docker・Git / GitHub" },
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
  { phLabel: "素材待ち:ワークショップ写真", title: "福島 AIワークショップ", desc: "復興地の高校生へAIの面白さを届ける。テクノロジーを「体験」として手渡す試み。" },
];

export const contact = {
  github: "#", // TODO: GitHubプロフィールURLに差し替え
  email: "#", // TODO: mailto: に差し替え
};

export const navItems: NavItem[] = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#beyond", label: "Beyond" },
  { href: "#contact", label: "Contact", cta: true },
];
```

- [ ] **Step 3: テスト実行**

Run: `npm test`
Expected: PASS (content の4テスト+スモーク)

- [ ] **Step 4: コミット**

```bash
git add app/content.ts tests/content.test.ts
git commit -m "feat: サイト全文言を型付きコンテンツモジュールに集約

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: リビールフック(スクロール演出)

**Files:**
- Create: `app/components/Reveal.tsx`
- Test: `tests/reveal.test.tsx`

**Interfaces:**
- Consumes: globals.css の `.rv` `.in` `.rv-d1..3` クラス
- Produces: `<Reveal as="div" className="..." delay={0..3}>{children}</Reveal>` — クライアントコンポーネント。`as` は任意のタグ名(デフォルト `div`)、`delay` は `.rv-dN` 付与。IntersectionObserver 交差時に `.in` を付与。reduced-motion または IO 非対応環境では `.rv` を付けない(即表示)

- [ ] **Step 1: 失敗するテストを書く**

`tests/reveal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Reveal from "@/app/components/Reveal";

describe("Reveal", () => {
  it("renders children with given tag and className", () => {
    render(
      <Reveal as="section" className="panelbox" data-testid="rv">
        <p>hello</p>
      </Reveal>
    );
    const el = screen.getByTestId("rv");
    expect(el.tagName).toBe("SECTION");
    expect(el).toHaveClass("panelbox");
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});
```

Run: `npm test`
Expected: FAIL — `Cannot find module '@/app/components/Reveal'`

- [ ] **Step 2: Reveal.tsx を実装**

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
  const [active, setActive] = useState(false); // .rv を付けるか(マウント後に判定)
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (
      typeof IntersectionObserver === "undefined" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return; // 即表示のまま
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

- [ ] **Step 3: テスト実行**

Run: `npm test`
Expected: PASS(jsdom は IO 未定義 → `.rv` 付かず即表示分岐が動く)

- [ ] **Step 4: コミット**

```bash
git add app/components/Reveal.tsx tests/reveal.test.tsx
git commit -m "feat: IntersectionObserverによるスクロールリビールを追加

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Nav・Hero・セクション枠コンポーネント

**Files:**
- Create: `app/components/Nav.tsx`, `app/components/Hero.tsx`, `app/components/Panel.tsx`
- Test: `tests/nav-hero.test.tsx`

**Interfaces:**
- Consumes: `content.ts` の `navItems` `profile`、globals.css クラス
- Produces: `<Nav />`(浮遊ピルナビ)、`<Hero />`、`<Panel id num label heading>{children}</Panel>` — `num` は `"01"` 等の文字列、`label` はセクション英名、`heading` は h2 文言。Panel は `<section id><div class="panelbox"><Reveal(sec-head)><Reveal(h2)>` を内包

- [ ] **Step 1: 失敗するテストを書く**

`tests/nav-hero.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Nav from "@/app/components/Nav";
import Hero from "@/app/components/Hero";
import Panel from "@/app/components/Panel";

describe("Nav", () => {
  it("renders 6 links with Contact as CTA", () => {
    render(<Nav />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(6);
    expect(links[5]).toHaveTextContent("Contact");
    expect(links[5]).toHaveClass("cta");
  });
});

describe("Hero", () => {
  it("renders catch phrase with two highlighted words", () => {
    render(<Hero />);
    expect(screen.getByText("笑顔")).toHaveClass("hl");
    expect(screen.getByText("心を動かす")).toHaveClass("hl");
    expect(screen.getByText("【氏名】")).toBeInTheDocument();
  });
});

describe("Panel", () => {
  it("renders section with id, number, label and heading", () => {
    render(
      <Panel id="about" num="01" label="About" heading="テスト見出し">
        <p>中身</p>
      </Panel>
    );
    expect(document.getElementById("about")).not.toBeNull();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("テスト見出し");
    expect(screen.getByText("中身")).toBeInTheDocument();
  });
});
```

Run: `npm test`
Expected: FAIL — モジュール未定義

- [ ] **Step 2: Nav.tsx 実装**

`app/components/Nav.tsx`:

```tsx
import { navItems } from "@/app/content";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-pill mono">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} className={item.cta ? "cta" : undefined}>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Hero.tsx 実装**

`app/components/Hero.tsx`:

```tsx
import { profile } from "@/app/content";

export default function Hero() {
  return (
    <header className="hero">
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
    </header>
  );
}
```

- [ ] **Step 4: Panel.tsx 実装**

`app/components/Panel.tsx`:

```tsx
import Reveal from "@/app/components/Reveal";

type PanelProps = {
  id: string;
  num: string;
  label: string;
  heading: string;
  children: React.ReactNode;
};

export default function Panel({ id, num, label, heading, children }: PanelProps) {
  return (
    <section id={id}>
      <div className="panelbox">
        <Reveal className="sec-head">
          <span className="sec-num mono">{num}</span>
          <span className="sec-label mono">{label}</span>
        </Reveal>
        <Reveal as="h2">{heading}</Reveal>
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: テスト実行**

Run: `npm test`
Expected: PASS(全ファイル)

- [ ] **Step 6: コミット**

```bash
git add app/components/Nav.tsx app/components/Hero.tsx app/components/Panel.tsx tests/nav-hero.test.tsx
git commit -m "feat: ナビ・ヒーロー・セクションパネルのコンポーネントを実装

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Skills・Experience セクション

**Files:**
- Create: `app/components/Skills.tsx`, `app/components/Experience.tsx`
- Test: `tests/sections.test.tsx`

**Interfaces:**
- Consumes: `content.ts` の `skills` `timeline`、`Panel`、`Reveal`
- Produces: `<Skills />`(Panel 02 内にチップ付きカード)、`<Experience />`(Panel 03 内にタイムライン)

- [ ] **Step 1: 失敗するテストを書く**

`tests/sections.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Skills from "@/app/components/Skills";
import Experience from "@/app/components/Experience";

describe("Skills", () => {
  it("renders 5 skill cards with chips", () => {
    render(<Skills />);
    expect(screen.getByText("Python — LLM / NLP")).toBeInTheDocument();
    expect(screen.getByText("Py")).toHaveClass("chip");
    expect(document.querySelectorAll(".skill")).toHaveLength(5);
  });
});

describe("Experience", () => {
  it("renders 5 timeline items with todo badge on the last", () => {
    render(<Experience />);
    expect(document.querySelectorAll(".timeline li")).toHaveLength(5);
    expect(screen.getByText("期間")).toHaveClass("todo");
    expect(screen.getByText(/レディオ湘南/)).toBeInTheDocument();
  });
});
```

Run: `npm test`
Expected: FAIL

- [ ] **Step 2: Skills.tsx 実装**

`app/components/Skills.tsx`:

```tsx
import { skills } from "@/app/content";
import Panel from "@/app/components/Panel";
import Reveal from "@/app/components/Reveal";

export default function Skills() {
  return (
    <Panel id="skills" num="02" label="Skills" heading="技術スタック">
      <div className="skill-grid">
        {skills.map((s, i) => (
          <Reveal key={s.title} className="skill" delay={(i % 4) as 0 | 1 | 2 | 3}>
            <span className="chip mono">{s.chip}</span>
            <div>
              <b>{s.title}</b>
              <span>{s.desc}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </Panel>
  );
}
```

- [ ] **Step 3: Experience.tsx 実装**

`app/components/Experience.tsx`:

```tsx
import { timeline } from "@/app/content";
import Panel from "@/app/components/Panel";
import Reveal from "@/app/components/Reveal";

export default function Experience() {
  return (
    <Panel id="experience" num="03" label="Experience" heading="経歴">
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
    </Panel>
  );
}
```

- [ ] **Step 4: テスト実行**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add app/components/Skills.tsx app/components/Experience.tsx tests/sections.test.tsx
git commit -m "feat: SkillsとExperienceセクションを実装

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Projects・Beyond Code セクション

**Files:**
- Create: `app/components/Projects.tsx`, `app/components/Beyond.tsx`
- Test: `tests/projects-beyond.test.tsx`

**Interfaces:**
- Consumes: `content.ts` の `projects` `beyond`、`Panel`、`Reveal`
- Produces: `<Projects />`(Panel 04)、`<Beyond />`(Panel 05)

- [ ] **Step 1: 失敗するテストを書く**

`tests/projects-beyond.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";

describe("Projects", () => {
  it("renders 3 project cards with rows and tags", () => {
    render(<Projects />);
    expect(document.querySelectorAll(".project")).toHaveLength(3);
    expect(screen.getAllByText("公開可否 要確認")).toHaveLength(2);
    expect(screen.getByText("Discord Bot(個人開発)")).toBeInTheDocument();
    expect(screen.getAllByText("課題")).toHaveLength(3);
  });
});

describe("Beyond", () => {
  it("renders 3 beyond cards with photo placeholders", () => {
    render(<Beyond />);
    expect(document.querySelectorAll(".beyond")).toHaveLength(3);
    expect(screen.getByText("素材待ち:旅の写真")).toBeInTheDocument();
    expect(screen.getByText("漫才ステージ")).toBeInTheDocument();
  });
});
```

Run: `npm test`
Expected: FAIL

- [ ] **Step 2: Projects.tsx 実装**

`app/components/Projects.tsx`:

```tsx
import { projects } from "@/app/content";
import Panel from "@/app/components/Panel";
import Reveal from "@/app/components/Reveal";

export default function Projects() {
  return (
    <Panel id="projects" num="04" label="Projects" heading="プロジェクト">
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
      <Reveal as="p" className="lede center" style={{ color: "var(--muted)", fontSize: 14 }}>
        その他の制作物は GitHub を参照 →
      </Reveal>
    </Panel>
  );
}
```

- [ ] **Step 3: Beyond.tsx 実装**

`app/components/Beyond.tsx`:

```tsx
import { beyond } from "@/app/content";
import Panel from "@/app/components/Panel";
import Reveal from "@/app/components/Reveal";

export default function Beyond() {
  return (
    <Panel id="beyond" num="05" label="Beyond Code" heading="コードの外側でも、人を笑顔に。">
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
    </Panel>
  );
}
```

- [ ] **Step 4: テスト実行**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add app/components/Projects.tsx app/components/Beyond.tsx tests/projects-beyond.test.tsx
git commit -m "feat: ProjectsとBeyond Codeセクションを実装

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Contact・ページ組み立て・メタ情報

**Files:**
- Create: `app/components/Contact.tsx`
- Modify: `app/page.tsx`(全置換)
- Test: `tests/page.test.tsx`

**Interfaces:**
- Consumes: 全コンポーネント、`content.ts` の `contact` `profile`
- Produces: 完成した 1 ページ(`/`)

- [ ] **Step 1: 失敗するテストを書く**

`tests/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("renders all 6 sections in order", () => {
    render(<Home />);
    const ids = ["about", "skills", "experience", "projects", "beyond", "contact"];
    ids.forEach((id) => expect(document.getElementById(id)).not.toBeNull());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("笑顔");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // footer
  });
});
```

Run: `npm test`
Expected: FAIL

- [ ] **Step 2: Contact.tsx 実装**

`app/components/Contact.tsx`:

```tsx
import { contact } from "@/app/content";
import Panel from "@/app/components/Panel";
import Reveal from "@/app/components/Reveal";

export default function Contact() {
  return (
    <Panel id="contact" num="06" label="Contact" heading="お気軽にどうぞ">
      <Reveal className="contact-row">
        <a className="btn btn-primary" href={contact.github}>
          GitHub <span className="arr">→</span>
        </a>
        <a className="btn btn-ghost" href={contact.email}>
          Email <span className="arr">→</span>
        </a>
      </Reveal>
    </Panel>
  );
}
```

- [ ] **Step 3: page.tsx を組み立て**

`app/page.tsx`:

```tsx
import Nav from "@/app/components/Nav";
import Hero from "@/app/components/Hero";
import Skills from "@/app/components/Skills";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
import Contact from "@/app/components/Contact";
import Panel from "@/app/components/Panel";
import Reveal from "@/app/components/Reveal";
import { aboutParagraphs, profile } from "@/app/content";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <div className="wrap">
        <Panel id="about" num="01" label="About" heading="ものづくりの原点は、目の前の人の反応。">
          {aboutParagraphs.map((p) => (
            <Reveal as="p" key={p} className="lede center">
              {p}
            </Reveal>
          ))}
        </Panel>
        <Skills />
        <Experience />
        <Projects />
        <Beyond />
        <Contact />
        <footer className="mono">© 2026 {profile.name} — built with Next.js</footer>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: テスト+ビルド確認**

Run: `npm test && npm run build`
Expected: 全テスト PASS、ビルド成功

- [ ] **Step 5: 開発サーバで目視確認**

Run: `npm run dev`(バックグラウンド)→ ブラウザで `http://localhost:3000`
確認: モックアップ v4 と見た目一致、Hero マーカースイープ動作、スクロールリビール動作、ナビアンカー動作、モバイル幅(375px)で崩れなし、ライト/ダーク両テーマ

- [ ] **Step 6: コミット**

```bash
git add app/components/Contact.tsx app/page.tsx tests/page.test.tsx
git commit -m "feat: 全セクションを組み立てて1ページ完成

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: README とデプロイ準備

**Files:**
- Modify: `README.md`(全置換)

**Interfaces:**
- Consumes: 完成したサイト
- Produces: リポジトリ説明とデプロイ手順

- [ ] **Step 1: README.md 作成**

`README.md`:

```markdown
# Portfolio 2025

就活用ポートフォリオサイト。「人を笑顔にし、心を動かすものを生み出す」。

## Tech Stack
- Next.js (App Router) + TypeScript
- CSS custom properties によるデザイントークン(ダーク/ライト対応)
- Vitest + React Testing Library

## Development
​```bash
npm install
npm run dev   # http://localhost:3000
npm test      # unit tests
npm run build # production build
​```

## Design
- 設計書: `docs/superpowers/specs/2026-07-07-portfolio-design.md`
- モックアップ: `docs/design/portfolio-mockup-v4.html`
- コンセプト: 「夜のステージとスポットライト」— アンバー(#FFC53D)が「笑顔」を照らす

## Deploy
Vercel にインポートしてデフォルト設定でデプロイ。
```

(README 内のコードフェンスは通常のバッククォート3つで記載すること)

- [ ] **Step 2: 最終確認**

Run: `npm test && npm run build`
Expected: 成功

- [ ] **Step 3: コミット**

```bash
git add README.md
git commit -m "docs: READMEを追加

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 4: デプロイ(ユーザー作業)**

Vercel アカウント作成・GitHub リポジトリ連携・インポートは**ユーザー本人が実施**(アカウント作成・認証は代行不可)。手順を案内:
1. GitHub にリポジトリを push(`gh repo create` またはブラウザで作成)
2. vercel.com → Add New Project → リポジトリ選択 → Deploy(設定変更不要)
3. 発行された URL を確認

---

## 残タスク(実装後・コンテンツ差し替え)

コード完成後、ユーザーから素材が届き次第 `content.ts` と `layout.tsx` の値を差し替える(コード変更はほぼ不要):
- `【氏名】` → 本名
- `contact.github` / `contact.email` → 実 URL / mailto
- インターン2案件の 課題/技術選定/工夫/成果(公開可否確認後)
- レディオ湘南の期間
- Beyond Code の写真3枚(`.ph` プレースホルダーを `next/image` に置換)
- OGP 画像(`app/opengraph-image.png` を置くだけで Next.js が配信)
