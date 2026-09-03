import { profile } from "@/app/content";

export default function Hero() {
  return (
    <header className="hero" id="hero">
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <div className="nebula" aria-hidden="true" />
      <div className="hero-fade" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-eyebrow mono">{profile.eyebrow}</div>
        <h1 className="serif">
          <span className="hero-line">
            人を<span className="hl">{profile.catchTop}</span>にし、
          </span>
          <span className="hero-line">
            <span className="hl">{profile.catchBottom}</span>ものを生み出す。
          </span>
        </h1>
        <div className="role-line mono">{profile.roleLine}</div>
        <div className="hero-sub">
          <span className="name">{profile.name}</span>
          {profile.affiliations.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true" />
    </header>
  );
}
