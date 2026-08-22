# サイドナビ刷新 + About セクション拡張 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 左固定の進度演出 `PathRail` をラベル付きサイドナビへ置き換え、About セクションに外部リンクアイコンとプロジェクト索引を追加する。

**Architecture:** サイドナビは `SideNav` という単一のクライアントコンポーネントに閉じ、IntersectionObserver で「交差中セクションのうち最も上のもの」を現在地とする。About のアイコンとプロジェクト索引はサーバーコンポーネントのまま `content.ts` のデータから自動生成する。アイコンは外部ライブラリを足さずインライン SVG で持つ。

**Tech Stack:** Next.js 16.2.10 (App Router) / TypeScript / 素の CSS / Vitest + React Testing Library

設計書: `docs/superpowers/specs/2026-08-22-about-navigation-design.md`

## Global Constraints

- 素の CSS のみ。Tailwind は使わない（確定済み決定、変更禁止）
- 外部ライブラリの追加禁止。アイコンはインライン SVG で自前定義する
- 全コンテンツは `app/content.ts` に集約する。件数はハードコードせず配列長から導く
- クライアント処理は `Reveal` / `CursorLight` / `ConsoleEgg` / `SideNav` / `CosmicBackground` の 5 つに隔離する。About / Projects / Contact はサーバーコンポーネントのまま
- 視差スクロール以外で scroll イベントを使わない。位置検出は IntersectionObserver のみ
- すべてのフォーカス可能要素に `:focus-visible` のフォーカス表示を付ける
- `@media (prefers-reduced-motion: reduce)` で追加したトランジション／アニメーションを無効化する
- 未確定情報は勝手に埋めない。X の URL は空文字のまま `要確認` 表示にする
- テスト実行コマンドは `npx vitest run`

## 着手前の既知の失敗（本計画と無関係）

着手時点で 10 件のテストが失敗している。すべて `content.ts` の編集にテストが追随していないことによるもの。**これらは修正しない。** 実装後に失敗が 10 件のままなら回帰なし、増えていれば自分の変更が原因。

- `tests/about-skills.test.tsx > Skills > renders 5 stack rows with pills`
- `tests/content.test.ts > has expected collection sizes`
- `tests/content.test.ts > adds the Tabime stack to the existing skill categories`
- `tests/content.test.ts > includes the Silk Road solo trip`
- `tests/content.test.ts > presents Tabime as a concise doorway to the product`
- `tests/content.test.ts > combines the internship work and states the factual responsibility boundary`
- `tests/sections.test.tsx > Experience > renders 6 timeline items`
- `tests/sections.test.tsx > Projects > renders three concise project doorways`
- `tests/sections.test.tsx > Projects > shows the two internship responsibilities inside one project`
- `tests/shapes.test.ts > preserves constellation data consumed by the page`

## File Structure

**Create**
- `app/components/SideNav.tsx` — 左固定のセクションナビ。唯一の新規クライアントコンポーネント。現在地判定を持つ
- `app/components/icons.tsx` — GitHub / X のインライン SVG と、ラベルからアイコンを引く `SocialIcon`。純粋な表示のみ
- `tests/sidenav.test.tsx` — `SideNav` のテスト

**Modify**
- `vitest.setup.ts` — `MockIntersectionObserver` に、一部の要素だけ交差させる `triggerFor` を追加
- `app/page.tsx:11,20` — `PathRail` → `SideNav`
- `app/content.ts` — `Social` 型と `socials` 配列を追加
- `app/components/About.tsx` — アイコンリンクとプロジェクト索引を追加
- `app/components/Projects.tsx:16` — 各 article に `id="project-{index}"` を付与
- `app/components/Contact.tsx:15` — Email に `mailto:` を付与
- `app/globals.css` — `.path-rail` / `.rail-track` / `.path-label` 系を削除し `.side-nav` 系へ置換。`.about-socials` / `.about-projects` を追加。`.project` に `scroll-margin-top`
- `tests/about-skills.test.tsx` — About のアイコンと索引のテストを追記
- `tests/sections.test.tsx` — Projects の id と Contact の mailto のテストを追記
- `tests/content.test.ts` — `socials` の形状テストを追記
- `CLAUDE.md:17,19` / `README.md:16` — `PathRail` の記述を `SideNav` に更新

