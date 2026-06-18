// app/[locale]/(protected)/layout.tsx

import type { Metadata } from "next";
import { NavPanel } from "@/components/dashboard/layout/NavPanel";

export const metadata: Metadata = {
  title: "Esthetic Match",
  description: "Esthetic Match Dashboard",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NavPanel>{children}</NavPanel>;
}
