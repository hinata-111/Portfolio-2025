"use client";

import { useEffect, useState } from "react";

const railSections = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "beyond", label: "Beyond Code" },
  { id: "contact", label: "Contact" },
];

export default function PathRail() {
  const [highestLitIndex, setHighestLitIndex] = useState(-1);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const sections = railSections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = railSections.findIndex(({ id }) => id === entry.target.id);
          if (index < 0) return;

          setHighestLitIndex((current) => Math.max(current, index));
        });
      },
      { threshold: 0.25 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="path-rail" aria-label="ページ内位置">
      {railSections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={index <= highestLitIndex ? "lit" : undefined}
          aria-label={`${section.label}へ移動`}
        />
      ))}
    </nav>
  );
}