**Delete**
- `app/components/PathRail.tsx`
- `tests/pathrail.test.tsx`

---

### Task 1: SideNav（PathRail の置き換え）

**Files:**
- Create: `app/components/SideNav.tsx`
- Create: `tests/sidenav.test.tsx`
- Delete: `app/components/PathRail.tsx`, `tests/pathrail.test.tsx`
- Modify: `vitest.setup.ts:63-78`
- Modify: `app/page.tsx:11,20`
- Modify: `app/globals.css:460-524`, `app/globals.css:567-571`, `app/globals.css:847-883`, `app/globals.css:918-922`
- Modify: `CLAUDE.md:17,19`, `README.md:16`

**Interfaces:**
- Consumes: なし
- Produces: `export default function SideNav(): JSX.Element`（`app/components/SideNav.tsx`）。DOM は `<nav class="side-nav" aria-label="セクションナビゲーション">` 直下に 7 つの `<a>`。現在地の `<a>` は `class="current"` と `aria-current="true"` を持つ。`MockIntersectionObserver.triggerFor(targets: Element[], isIntersecting: boolean): void`（`vitest.setup.ts`）

- [ ] **Step 1: テスト用モックに `triggerFor` を追加する**

`vitest.setup.ts` の `trigger` メソッド（63-78 行目）を、以下の 2 メソッドに丸ごと置き換える。既存の `trigger` は `triggerFor` に委譲させるので、`tests/reveal.test.tsx` など既存の呼び出し側は変更不要。

```ts
  /** Simulate the observer firing for a specific subset of observed elements. */
  triggerFor(targets: Element[], isIntersecting: boolean) {
    const entries = targets.map(
      (target) =>
        ({
          isIntersecting,
          target,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        }) as IntersectionObserverEntry,
    );
    this.callback(entries, this);
  }

  /** Simulate the observer firing for every currently-observed element. */
  trigger(isIntersecting: boolean) {
    this.triggerFor(Array.from(this.elements), isIntersecting);
  }
```

同ファイル 28 行目のコメント中の `Reveal/PathRail` を `Reveal/SideNav` に直す。

- [ ] **Step 2: 失敗するテストを書く**

`tests/sidenav.test.tsx` を新規作成する。

```tsx
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SideNav from "@/app/components/SideNav";
import { MockIntersectionObserver } from "@/vitest.setup";

const expectedHrefs = [
  "#hero",
  "#about",
  "#skills",
  "#experience",
  "#projects",
  "#beyond",
  "#contact",
];

const expectedLabels = [
  "Top",
  "About",
  "Skills",
  "Experience",
  "Projects",
  "Life & Creative Practice",
  "Contact",
];

const expectedNums = ["00", "01", "02", "03", "04", "05", "06"];

function renderSideNavWithSections() {
  render(
    <>
      {expectedHrefs.map((href) => (
        <section key={href} id={href.slice(1)} />
      ))}
      <SideNav />
    </>,
  );
}

async function activeObserver() {
  await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1));
  return MockIntersectionObserver.instances[0];
}

function sectionEl(id: string) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`section #${id} not rendered`);
  return el;
}

