import { projects } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";
import Phrased from "@/app/components/Phrased";

export default function Projects() {
  return (
    <section id="projects">
      <Reveal>
        <SectionHead num="04" label="Projects" />
      </Reveal>
      <Reveal as="h2">創作物</Reveal>
      <div className="project-ledger">
        <nav className="project-ledger-index mono" aria-label="作品台帳の索引">
          {projects.map((project, index) => (
            <a key={project.title} href={`#project-${index}`}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>
                <Phrased text={project.title} />
              </span>
            </a>
          ))}
        </nav>
        <div className="project-ledger-entries">
          {projects.map((p, index) => (
            <Reveal
              as="article"
              key={p.title}
              id={`project-${index}`}
              className="project-ledger-entry"
              data-project-index={String(index + 1).padStart(2, "0")}
              aria-labelledby={`project-title-${index}`}
            >
              <span className="project-ledger-id mono" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="project-ledger-copy">
                <h3 id={`project-title-${index}`}>
                  <Phrased text={p.title} />
                </h3>
                <p className="project-summary">
                  <Phrased text={p.summary} />
                </p>
                {p.details?.map((detail) => (
                  <div key={detail.title} className="project-ledger-row">
                    <h4>
                      <Phrased text={detail.title} />
                    </h4>
                    <p>
                      <Phrased text={detail.value} />
                    </p>
                  </div>
                ))}
                {p.href && p.linkLabel && (
                  <a className="project-link" href={p.href} target="_blank" rel="noreferrer">
                    {p.linkLabel}
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
