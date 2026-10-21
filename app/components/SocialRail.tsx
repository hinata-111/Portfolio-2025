import { contact, socials } from "@/app/content";
import { MailIcon, SocialIcon } from "@/app/components/icons";

// href が空の SNS は URL 未確定なので出さない
export default function SocialRail() {
  return (
    <ul className="social-rail" aria-label="SNSとメール">
      {socials
        .filter((social) => social.href)
        .map((social) => (
          <li key={social.label}>
            <a href={social.href} target="_blank" rel="noreferrer" aria-label={`${social.label}を開く`}>
              <SocialIcon label={social.label} />
            </a>
          </li>
        ))}
      <li>
        <a href={`mailto:${contact.email}`} aria-label="メールを送る">
          <MailIcon />
        </a>
      </li>
    </ul>
  );
}
