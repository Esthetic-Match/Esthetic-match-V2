import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/esthetic-match-v2-main/**", // private bucket
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/esthetic-match-v2-public/**", // public bucket
      },
    ],
  },
};

export default withNextIntl(nextConfig);