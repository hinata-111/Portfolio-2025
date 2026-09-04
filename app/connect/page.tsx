import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SocialIcon } from "@/app/components/icons";
import { connectProfile, profile } from "@/app/content";
import Phrased from "@/app/components/Phrased";
import ProfileDetails from "./ProfileDetails";
import styles from "./connect.module.css";

export const metadata: Metadata = {
  title: `${profile.name} | Connect`,
  description: `${profile.name}のプロフィールとSNSリンク`,
};

export default function ConnectPage() {
  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <article className={styles.card} aria-labelledby="connect-name">
        <header className={styles.identity}>
          <div className={styles.portrait}>
            <Image
              className={styles.portraitImage}
              src="/images/profile-portrait.webp"
              width={1196}
              height={2000}
              sizes="112px"
              priority
              alt={`${profile.name}のポートレート`}
            />
          </div>
          <h1 id="connect-name">{profile.name}</h1>
          <p className={styles.nameLatin}>{connectProfile.nameLatin}</p>
          <p className={styles.affiliation}>{profile.affiliations[0]}</p>
          <p className={styles.tagline}>{connectProfile.tagline}</p>
          <p className={styles.roleLine}>{profile.roleLine}</p>
        </header>

        <ProfileDetails introduction={<Phrased text={connectProfile.introduction} />} />

        <nav className={styles.socials} aria-label="SNS">
          <ul>
            {connectProfile.socials.map((social) => (
              <li
                key={social.label}
                className={styles[`social${social.label}`]}
                aria-disabled={social.href ? undefined : "true"}
              >
                {social.href ? (
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${social.label}を開く`}
                  >
                    <SocialIcon label={social.label} className={styles.socialIcon} />
                    <span>{social.label}</span>
                  </a>
                ) : (
                  <span className={styles.socialUnavailable} title="URL未設定">
                    <SocialIcon label={social.label} className={styles.socialIcon} />
                    <span>{social.label}</span>
                    <small>未設定</small>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <Link className={styles.portfolioLink} href="/" aria-label="Portfolioを見る">
          <span>
            <small>PORTFOLIO</small>
            制作・活動実績を見る
          </span>
          <span className={styles.portfolioArrow} aria-hidden="true">↗</span>
        </Link>
      </article>
    </main>
  );
}
