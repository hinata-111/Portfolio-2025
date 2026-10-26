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

// カーソルが通った跡の周りだけ星が光り、少しずつ元に戻る
export const GLOW_RADIUS = 170;
export const GLOW_LIFETIME_MS = 900;
const TRAIL_LIMIT = 32;

export type TrailPoint = { x: number; y: number; t: number };

// 0(光らない)〜 1(いちばん明るい)。近く・新しい跡ほど強く、いちばん強い跡を採る
export function cursorGlow(point: { x: number; y: number }, trail: readonly TrailPoint[], now: number) {
  let glow = 0;
  for (const mark of trail) {
    const age = (now - mark.t) / GLOW_LIFETIME_MS;
    if (age >= 1) continue;
    const distance = Math.hypot(point.x - mark.x, point.y - mark.y) / GLOW_RADIUS;
    if (distance >= 1) continue;
    glow = Math.max(glow, (1 - distance) * (1 - age));
  }
  return glow;
}

// トップの背景で星がゆっくり漂い、近い星が線でつながる。
// スクロールすると星は文字より遅れて流れ、大きい(手前の)星ほど速い(視差)。
// マウスを動かすと、通った跡の近くの星と線が光ってから消える(スマホでは何もしない)。
// 動きを減らす設定では静止した 1 枚を描くだけ。タブが裏にある間は描画を止める。
export default function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const followsCursor = !reduced && window.matchMedia("(pointer: fine)").matches;
    const trail: TrailPoint[] = [];
    // mousemove では位置を覚えるだけ。跡に足すのは描画ループの中で 1 フレーム 1 回
    let cursor: { x: number; y: number } | null = null;
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
    const draw = (seconds: number, scroll: number, now = 0) => {
      // 画面外へ出た星は反対側から戻す
      const points = driftingStars.map((star) => ({
        x: wrap(star.x + star.vx * seconds, 1) * width,
        y: wrap(wrap(star.y + star.vy * seconds, 1) * height - scroll * parallaxRate(star.r), height),
        r: star.r,
        glow: 0,
      }));
      if (trail.length) for (const point of points) point.glow = cursorGlow(point, trail, now);

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 0.6;
      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
          if (distance >= LINK_DISTANCE) continue;
          const glow = (points[i].glow + points[j].glow) / 2;
          ctx.strokeStyle = `rgba(184, 214, 255, ${((1 - distance / LINK_DISTANCE) * (0.28 + glow * 1.1)).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
      // 光っている星だけ周りをぼかしてにじませる
      ctx.shadowColor = "rgba(184, 214, 255, 0.9)";
      for (const point of points) {
        ctx.shadowBlur = point.glow * 18;
        ctx.fillStyle = `rgba(255, 255, 255, ${(0.75 + point.glow * 0.25).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r * (1 + point.glow * 1.2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

    };

    const elapsed = () => (performance.now() - startedAt) / 1000;

    const tick = () => {
      const now = performance.now();
      if (cursor) {
        trail.push({ ...cursor, t: now });
        cursor = null;
      }
      while (trail.length && (now - trail[0].t >= GLOW_LIFETIME_MS || trail.length > TRAIL_LIMIT)) trail.shift();
      draw(elapsed(), window.scrollY, now);
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

    const onMouseMove = (event: MouseEvent) => {
      cursor = { x: event.clientX, y: event.clientY };
    };

    fitToViewport();
    draw(0, reduced ? 0 : window.scrollY);
    window.addEventListener("resize", onResize);
    if (!reduced) {
      frame = requestAnimationFrame(tick);
      document.addEventListener("visibilitychange", onVisibilityChange);
    }
    if (followsCursor) document.addEventListener("mousemove", onMouseMove);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="constellation" aria-hidden="true" />;
}
