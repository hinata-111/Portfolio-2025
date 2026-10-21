import Link from "next/link";
import { beyond, projects } from "@/app/content";
import WorkCard from "@/app/components/WorkCard";

export default function TopWorks() {
  return (
    <>
      <section id="projects">
        <h2>活動</h2>
        <ul className="work-grid">
          {projects.map((work) => (
            <WorkCard key={work.slug} work={work} />
          ))}
        </ul>
      </section>
      <section id="beyond">
        <h2>コードの外側</h2>
        <ul className="work-grid">
          {beyond.map((work) => (
            <WorkCard key={work.slug} work={work} />
          ))}
        </ul>
        <Link className="more-link" href="/works">
          すべての活動を見る <span aria-hidden="true">→</span>
        </Link>
      </section>
    </>
  );
}
