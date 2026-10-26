import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Hero from "@/app/components/Hero";
import { profile } from "@/app/content";

describe("Hero", () => {
  it("renders catch phrase with two highlighted words", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(within(h1).getByText(profile.catchTop)).toHaveClass("hl");
    expect(within(h1).getByText(profile.catchBottom)).toHaveClass("hl");
  });

  it("shows the introduction and role line, leaving the name to the profile section below", () => {
    render(<Hero />);
    expect(screen.getByText(profile.intro)).toBeInTheDocument();
    expect(screen.getByText(profile.roleLine)).toBeInTheDocument();
    expect(screen.queryByText(profile.name)).not.toBeInTheDocument();
  });

  it("hides the decorative orbit and scroll cue from assistive tech", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector(".hero-orbit")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".scroll-cue")).toHaveAttribute("aria-hidden", "true");
  });
});
