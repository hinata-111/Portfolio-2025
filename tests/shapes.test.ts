import { describe, expect, it } from "vitest";
import { timeline } from "@/app/content";
import { constellationLayout, starLayers } from "@/app/shapes";

describe("scroll-depth star data", () => {
  it("exposes deterministic far, mid, and near layers with depth speeds", () => {
    expect(Object.keys(starLayers)).toEqual(["far", "mid", "near"]);
    expect(starLayers.far.stars.length).toBeGreaterThan(0);
    expect(starLayers.mid.stars.length).toBeGreaterThan(starLayers.far.stars.length);
    expect(starLayers.near.stars.length).toBeGreaterThan(starLayers.mid.stars.length);
    expect(starLayers.far.speed).toBe(1);
    expect(starLayers.mid.speed).toBe(2);
    expect(starLayers.near.speed).toBe(4);
    for (const layer of Object.values(starLayers)) for (const star of layer.stars) {
      expect(star.top).toBeGreaterThanOrEqual(0); expect(star.top).toBeLessThanOrEqual(100);
      expect(star.left).toBeGreaterThanOrEqual(0); expect(star.left).toBeLessThanOrEqual(100);
      expect(star.size).toBeGreaterThan(0);
    }
  });
  it("does not expose retired scene, motif, or shape data", async () => {
    const shapes = await import("@/app/shapes");
    expect(shapes).not.toHaveProperty("SCENE_DEFINITIONS");
    expect(shapes).not.toHaveProperty("COSMIC_MOTIFS");
    expect(shapes).not.toHaveProperty("SHAPE_KINDS");
  });
  it("preserves constellation data consumed by the page", () => {
    expect(constellationLayout).toHaveLength(timeline.length);
    expect(constellationLayout.at(-1)).toEqual({ x: 82, y: 82 });
  });
});
