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

  it("adds the introduction and presents identity as an editorial signature", () => {
    const { container } = render(<Hero />);

    expect(
      screen.getByText("企画から実装まで一貫して、AI・Web技術でアイデアを形にする。"),
    ).toBeInTheDocument();
    expect(container.querySelector(".hero-signature")).toBeInTheDocument();
    expect(container.querySelector(".hero-sub")).not.toBeInTheDocument();
    expect(screen.queryByText(profile.eyebrow)).not.toBeInTheDocument();
  });

  it("keeps the requested scroll marker", () => {
    const { container } = render(<Hero />);

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
