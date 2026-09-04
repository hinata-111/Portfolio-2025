import Hero from "@/app/components/Hero";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";
import Experience from "@/app/components/Experience";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
import Contact from "@/app/components/Contact";
import CursorLight from "@/app/components/CursorLight";
import ConsoleEgg from "@/app/components/ConsoleEgg";
import BottomChapterNav from "@/app/components/BottomChapterNav";
import CosmicBackground from "@/app/components/CosmicBackground";
import { profile } from "@/app/content";

export default function Home() {
  return (
    <main>
      <CosmicBackground />
      <Hero />
      <div className="wrap">
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Beyond />
        <Contact />
        <footer className="mono">© 2026 {profile.name} — built with Next.js</footer>
      </div>
      <BottomChapterNav />
      <CursorLight />
      <ConsoleEgg />
    </main>
  );
}
