import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";
import { aboutParagraphs, contact, motto, socials, stack } from "@/app/content";

describe("About", () => {
  it("presents the portrait, info list, story and motto", () => {
    render(<About />);

    expect(document.getElementById("about")).not.toBeNull();
    expect(screen.getByRole("img", { name: /ポートレート/ }).closest("figure")).toHaveClass("about-portrait");
    expect(screen.getByRole("link", { name: contact.email })).toHaveAttribute("href", `mailto:${contact.email}`);
    aboutParagraphs.forEach((paragraph) => expect(screen.getByText(paragraph)).toBeInTheDocument());
    expect(screen.getByText(new RegExp(motto.quote.slice(0, 6)))).toBeInTheDocument();
  });

  it("links only socials with a URL and marks the rest 要確認", () => {
    render(<About />);

    expect(document.querySelectorAll(".about-socials li")).toHaveLength(socials.length);
    socials.forEach((social) => {
      if (social.href) {
        const link = screen.getByRole("link", { name: `${social.label}を開く` });
        expect(link).toHaveAttribute("href", social.href);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noreferrer");
      } else {
        expect(screen.queryByRole("link", { name: `${social.label}を開く` })).not.toBeInTheDocument();
        expect(screen.getByText(`${social.label} 要確認`)).toBeInTheDocument();
      }
    });
  });
});

describe("Skills", () => {
  it("renders one row per stack category with all its pills", () => {
    render(<Skills />);
    expect(document.getElementById("skills")).not.toBeNull();
    expect(document.querySelectorAll(".stack-row")).toHaveLength(stack.length);
    expect(screen.getByText("PyTorch")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });
});
