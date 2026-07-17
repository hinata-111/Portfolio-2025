import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Reveal from "@/app/components/Reveal";
import SectionHead from "@/app/components/SectionHead";

describe("Reveal", () => {
  it("renders children with given tag and className", () => {
    render(
      <Reveal as="section" className="foo" data-testid="rv">
        <p>hello</p>
      </Reveal>
    );
    const el = screen.getByTestId("rv");
    expect(el.tagName).toBe("SECTION");
    expect(el).toHaveClass("foo");
  });
});

describe("SectionHead", () => {
  it("renders number and label", () => {
    render(<SectionHead num="01" label="About" />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });
});
