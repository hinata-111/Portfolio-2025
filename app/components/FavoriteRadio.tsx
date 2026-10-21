import { favoriteRadio } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function FavoriteRadio() {
  return (
    <section id="radio">
      <Reveal>
        <SectionHead num="04" label="Radio" />
      </Reveal>
      <Reveal as="h2">好きなラジオ番組</Reveal>
      <ul className="radio-grid">
        {favoriteRadio.map((show) => (
          <li key={show.title}>
            <span className="radio-art">
              {/* 番組名は下に文字で出すので画像は装飾扱い */}
              <img src={show.imageSrc} alt="" loading="lazy" />
            </span>
            <span className="radio-title">{show.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
