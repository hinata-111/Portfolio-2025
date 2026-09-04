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

describe("bottom chapter navigation contract", () => {
  it("uses four fixed, accessible chapter buttons without a progress rail", () => {
    expect(css).toMatch(/\.chapter-nav\s*\{[^}]*position:\s*fixed/);
    expect(css).toMatch(/\.chapter-nav a\s*\{[^}]*min-height:\s*44px/);
    expect(css).not.toContain("chapter-nav-progress");
  });

  it("does not retain the previous side rail or fixed Contact control", () => {
    expect(css).not.toContain(".side-nav");
    expect(css).not.toContain(".contact-fab");
  });

  it("marks the current chapter with the yellow accent", () => {
    expect(css).toMatch(/\.chapter-nav a\.current\s*\{[^}]*color:\s*var\(--sun\)/);
    expect(css).toMatch(/:has\(#projects:target\)[^{]*\.chapter-nav a\[href="#projects"\][^{]*\{[^}]*color:\s*var\(--sun\)/);
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

  it("retains focus-visible and reduced-motion support for the editorial interactions", () => {
    expect(css).toMatch(/\.project-ledger a:focus-visible/);
    expect(css).toMatch(/\.essay a:focus-visible/);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });
});
