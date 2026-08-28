import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

// 小さい方に 9〜17px が15段階も並んでいたせいで、見出しとの落差が読めなくなっていた。
// 刻みを畳んで段数を減らし、1段ごとの差をはっきりさせる。
const SCALE = [
  "--fs-label",
  "--fs-meta",
  "--fs-note",
  "--fs-body",
  "--fs-lead",
  "--fs-title",
  "--fs-title-lg",
  "--fs-section",
  "--fs-hero",
] as const;

describe("type scale", () => {
  it("defines the shared scale once", () => {
    for (const token of SCALE) {
      expect(css).toMatch(new RegExp(`\\${token}:\\s*[^;]+;`));
    }
  });

  it("routes every font-size through the scale instead of a raw size", () => {
    const raw = [...css.matchAll(/font-size:\s*([^;}]+)[;}]/g)]
      .map((match) => match[1].trim())
      .filter((value) => !value.startsWith("var(--fs-"));
    expect(raw).toEqual([]);
  });

  it("keeps each step clearly apart so the jump to a heading reads", () => {
    const step = (token: string) => {
      const found = css.match(new RegExp(`\\${token}:\\s*([^;]+);`));
      if (!found) throw new Error(`${token} is not defined`);
      const max = found[1].trim().match(/([\d.]+)px\s*\)?\s*$/);
      if (!max) throw new Error(`${token} has no px size: ${found[1]}`);
      return Number(max[1]);
    };
    const sizes = SCALE.map(step);
    // 単調増加、かつ隣り合う段が 1px 差のような見分けのつかない刻みにならない
    for (let i = 1; i < sizes.length; i += 1) {
      expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
      expect(sizes[i] / sizes[i - 1]).toBeGreaterThanOrEqual(1.1);
    }
  });
});
