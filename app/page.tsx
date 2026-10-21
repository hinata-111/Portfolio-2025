import Hero from "@/app/components/Hero";
import SiteNav from "@/app/components/SiteNav";
import TopProfile from "@/app/components/TopProfile";
import TopTimeline from "@/app/components/TopTimeline";
import TopWorks from "@/app/components/TopWorks";
import Contact from "@/app/components/Contact";
import SiteFooter from "@/app/components/SiteFooter";
import CursorLight from "@/app/components/CursorLight";
import ConsoleEgg from "@/app/components/ConsoleEgg";
import CosmicBackground from "@/app/components/CosmicBackground";

export default function Home() {
  return (
    <main>
      <CosmicBackground />
      <SiteNav />
      <Hero />
      <div className="wrap wrap--narrow">
        <TopProfile />
        <TopTimeline />
        <TopWorks />
        <Contact />
        <SiteFooter />
      </div>
      <CursorLight />
      <ConsoleEgg />
    </main>
  );
}
