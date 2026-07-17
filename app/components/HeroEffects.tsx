"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number; y: number; r: number;
  vx: number; vy: number;
  tw: number; tws: number; depth: number;
};

export default function HeroEffects() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let mx = 0.5, my = 0.5;
    let raf = 0;
    let visible = true;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150); // 品質要件④ debounce
    };
    window.addEventListener("resize", onResize);

    const parts: Particle[] = Array.from({ length: 55 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 2.2 + 0.6,
      vy: -(Math.random() * 0.012 + 0.004),
      vx: (Math.random() - 0.5) * 0.008,
      tw: Math.random() * Math.PI * 2,
      tws: Math.random() * 0.03 + 0.01,
      depth: Math.random() * 0.7 + 0.3,
    }));

    let mouseQueued = false;
    const onMouse = (e: MouseEvent) => {
      if (mouseQueued) return; // 品質要件③ rAFスロットリング
      mouseQueued = true;
      requestAnimationFrame(() => {
        mx = e.clientX / window.innerWidth;
        my = e.clientY / window.innerHeight;
        mouseQueued = false;
      });
    };
    document.addEventListener("mousemove", onMouse);

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y += p.vy * p.depth;
        p.x += p.vx * p.depth;
        p.tw += p.tws;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        const px = (p.x + (mx - 0.5) * 0.04 * p.depth) * W;
        const py = (p.y + (my - 0.5) * 0.04 * p.depth) * H;
        const a = (0.25 + Math.sin(p.tw) * 0.2) * p.depth;
        ctx.beginPath();
        ctx.arc(px, py, p.r * p.depth, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,197,61,${a.toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    // 品質要件② 画面外では rAF 停止
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(tick);
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouse);
      clearTimeout(resizeTimer);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />;
}
