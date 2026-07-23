"use client";

import { useEffect, useState } from "react";

type AmbientStage = "chi" | "ko" | "raku";

const stageClasses: Record<AmbientStage, string> = {
  chi: "stage-chi",
  ko: "stage-ko",
  raku: "stage-raku",
};

function getStageForElement(element: Element): AmbientStage {
  if (element.classList.contains(stageClasses.raku)) return "raku";
  if (element.classList.contains(stageClasses.ko)) return "ko";
  return "chi";
}

export default function AmbientLight() {
  const [activeStage, setActiveStage] = useState<AmbientStage>("chi");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(".stage-chi, .stage-ko, .stage-raku"),
    );
    if (sections.length === 0) return;

    const visibleSections = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            visibleSections.add(section);
          } else {
            visibleSections.delete(section);
          }
        });

        const currentSection = sections.find((section) => visibleSections.has(section));
        setActiveStage(currentSection ? getStageForElement(currentSection) : "chi");
      },
      { threshold: 0.5 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="ambient-light" aria-hidden="true">
      {(Object.keys(stageClasses) as AmbientStage[]).map((stage) => (
        <div
          key={stage}
          className={`ambient-layer ambient-layer-${stage}${
            activeStage === stage ? " is-active" : ""
          }`}
          data-stage={stage}
        />
      ))}
    </div>
  );
}
