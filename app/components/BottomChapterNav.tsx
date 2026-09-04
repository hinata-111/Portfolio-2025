"use client";

import { useEffect, useState } from "react";

const chapters = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
];

export default function BottomChapterNav() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("chapter-nav-ready");

    const sections = chapters
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const updateCurrentChapter = () => {
      const readingLine = window.innerHeight * 0.35;
      const current = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= readingLine && rect.bottom >= readingLine;
      });

      setActiveId((previous) => current?.id ?? previous);
    };

    updateCurrentChapter();
    window.addEventListener("scroll", updateCurrentChapter, { passive: true });
    window.addEventListener("resize", updateCurrentChapter);

    return () => {
      window.removeEventListener("scroll", updateCurrentChapter);
      window.removeEventListener("resize", updateCurrentChapter);
      document.documentElement.classList.remove("chapter-nav-ready");
    };
  }, []);

  return (
    <nav className="chapter-nav" aria-label="主要セクションナビゲーション">
      {chapters.map((chapter) => {
        const current = chapter.id === activeId;

        return (
          <a
            className={current ? "current" : undefined}
            href={`#${chapter.id}`}
            aria-current={current ? "true" : undefined}
            key={chapter.id}
            onClick={() => setActiveId(chapter.id)}
          >
            {chapter.label}
          </a>
        );
      })}
    </nav>
  );
}
