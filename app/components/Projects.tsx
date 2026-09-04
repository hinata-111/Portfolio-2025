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
      {projects.map((p, index) => (
        <Reveal
          as="article"
          key={p.title}
          id={`project-${index}`}
          className={`project${index === 0 ? " project--featured" : ""}`}
          data-project-index={String(index + 1).padStart(2, "0")}
          aria-labelledby={`project-title-${index}`}
        >
          <span className="project-kicker mono" aria-hidden="true">
            PROJECT {String(index + 1).padStart(2, "0")}
          </span>
          <h3 id={`project-title-${index}`}>{p.title}</h3>
          <p className="project-summary">
            <Phrased text={p.summary} />
          </p>
          {p.details && (
            <div className="project-details">
              {p.details.map((detail) => (
                <div key={detail.title} className="project-detail">
                  <h4>{detail.title}</h4>
                  <p>
                    <Phrased text={detail.value} />
                  </p>
                </div>
              ))}
            </div>
          )}
          {p.href && p.linkLabel && (
            <a className="project-link" href={p.href} target="_blank" rel="noreferrer">
              {p.linkLabel}
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </Reveal>
      ))}
    </section>
  );
}
