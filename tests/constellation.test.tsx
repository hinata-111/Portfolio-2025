import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Constellation, { GLOW_LIFETIME_MS, GLOW_RADIUS, cursorGlow } from "@/app/components/Constellation";
import { driftingStars } from "@/app/shapes";

function fakeContext() {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    lineWidth: 0,
    strokeStyle: "",
    fillStyle: "",
  };
}

// finePointer: マウスなど、ホバーできる精密なポインターがある環境
function setReducedMotion(reduced: boolean, finePointer = false) {
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    matches: (reduced && query.includes("prefers-reduced-motion")) || (finePointer && query.includes("pointer: fine")),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("drifting star data", () => {
  it("is fixed by a seed, not by runtime randomness", () => {
    expect(driftingStars.length).toBeGreaterThanOrEqual(50);
    for (const star of driftingStars) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThan(1);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThan(1);
      expect(star.r).toBeGreaterThan(0);
      // ゆっくり漂う(1秒で画面幅の 1% 未満)
      expect(Math.abs(star.vx)).toBeLessThan(0.01);
      expect(Math.abs(star.vy)).toBeLessThan(0.01);
    }
  });
});

describe("cursor glow", () => {
  const star = { x: 100, y: 100 };

  it("is brightest right where the cursor just passed", () => {
    expect(cursorGlow(star, [{ x: 100, y: 100, t: 0 }], 0)).toBe(1);
  });

  it("does not reach stars outside the glow radius", () => {
    expect(cursorGlow(star, [{ x: 100 + GLOW_RADIUS, y: 100, t: 0 }], 0)).toBe(0);
  });

  it("fades as the trail point ages and is gone after its lifetime", () => {
    const trail = [{ x: 100, y: 100, t: 0 }];
    const early = cursorGlow(star, trail, GLOW_LIFETIME_MS * 0.25);
    const late = cursorGlow(star, trail, GLOW_LIFETIME_MS * 0.75);
    expect(early).toBeLessThan(1);
    expect(late).toBeLessThan(early);
    expect(late).toBeGreaterThan(0);
    expect(cursorGlow(star, trail, GLOW_LIFETIME_MS)).toBe(0);
  });

  it("takes the strongest trail point when several are near", () => {
    const near = { x: 100, y: 100, t: 0 };
    const far = { x: 100 + GLOW_RADIUS / 2, y: 100, t: 0 };
    expect(cursorGlow(star, [far, near], 0)).toBe(1);
  });
});

