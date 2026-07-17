"use client";

import { useEffect, useRef } from "react";

export default function CursorLight() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(pointer: fine)").matches) return;

    let queued = false;
    const onMouse = (e: MouseEvent) => {
      if (queued) return; // rAFスロットリング
      queued = true;
      requestAnimationFrame(() => {
        el.classList.add("on");
        el.style.background = `radial-gradient(circle 260px at ${e.clientX}px ${e.clientY}px, rgba(255,197,61,.07), transparent 70%)`;
        queued = false;
      });
    };
    document.addEventListener("mousemove", onMouse);
    return () => document.removeEventListener("mousemove", onMouse);
  }, []);

  return <div ref={ref} className="cursor-light" aria-hidden="true" />;
}
