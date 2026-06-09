import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://estheticmatch.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Esthetic Match | Find Trusted Aesthetic Doctors",
    template: "%s | Esthetic Match",
  },

  description:
    "Esthetic Match helps patients discover trusted aesthetic doctors, compare consultation options, view real results, and book online or in-clinic consultations.",

  applicationName: "Esthetic Match",

  keywords: [
    "esthetic doctors",
    "aesthetic medicine",
    "cosmetic doctors",
    "beauty consultations",
    "aesthetic clinic",
    "doctor booking",
    "online consultation",
    "in-clinic consultation",
    "Esthetic Match",
  ],

  authors: [{ name: "Esthetic Match" }],
  creator: "Esthetic Match",
  publisher: "Esthetic Match",

  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      fr: "/fr",
    },
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Esthetic Match",
    title: "Esthetic Match | Find Trusted Aesthetic Doctors",
    description:
      "Discover trusted aesthetic doctors, compare prices, view results, and book online or in-clinic consultations.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Esthetic Match - Find trusted aesthetic doctors",
      },
    ],
    locale: "en_US",
    alternateLocale: ["fr_FR"],
  },

  twitter: {
    card: "summary_large_image",
    title: "Esthetic Match | Find Trusted Aesthetic Doctors",
    description:
      "Discover trusted aesthetic doctors, compare prices, view results, and book online or in-clinic consultations.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  category: "healthcare",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF9F7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Esthetic Match",
    url: siteUrl,
    description:
      "Esthetic Match helps patients discover trusted aesthetic doctors and book consultations.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/doctors?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className={`${dmSans.className} flex min-h-full flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        {children}
      </body>
    </html>
  );
}