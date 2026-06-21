// app/[locale]/doctors/non-surgical/page.tsx

import NonSurgicalDoctorsClient from "@/components/public/doctors/NonSurgicalDoctorsClient";

export const metadata = {
  title: "Non-surgical aesthetic doctors | Esthetic Match",
  description:
    "Find aesthetic doctors, dermatologists, ophthalmologists, dentists, orthodontists, general practitioners, and oculoplastic specialists on Esthetic Match.",
};

export default function NonSurgicalDoctorsPage() {
  return <NonSurgicalDoctorsClient />;
}