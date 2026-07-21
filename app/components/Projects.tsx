import { projects } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function Projects() {
  return (
    <section id="projects" className="stage-raku">
      <Reveal>
        <SectionHead num="04" label="Projects" />
      </Reveal>
      <Reveal as="h2">プロジェクト</Reveal>
      {projects.map((p) => (
        <Reveal as="article" key={p.title} className="project">
          <h3>
            {p.title}
            {p.todoBadge && <span className="todo">{p.todoBadge}</span>}
          </h3>
          <div className="meta mono">{p.meta}</div>
          <dl className="prs">
            {p.rows.map((r) => (
              <div key={r.label} style={{ display: "contents" }}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
          <div className="tags">
            {p.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      ))}
      <Reveal
        as="p"
        className="lede center"
        style={{ color: "var(--muted)", fontSize: 14, marginTop: 28 }}
      >
        その他の制作物は GitHub を参照 →
      </Reveal>
    </section>
  );
}
