import { projects } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";
import TextThumb from "@/app/components/TextThumb";

export default function Projects() {
  return (
    <section id="projects">
      <Reveal>
        <SectionHead num="01" label="Works" />
      </Reveal>
      <Reveal as="h2">活動</Reveal>
      <div className="project-ledger">
        <nav className="project-ledger-index mono" aria-label="作品台帳の索引">
          {projects.map((project, index) => (
            <a key={project.slug} href={`#${project.slug}`}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>{project.title}</span>
            </a>
          ))}
        </nav>
        <div className="project-ledger-entries">
          {projects.map((p, index) => (
            <Reveal
              as="article"
              key={p.title}
              id={p.slug}
              className="project-ledger-entry"
              data-project-index={String(index + 1).padStart(2, "0")}
              aria-labelledby={`project-title-${index}`}
            >
              <span className="project-ledger-id mono" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="project-ledger-copy">
                <div className="project-ledger-head">
                  <div className={`project-thumb${p.imageFit === "contain" ? " thumb--contain" : ""}`}>
                    {p.imageSrc ? (
                      <img src={p.imageSrc} alt={`${p.title}の画面`} loading="lazy" />
                    ) : p.textThumb ? (
                      <TextThumb label={p.textThumb.label} lines={p.textThumb.lines} />
                    ) : (
                      <span className="mono">{p.phLabel}</span>
                    )}
                  </div>
                  <div>
                    <h3 id={`project-title-${index}`}>{p.title}</h3>
                    <p className="project-summary">{p.summary}</p>
                  </div>
                </div>
                {p.details?.map((detail) => (
                  <div key={detail.title} className="project-ledger-row">
                    <h4>{detail.title}</h4>
                    <ul>
                      {detail.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
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
