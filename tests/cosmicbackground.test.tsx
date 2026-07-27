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

  it("sets an inline height on the background layers computed from the document height", () => {
    const { container } = render(<CosmicBackground />);
    const starfield = container.querySelector(".starfield") as HTMLElement;
    const shapes = container.querySelector(".floating-shapes") as HTMLElement;
    expect(starfield.style.height).not.toBe("");
    expect(shapes.style.height).not.toBe("");
  });
});
