"use client";

import { usePathname } from "@/i18n/navigation";
import Footer from "@/components/public/layout/Footer";

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