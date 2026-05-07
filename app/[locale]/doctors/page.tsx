import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Heart } from "lucide-react";
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

const doctors = [
  {
    id: "1",
    name: "Dr. Alexandre Martin",
    specialty: "Médecine esthétique",
    rating: 4.9,
    reviews: 128,
    location: "Paris, France",
    image: "/dev/doctors/doctor-1.jpg",
    tags: ["Botox", "Fillers", "Skin"],
    price: "€90",
  },
  {
    id: "2",
    name: "Dr. Sophie Leroy",
    specialty: "Chirurgie du visage",
    rating: 4.8,
    reviews: 96,
    location: "Lyon, France",
    image: "/dev/doctors/doctor-2.jpg",
    tags: ["Face Lift", "Rhinoplasty"],
    price: "€120",
  },
  {
    id: "3",
    name: "Dr. Julien Belin",
    specialty: "Chirurgie du corps",
    rating: 4.9,
    reviews: 147,
    location: "Marseille, France",
    image: "/dev/doctors/doctor-3.jpg",
    tags: ["Body", "Contour"],
    price: "€110",
  },
  {
    id: "4",
    name: "Dr. Camille Roche",
    specialty: "Médecine esthétique",
    rating: 4.7,
    reviews: 83,
    location: "Bordeaux, France",
    image: "/dev/doctors/doctor-1.jpg",
    tags: ["Skin", "Laser"],
    price: "€80",
  },
  {
    id: "5",
    name: "Dr. Lina Moreau",
    specialty: "Dermatologie esthétique",
    rating: 4.9,
    reviews: 174,
    location: "Nice, France",
    image: "/dev/doctors/doctor-2.jpg",
    tags: ["Acne", "Pigmentation"],
    price: "€95",
  },
  {
    id: "6",
    name: "Dr. Adam Laurent",
    specialty: "Hair restoration",
    rating: 4.8,
    reviews: 112,
    location: "Toulouse, France",
    image: "/dev/doctors/doctor-3.jpg",
    tags: ["Hair", "PRP"],
    price: "€100",
  },
];

export default function DoctorsPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F7]">
        <NavBarMain />
      <HeaderSection/>
      <DoctorsListSection doctors={doctors}/>
    </main>
  );
}