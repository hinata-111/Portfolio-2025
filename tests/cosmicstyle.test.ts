import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
describe("cosmic editorial background contract", () => {
  it("uses the selected sample's two restrained glows and dark page gradient", () => {
    const start = css.indexOf(".cosmic-background {");
    const block = css.slice(start, css.indexOf("\n}", start) + 2);

    expect(block).toContain("radial-gradient(circle at 82% 5%, rgba(94,112,255,.27), transparent 18%)");
    expect(block).toContain("radial-gradient(circle at 12% 45%, rgba(67,91,180,.18), transparent 16%)");
    expect(block).toContain("linear-gradient(180deg, var(--night-2), var(--night) 32%, #0b1026 70%, #11182f)");
  });

  it("uses a sparse static star texture like the selected sample", () => {
    expect(css).toMatch(/\.cosmic-background::before\s*\{[^}]*opacity:\s*\.34/);
    expect(css).toMatch(/\.cosmic-background::before\s*\{[^}]*background-size:\s*100px 100px,\s*137px 137px,\s*169px 169px,\s*121px 121px/);
  });

  it("does not retain the previous moving depth gate background", () => {
    for (const selector of [".star-layer", ".star-tile", ".star-dot", ".nebula-layer", ".cosmic-boundary"]) {
      expect(css).not.toContain(selector);
    }
    for (const token of ["--scroll-progress", "--gate-approach", "--gate-pass", "--post-gate", "--scroll-velocity"]) {
      expect(css).not.toContain(token);
    }
  });

  it("keeps the dark palette regardless of the device color scheme", () => {
    const rootStart = css.indexOf(":root {");
    const rootBlock = css.slice(rootStart, css.indexOf("\n}", rootStart) + 2);

    expect(rootBlock).toMatch(/color-scheme:\s*dark/);
    expect(css).not.toMatch(/prefers-color-scheme:\s*light/);
    expect(css).not.toContain(':root[data-theme="light"]');
  });
});

describe("site navigation contract", () => {
  it("drops the fixed bottom chapter bar in favour of the site nav", () => {
    expect(css).not.toContain(".chapter-nav");
    expect(css).toMatch(/\.site-nav a\s*\{[^}]*min-height:\s*44px/);
  });

  it("moves the site nav into a left sidebar on wide screens like the reference", () => {
    const wide = css.slice(css.indexOf("@media (min-width: 1100px)"));
    expect(wide).toMatch(/\.site-nav--bar\s*\{[^}]*position:\s*fixed/);
    // サイドバーはトップでもスクロールに追従して固定。右には SNS の縦レールを固定
    expect(css).not.toContain(".site-nav--hero");
    expect(wide).toMatch(/\.site-nav \.social-rail\s*\{[^}]*position:\s*fixed/);
    expect(wide).toMatch(/main:has\(> \.site-nav\)\s*\{[^}]*padding-right:/);
    // /connect は独自レイアウトなので、サイトナビを持つページだけずらす
    expect(wide).toMatch(/main:has\(> \.site-nav\)\s*\{[^}]*padding-left:/);
    expect(css).not.toMatch(/(^|[\s}])main\s*\{[^}]*padding-(top|left):/);
    expect(wide).toMatch(/\.site-nav-links\s*\{[^}]*display:\s*grid/);
  });

  it("does not retain the previous side rail or fixed Contact control", () => {
    expect(css).not.toContain(".side-nav");
    expect(css).not.toContain(".contact-fab");
  });

  it("collapses the site nav into a 44px menu button on small screens", () => {
    const mobile = css.slice(css.indexOf("@media (max-width: 720px)"));
    expect(mobile).toMatch(/\.site-nav summary\s*\{[^}]*min-height:\s*44px/);
    expect(mobile).toMatch(/\.work-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/);
  });
});

describe("cosmic editorial section contracts", () => {
  it("keeps each highlighted Hero phrase on one marker box at narrow widths", () => {
    expect(css).toMatch(/\.hl\s*\{[^}]*display:\s*inline-block/);
  });

  it("uses thin-rule editorial containers rather than project cards or constellation history", () => {
    expect(css).toContain(".project-ledger");
    expect(css).toContain(".project-ledger-entry");
    expect(css).toContain(".essay-feature");
    expect(css).not.toContain(".constellation-map");
    expect(css).not.toContain(".const-star");
    expect(css).not.toContain(".project--featured");
  });

  it("caps the featured travel photo height instead of letting it grow with its width", () => {
    const rule = css.match(/\.essay-feature \.essay-image\s*\{([^}]*)\}/)?.[1] ?? "";
    const max = rule.match(/height:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)px\)/)?.[1];
    expect(Number(max)).toBeLessThanOrEqual(360);
    expect(css).toMatch(/\.essay-feature \.essay-image img\s*\{[^}]*object-position:/);
  });

  it("retains focus-visible and reduced-motion support for the editorial interactions", () => {
    expect(css).toMatch(/\.project-ledger a:focus-visible/);
    expect(css).toMatch(/\.essay a:focus-visible/);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });
});
