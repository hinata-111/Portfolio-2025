import type { Metadata } from "next";
import { profile } from "@/app/content";
import SiteNav from "@/app/components/SiteNav";
import Projects from "@/app/components/Projects";
import Beyond from "@/app/components/Beyond";
import Contact from "@/app/components/Contact";
import SiteFooter from "@/app/components/SiteFooter";
import CosmicBackground from "@/app/components/CosmicBackground";

export const metadata: Metadata = {
  title: `Works | ${profile.name}`,
};

export default function WorksPage() {
  return (
    <main className="page-sub">
      <CosmicBackground />
      <SiteNav />
      <div className="wrap">
        <Projects />
        <Beyond />
        <Contact />
        <SiteFooter />
      </div>
    </main>
  );
}
