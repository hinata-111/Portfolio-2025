import { beyond } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";
import Phrased from "@/app/components/Phrased";

export default function Beyond() {
  return (
    <section id="beyond">
      <Reveal>
        <SectionHead num="05" label="Projects Beyond My Work" />
      </Reveal>
      <Reveal as="h2">コードの外側</Reveal>
      <div className="beyond-grid">
        {beyond.map((b, i) => {
          const headingId = `beyond-title-${i}`;

          return (
            <Reveal
              as="article"
              key={b.title}
              className={`beyond${b.featured ? " beyond--featured" : ""}`}
              delay={(i % 4) as 0 | 1 | 2 | 3}
              aria-labelledby={headingId}
            >
              <div className="ph">
                {b.imageSrc ? (
                  <img src={b.imageSrc} alt={`${b.title}の写真`} loading={b.featured ? "eager" : "lazy"} />
                ) : (
                  <span className="mono">{b.phLabel}</span>
                )}
              </div>
              <div className="body">
                <h3 id={headingId}>{b.title}</h3>
                {b.meta && <div className="meta mono">{b.meta}</div>}
                <p className="beyond-lead">
                  <Phrased text={b.desc} />
                </p>
                {b.details && (
                  <div className="life-details">
                    {b.details.map((detail) => (
                      <div key={detail.label} className="life-detail">
                        <span className="mono">{detail.label}</span>
                        <p>
                          <Phrased text={detail.value} />
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {b.tags && (
                  <div className="tags">
                    {b.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {b.href && b.linkLabel && (
                  <a className="project-link" href={b.href} target="_blank" rel="noreferrer">
                    {b.linkLabel}
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
      <Reveal as="p" className="section-invite">
        気になった活動があれば、ぜひその話から。
      </Reveal>
    </section>
  );
}
