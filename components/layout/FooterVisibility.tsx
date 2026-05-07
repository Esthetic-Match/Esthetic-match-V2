"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/homePage/Footer";

export default function FooterVisibility() {
  const pathname = usePathname();

  const hideFooter =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/en/dashboard") ||
    pathname.startsWith("/fr/dashboard");

  if (hideFooter) {
    return null;
  }

  return <Footer />;
}