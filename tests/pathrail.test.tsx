import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PathRail from "@/app/components/PathRail";
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

function renderPathRailWithSections() {
  return render(
    <>
      {expectedHrefs.map((href) => (
        <section key={href} id={href.slice(1)} />
      ))}
      <PathRail />
    </>,
  );
}

describe("PathRail", () => {
  it("renders 7 section links with the correct hrefs", () => {
    render(<PathRail />);

    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(7);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(expectedHrefs);
  });

  it("renders a labelled navigation landmark", () => {
    render(<PathRail />);

    expect(screen.getByRole("navigation", { name: "ページ内位置" })).toBeInTheDocument();
  });

  it("lights observed section links and keeps them lit", async () => {
    renderPathRailWithSections();

    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1));

    const observer = MockIntersectionObserver.instances[0];
    const links = screen.getAllByRole("link");

    act(() => observer.trigger(true));
    links.forEach((link) => expect(link).toHaveClass("lit"));

    act(() => observer.trigger(false));
    links.forEach((link) => expect(link).toHaveClass("lit"));
  });
});
