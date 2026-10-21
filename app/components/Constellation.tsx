"use client";

import { useEffect, useRef } from "react";
import { driftingStars } from "@/app/shapes";

// 星どうしをこの距離(px)未満で線につなぐ。近いほど濃く
const LINK_DISTANCE = 140;
const RESIZE_DEBOUNCE_MS = 200;

// スクロール 1px に対して星が動く量。奥(小さい星)0.12 〜 手前(大きい星)0.42
const MIN_STAR_R = Math.min(...driftingStars.map((star) => star.r));
const MAX_STAR_R = Math.max(...driftingStars.map((star) => star.r));
function parallaxRate(r: number) {
  return 0.12 + ((r - MIN_STAR_R) / (MAX_STAR_R - MIN_STAR_R)) * 0.3;
}

// トップの背景で星がゆっくり漂い、近い星が線でつながる。
// スクロールすると星は文字より遅れて流れ、大きい(手前の)星ほど速い(視差)。
// 動きを減らす設定では静止した 1 枚を描くだけ。タブが裏にある間は描画を止める。
export default function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = performance.now();

    const fitToViewport = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // innerWidth はスクロールバー込みなので、表示幅とずれないよう clientWidth を使う
      width = document.documentElement.clientWidth || window.innerWidth;
      height = document.documentElement.clientHeight || window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const wrap = (value: number, size: number) => ((value % size) + size) % size;

    // scroll: ページのスクロール量。星は文字より遅く流れ、大きい(手前の)星ほど速い
    const draw = (seconds: number, scroll: number) => {
      // 画面外へ出た星は反対側から戻す
      const points = driftingStars.map((star) => ({
        x: wrap(star.x + star.vx * seconds, 1) * width,
        y: wrap(wrap(star.y + star.vy * seconds, 1) * height - scroll * parallaxRate(star.r), height),
        r: star.r,
      }));

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 0.6;
      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
          if (distance >= LINK_DISTANCE) continue;
          ctx.strokeStyle = `rgba(184, 214, 255, ${((1 - distance / LINK_DISTANCE) * 0.28).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const elapsed = () => (performance.now() - startedAt) / 1000;

    const tick = () => {
      draw(elapsed(), window.scrollY);
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (!frame) frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        fitToViewport();
        if (reduced) draw(0, 0);
        else draw(elapsed(), window.scrollY);
      }, RESIZE_DEBOUNCE_MS);
    };

    fitToViewport();
    draw(0, reduced ? 0 : window.scrollY);
    window.addEventListener("resize", onResize);
    if (!reduced) {
      frame = requestAnimationFrame(tick);
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      stop();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="constellation" aria-hidden="true" />;
}
