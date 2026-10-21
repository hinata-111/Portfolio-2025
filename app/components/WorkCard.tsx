import Link from "next/link";

type Work = { slug: string; title: string; imageSrc?: string; imageFit?: "contain"; phLabel: string };

export default function WorkCard({ work }: { work: Work }) {
  return (
    <li className="work-card">
      <Link href={`/works#${work.slug}`}>
        <span className={`work-thumb${work.imageFit === "contain" ? " thumb--contain" : ""}`}>
          {work.imageSrc ? (
            <img src={work.imageSrc} alt="" loading="lazy" />
          ) : (
            <span className="mono">{work.phLabel}</span>
          )}
        </span>
        <span className="work-title">{work.title}</span>
      </Link>
    </li>
  );
}
