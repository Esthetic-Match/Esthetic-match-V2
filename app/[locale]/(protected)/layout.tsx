import type { Metadata } from "next";
import { NavPanel } from "@/components/dashboard/layout/NavPanel";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Esthetic Match",
  description: "Esthetic Match Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  return <NavPanel>{children}</NavPanel>;
}

