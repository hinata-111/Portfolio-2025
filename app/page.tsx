import Hero from "@/app/components/Hero";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
import Contact from "@/app/components/Contact";
import ContactFab from "@/app/components/ContactFab";
import CursorLight from "@/app/components/CursorLight";
import ConsoleEgg from "@/app/components/ConsoleEgg";
import PathRail from "@/app/components/PathRail";
import AmbientLight from "@/app/components/AmbientLight";
import { profile } from "@/app/content";

export default function Home() {
  return (
    <main>
      <AmbientLight />
      <Hero />
      <PathRail />
      <div className="wrap">
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Beyond />
        <Contact />
        <footer className="mono">© 2026 {profile.name} — built with Next.js</footer>
      </div>
      <ContactFab />
      <CursorLight />
      <ConsoleEgg />
    </main>
  );
}
