import type { Metadata } from "next";
import { NavBarMain } from "@/components/NavbarMain";
import AmbientBackground from "@/components/UI/BlueAmbientBackground";
import HomeSection from "@/components/homePage/HeroSection"
import CategoryCarousel from "@/components/homePage/CategoryCarousel";
import ProfileDisplay from "@/components/homePage/DoctorProfileDisplay";
import WhyDoctorsShouldJoin from "@/components/homePage/WhyDoctorsShouldJoin";
import WhyPatientsUseEstheticMatch from "@/components/homePage/WhyPatientsUseEstheticMatch";
import { FinalStatement } from "@/components/homePage/FinalStatement";
import PageLoadGate from "@/components/UI/loaders/PageLoadGate";

export const metadata: Metadata = {
  title: "Esthetic Match | Find Trusted Aesthetic Doctors",
  description:
    "Esthetic Match helps patients discover trusted aesthetic doctors, compare procedures, and book consultations with confidence.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Esthetic Match | Find Trusted Aesthetic Doctors",
    description:
      "Discover trusted aesthetic doctors and book consultations with confidence.",
    url: "/",
    siteName: "Esthetic Match",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Esthetic Match",
  url: "https://estheticmatch.com",
  description:
    "Esthetic Match helps patients discover trusted aesthetic doctors and book consultations.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://estheticmatch.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
     <PageLoadGate>
      <main className="relative min-h-screen overflow-x-hidden bg-[#FAF9F7] text-[#283C5D]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AmbientBackground />
    
        <NavBarMain />   
    
        <section aria-label="Esthetic Match homepage content">
          <HomeSection />
          <CategoryCarousel/>
          <ProfileDisplay />
          <WhyDoctorsShouldJoin />
          <WhyPatientsUseEstheticMatch />
          <FinalStatement/>
        </section>
      </main>
    </PageLoadGate>
  );
}