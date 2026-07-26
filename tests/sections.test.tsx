import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
import { timeline } from "@/app/content";

describe("Experience", () => {
  it("renders 5 timeline items", () => {
    render(<Experience />);
    expect(document.querySelectorAll(".timeline li")).toHaveLength(5);
  });

  it("renders a decorative constellation map matching the timeline length", () => {
    render(<Experience />);
    const map = document.querySelector(".constellation-map");
    expect(map).toHaveAttribute("aria-hidden", "true");
    const stars = document.querySelectorAll(".const-star");
    expect(stars).toHaveLength(5);
    expect(document.querySelectorAll(".constellation-map svg line")).toHaveLength(4);
  });

  it("gives each constellation star a focusable tooltip with the matching timeline entry", () => {
    render(<Experience />);
    const stars = document.querySelectorAll(".const-star");
    stars.forEach((star, i) => {
      expect(star).toHaveAttribute("tabIndex", "0");
      const tip = star.querySelector(".tip");
      expect(tip).not.toBeNull();
      expect(tip?.textContent).toContain(timeline[i].title);
      expect(tip?.textContent).toContain(timeline[i].when);
    });
  });
});

describe("Projects", () => {
  it("renders 3 projects with rows and tags", () => {
    render(<Projects />);
    expect(document.querySelectorAll(".project")).toHaveLength(3);
    expect(screen.getAllByText("公開可否 要確認")).toHaveLength(2);
    expect(screen.getAllByText("課題")).toHaveLength(3);
  });
});

describe("Beyond", () => {
  it("renders 3 cards with photo placeholders", () => {
    render(<Beyond />);
    expect(document.querySelectorAll(".beyond")).toHaveLength(3);
    expect(screen.getByText("素材待ち:旅の写真")).toBeInTheDocument();
  });
});
