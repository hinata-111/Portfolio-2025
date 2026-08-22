"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { starLayers, type StarLayer } from "@/app/shapes";

const LAYERS: Array<[keyof typeof starLayers, StarLayer]> = [
  ["far", starLayers.far], ["mid", starLayers.mid], ["near", starLayers.near],
];

export default function CosmicBackground() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame: number | null = null;
    let queued = false;
    const update = () => {
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
    };
  }, []);

  return (
    <div ref={rootRef} className="cosmic-background" aria-hidden="true">
      {LAYERS.map(([name, layer]) => (
        <div key={name} className={`star-layer star-layer--${name}`} data-depth={name}>
          {layer.stars.map((star, index) => (
            <span key={`${name}-${index}`} className="star-dot" data-fade-after-gate={star.fadeAfterGate ? "true" : "false"} style={{
              "--top": `${star.top}%`, "--left": `${star.left}%`, "--size": `${star.size}px`, "--star-opacity": star.opacity,
            } as CSSProperties} />
          ))}
        </div>
      ))}
      <div className="nebula-layer nebula-layer--pre" />
      <div className="nebula-layer nebula-layer--post" />
      <div className="cosmic-boundary" />
    </div>
  );
}
