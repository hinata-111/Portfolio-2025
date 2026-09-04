import { timeline } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";
import Phrased from "@/app/components/Phrased";

export default function Experience() {
  return (
    <section id="experience">
      <Reveal>
        <SectionHead num="02" label="Experience" />
      </Reveal>
      <Reveal as="h2">経歴</Reveal>
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
              <span>
                <Phrased text={t.desc} />
              </span>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
