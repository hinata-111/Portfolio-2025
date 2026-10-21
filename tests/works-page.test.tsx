import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WorksPage, { metadata } from "@/app/works/page";
import { beyond, profile, projects } from "@/app/content";

describe("Works page", () => {
  it("shows the project ledger and then the essays", () => {
    const { container } = render(<WorksPage />);
    expect(Array.from(container.querySelectorAll(".wrap > section")).map((section) => section.id)).toEqual([
      "projects",
      "beyond",
      "contact",
    ]);
  });

  it("has an anchor for every work card on the top page", () => {
    render(<WorksPage />);
    [...projects, ...beyond].forEach((work) => expect(document.getElementById(work.slug)).not.toBeNull());
  });

  it("uses the bar variant of the site nav and its own title", () => {
    const { container } = render(<WorksPage />);
    expect(container.querySelector(".site-nav--bar")).toBeInTheDocument();
    expect(container.querySelector(".social-rail")).toBeInTheDocument();
    expect(metadata.title).toBe(`Works | ${profile.name}`);
  });
});
