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
