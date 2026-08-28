import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
describe("cosmic depth-gate visual contract", () => {
  it("defines three depth layers, nebula, boundary, phases, and motion variables", () => {
    // 深度ごとの速度は data-speed で JS が持つので、CSS 側に深度別の規則はもう要らない
    for (const selector of [".cosmic-background", ".star-layer", ".star-tile", ".star-dot", ".nebula-layer", ".cosmic-boundary"]) expect(css).toContain(selector);
    expect(css).toMatch(/--scroll-progress/); expect(css).toMatch(/--gate-approach/); expect(css).toMatch(/--gate-pass/); expect(css).toMatch(/--post-gate/);
    expect(css).toMatch(/\.cosmic-boundary[^}]*transform/s); expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
  it("drives the starfield from a wrapping shift over two stacked tiles", () => {
    // JS が --star-shift に「スクロール量 × 倍率」を 1タイル分でラップした値を入れる。
    // タイルを2枚重ねてあるので、1枚ぶん流れきった時点で継ぎ目なく元へ戻る。
    expect(css).toMatch(/\.star-layer\s*\{[^}]*transform:\s*translate3d\(0,\s*var\(--star-shift[^}]*\}/s);
    expect(css).toMatch(/\.star-layer\s*\{[^}]*height:\s*200vh/s);
    expect(css).toMatch(/\.star-tile\s*\{[^}]*height:\s*50%/s);
    expect(css).not.toContain("--travel");
  });
  it("contains responsive and retired-selector contracts", () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*720px\)[\s\S]*\.cosmic-boundary/); expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.cosmic-boundary/);
    for (const selector of [".cosmic-scenes", ".cosmic-scene", ".cosmic-shape", ".cosmic-motif", ".orbit-ring", ".shooting-star", ".cosmic-grid", ".checkerboard", ".cosmic-lens", ".cosmic-ribbon", ".cosmic-arc"]) expect(css).not.toContain(selector);
    expect(css).not.toContain("shooting-fall");
    for (const token of ["--shape-pink", "--shape-teal", "--shape-yellow", "--shape-navy", "--cosmic-cyan", "--cosmic-pink"]) expect(css).not.toContain(token);
  });
  it("paints a visible top-to-bottom brightness gradient that deepens with scroll", () => {
    const start = css.indexOf(".cosmic-background {");
    const block = css.slice(start, css.indexOf("\n}", start) + 2);
    // 上端(暗)→中間(素)→下端(明) の縦グラデ。スクロール0でも平坦にならない。
    expect(block).toMatch(/background:\s*linear-gradient\(\s*180deg[\s\S]*var\(--sky-top\)[\s\S]*var\(--sky-bottom\)/);
    expect(block).toMatch(/--sky-top:\s*color-mix\([\s\S]*--scroll-progress/);
    expect(block).toMatch(/--sky-bottom:\s*color-mix\([\s\S]*--scroll-progress/);
    // 明るい側の下地はライトテーマでも破綻しないよう差し替える
    expect(css).toMatch(/prefers-color-scheme:\s*light\)\s*\{\s*\.cosmic-background/);
  });
  it("re-saturates the background with scroll velocity", () => {
    expect(css).toMatch(/--scroll-velocity/);
    expect(css).toMatch(/\.cosmic-background[^}]*filter:\s*saturate\([^)]*--scroll-velocity[^}]*\}/s);
  });
});

describe("side nav layout contract", () => {
  it("reserves the nav's footprint so the content column can never sit under it", () => {
    // 本文の列幅は「画面幅 - ガター2つ分」を上限にする。左右対称に引くので中央寄せは崩れない。
    expect(css).toMatch(/--side-nav-gutter/);
    expect(css).toMatch(/\.wrap[^}]*max-width:\s*min\(\s*1024px\s*,\s*calc\(\s*100vw\s*-\s*var\(--side-nav-gutter\)\s*\*\s*2\s*\)\s*\)/s);
  });

  it("switches between full rail, compact rail, and drawer by width and hover capability", () => {
    expect(css).toMatch(/@media\s*\(min-width:\s*1240px\)/);
    expect(css).toMatch(/@media[^{]*max-width:\s*1239px[^{]*hover:\s*hover/);
    expect(css).toMatch(/@media[^{]*max-width:\s*1239px[^{]*hover:\s*none/);
  });

  it("disables the added nav motion under reduced motion", () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.side-nav/);
  });

  it("slides the drawer with transform alone", () => {
    // transform と translate プロパティを混ぜると、ビルド時の CSS 最適化が
    // 閉状態だけを transform に畳み、開状態の translate が打ち消せなくなる。
    // 実際にドロワーが画面外に貼りついたので、混在を禁止する。
    const drawer = css.slice(css.indexOf("max-width: 1239px) and (hover: none)"));
    expect(drawer).toMatch(/\.side-nav\s*\{[^}]*transform:\s*translateX\(-100%\)/s);
    expect(drawer).toMatch(/\.side-nav\[data-open="true"\]\s*\{[^}]*transform:\s*none/s);
    expect(drawer).not.toMatch(/^\s*translate:/m);
  });
});
