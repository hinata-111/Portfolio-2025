import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";
import { aboutParagraphs, socials, stack } from "@/app/content";

describe("About", () => {
  it("presents the profile with a vertical portrait, identity, story and motto", () => {
    render(<About />);

    expect(document.getElementById("about")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "プロフィール" })).toBeInTheDocument();
    const portrait = screen.getByRole("img", {
      name: "夜の街並みを背景にした鈴木日向のポートレート",
    });
    expect(portrait).toHaveClass("about-portrait-image");
    expect(portrait.closest("figure")).toHaveClass("about-portrait");
    expect(screen.getByText("Hinata Suzuki")).toBeInTheDocument();
    expect(screen.queryByText("ENGINEER × ENTERTAINMENT")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".about-info li")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "yos570038@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:yos570038@gmail.com",
    );
    aboutParagraphs.forEach((paragraph) =>
      expect(screen.getByText(paragraph)).toBeInTheDocument(),
    );
    expect(screen.getByText(/之を楽しむ者に如かず/)).toBeInTheDocument();
    expect(screen.getByText("「楽しむ者」")).toBeInTheDocument();
  });

  it("shows social icon links and marks unresolved ones", () => {
    render(<About />);

    const items = document.querySelectorAll(".about-socials li");
    expect(items).toHaveLength(socials.length);

    const github = screen.getByRole("link", { name: "GitHubを開く" });
    expect(github).toHaveAttribute("href", "https://github.com/hinata-111");
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noreferrer");
    expect(github.querySelector("svg")).not.toBeNull();

    expect(screen.queryByRole("link", { name: "Xを開く" })).not.toBeInTheDocument();
    expect(screen.getByText("X 要確認")).toBeInTheDocument();
  });

  it("does not repeat the Projects index inside About", () => {
    render(<About />);

    expect(screen.queryByRole("navigation", { name: "プロジェクト索引" })).not.toBeInTheDocument();
    expect(document.querySelector(".about-projects")).not.toBeInTheDocument();
  });
});

describe("Skills", () => {
  it("renders 4 stack rows with pills", () => {
    render(<Skills />);
    expect(document.getElementById("skills")).not.toBeNull();
    expect(document.querySelectorAll(".stack-row")).toHaveLength(stack.length);
    expect(screen.getByText("PyTorch")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });
});
