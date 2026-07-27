"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { shapeLayout, starLayout, shootingStarLayout } from "@/app/shapes";

const NEAR_FACTOR = 1.7;
const FAR_FACTOR = 0.4;

export default function CosmicBackground() {
  const shapesRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const shapesEl = shapesRef.current;
    const starsEl = starsRef.current;
    if (!shapesEl || !starsEl) return;

    let queued = false;
    const onScroll = () => {
      if (queued) return; // rAFスロットリング
      queued = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        shapesEl.style.transform = `translateY(${-y * NEAR_FACTOR}px)`;
        starsEl.style.transform = `translateY(${-y * FAR_FACTOR}px)`;
        queued = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // レイアウト補正: 背景レイヤーの高さを実ページ高から動的計算する。
  // prefers-reduced-motion でも実行する(モーションでなくレイアウトの補正のため)。
  useEffect(() => {
    const shapesEl = shapesRef.current;
    const starsEl = starsRef.current;
    if (!shapesEl || !starsEl) return;

    const applyHeight = () => {
      const scrollMax = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      const needed = scrollMax * (1 + NEAR_FACTOR) + window.innerHeight;
      const heightPx = Math.ceil(needed * 1.1);
      shapesEl.style.height = `${heightPx}px`;
      starsEl.style.height = `${heightPx}px`;
    };
    applyHeight();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyHeight, 150); // 品質要件④ debounce
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <>
      <div ref={starsRef} className="starfield" aria-hidden="true">
        {starLayout.map((s, i) => (
          <div
            key={i}
            className="star-dot"
            style={
              {
                "--top": `${s.top}%`,
                "--left": `${s.left}%`,
                "--size": `${s.size}px`,
                "--duration": `${s.duration}s`,
                "--delay": `${s.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="shooting-stars" aria-hidden="true">
        {shootingStarLayout.map((sh, i) => (
          <div
            key={i}
            className="shooting-star-wrap"
            style={
              {
                "--sy": `${sh.sy}%`,
                "--sx": `${sh.sx}%`,
                "--angle": `${sh.angle}deg`,
              } as CSSProperties
            }
          >
            <div
              className="shooting-star"
              style={
                {
                  "--sdur": `${sh.duration}s`,
                  "--sdelay": `${sh.delay}s`,
                } as CSSProperties
              }
            />
          </div>
        ))}
      </div>
      <div ref={shapesRef} className="floating-shapes" aria-hidden="true">
        {shapeLayout.map((sh, i) => (
          <div
            key={i}
            className={`shape shape-${sh.kind} shape-${sh.color}`}
            style={
              {
                "--top": `${sh.top}%`,
                "--left": `${sh.left}%`,
                "--size": `${sh.size}px`,
                "--duration": `${sh.duration}s`,
                "--delay": `${sh.delay}s`,
                "--drift": sh.drift,
                "--rotate": `${sh.rotate}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
