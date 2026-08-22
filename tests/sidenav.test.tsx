import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SideNav from "@/app/components/SideNav";
import { MockIntersectionObserver } from "@/vitest.setup";

const expectedHrefs = [
  "#hero",
  "#about",
  "#skills",
  "#experience",
  "#projects",
  "#beyond",
  "#contact",
];

const expectedLabels = [
  "Top",
  "About",
  "Skills",
  "Experience",
  "Projects",
  "Life & Creative Practice",
  "Contact",
];

const expectedNums = ["00", "01", "02", "03", "04", "05", "06"];

function renderSideNavWithSections() {
  render(
    <>
      {expectedHrefs.map((href) => (
        <section key={href} id={href.slice(1)} />
      ))}
      <SideNav />
    </>,
  );
}

async function activeObserver() {
  await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1));
  return MockIntersectionObserver.instances[0];
}

function sectionEl(id: string) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`section #${id} not rendered`);
  return el;
}

describe("SideNav", () => {
  it("renders 7 section links with the correct hrefs", () => {
    render(<SideNav />);

    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(7);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(expectedHrefs);
  });

  it("renders a labelled navigation landmark", () => {
    render(<SideNav />);

    expect(
      screen.getByRole("navigation", { name: "セクションナビゲーション" }),
    ).toBeInTheDocument();
  });

  it("shows a section number and a readable label on every row", () => {
    render(<SideNav />);

    const nums = Array.from(document.querySelectorAll(".side-nav-num"));
    expect(nums.map((num) => num.textContent)).toEqual(expectedNums);
    nums.forEach((num) => expect(num).toHaveAttribute("aria-hidden", "true"));

    const labels = Array.from(document.querySelectorAll(".side-nav-label"));
    expect(labels.map((label) => label.textContent)).toEqual(expectedLabels);
  });

  it("has no current section before any intersection is reported", () => {
    render(<SideNav />);

    expect(document.querySelectorAll("[aria-current]")).toHaveLength(0);
  });

  it("marks the intersecting section as current", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("projects")], true));

    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(document.querySelectorAll("[aria-current]")).toHaveLength(1);
  });

  it("prefers the topmost section when several are visible at once", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("about"), sectionEl("skills")], true));

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "Skills" })).not.toHaveAttribute("aria-current");
  });

  it("moves the current marker back when an earlier section returns to view", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("projects")], true));
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    act(() => observer.triggerFor([sectionEl("projects")], false));
    act(() => observer.triggerFor([sectionEl("skills")], true));

    expect(screen.getByRole("link", { name: "Skills" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "Projects" })).not.toHaveAttribute("aria-current");
  });

  it("keeps the last current section while nothing is intersecting", async () => {
    renderSideNavWithSections();
    const observer = await activeObserver();

    act(() => observer.triggerFor([sectionEl("beyond")], true));
    act(() => observer.triggerFor([sectionEl("beyond")], false));

    expect(screen.getByRole("link", { name: "Life & Creative Practice" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
