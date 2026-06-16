import FooterVisibility from "@/components/public/layout/FooterVisibility";
import Script from "next/script";
import PageLoadGate from "@/components/UI/loaders/PageLoadGate";
import PublicNavbarVisibility from "@/components/public/layout/NavBarVisibility";

export default async function LocaleLayout({
  children,
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
        <PublicNavbarVisibility /> 
        <PageLoadGate>
          {children}
          <FooterVisibility />
        </PageLoadGate>
    </>
  );
}