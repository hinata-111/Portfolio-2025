import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AboutPage, { metadata } from "@/app/about/page";
import { favoriteRadio, profile, timeline } from "@/app/content";

describe("About page", () => {
  it("shows About, Skills, the full Experience timeline and favourite radio in that order", () => {
    const { container } = render(<AboutPage />);
    expect(Array.from(container.querySelectorAll(".wrap > section")).map((section) => section.id)).toEqual([
      "about",
      "skills",
      "experience",
      "radio",
      "contact",
    ]);
    expect(screen.getByText(timeline[1].desc)).toBeInTheDocument();
  });

  it("lines up every favourite radio show as a square card with its title", () => {
    render(<AboutPage />);
    const section = document.getElementById("radio")!;
    expect(within(section).getByText("Radio")).toBeInTheDocument();
    expect(within(section).getByRole("heading", { level: 2, name: "好きなラジオ番組" })).toBeInTheDocument();

    const cards = Array.from(section.querySelectorAll(".radio-grid li"));
    expect(cards).toHaveLength(favoriteRadio.length);
    cards.forEach((card, i) => {
      expect(card).toHaveTextContent(favoriteRadio[i].title);
      expect(card.querySelector("img")).toHaveAttribute("src", favoriteRadio[i].imageSrc);
    });
  });

  it("uses the bar variant of the site nav and its own title", () => {
    const { container } = render(<AboutPage />);
    expect(container.querySelector(".site-nav--bar")).toBeInTheDocument();
    expect(metadata.title).toBe(`About | ${profile.name}`);
  });
});
