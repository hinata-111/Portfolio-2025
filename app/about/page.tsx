import type { Metadata } from "next";
import { profile } from "@/app/content";
import SiteNav from "@/app/components/SiteNav";
import About from "@/app/components/About";
import Skills from "@/app/components/Skills";
import Experience from "@/app/components/Experience";
import FavoriteRadio from "@/app/components/FavoriteRadio";
import Contact from "@/app/components/Contact";
import SiteFooter from "@/app/components/SiteFooter";
import CosmicBackground from "@/app/components/CosmicBackground";

export const metadata: Metadata = {
  title: `About | ${profile.name}`,
};

export default function AboutPage() {
  return (
    <main className="page-sub">
      <CosmicBackground />
      <SiteNav />
      <div className="wrap">
        <About />
        <Skills />
        <Experience />
        <FavoriteRadio />
        <Contact />
        <SiteFooter />
      </div>
    </main>
  );
}
