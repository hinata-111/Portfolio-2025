import { act, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Reveal from "@/app/components/Reveal";
import { MockIntersectionObserver } from "@/vitest.setup";

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

  it("arms the rv/rv-dN classes and adds 'in' once IntersectionObserver reports the element entered view", () => {
    render(
      <Reveal as="div" delay={2} data-testid="rv2">
        <p>hello</p>
      </Reveal>
    );
    const el = screen.getByTestId("rv2");
    // Motion is enabled (matchMedia mock defaults to matches:false), so the
    // observer should have been armed immediately, before any intersection fires.
    expect(el).toHaveClass("rv");
    expect(el).toHaveClass("rv-d2");
    expect(el).not.toHaveClass("in");

    const observer = MockIntersectionObserver.instances.at(-1);
    expect(observer).toBeDefined();
    act(() => {
      observer!.trigger(true);
    });

    expect(el).toHaveClass("in");
  });

  it("skips the reveal animation entirely when prefers-reduced-motion is set", () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <Reveal as="div" data-testid="rv3">
        <p>hello</p>
      </Reveal>
    );
    const el = screen.getByTestId("rv3");
    expect(el).not.toHaveClass("rv");
    expect(el).not.toHaveClass("in");
  });
});
