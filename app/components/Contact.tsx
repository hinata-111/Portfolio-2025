import { contact } from "@/app/content";

export default function Contact() {
  return (
    <section id="contact">
      <h2>Contact</h2>
      <div className="contact-row">
        <a className="btn btn-primary" href={`mailto:${contact.email}`}>
          Email <span className="arr">→</span>
        </a>
      </div>
    </section>
  );
}
