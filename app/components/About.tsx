import { aboutInfo, aboutParagraphs, motto } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function About() {
  return (
    <section id="about" style={{ padding: "72px 0 64px" }}>
      <Reveal>
        <SectionHead num="01" label="About" />
      </Reveal>
      <Reveal as="h2">ものづくりの原点は、目の前の人の反応。</Reveal>
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
