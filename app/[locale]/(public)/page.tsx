import type { Metadata } from "next";
import AmbientBackground from "@/components/UI/BlueAmbientBackground";
import HomeSection from "@/components/public/homepage/HeroSection"
import CategoryCarousel from "@/components/public/homepage/CategoryCarousel";
import ProfileDisplay from "@/components/public/homepage/DoctorProfileDisplay";
import WhyDoctorsShouldJoin from "@/components/public/homepage/WhyDoctorsShouldJoin";
import WhyPatientsUseEstheticMatch from "@/components/public/homepage/WhyPatientsUseEstheticMatch";
import { FinalStatement } from "@/components/public/homepage/FinalStatement";

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
    <>  
        <main className="relative min-h-screen overflow-x-hidden bg-[#FAF9F7] text-[#283C5D]">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
          <AmbientBackground />
          <section aria-label="Esthetic Match homepage content">
            <HomeSection />
            <CategoryCarousel/>
            <ProfileDisplay />
            <WhyDoctorsShouldJoin />
            <WhyPatientsUseEstheticMatch />
            <FinalStatement/>
          </section>
        </main>
    </>
  );
}