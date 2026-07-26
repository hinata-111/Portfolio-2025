import { beyond } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function Beyond() {
  return (
    <section id="beyond">
      <Reveal>
        <SectionHead num="05" label="Beyond Code" />
      </Reveal>
      <Reveal as="h2">コードの外側でも、人を笑顔に。</Reveal>
      <div className="beyond-grid">
        {beyond.map((b, i) => (
          <Reveal key={b.title} className="beyond" delay={(i % 4) as 0 | 1 | 2 | 3}>
            <div className="ph mono">{b.phLabel}</div>
            <div className="body">
              <b>{b.title}</b>
              <p>{b.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
