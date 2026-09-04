import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CosmicBackground from "@/app/components/CosmicBackground";

describe("CosmicBackground", () => {
  it("renders one static, non-interactive editorial background", () => {
    const { container } = render(<CosmicBackground />);

    expect(container.querySelector(".cosmic-background")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".cosmic-background")?.children).toHaveLength(0);
    expect(container.querySelectorAll("button, a, input, textarea, select, [tabindex]")).toHaveLength(0);
  });

  it("does not register scroll or resize behavior", () => {
    const add = vi.spyOn(window, "addEventListener");

    render(<CosmicBackground />);

    expect(add.mock.calls.some(([type]) => type === "scroll" || type === "resize")).toBe(false);
  });
});
