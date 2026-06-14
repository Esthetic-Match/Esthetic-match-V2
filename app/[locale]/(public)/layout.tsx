import { NextIntlClientProvider } from "next-intl";
import FooterVisibility from "@/components/home/layout/FooterVisibility";
import Script from "next/script";
import PageLoadGate from "@/components/UI/loaders/PageLoadGate";
import { NavBarMain } from "@/components/NavbarMain";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  return (
    <>
      <Script
        id="Cookiebot"
        src="https://consent.cookiebot.com/uc.js"
        data-cbid="1f821395-7c93-4bc1-a077-36d1d1ef9aa9"
        data-blockingmode="auto"
        strategy="beforeInteractive"
      />
        <NavBarMain /> 
        <PageLoadGate>
          {children}
          <FooterVisibility />
        </PageLoadGate>
    </>
  );
}