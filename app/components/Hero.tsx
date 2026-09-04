import { profile } from "@/app/content";

export default function Hero() {
  return (
    <header className="hero" id="hero">
      <div className="hero-orbit" aria-hidden="true" />
      <div className="hero-inner">
        <h1 className="serif">
          人を<span className="hl">{profile.catchTop}</span>にし、
          <br />
          <span className="hl">{profile.catchBottom}</span>ものを生み出す。
        </h1>
        <p className="hero-intro">
          企画から実装まで一貫して、AI・Web技術でアイデアを形にする。
        </p>
        <div className="role-line mono">{profile.roleLine}</div>
        <div className="hero-signature">
          <span className="hero-signature-name">{profile.name}</span>
          {profile.affiliations.map((a) => (
            <span className="hero-signature-affiliation" key={a}>
              {a}
            </span>
          ))}
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true" />
    </header>
  );
}
