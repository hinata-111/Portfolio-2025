import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const css = read("app/globals.css");

const token = (name: string) => {
  const found = css.match(new RegExp(`\\${name}:\\s*([^;]+);`));
  if (!found) throw new Error(`${name} is not defined`);
  return found[1].trim();
};
const maxPx = (value: string) => {
  const all = [...value.matchAll(/([\d.]+)px/g)].map((m) => Number(m[1]));
  if (!all.length) throw new Error(`no px in ${value}`);
  return Math.max(...all);
};

describe("section spacing", () => {
  it("defines the shared spacing tokens", () => {
    expect(maxPx(token("--space-section"))).toBeGreaterThan(0);
    expect(maxPx(token("--space-heading"))).toBeGreaterThan(0);
  });

  it("keeps the gap between sections from eating the screen", () => {
    // 上下 padding の合計がセクション間の余白。画面の高さを埋め尽くすと
    // スクロールしても何も無い時間が生まれる。
    const gap = maxPx(token("--space-section")) * 2;
    expect(gap).toBeLessThanOrEqual(150);
  });

  it("still separates sections more than anything inside one", () => {
    const gap = maxPx(token("--space-section")) * 2;
    expect(gap).toBeGreaterThan(maxPx(token("--space-heading")) * 2);
  });

  it("routes section and heading spacing through the tokens", () => {
    expect(css).toMatch(/section\s*\{[^}]*padding:\s*var\(--space-section\)\s+0/s);
    expect(css).toMatch(/\bh2\s*\{[^}]*margin:\s*0 0 var\(--space-heading\)/s);
  });

  it("lets every section use the shared rule instead of its own padding", () => {
    // About だけインライン style で独自 padding を持っていて、間隔が揃わなかった
    expect(read("app/components/About.tsx")).not.toMatch(/padding:\s*["']/);
    expect(css).not.toMatch(/@media[^{]*\{[^}]*\bsection\s*\{\s*padding:\s*\d/s);
  });
});
