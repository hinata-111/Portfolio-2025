import Link from "next/link";
import TextThumb from "@/app/components/TextThumb";

type Work = {
  slug: string;
  title: string;
  imageSrc?: string;
  imageFit?: "contain";
  textThumb?: { label: string; lines: string[] };
  phLabel: string;
};

export default function WorkCard({ work }: { work: Work }) {
  return (
    <li className="work-card">
      <Link href={`/works#${work.slug}`}>
        <span className={`work-thumb${work.imageFit === "contain" ? " thumb--contain" : ""}`}>
          {work.imageSrc ? (
            <img src={work.imageSrc} alt="" loading="lazy" />
          ) : work.textThumb ? (
            <TextThumb label={work.textThumb.label} lines={work.textThumb.lines} />
          ) : (
            <span className="mono">{work.phLabel}</span>
          )}
        </span>
        <span className="work-title">{work.title}</span>
      </Link>
    </li>
  );
}
