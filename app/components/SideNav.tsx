"use client";

import { useEffect, useState } from "react";

const navSections = [
  { id: "hero", num: "00", label: "Top" },
  { id: "about", num: "01", label: "About" },
  { id: "skills", num: "02", label: "Skills" },
  { id: "experience", num: "03", label: "Experience" },
  { id: "projects", num: "04", label: "Projects" },
  { id: "beyond", num: "05", label: "Life & Creative Practice" },
  { id: "contact", num: "06", label: "Contact" },
];

export default function SideNav() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const sections = navSections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        const topmost = navSections.find(({ id }) => visible.has(id));
        // 何も交差していない一瞬は直前の現在地を保つ(高速スクロール時のちらつき防止)
        setActiveId((current) => topmost?.id ?? current);
      },
      { threshold: 0.25 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="side-nav" aria-label="セクションナビゲーション">
      {navSections.map((section) => {
        const isCurrent = section.id === activeId;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={isCurrent ? "current" : undefined}
            aria-current={isCurrent ? "true" : undefined}
          >
            <span className="side-nav-num mono" aria-hidden="true">
              {section.num}
            </span>
            <span className="side-nav-label">{section.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
