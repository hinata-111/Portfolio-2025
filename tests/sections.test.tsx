import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";

describe("Experience", () => {
  it("renders 5 timeline items with todo badge on radio", () => {
    render(<Experience />);
    expect(document.querySelectorAll(".timeline li")).toHaveLength(5);
    expect(screen.getByText("期間")).toHaveClass("todo");
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
