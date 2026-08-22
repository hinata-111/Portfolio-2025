import { aboutInfo, aboutParagraphs, motto, socials } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";
import { SocialIcon } from "@/app/components/icons";

export default function About() {
  return (
    <section id="about" style={{ padding: "72px 0 64px" }}>
      <Reveal>
        <SectionHead num="01" label="About" />
      </Reveal>
      <Reveal className="about-grid">
        <div>
          <ul className="about-info">
            {aboutInfo.map((item) => (
              <li key={item.k}>
                <span className="k mono">{item.k}</span>
                <span className="v">{item.v}</span>
              </li>
            ))}
          </ul>
          <ul className="about-socials">
            {socials.map((social) => (
              <li key={social.label}>
                {social.href ? (
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${social.label}を開く`}
                  >
                    <SocialIcon label={social.label} />
                  </a>
                ) : (
                  <span className="about-social-todo">
                    <SocialIcon label={social.label} />
                    <span className="todo">{social.label} 要確認</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="about-story">
          {aboutParagraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Reveal>
      <Reveal className="motto">
        <blockquote className="serif">
          {motto.quote.split("、")[0]}、<br />
          {motto.quote.split("、")[1]}
        </blockquote>
        <cite className="mono">{motto.cite}</cite>
        <p className="vow">
          {motto.vowBefore}
          <b>{motto.vowStrong}</b>
          {motto.vowAfter}
        </p>
      </Reveal>
    </section>
  );
}
