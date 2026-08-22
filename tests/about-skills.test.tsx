import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";
import { projects, socials, stack } from "@/app/content";

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

  it("indexes every project and links down to its card", () => {
    render(<About />);

    const index = screen.getByRole("navigation", { name: "プロジェクト索引" });
    const links = Array.from(index.querySelectorAll("a"));

    expect(links).toHaveLength(projects.length);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      projects.map((_, i) => `#project-${i}`),
    );
    expect(links[0]).toHaveTextContent(projects[0].title);
    expect(links[0]).toHaveTextContent(projects[0].summary);
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
