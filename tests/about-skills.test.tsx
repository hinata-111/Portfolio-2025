import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";
import { socials } from "@/app/content";

describe("About", () => {
  it("renders info list, story and motto", () => {
    render(<About />);
    expect(document.getElementById("about")).not.toBeNull();
    expect(document.querySelectorAll(".about-info li")).toHaveLength(4);
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
});

describe("Skills", () => {
  it("renders 5 stack rows with pills", () => {
    render(<Skills />);
    expect(document.getElementById("skills")).not.toBeNull();
    expect(document.querySelectorAll(".stack-row")).toHaveLength(5);
    expect(screen.getByText("PyTorch")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });
});
