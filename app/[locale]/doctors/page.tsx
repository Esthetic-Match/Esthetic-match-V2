import { NavBarMain } from "@/components/NavbarMain";
import HeaderSection from "@/components/homePage/doctors/HeaderSection";
import DoctorsListSection from "@/components/homePage/doctors/DoctorsListSection";

export const metadata = {
  title: "Find Aesthetic Doctors | Esthetic Match",
  description:
    "Discover trusted aesthetic doctors, dermatologists, plastic surgeons, and cosmetic practitioners near you. Compare profiles, ratings, specialties, and consultation options.",
  keywords: [
    "aesthetic doctors",
    "cosmetic doctors",
    "dermatologists",
    "plastic surgeons",
    "esthetic match",
    "aesthetic medicine",
    "cosmetic surgery",
  ],
  openGraph: {
    title: "Find Aesthetic Doctors | Esthetic Match",
    description:
      "Browse trusted aesthetic doctors and compare specialties, ratings, and locations.",
    type: "website",
  },
};


export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    specialty?: string;
    category?: string;
    procedures?: string;
    location?: string;
    minRating?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <NavBarMain />
      <HeaderSection initialQuery={params.q ?? ""} />
      <DoctorsListSection filters={params} />
    </main>
  );
}