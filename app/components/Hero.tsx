import { profile, tickerWords } from "@/app/content";
import HeroEffects from "@/app/components/HeroEffects";

export default function Hero() {
  const repeats = 4; // シームレスループ用に4回繰り返し(トラックを-50%移動)
  return (
    <header className="hero">
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <HeroEffects />
      <div className="hero-inner">
        <div className="hero-eyebrow mono">{profile.grad}</div>
        <h1 className="serif">
          人を<span className="hl">{profile.catchTop}</span>にし、
          <br />
          <span className="hl">{profile.catchBottom}</span>ものを生み出す。
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
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {Array.from({ length: repeats }).flatMap((_, r) =>
            tickerWords.map((w, i) => (
              <span key={`${r}-${i}`} className={w.fill ? "fill" : undefined}>
                {w.text}
              </span>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
