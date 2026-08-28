"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { starLayers, type StarLayer } from "@/app/shapes";

const LAYERS: Array<[keyof typeof starLayers, StarLayer]> = [
  ["far", starLayers.far], ["mid", starLayers.mid], ["near", starLayers.near],
];

const SCROLL_VELOCITY_DECAY_MS = 550;
const SCROLL_VELOCITY_REFERENCE_PX_PER_MS = 3.2;

export default function CosmicBackground() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const layers = [...root.querySelectorAll<HTMLElement>(".star-layer")];
    let frame: number | null = null;
    let queued = false;
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let velocityResetTimer: ReturnType<typeof setTimeout> | null = null;
    const update = () => {
      const now = performance.now();
      const deltaY = Math.abs(window.scrollY - lastScrollY);
      const deltaT = Math.max(1, now - lastTime);
      const velocity = Math.min(1, deltaY / deltaT / SCROLL_VELOCITY_REFERENCE_PX_PER_MS);
      root.style.setProperty("--scroll-velocity", String(velocity));
      lastScrollY = window.scrollY;
      lastTime = now;
      if (velocityResetTimer !== null) clearTimeout(velocityResetTimer);
      velocityResetTimer = setTimeout(() => {
        root.style.setProperty("--scroll-velocity", "0");
      }, SCROLL_VELOCITY_DECAY_MS);
      // 背景をページより速く流す。1タイル(=1画面分)でラップさせるので星が尽きない
      const tile = Math.max(1, window.innerHeight);
      for (const layer of layers) {
        const speed = Number(layer.dataset.speed) || 1;
        layer.style.setProperty("--star-shift", `${-((window.scrollY * speed) % tile)}px`);
      }
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const approach = Math.min(1, Math.max(0, (progress - 0.35) / 0.3));
      const pass = Math.min(1, Math.max(0, (progress - 0.65) / 0.15));
      const post = Math.min(1, Math.max(0, (progress - 0.8) / 0.2));
      const gateOpacity = Math.min(1, Math.max(0, (progress - 0.35) / 0.08)) * (1 - Math.min(1, Math.max(0, (progress - 0.72) / 0.08)));
      root.style.setProperty("--scroll-progress", String(progress));
      root.style.setProperty("--gate-approach", String(approach));
      root.style.setProperty("--gate-pass", String(pass));
      root.style.setProperty("--post-gate", String(post));
      root.style.setProperty("--gate-opacity", String(gateOpacity));
      root.style.setProperty("--gate-scale", String(0.35 + approach * 2.8 + pass * 4.85));
      root.style.setProperty("--post-density", String(post * 0.55));
      root.style.setProperty("--pre-nebula-opacity", String(0.18 - post * 0.1));
      root.style.setProperty("--post-nebula-opacity", String(post * 0.28));
      queued = false;
      frame = null;
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(update);
    };
    root.style.setProperty("--scroll-progress", "0");
    root.style.setProperty("--gate-approach", "0");
    root.style.setProperty("--gate-pass", "0");
    root.style.setProperty("--post-gate", "0");
    root.style.setProperty("--gate-opacity", "0");
    root.style.setProperty("--gate-scale", "0.35");
    root.style.setProperty("--post-density", "0");
    root.style.setProperty("--pre-nebula-opacity", ".18");
    root.style.setProperty("--post-nebula-opacity", "0");
    root.style.setProperty("--scroll-velocity", "0");
    for (const layer of layers) layer.style.setProperty("--star-shift", "0px");
    update();
    if (!reduced) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
    }
    return () => {
      if (!reduced) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      }
      if (frame !== null) cancelAnimationFrame(frame);
      if (velocityResetTimer !== null) clearTimeout(velocityResetTimer);
    };
  }, []);

  return (
    <div ref={rootRef} className="cosmic-background" aria-hidden="true">
      {LAYERS.map(([name, layer]) => (
        <div key={name} className={`star-layer star-layer--${name}`} data-depth={name} data-speed={layer.speed}>
          {/* 同じ星並びを2枚重ねる。1枚ぶん流れきったところで shift が 0 に戻るので継ぎ目が出ない */}
          {[0, 1].map((tile) => (
            <div key={tile} className="star-tile">
              {layer.stars.map((star, index) => (
                <span key={`${name}-${tile}-${index}`} className="star-dot" data-fade-after-gate={star.fadeAfterGate ? "true" : "false"} style={{
                  "--top": `${star.top}%`, "--left": `${star.left}%`, "--size": `${star.size}px`, "--star-opacity": star.opacity,
                } as CSSProperties} />
              ))}
            </div>
          ))}
        </div>
      ))}
      <div className="nebula-layer nebula-layer--pre" />
      <div className="nebula-layer nebula-layer--post" />
      <div className="cosmic-boundary" />
    </div>
  );
}
