import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CosmicBackground from "@/app/components/CosmicBackground";
import { starLayers } from "@/app/shapes";

afterEach(() => vi.restoreAllMocks());

describe("CosmicBackground", () => {
  it("renders exactly three star layers, nebulae, and one boundary", () => {
    const { container } = render(<CosmicBackground />);
    expect(container.querySelector(".cosmic-background")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".star-layer")).toHaveLength(3);
    expect(container.querySelectorAll(".star-dot")).toHaveLength(starLayers.far.stars.length + starLayers.mid.stars.length + starLayers.near.stars.length);
    expect(container.querySelectorAll(".nebula-layer")).toHaveLength(2);
    expect(container.querySelectorAll(".cosmic-boundary")).toHaveLength(1);
    expect(container.querySelectorAll("button, a, input, textarea, select, [tabindex]")).toHaveLength(0);
    expect(container.querySelector(".cosmic-scenes")).toBeNull();
    expect(container.querySelector(".cosmic-motif-layer")).toBeNull();
    expect(container.querySelector(".cosmic-shape")).toBeNull();
  });
  it("uses one root progress variable and coalesces passive scroll updates", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 4);
    const add = vi.spyOn(window, "addEventListener");
    const { container } = render(<CosmicBackground />);
    const root = container.querySelector(".cosmic-background") as HTMLElement;
    const scroll = add.mock.calls.find(([type]) => type === "scroll");
    expect(scroll?.[2]).toMatchObject({ passive: true });
    window.dispatchEvent(new Event("scroll")); window.dispatchEvent(new Event("scroll"));
    expect(raf).toHaveBeenCalledTimes(1);
    expect(root.style.getPropertyValue("--scroll-progress")).toBe("0");
  });
  it("calculates initial progress and exposes continuous post-gate variables", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 2000 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 500 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 1350 });
    const { container } = render(<CosmicBackground />);
    const root = container.querySelector(".cosmic-background") as HTMLElement;
    expect(Number(root.style.getPropertyValue("--scroll-progress"))).toBeCloseTo(0.9);
    expect(Number(root.style.getPropertyValue("--post-gate"))).toBeGreaterThan(0);
    expect(Number(root.style.getPropertyValue("--post-gate"))).toBeLessThan(1);
    expect(root.style.getPropertyValue("--gate-opacity")).toBe("0");
  });
  it("clamps progress, recalculates on resize, and cleans up queued work", () => {
    let callback: FrameRequestCallback | undefined;
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation((next) => { callback = next; return 7; });
    const cancel = vi.spyOn(window, "cancelAnimationFrame"); const remove = vi.spyOn(window, "removeEventListener");
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 2000 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 500 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 3000 });
    const { container, unmount } = render(<CosmicBackground />);
    window.dispatchEvent(new Event("scroll")); callback?.(0);
    const root = container.querySelector(".cosmic-background") as HTMLElement;
    expect(root.style.getPropertyValue("--scroll-progress")).toBe("1");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 }); window.dispatchEvent(new Event("resize"));
    expect(raf).toHaveBeenCalledTimes(2); unmount();
    expect(cancel).toHaveBeenCalledWith(7);
    expect(remove.mock.calls.some(([type]) => type === "scroll")).toBe(true);
    expect(remove.mock.calls.some(([type]) => type === "resize")).toBe(true);
  });
  it("does not register scroll or resize listeners for reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    const add = vi.spyOn(window, "addEventListener"); render(<CosmicBackground />);
    expect(add.mock.calls.some(([type]) => type === "scroll" || type === "resize")).toBe(false);
  });
});
