"use client";

import { usePathname } from "next/navigation";
import { NavBarMain } from "@/components/public/layout/NavbarMain";

export default function PublicNavbarVisibility() {
  const pathname = usePathname();

  const hideNavbarRoutes = ["/sign-up","/sign-in", "/forgot-password", "/reset-password", "/verify-email", "/verify-email-success", "/verify-email-failure"];

  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    pathname.endsWith(route)
  );

  if (shouldHideNavbar) return null;

  return <NavBarMain />;
}