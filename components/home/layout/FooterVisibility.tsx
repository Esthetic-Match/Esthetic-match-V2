"use client";

import { usePathname } from "@/i18n/navigation";
import Footer from "@/components/home/Footer";

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