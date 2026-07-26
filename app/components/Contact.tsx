import { contact } from "@/app/content";
import SectionHead from "@/app/components/SectionHead";
import Reveal from "@/app/components/Reveal";

export default function Contact() {
  return (
    <section id="contact">
      <Reveal>
        <SectionHead num="06" label="Contact" />
      </Reveal>
      <Reveal className="contact-row">
        <a className="btn btn-primary" href={contact.github}>
          GitHub <span className="arr">→</span>
        </a>
        <a className="btn btn-ghost" href={contact.email}>
          Email <span className="arr">→</span>
        </a>
      </Reveal>
    </section>
  );
}