describe("Constellation", () => {
  let ctx: ReturnType<typeof fakeContext>;
  let raf: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    ctx = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
    raf = vi.fn().mockReturnValue(1);
    vi.stubGlobal("requestAnimationFrame", raf);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders one decorative canvas that never takes pointer input", () => {
    setReducedMotion(false);
    const { container } = render(<Constellation />);
    const canvas = container.querySelector("canvas.constellation");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
  });

  it("draws stars and connecting lines, then keeps animating", () => {
    setReducedMotion(false);
    render(<Constellation />);
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(raf).toHaveBeenCalled();
  });

  it("lets the stars trail the page scroll, nearer (bigger) stars moving faster", () => {
    setReducedMotion(false);
    vi.spyOn(performance, "now").mockReturnValue(0);
    render(<Constellation />);
    const tick = raf.mock.calls[0][0] as FrameRequestCallback;
    const yAt = (scroll: number) => {
      Object.defineProperty(window, "scrollY", { configurable: true, value: scroll });
      ctx.arc.mockClear();
      tick(0);
      return ctx.arc.mock.calls.map((call) => call[1] as number);
    };

    const still = yAt(0);
    const scrolled = yAt(100);
    const shift = still.map((y, i) => y - scrolled[i]);
    const height = document.documentElement.clientHeight || window.innerHeight;
    const normalized = shift.map((d) => ((d % height) + height) % height);
    // 文字(100px 上へ)より遅く、でも止まってはいない
    normalized.forEach((d) => {
      expect(d).toBeGreaterThan(0);
      expect(d).toBeLessThan(100);
    });
    const bigIndex = driftingStars.reduce((best, s, i) => (s.r > driftingStars[best].r ? i : best), 0);
    const smallIndex = driftingStars.reduce((best, s, i) => (s.r < driftingStars[best].r ? i : best), 0);
    expect(normalized[bigIndex]).toBeGreaterThan(normalized[smallIndex]);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  });

  it("draws a single still frame when the visitor prefers reduced motion", () => {
    setReducedMotion(true);
    render(<Constellation />);
    expect(ctx.arc).toHaveBeenCalled();
    expect(raf).not.toHaveBeenCalled();
  });

  it("stops the loop while the tab is hidden and on unmount", () => {
    setReducedMotion(false);
    const { unmount } = render(<Constellation />);
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);

    raf.mockClear();
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(raf).toHaveBeenCalledTimes(1);

    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it("lights up the stars the cursor passes and lets them fade back", () => {
    setReducedMotion(false, true);
    const now = vi.spyOn(performance, "now").mockReturnValue(0);
    render(<Constellation />);
    const tick = raf.mock.calls[0][0] as FrameRequestCallback;
    const radiiAt = (x: number, y: number) =>
      ctx.arc.mock.calls
        .filter((call) => Math.abs((call[0] as number) - x) < 0.5 && Math.abs((call[1] as number) - y) < 0.5)
        .map((call) => call[2] as number);

    // 先頭の星の位置(時刻 0・スクロール 0)にカーソルを置く
    const width = document.documentElement.clientWidth || window.innerWidth;
    const height = document.documentElement.clientHeight || window.innerHeight;
    const x = driftingStars[0].x * width;
    const y = driftingStars[0].y * height;
    act(() => {
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: x, clientY: y }));
    });
    ctx.arc.mockClear();
    tick(0);
    expect(Math.max(...radiiAt(x, y))).toBeGreaterThan(driftingStars[0].r);

    // 寿命が過ぎたら元の大きさに戻る。星はほぼ動かないよう、寿命ぶんだけ進める
    now.mockReturnValue(GLOW_LIFETIME_MS);
    ctx.arc.mockClear();
    tick(GLOW_LIFETIME_MS);
    const later = driftingStars[0];
    const laterX = (((later.x + later.vx * (GLOW_LIFETIME_MS / 1000)) % 1) + 1) % 1 * width;
    const laterY = (((later.y + later.vy * (GLOW_LIFETIME_MS / 1000)) % 1) + 1) % 1 * height;
    expect(radiiAt(laterX, laterY)).toEqual([later.r]);
  });

  it("only listens to the mouse when there is a fine pointer and motion is allowed", () => {
    const add = vi.spyOn(document, "addEventListener");
    const listensToMouse = () => add.mock.calls.some(([type]) => type === "mousemove");

    setReducedMotion(false, false);
    const touch = render(<Constellation />);
    expect(listensToMouse()).toBe(false);
    touch.unmount();

    setReducedMotion(true, true);
    const reduced = render(<Constellation />);
    expect(listensToMouse()).toBe(false);
    reduced.unmount();

    setReducedMotion(false, true);
    render(<Constellation />);
    expect(listensToMouse()).toBe(true);
  });

  it("stops listening to the mouse on unmount", () => {
    setReducedMotion(false, true);
    const remove = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<Constellation />);
    unmount();
    expect(remove.mock.calls.some(([type]) => type === "mousemove")).toBe(true);
  });

  it("debounces resize instead of redrawing on every event", () => {
    vi.useFakeTimers();
    setReducedMotion(true);
    render(<Constellation />);
    ctx.clearRect.mockClear();
    act(() => {
      for (let i = 0; i < 5; i += 1) window.dispatchEvent(new Event("resize"));
    });
    expect(ctx.clearRect).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
  });
});
