import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CosmicBackground from "@/app/components/CosmicBackground";
import { starLayers } from "@/app/shapes";

afterEach(() => vi.restoreAllMocks());

const layerShifts = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>(".star-layer")]
    .map((layer) => Math.abs(parseFloat(layer.style.getPropertyValue("--star-shift"))));

describe("CosmicBackground", () => {
  it("renders exactly three star layers, nebulae, and one boundary", () => {
    const { container } = render(<CosmicBackground />);
    expect(container.querySelector(".cosmic-background")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".star-layer")).toHaveLength(3);
    expect(container.querySelectorAll(".nebula-layer")).toHaveLength(2);
    expect(container.querySelectorAll(".cosmic-boundary")).toHaveLength(1);
    expect(container.querySelectorAll("button, a, input, textarea, select, [tabindex]")).toHaveLength(0);
    expect(container.querySelector(".cosmic-scenes")).toBeNull();
    expect(container.querySelector(".cosmic-motif-layer")).toBeNull();
    expect(container.querySelector(".cosmic-shape")).toBeNull();
    expect(container.querySelector(".shooting-stars")).toBeNull();
    expect(container.querySelector(".shooting-star")).toBeNull();
  });
  it("stacks two identical tiles per layer so the scrolled starfield can wrap", () => {
    const { container } = render(<CosmicBackground />);
    const total = starLayers.far.stars.length + starLayers.mid.stars.length + starLayers.near.stars.length;
    expect(container.querySelectorAll(".star-tile")).toHaveLength(6);
    expect(container.querySelectorAll(".star-dot")).toHaveLength(total * 2);
    for (const layer of container.querySelectorAll(".star-layer")) {
      expect(layer.querySelectorAll(".star-tile")).toHaveLength(2);
    }
  });
  it("shifts every layer further than the page scrolls, deepest layer trailing", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 8000 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 300 });
    const { container } = render(<CosmicBackground />);
    const shifts = layerShifts(container);
    expect(shifts).toHaveLength(3);
    for (const shift of shifts) expect(shift).toBeGreaterThan(300);
    expect(shifts[1]).toBeGreaterThan(shifts[0]);
    expect(shifts[2]).toBeGreaterThan(shifts[1]);
  });
  it("moves the starfield when the page actually scrolls, via the queued frame", () => {
    // 「背景の星がスクロールで動かない」の回帰テスト。
    // scroll イベント → rAF → update という実際の経路を通して値が変わることを見る。
    let callback: FrameRequestCallback | undefined;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((next) => { callback = next; return 9; });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 8000 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    const { container } = render(<CosmicBackground />);
    expect(layerShifts(container)).toEqual([0, 0, 0]);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 200 });
    window.dispatchEvent(new Event("scroll"));
    callback?.(0);
    for (const shift of layerShifts(container)) expect(shift).toBeGreaterThan(200);
  });
  it("keeps accepting new frames after one has been served", () => {
    // ラッチが立ちっぱなしになると以降のスクロールが全部無視される
    let callback: FrameRequestCallback | undefined;
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation((next) => { callback = next; return 9; });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    const { container } = render(<CosmicBackground />);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 100 });
    window.dispatchEvent(new Event("scroll"));
    callback?.(0);
    const first = layerShifts(container);
    raf.mockClear();
    Object.defineProperty(window, "scrollY", { configurable: true, value: 300 });
    window.dispatchEvent(new Event("scroll"));
    expect(raf).toHaveBeenCalledTimes(1);
    callback?.(0);
    expect(layerShifts(container)).not.toEqual(first);
  });
  it("wraps the shift inside one tile so the starfield never runs out", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 8000 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 5000 });
    const { container } = render(<CosmicBackground />);
    for (const shift of layerShifts(container)) expect(shift).toBeLessThan(800);
  });
  it("uses one root progress variable and coalesces passive scroll updates", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 4);
    const add = vi.spyOn(window, "addEventListener");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
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
  it("raises --scroll-velocity on scroll and lets it decay back to zero", () => {
    vi.useFakeTimers();
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => { cb(0); return 1; });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    const { container } = render(<CosmicBackground />);
    const root = container.querySelector(".cosmic-background") as HTMLElement;
    Object.defineProperty(window, "scrollY", { configurable: true, value: 400 });
    window.dispatchEvent(new Event("scroll"));
    expect(Number(root.style.getPropertyValue("--scroll-velocity"))).toBeGreaterThan(0);
    vi.advanceTimersByTime(600);
    expect(root.style.getPropertyValue("--scroll-velocity")).toBe("0");
    raf.mockRestore();
    vi.useRealTimers();
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  });
  it("does not register scroll or resize listeners for reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    const add = vi.spyOn(window, "addEventListener"); render(<CosmicBackground />);
    expect(add.mock.calls.some(([type]) => type === "scroll" || type === "resize")).toBe(false);
  });
});
