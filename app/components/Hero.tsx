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
          {profile.intro}
        </p>
        <div className="role-line mono">{profile.roleLine}</div>
      </div>
      <div className="scroll-cue" aria-hidden="true" />
    </header>
  );
}
