import { timeline } from "@/app/content";
import { constellationLayout } from "@/app/shapes";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function Experience() {
  return (
    <section id="experience">
      <Reveal>
        <SectionHead num="03" label="Experience" />
      </Reveal>
      <Reveal as="h2">経歴</Reveal>
      <div className="constellation-map" aria-hidden="true">
        <svg>
          {constellationLayout.slice(1).map((pt, i) => {
            const prev = constellationLayout[i];
            return (
              <line
                key={i}
                x1={`${prev.x}%`}
                y1={`${prev.y}%`}
                x2={`${pt.x}%`}
                y2={`${pt.y}%`}
              />
            );
          })}
        </svg>
        {constellationLayout.map((pt, i) => (
          <div
            key={i}
            className="const-star"
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
          >
            <div className="tip">
              <span className="when">{timeline[i].when}</span>
              {timeline[i].title}
            </div>
          </div>
        ))}
      </div>
      <ul className="timeline">
        {timeline.map((t) => (
          <Reveal as="li" key={t.title}>
            <div className="when mono">
              {t.when}
              {t.todo && <span className="todo">{t.todo}</span>}
            </div>
            <div className="dot" />
            <div className="what">
              <b>{t.title}</b>
              <span>{t.desc}</span>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
