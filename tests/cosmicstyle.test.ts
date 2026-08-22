import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
describe("cosmic depth-gate visual contract", () => {
  it("defines three depth layers, nebula, boundary, phases, and motion variables", () => {
    for (const selector of [".cosmic-background", ".star-layer", ".star-layer--far", ".star-layer--mid", ".star-layer--near", ".nebula-layer", ".cosmic-boundary"]) expect(css).toContain(selector);
    expect(css).toMatch(/--scroll-progress/); expect(css).toMatch(/--gate-approach/); expect(css).toMatch(/--gate-pass/); expect(css).toMatch(/--post-gate/);
    expect(css).toMatch(/\.star-layer--far[^}]*travel[^}]*60px/s); expect(css).toMatch(/\.star-layer--mid[^}]*travel[^}]*190px/s); expect(css).toMatch(/\.star-layer--near[^}]*travel[^}]*410px/s);
    expect(css).toMatch(/\.cosmic-boundary[^}]*transform/s); expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
  it("contains responsive and retired-selector contracts", () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*720px\)[\s\S]*\.cosmic-boundary/); expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.cosmic-boundary/);
    for (const selector of [".cosmic-scenes", ".cosmic-scene", ".cosmic-shape", ".cosmic-motif", ".orbit-ring", ".shooting-star", ".cosmic-grid", ".checkerboard", ".cosmic-lens", ".cosmic-ribbon", ".cosmic-arc"]) expect(css).not.toContain(selector);
    for (const token of ["--shape-pink", "--shape-teal", "--shape-yellow", "--shape-navy", "--cosmic-cyan", "--cosmic-pink"]) expect(css).not.toContain(token);
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
