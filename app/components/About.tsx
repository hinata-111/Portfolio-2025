import Image from "next/image";
import { aboutInfo, aboutParagraphs, motto, profile, projects, socials } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";
import { SocialIcon } from "@/app/components/icons";
import Phrased from "@/app/components/Phrased";

export default function About() {
  const profileDetails = aboutInfo.filter((item) => item.k !== "名前");

  return (
    <section id="about">
      <Reveal>
        <SectionHead num="01" label="About" />
      </Reveal>
      <Reveal as="h2">プロフィール</Reveal>
      <Reveal className="about-profile">
        <div className="about-profile-main">
          <figure className="about-portrait">
            <Image
              className="about-portrait-image"
              src="/images/profile-portrait.webp"
              width={1196}
              height={2000}
              sizes="(max-width: 560px) 150px, (max-width: 720px) 160px, 180px"
              alt="夜の街並みを背景にした鈴木日向のポートレート"
            />
          </figure>
          <div className="about-profile-copy">
            <div className="about-identity">
              <h3 className="about-name">{profile.name}</h3>
              <p className="about-name-latin mono">Hinata Suzuki</p>
            </div>
            <ul className="about-info">
              {profileDetails.map((item) => (
                <li key={item.k}>
                  <span className="k mono">{item.k}</span>
                  <span className="v">
                    {item.href ? <a href={item.href}>{item.v}</a> : item.v}
                  </span>
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
        </div>
        <div className="about-story">
          {aboutParagraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Reveal>
      <Reveal as="nav" className="about-projects" aria-label="プロジェクト索引">
        <p className="about-projects-head mono">PROJECTS</p>
        <ul>
          {projects.map((p, index) => (
            <li key={p.title}>
              <a href={`#project-${index}`}>
                <span className="about-project-num mono" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="about-project-body">
                  <span className="about-project-title">{p.title}</span>
                  <span className="about-project-summary">
                    <Phrased text={p.summary} />
                  </span>
                </span>
                <span className="about-project-arrow" aria-hidden="true">
                  ↓
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal className="motto">
        <blockquote className="serif">
          <Phrased text={motto.quote} />
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
