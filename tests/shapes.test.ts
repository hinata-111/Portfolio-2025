import { describe, it, expect } from "vitest";
import { timeline } from "@/app/content";
import {
  shapeLayout,
  starLayout,
  shootingStarLayout,
  constellationLayout,
} from "@/app/shapes";

describe("shapes data", () => {
  it("has the expected element counts", () => {
    expect(shapeLayout).toHaveLength(74);
    expect(starLayout).toHaveLength(140);
    expect(shootingStarLayout).toHaveLength(5);
  });

  it("keeps constellationLayout aligned with the timeline data", () => {
    expect(constellationLayout).toHaveLength(timeline.length);
  });

  it("only uses defined shape kinds and colors", () => {
    const kinds = new Set([
      "circle", "triangle", "square", "star", "diamond",
      "pentagon", "ring", "plus", "moon", "sparkle",
    ]);
    const colors = new Set(["pink", "teal", "yellow", "navy", "amber"]);
    for (const shape of shapeLayout) {
      expect(kinds.has(shape.kind)).toBe(true);
      expect(colors.has(shape.color)).toBe(true);
    }
  });

  it("keeps shape positions within the background layer's bounds", () => {
    for (const shape of shapeLayout) {
      expect(shape.top).toBeGreaterThanOrEqual(4);
      expect(shape.top).toBeLessThanOrEqual(96);
      expect(shape.left).toBeGreaterThanOrEqual(4);
      expect(shape.left).toBeLessThanOrEqual(92);
    }
  });
});
