"use client";

import { usePathname } from "next/navigation";
import { NavBarMain } from "@/components/public/layout/NavbarMain";

export default function PublicNavbarVisibility() {
  const pathname = usePathname();

  const hideNavbarRoutes = ["/sign-up"];

  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    pathname.endsWith(route)
  );

  if (shouldHideNavbar) return null;

  return <NavBarMain />;
}