describe("SideNav", () => {
  it("renders 7 section links with the correct hrefs", () => {
    render(<SideNav />);

    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(7);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(expectedHrefs);
  });

  it("renders a labelled navigation landmark", () => {
    render(<SideNav />);

    expect(
      screen.getByRole("navigation", { name: "セクションナビゲーション" }),
    ).toBeInTheDocument();
  });

  it("shows a section number and a readable label on every row", () => {
    render(<SideNav />);

    const nums = Array.from(document.querySelectorAll(".side-nav-num"));
    expect(nums.map((num) => num.textContent)).toEqual(expectedNums);
    nums.forEach((num) => expect(num).toHaveAttribute("aria-hidden", "true"));

    const labels = Array.from(document.querySelectorAll(".side-nav-label"));
    expect(labels.map((label) => label.textContent)).toEqual(expectedLabels);
  });

  it("has no current section before any intersection is reported", () => {
    render(<SideNav />);

    expect(document.querySelectorAll("[aria-current]")).toHaveLength(0);
  });

  it("marks the intersecting section as current", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("projects")], true));

    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(document.querySelectorAll("[aria-current]")).toHaveLength(1);
  });

  it("prefers the topmost section when several are visible at once", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("about"), sectionEl("skills")], true));

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "Skills" })).not.toHaveAttribute("aria-current");
  });

  it("moves the current marker back when an earlier section returns to view", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("projects")], true));
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    act(() => observer.triggerFor([sectionEl("projects")], false));
    act(() => observer.triggerFor([sectionEl("skills")], true));

    expect(screen.getByRole("link", { name: "Skills" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "Projects" })).not.toHaveAttribute("aria-current");
  });

  it("keeps the last current section while nothing is intersecting", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("beyond")], true));
    act(() => observer.triggerFor([sectionEl("beyond")], false));

    expect(screen.getByRole("link", { name: "Life & Creative Practice" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
```

- [ ] **Step 3: テストを実行して落ちることを確認する**

Run: `npx vitest run tests/sidenav.test.tsx`
Expected: FAIL。`Failed to resolve import "@/app/components/SideNav"`

- [ ] **Step 4: SideNav を実装する**

`app/components/SideNav.tsx` を新規作成する。

```tsx
"use client";

import { useEffect, useState } from "react";

const navSections = [
  { id: "hero", num: "00", label: "Top" },
  { id: "about", num: "01", label: "About" },
  { id: "skills", num: "02", label: "Skills" },
  { id: "experience", num: "03", label: "Experience" },
  { id: "projects", num: "04", label: "Projects" },
  { id: "beyond", num: "05", label: "Life & Creative Practice" },
  { id: "contact", num: "06", label: "Contact" },
];

export default function SideNav() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const sections = navSections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        const topmost = navSections.find(({ id }) => visible.has(id));
        // 何も交差していない一瞬は直前の現在地を保つ(高速スクロール時のちらつき防止)
        setActiveId((current) => topmost?.id ?? current);
      },
      { threshold: 0.25 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="side-nav" aria-label="セクションナビゲーション">
      {navSections.map((section) => {
        const isCurrent = section.id === activeId;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={isCurrent ? "current" : undefined}
            aria-current={isCurrent ? "true" : undefined}
          >
            <span className="side-nav-num mono" aria-hidden="true">
              {section.num}
            </span>
            <span className="side-nav-label">{section.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 5: テストを実行して通ることを確認する**

Run: `npx vitest run tests/sidenav.test.tsx`
Expected: PASS（8 テスト）

- [ ] **Step 6: PathRail を削除して page.tsx を差し替える**

```bash
git rm app/components/PathRail.tsx tests/pathrail.test.tsx
```

`app/page.tsx:11` を差し替える。

```tsx
import SideNav from "@/app/components/SideNav";
```

`app/page.tsx:20` を差し替える。

```tsx
      <SideNav />
```

- [ ] **Step 7: CSS を置き換える**

`app/globals.css` の 460-524 行目（`/* ---------- Path rail: fixed lantern minimap ---------- */` から `@media (max-width: 860px) { .path-rail { display: none; } }` まで、`@keyframes rail-twinkle` を含む）を、以下で丸ごと置き換える。

```css
/* ---------- Side nav: fixed section list ---------- */
.side-nav {
  position: fixed;
  left: 26px;
  top: 50%;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 158px;
  transform: translateY(-50%);
}
.side-nav a {
  position: relative;
  display: grid;
  grid-template-columns: 18px 1fr;
  align-items: baseline;
  gap: 8px;
  padding: 6px 10px 6px 12px;
  border-radius: 10px;
  color: var(--muted);
  font-size: 11.5px;
  line-height: 1.35;
  letter-spacing: .06em;
  text-decoration: none;
  transition: color .3s ease, background .3s ease;
}
.side-nav a::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 2px;
  height: 0;
  border-radius: 999px;
  background: var(--sun);
  transform: translateY(-50%);
  transition: height .3s ease;
}
.side-nav a:hover {
  color: var(--ink);
  background: color-mix(in srgb, var(--ink-strong) 6%, transparent);
}
.side-nav a.current {
  color: var(--ink-strong);
  font-weight: 700;
}
.side-nav a.current::before { height: calc(100% - 10px); }
.side-nav-num {
  color: var(--muted);
  font-size: 9px;
  letter-spacing: .16em;
}
.side-nav a.current .side-nav-num { color: var(--sun-deep); }
.side-nav a:focus-visible {
  outline: 2px solid var(--sun);
  outline-offset: 2px;
}
@media (max-width: 860px) {
  .side-nav { display: none; }
}
```

次に `prefers-reduced-motion` ブロック（旧 567-571 行目）を置き換える。

```css
@media (prefers-reduced-motion: reduce) {
  .side-nav a,
  .side-nav a::before { transition: none; }
  .star-dot, .nebula { animation: none; }
}
```

次に Cosmic refinement 内の `.path-rail` / `.path-label` 群（旧 847-883 行目、`.path-rail { left: 24px; gap: 26px; }` から `.path-rail a.current .path-label { color: var(--ink-strong); }` まで）を置き換える。直後の `.star-dot { opacity: .34; }` は残す。

```css
.side-nav {
  left: 24px;
  padding: 10px 8px;
  border: 1px solid var(--cosmic-hairline);
  border-radius: 16px;
  background: color-mix(in srgb, var(--ground) 62%, transparent);
  backdrop-filter: blur(14px);
}
```

最後に旧 921 行目の `.path-label { transition: none; }` の 1 行を削除する。囲んでいる `@media (prefers-reduced-motion: reduce)` ブロックと他の 2 行は残す。

- [ ] **Step 8: 全テストを実行して回帰がないことを確認する**

Run: `npx vitest run`
Expected: 失敗は「着手前の既知の失敗」10 件のみ。それ以外が失敗していたら直す

- [ ] **Step 9: ドキュメントを更新する**

`CLAUDE.md:17` の `PathRail` を `SideNav` に置き換える。

```
- クライアント処理は `Reveal` / `CursorLight` / `ConsoleEgg` / `SideNav` / `CosmicBackground` の 5 コンポーネントに隔離。他はサーバーコンポーネント
```

`CLAUDE.md:19` の `[PathRail]` を `[SideNav]` に置き換える。

```
- 視差スクロールのみ scroll イベント(rAFスロットリング)を使用 — 他の演出([Reveal]/[SideNav]等)は IntersectionObserver のみで実装する方針の例外
```

`README.md:16` の `PathRail` を `SideNav` に置き換える。

```
- `app/components/` — セクション単位の独立コンポーネント。クライアント処理は Reveal / CursorLight / ConsoleEgg / SideNav / CosmicBackground に隔離
```

- [ ] **Step 10: コミット**

```bash
git add app/components/SideNav.tsx tests/sidenav.test.tsx vitest.setup.ts app/page.tsx app/globals.css CLAUDE.md README.md
git commit -m "feat: PathRailの進度演出をラベル付きサイドナビSideNavへ置き換え

現在地判定を単調増加から「交差中セクションのうち最上位」に変更し、
上スクロールで現在地が戻るようにした。テスト用モックには一部要素だけを
交差させる triggerFor を追加した。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: About のアイコンリンク

**Files:**
- Create: `app/components/icons.tsx`
- Modify: `app/content.ts`
- Modify: `app/components/About.tsx`
- Modify: `app/globals.css`
- Test: `tests/about-skills.test.tsx`, `tests/content.test.ts`

**Interfaces:**
- Consumes: なし（Task 1 とは独立）
- Produces: `export type Social = { label: string; href: string }` と `export const socials: Social[]`（`app/content.ts`）、`export function SocialIcon({ label }: { label: string }): JSX.Element | null`（`app/components/icons.tsx`）

- [ ] **Step 1: 失敗するテストを書く**

`tests/content.test.ts` の 2-4 行目の import を差し替える。

```ts
import {
  profile, aboutInfo, aboutParagraphs, motto, stack, timeline, projects, beyond, socials,
} from "@/app/content";
```

同ファイルの末尾に追記する。

```ts
describe("socials", () => {
  it("lists GitHub with a URL and keeps X unresolved", () => {
    expect(socials.map((social) => social.label)).toEqual(["GitHub", "X"]);
    expect(socials[0].href).toBe("https://github.com/hinata-111");
    expect(socials[1].href).toBe("");
  });
});
```

`tests/about-skills.test.tsx` の `describe("About", ...)` の中に追記する。冒頭に `import { socials } from "@/app/content";` を足すこと。

```tsx
  it("shows social icon links and marks unresolved ones", () => {
    render(<About />);

    const items = document.querySelectorAll(".about-socials li");
    expect(items).toHaveLength(socials.length);

    const github = screen.getByRole("link", { name: "GitHubを開く" });
    expect(github).toHaveAttribute("href", "https://github.com/hinata-111");
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noreferrer");
    expect(github.querySelector("svg")).not.toBeNull();

    expect(screen.queryByRole("link", { name: "Xを開く" })).not.toBeInTheDocument();
    expect(screen.getByText("X 要確認")).toBeInTheDocument();
  });
```

- [ ] **Step 2: テストを実行して落ちることを確認する**

Run: `npx vitest run tests/content.test.ts tests/about-skills.test.tsx`
Expected: 新しい 2 テストが FAIL。`socials` が `content.ts` に存在しないため import エラー

- [ ] **Step 3: content.ts に socials を追加する**

`app/content.ts` の型定義の並び（`LifeDetail` 型の近く）に追加する。

```ts
export type Social = { label: string; href: string };
```

ファイル末尾の `contact` の直前に追加する。`href` が空の項目は「URL 未確定」を意味する。

```ts
// href が空の項目は URL 未確定。埋めるだけでリンクとして描画される
export const socials: Social[] = [
  { label: "GitHub", href: "https://github.com/hinata-111" },
  { label: "X", href: "" },
];
```

- [ ] **Step 4: アイコンを実装する**

`app/components/icons.tsx` を新規作成する。

```tsx
import type { ComponentType } from "react";

type IconProps = { className?: string };

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.52 6.78 15.48 0h-1.41L8.9 5.89 4.77 0H0l6.25 8.9L0 16h1.41l5.46-6.22L11.23 16H16L9.52 6.78Zm-1.93 2.2-.63-.89L1.92 1.04h2.17l4.06 5.7.63.89 5.28 7.41h-2.17L7.59 8.98Z" />
    </svg>
  );
}

const socialIcons: Record<string, ComponentType<IconProps>> = {
  GitHub: GitHubIcon,
  X: XIcon,
};

export function SocialIcon({ label, className }: { label: string; className?: string }) {
  const Icon = socialIcons[label];
  return Icon ? <Icon className={className} /> : null;
}
```

- [ ] **Step 5: About にアイコンリンクを差し込む**

`app/components/About.tsx` の import 文を差し替える。

```tsx
import { aboutInfo, aboutParagraphs, motto, socials } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";
import { SocialIcon } from "@/app/components/icons";
```

`about-info` の `</ul>` の直後、同じ `<div>` の中に追加する。

```tsx
          <ul className="about-socials">
            {socials.map((social) => (
              <li key={social.label}>
                {social.href ? (
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${social.label}を開く`}
                  >
                    <SocialIcon label={social.label} />
                  </a>
                ) : (
                  <span className="about-social-todo">
                    <SocialIcon label={social.label} />
                    <span className="todo">{social.label} 要確認</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
```

- [ ] **Step 6: CSS を追加する**

`app/globals.css` の `.about-story p { ... }` の行（170 行目付近）の直後、`@media (max-width: 640px)` の前に追加する。

```css
.about-socials {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 16px 0 0;
  padding: 0;
}
.about-socials a,
.about-social-todo {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--muted);
}
.about-socials a {
  width: 34px;
  height: 34px;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  text-decoration: none;
  transition: color .3s ease, border-color .3s ease, transform .3s cubic-bezier(.2,.7,.3,1);
}
.about-socials a:hover {
  color: var(--sun-deep);
  border-color: var(--sun);
  transform: translateY(-2px);
}
.about-socials a:focus-visible {
  outline: 2px solid var(--sun);
  outline-offset: 3px;
}
.about-social-todo .todo { margin-left: 0; }
@media (prefers-reduced-motion: reduce) {
  .about-socials a { transition: none; }
  .about-socials a:hover { transform: none; }
}
```

- [ ] **Step 7: テストを実行して通ることを確認する**

Run: `npx vitest run tests/content.test.ts tests/about-skills.test.tsx`
Expected: 新しい 2 テストが PASS。失敗は既知の 2 件（`has expected collection sizes` ほか content.test.ts の 5 件と `renders 5 stack rows with pills`）のみ

- [ ] **Step 8: コミット**

```bash
git add app/components/icons.tsx app/content.ts app/components/About.tsx app/globals.css tests/about-skills.test.tsx tests/content.test.ts
git commit -m "feat: AboutにGitHub/Xのアイコンリンクを追加

アイコンは外部ライブラリを足さずインラインSVGで持つ。XのURLは未確定の
ため空文字のままとし、その場合はリンクにせず要確認バッジで表示する。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: About のプロジェクト索引と Projects のアンカー

**Files:**
- Modify: `app/components/Projects.tsx:16`
- Modify: `app/components/About.tsx`
- Modify: `app/globals.css`
- Test: `tests/sections.test.tsx`, `tests/about-skills.test.tsx`

**Interfaces:**
- Consumes: `projects`（`app/content.ts` の既存 export、`Project = { title, summary, details?, href?, linkLabel? }`）
- Produces: `Projects` の各 `article` が `id="project-{index}"`（index は 0 始まり）を持つ。About の索引はこの id にリンクする

- [ ] **Step 1: 失敗するテストを書く**

`tests/sections.test.tsx` の `describe("Projects", ...)` の中に追記する。

```tsx
  it("gives every project an anchor the About index can link to", () => {
    render(<Projects />);

    const projectArticles = Array.from(document.querySelectorAll(".project"));
    expect(projectArticles.map((project) => project.id)).toEqual([
      "project-0",
      "project-1",
      "project-2",
    ]);
  });
```

`tests/about-skills.test.tsx` の冒頭にある content からの import 行を、以下に差し替える（Task 2 で追加した `socials` に `projects` を足す）。

```tsx
import { projects, socials } from "@/app/content";
```

同ファイルの `describe("About", ...)` の中に追記する。

```tsx
  it("indexes every project and links down to its card", () => {
    render(<About />);

    const index = screen.getByRole("navigation", { name: "プロジェクト索引" });
    const links = Array.from(index.querySelectorAll("a"));

    expect(links).toHaveLength(projects.length);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      projects.map((_, i) => `#project-${i}`),
    );
    expect(links[0]).toHaveTextContent(projects[0].title);
    expect(links[0]).toHaveTextContent(projects[0].summary);
  });
```

- [ ] **Step 2: テストを実行して落ちることを確認する**

Run: `npx vitest run tests/sections.test.tsx tests/about-skills.test.tsx`
Expected: 新しい 2 テストが FAIL。id が空文字、および `navigation` ロールが見つからない

- [ ] **Step 3: Projects に id を付与する**

`app/components/Projects.tsx` の `<Reveal as="article" ...>` に `id` を追加する。`data-project-index` は既存テストが見ているのでそのまま残す。

```tsx
        <Reveal
          as="article"
          key={p.title}
          id={`project-${index}`}
          className={`project${index === 0 ? " project--featured" : ""}`}
          data-project-index={String(index + 1).padStart(2, "0")}
          aria-labelledby={`project-title-${index}`}
        >
```

- [ ] **Step 4: About にプロジェクト索引を追加する**

`app/components/About.tsx` の import 文に `projects` を足す。

```tsx
import { aboutInfo, aboutParagraphs, motto, projects, socials } from "@/app/content";
```

`about-grid` の `</Reveal>` の直後、`motto` の `<Reveal>` の前に挿入する。About には h2 が無いため、見出しタグは使わず `nav` のラベルで索引だと伝える。

```tsx
      <Reveal as="nav" className="about-projects" aria-label="プロジェクト索引">
        <p className="about-projects-head mono">PROJECTS</p>
        <ul>
          {projects.map((p, index) => (
            <li key={p.title}>
              <a href={`#project-${index}`}>
                <span className="about-project-num mono" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="about-project-body">
                  <span className="about-project-title">{p.title}</span>
                  <span className="about-project-summary">{p.summary}</span>
                </span>
                <span className="about-project-arrow" aria-hidden="true">
                  ↓
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
```

- [ ] **Step 5: CSS を追加する**

`app/globals.css` の Cosmic refinement 内、`.motto { position: relative; padding: 44px 32px; }`（673 行目付近）の直前に追加する。要約は 2 行で切る。`content.ts` の文言を変えないためのクランプなので、専用の短文フィールドは作らない。

```css
.about-projects { margin: 34px 0 0; text-align: left; }
.about-projects-head {
  margin: 0 0 12px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: .24em;
}
.about-projects ul {
  list-style: none;
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
}
.about-projects a {
  display: grid;
  grid-template-columns: 26px 1fr 16px;
  align-items: start;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--cosmic-hairline);
  border-radius: 16px;
  background: var(--cosmic-glass);
  text-decoration: none;
  transition: transform .3s cubic-bezier(.2,.7,.3,1), border-color .3s ease, box-shadow .3s ease;
}
.about-projects a:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--sun) 30%, var(--cosmic-hairline));
  box-shadow: 0 16px 40px rgba(0, 0, 0, .14);
}
.about-projects a:focus-visible {
  outline: 2px solid var(--sun);
  outline-offset: 3px;
}
.about-project-num {
  padding-top: 3px;
  color: var(--sun-deep);
  font-size: 10px;
  letter-spacing: .16em;
}
.about-project-body { display: grid; gap: 5px; min-width: 0; }
.about-project-title {
  color: var(--ink-strong);
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.5;
}
.about-project-summary {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.7;
}
.about-project-arrow {
  padding-top: 3px;
  color: var(--muted);
  font-size: 13px;
  transition: transform .3s ease;
}
.about-projects a:hover .about-project-arrow { transform: translateY(3px); }
@media (prefers-reduced-motion: reduce) {
  .about-projects a,
  .about-project-arrow { transition: none; }
  .about-projects a:hover { transform: none; }
  .about-projects a:hover .about-project-arrow { transform: none; }
}
```

続けて、索引から飛んだときにカード上端が切れないよう、Cosmic refinement の `.project { ... }` ルール（750 行目付近、`counter-increment: cosmic-project;` を含むもの）に 1 行足す。

```css
  scroll-margin-top: 90px;
```

さらに 720px 以下のブロック（`.project, .project--featured { padding: 28px 22px; ... }` があるところ）に追加する。狭い画面では索引カードの左右余白を詰める。

```css
  .about-projects a { padding: 14px 15px; gap: 11px; }
```

- [ ] **Step 6: テストを実行して通ることを確認する**

Run: `npx vitest run tests/sections.test.tsx tests/about-skills.test.tsx`
Expected: 新しい 2 テストが PASS。失敗は既知の 3 件のみ

- [ ] **Step 7: 全テストを実行して回帰がないことを確認する**

Run: `npx vitest run`
Expected: 失敗は「着手前の既知の失敗」10 件のみ

- [ ] **Step 8: コミット**

```bash
git add app/components/About.tsx app/components/Projects.tsx app/globals.css tests/sections.test.tsx tests/about-skills.test.tsx
git commit -m "feat: Aboutにプロジェクト索引を追加し各カードへアンカーを付与

content.tsのprojectsから自動生成し、クリックでProjectsセクションの該当
カードへ直接飛ぶ。要約は文言を変えずCSSで2行にクランプする。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Contact の mailto 修正

**Files:**
- Modify: `app/components/Contact.tsx:15`
- Test: `tests/sections.test.tsx`

**Interfaces:**
- Consumes: `contact`（`app/content.ts` の既存 export、`{ github: string; email: string }`）
- Produces: なし

- [ ] **Step 1: 失敗するテストを書く**

`tests/sections.test.tsx` の末尾に追記する。冒頭の import に以下 2 行を足すこと。

```tsx
import Contact from "@/app/components/Contact";
import { contact } from "@/app/content";
```

```tsx
describe("Contact", () => {
  it("makes the email a working mailto link", () => {
    render(<Contact />);

    expect(screen.getByRole("link", { name: /Email/ })).toHaveAttribute(
      "href",
      `mailto:${contact.email}`,
    );
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", contact.github);
  });
});
```

- [ ] **Step 2: テストを実行して落ちることを確認する**

Run: `npx vitest run tests/sections.test.tsx -t "mailto"`
Expected: FAIL。`href` が `mailto:` を伴わない `yos570038@gmail.com` になっている

- [ ] **Step 3: mailto を付ける**

`app/components/Contact.tsx:15` を差し替える。

```tsx
        <a className="btn btn-ghost" href={`mailto:${contact.email}`}>
```

- [ ] **Step 4: テストを実行して通ることを確認する**

Run: `npx vitest run tests/sections.test.tsx -t "mailto"`
Expected: PASS

- [ ] **Step 5: 全テストを実行して回帰がないことを確認する**

Run: `npx vitest run`
Expected: 失敗は「着手前の既知の失敗」10 件のみ

- [ ] **Step 6: コミット**

```bash
git add app/components/Contact.tsx tests/sections.test.tsx
git commit -m "fix: ContactのEmailリンクにmailto:を付与

相対URLとして解釈されリンクが機能していなかった。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## 完了後の手動確認

1. `npm run dev` で起動する
2. 左サイドナビの各行をクリックし、対応するセクションへ移動することを確認する
3. スクロールに追従して現在地ハイライトが動き、**上へ戻したときにハイライトも前のセクションへ戻る**ことを確認する
4. About のプロジェクト索引をクリックし、Projects の該当カードが上端から見える位置に着地することを確認する（`scroll-margin-top` の効き）
5. GitHub アイコンが新規タブで開き、X が `X 要確認` バッジで表示されることを確認する
6. ブラウザ幅を 860px 以下にしてサイドナビが消えること、720px 以下で索引カードのレイアウトが崩れないことを確認する
7. キーボードの Tab のみでサイドナビと索引をたどり、フォーカスリングが見えることを確認する
8. OS の「視差効果を減らす」を有効にして、ホバーの浮き上がりとトランジションが止まることを確認する
