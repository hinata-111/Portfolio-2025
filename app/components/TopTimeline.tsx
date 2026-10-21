import Link from "next/link";
import { timeline } from "@/app/content";

export default function TopTimeline() {
  return (
    <section id="experience">
      <h2>経歴</h2>
      <ul className="top-timeline">
        {timeline.map((t) => (
          <li key={t.title}>
            <span className="when mono">{t.when}</span>
            <span>{t.title}</span>
          </li>
        ))}
      </ul>
      <Link className="more-link" href="/about#experience">
        経歴の詳細を見る <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
