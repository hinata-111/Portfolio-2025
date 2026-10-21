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
  });

  it("adds the introduction but leaves name and affiliation to the profile section below", () => {
    const { container } = render(<Hero />);

    expect(screen.getByText(profile.intro)).toBeInTheDocument();
    expect(screen.getByText(profile.roleLine)).toBeInTheDocument();
    expect(container.querySelector(".hero-signature")).not.toBeInTheDocument();
    expect(screen.queryByText(profile.name)).not.toBeInTheDocument();
    profile.affiliations.forEach((a) => expect(screen.queryByText(a)).not.toBeInTheDocument());
    expect(container.querySelector(".hero-sub")).not.toBeInTheDocument();
    expect(screen.queryByText(profile.eyebrow)).not.toBeInTheDocument();
  });

  it("keeps the full-screen opening without a framed panel", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector(".hero-panel")).not.toBeInTheDocument();
    expect(container.querySelector(".social-rail")).not.toBeInTheDocument();
    expect(container.querySelector(".scroll-cue")).toHaveAttribute("aria-hidden", "true");
  });

  it("uses the selected sample's quiet orbit without the previous glow layers", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector(".hero-orbit")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".glow")).not.toBeInTheDocument();
    expect(container.querySelector(".nebula")).not.toBeInTheDocument();
    expect(container.querySelector(".hero-fade")).not.toBeInTheDocument();
  });
});
