import HomePageTemplate from "@/components/homePage/template";
import { NavBarMain } from "@/components/NavbarMain";
import AmbientBackground from "@/components/UI/BlueAmbientBackground";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#FAF9F7] text-[#283C5D] overflow-x-hidden">
      <AmbientBackground />
      
      {/* Navbar */}
      <NavBarMain />
      
      {/* Content */}
      <section>
        <HomePageTemplate />
        <HomePageTemplate />
      </section>
      
    </main>
  );
}