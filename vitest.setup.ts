import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(cleanup);

function defaultMatchMediaImpl(query: string) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

const matchMediaMock = vi.fn().mockImplementation(defaultMatchMediaImpl);

// OGP 画像のテストは Node 環境(window なし)で動くので、ブラウザ用モックはその時だけ入れない
const hasWindow = typeof window !== "undefined";

if (hasWindow) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: matchMediaMock,
  });
}

/**
 * jsdom does not implement IntersectionObserver. Reveal/BottomChapterNav
 * feature-detect it and no-op when it's undefined, which previously meant the actual
 * observer-driven reveal logic was never exercised by any test. This mock records
 * observed elements and exposes `trigger()` so tests can simulate a real intersection.
 */
export class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  private elements = new Set<Element>();
  private callback: IntersectionObserverCallback;

  static instances: MockIntersectionObserver[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.elements.add(el);
  }

  unobserve(el: Element) {
    this.elements.delete(el);
  }

  disconnect() {
    this.elements.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Simulate the observer firing for a specific subset of observed elements. */
  triggerFor(targets: Element[], isIntersecting: boolean) {
    const entries = targets.map(
      (target) =>
        ({
          isIntersecting,
          target,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        }) as IntersectionObserverEntry,
    );
    this.callback(entries, this);
  }

  /** Simulate the observer firing for every currently-observed element. */
  trigger(isIntersecting: boolean) {
    this.triggerFor(Array.from(this.elements), isIntersecting);
  }
}

if (hasWindow) {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockIntersectionObserver,
  });
}
Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

afterEach(() => {
  MockIntersectionObserver.instances = [];
  matchMediaMock.mockReset();
  matchMediaMock.mockImplementation(defaultMatchMediaImpl);
});
