import HomePageTemplate from "@/components/homePage/template";
import { NavbarMain } from "@/components/NavbarMain";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#FAF9F7] text-[#283C5D] overflow-x-hidden">
      
      {/* Subtle blue ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_25%,_rgba(40,60,93,0.10),_transparent_60%),radial-gradient(circle_at_85%_75%,_rgba(40,60,93,0.06),_transparent_60%)] blur-3xl" />
      
      {/* Navbar */}
      <NavbarMain />
      
      {/* Content */}
      <section>
        <HomePageTemplate />
        <HomePageTemplate />
      </section>
      
    </main>
  );
}