import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Hero from "@/app/components/Hero";
import { profile } from "@/app/content";

describe("Hero", () => {
  it("renders catch phrase with two highlighted words", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(within(h1).getByText("笑顔")).toHaveClass("hl");
    expect(within(h1).getByText("心を動かす")).toHaveClass("hl");
    expect(screen.getByText(profile.name)).toBeInTheDocument();
    expect(h1).toBeInTheDocument();
  });

  it("renders a decorative fade between the hero and the first section", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector(".hero-fade")).toHaveAttribute("aria-hidden", "true");
  });

  it("does not render the retired orbit ring decoration", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector(".orbit-ring")).toBeNull();
  });
});
