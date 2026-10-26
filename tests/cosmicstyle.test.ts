import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// 見た目の細かい値はスクショ照合で見る。ここでは CLAUDE.md の品質要件と、過去に壊れた箇所だけを守る。
const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
const connectCss = readFileSync(resolve(process.cwd(), "app/connect/connect.module.css"), "utf8");
const mobile = css.slice(css.indexOf("@media (max-width: 720px)"));

describe("quality requirements", () => {
  it("disables animation under prefers-reduced-motion", () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it("outlines every link, button and the mobile menu toggle on :focus-visible", () => {
    expect(css).toMatch(/a:focus-visible,\s*button:focus-visible\s*\{[^}]*outline:/);
    expect(mobile).toMatch(/\.site-nav summary:focus-visible\s*\{[^}]*outline:/);
  });

  it("keeps touch targets at least 44px", () => {
    expect(css).toMatch(/\.site-nav a\s*\{[^}]*min-height:\s*44px/);
    expect(mobile).toMatch(/\.site-nav summary\s*\{[^}]*min-height:\s*44px/);
    expect(connectCss).toMatch(/\.detailsButton\s*\{[^}]*min-width:\s*2\.75rem/);
    expect(connectCss).toMatch(/\.detailsButton\s*\{[^}]*min-height:\s*2\.75rem/);
  });

  it("keeps the dark palette regardless of the device color scheme", () => {
    const rootStart = css.indexOf(":root {");
    expect(css.slice(rootStart, css.indexOf("\n}", rootStart))).toMatch(/color-scheme:\s*dark/);
    expect(css).not.toMatch(/prefers-color-scheme:\s*light/);
  });
});

describe("regressions", () => {
  it("keeps each highlighted Hero phrase on one marker box at narrow widths", () => {
    expect(css).toMatch(/\.hl\s*\{[^}]*display:\s*inline-block/);
  });

  it("caps the featured travel photo height instead of letting it grow with its width", () => {
    const rule = css.match(/\.essay-feature \.essay-image\s*\{([^}]*)\}/)?.[1] ?? "";
    const max = rule.match(/height:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)px\)/)?.[1];
    expect(Number(max)).toBeLessThanOrEqual(360);
  });

  it("keeps the mobile timeline in three columns without horizontal overflow", () => {
    expect(css).toMatch(
      /@media\s*\(max-width:\s*620px\)[\s\S]*?\.timeline li\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*72px\)\s+20px\s+minmax\(0,\s*1fr\)/,
    );
  });

  it("offsets only pages that carry the site nav, leaving /connect's own layout alone", () => {
    const wide = css.slice(css.indexOf("@media (min-width: 1100px)"));
    expect(wide).toMatch(/main:has\(> \.site-nav\)\s*\{[^}]*padding-left:/);
    expect(css).not.toMatch(/(^|[\s}])main\s*\{[^}]*padding-(top|left):/);
  });
});
