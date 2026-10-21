import Image from "next/image";
import Link from "next/link";
import { profile } from "@/app/content";

// 一言紹介と肩書きはヒーローに出しているので、ここは顔・所属・趣味の一言・導線だけ
export default function TopProfile() {
  return (
    <section id="profile">
      <div className="top-profile-head">
        <figure className="top-avatar">
          <Image
            src="/images/profile-portrait.webp"
            width={1196}
            height={2000}
            sizes="80px"
            alt={`${profile.name}のポートレート`}
          />
        </figure>
        <div>
          <p className="top-name">{profile.name}</p>
          {profile.affiliations.map((a) => (
            <p className="top-affiliation" key={a}>
              {a}
            </p>
          ))}
        </div>
      </div>
      <p className="top-intro">
        {profile.personalNote.map((line, i) => (
          <span key={line}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
      <Link className="more-link" href="/about">
        自己紹介を読む <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
