import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CosmicBackground from "@/app/components/CosmicBackground";
import { shapeLayout, starLayout, shootingStarLayout } from "@/app/shapes";

describe("CosmicBackground", () => {
  it("renders background layers as aria-hidden with counts matching shapes.ts data", () => {
    const { container } = render(<CosmicBackground />);
    expect(container.querySelector(".starfield")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".shooting-stars")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".floating-shapes")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".star-dot")).toHaveLength(starLayout.length);
    expect(container.querySelectorAll(".shooting-star")).toHaveLength(shootingStarLayout.length);
    expect(container.querySelectorAll(".shape")).toHaveLength(shapeLayout.length);
  });
});
