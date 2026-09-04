import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("renders the approved section order, bottom navigation and footer", () => {
    const { container } = render(<Home />);
    const ids = ["about", "experience", "skills", "projects", "beyond", "contact"];
    ids.forEach((id) =>
      expect(document.getElementById(id)).not.toBeNull()
    );
    expect(Array.from(container.querySelectorAll(".wrap > section")).map((section) => section.id)).toEqual(ids);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("笑顔");
    expect(document.querySelector(".side-nav")).not.toBeInTheDocument();
    expect(document.querySelector(".contact-fab")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "主要セクションナビゲーション" })).toBeInTheDocument();
    expect(
      Array.from(container.querySelectorAll(".chapter-nav a")).map((link) => link.getAttribute("href")),
    ).toEqual(["#about", "#experience", "#skills", "#projects"]);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
  it("logs the console easter egg on mount", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<Home />);
    const logged = spy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(logged).toContain("SPOTLIGHT ON");
    spy.mockRestore();
  });
});
