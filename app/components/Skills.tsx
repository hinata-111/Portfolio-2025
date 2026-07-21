import { stack } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function Skills() {
  return (
    <section id="skills" className="stage-ko">
      <Reveal>
        <SectionHead num="02" label="Skills" />
      </Reveal>
      <Reveal as="h2">技術スタック</Reveal>
      <div className="stack">
        {stack.map((row, i) => (
          <Reveal key={row.cat} className="stack-row" delay={(i % 4) as 0 | 1 | 2 | 3}>
            <div className="cat">
              <span className="chip mono">{row.chip}</span>
              <span>
                <b>{row.cat}</b>
                {row.note && <i>{row.note}</i>}
              </span>
            </div>
            <div className="stack-pills">
              {row.pills.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
