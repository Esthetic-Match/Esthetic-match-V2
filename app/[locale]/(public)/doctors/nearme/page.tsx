// app/[locale]/doctors-near-me/page.tsx
import DoctorsNearMeClient from "@/components/public/doctorsNearMe/DoctorsNearMeClient";

export const metadata = {
  title: "Doctors near me | Esthetic Match",
  description:
    "Find qualified aesthetic doctors and practitioners near your current location.",
};

export default function DoctorsNearMePage() {
  return <DoctorsNearMeClient />;
}