import { act, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AmbientLight from "@/app/components/AmbientLight";
import { MockIntersectionObserver } from "@/vitest.setup";

describe("AmbientLight", () => {
  it("renders as an aria-hidden ambient layer container", () => {
    const { container } = render(<AmbientLight />);

    const ambient = container.querySelector(".ambient-light");
    expect(ambient).toBeInTheDocument();
    expect(ambient).toHaveAttribute("aria-hidden", "true");
  });

  it("activates the matching layer when an observed stage section intersects", async () => {
    const { container } = render(
      <>
        <section className="stage-ko" />
        <AmbientLight />
      </>,
    );

    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1));

    const observer = MockIntersectionObserver.instances[0];
    const chiLayer = container.querySelector('[data-stage="chi"]');
    const koLayer = container.querySelector('[data-stage="ko"]');
    const rakuLayer = container.querySelector('[data-stage="raku"]');

    expect(chiLayer).toHaveClass("is-active");
    expect(koLayer).not.toHaveClass("is-active");

    act(() => observer.trigger(true));

    expect(chiLayer).not.toHaveClass("is-active");
    expect(koLayer).toHaveClass("is-active");
    expect(rakuLayer).not.toHaveClass("is-active");
  });
});
