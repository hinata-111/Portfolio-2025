import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BottomChapterNav from "@/app/components/BottomChapterNav";

const sections = ["about", "experience", "skills", "projects"];

function renderNavigation() {
  render(
    <>
      {sections.map((id) => (
        <section id={id} key={id} />
      ))}
      <BottomChapterNav />
    </>,
  );
}

describe("BottomChapterNav", () => {
  it("shows only the four primary portfolio chapters in page order", () => {
    render(<BottomChapterNav />);

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "About",
      "Experience",
      "Skills",
      "Projects",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      sections.map((id) => `#${id}`),
    );
  });

  it("marks the chapter crossing the reading line as current", () => {
    renderNavigation();

    const experience = document.getElementById("experience");
    if (!experience) throw new Error("experience section not rendered");
    vi.spyOn(experience, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: window.innerHeight,
    } as DOMRect);

    fireEvent.scroll(window);

    expect(screen.getByRole("link", { name: "Experience" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("marks a chosen chapter immediately", () => {
    render(<BottomChapterNav />);

    fireEvent.click(screen.getByRole("link", { name: "Projects" }));

    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
