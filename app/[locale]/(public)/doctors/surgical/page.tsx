// app/[locale]/surgical-specialists/page.tsx

import SurgicalSpecialistsClient from "@/components/public/doctors/SurgicalSpecialistsClient ";

export const metadata = {
  title: "Surgical Specialists | Esthetic Match",
  description:
    "Find plastic surgeons, maxillofacial surgeons, ENT surgeons, and reconstructive surgeons on Esthetic Match.",
};

export default function SurgicalSpecialistsPage() {
  return <SurgicalSpecialistsClient />;
}