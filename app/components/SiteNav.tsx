import Link from "next/link";
import { profile } from "@/app/content";
import SocialRail from "@/app/components/SocialRail";

const links = [
  { href: "/about", label: "About" },
  { href: "/works", label: "Works" },
  // Contact は全ページの末尾にあるので、ページを移らずその場で下へ
  { href: "#contact", label: "Contact" },
];

// PC は常に並べたリンク、スマホは <details> のメニューに切り替える(JS 不要)。
// 2 つのリストは CSS でどちらか一方だけ表示する。
// 広い画面では左サイドバー、SocialRail は右端の縦レールとして画面に固定する。
export default function SiteNav() {
  return (
    <nav className="site-nav site-nav--bar" aria-label="サイトナビゲーション">
      <Link className="site-nav-logo serif" href="/">
        {profile.nameLatin}
      </Link>
      <ul className="site-nav-links">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
      <SocialRail />
      <details className="site-nav-menu">
        <summary aria-label="メニューを開く">
          <span aria-hidden="true" />
        </summary>
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}
