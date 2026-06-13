// components/UI/PrivateGcsImage.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type PrivateGcsImageProps = {
  objectPath: string;
  alt: string;
  className?: string;
};

export default function PrivateGcsImage({
  objectPath,
  alt,
  className,
}: PrivateGcsImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadSignedUrl() {
      const res = await fetch("/api/images/read-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ objectPath }),
      });

      if (!res.ok) return;

      const data = await res.json();
      setSignedUrl(data.signedUrl);
    }

    loadSignedUrl();
  }, [objectPath]);

  if (!signedUrl) {
    return <div className="h-full w-full animate-pulse bg-[#FAF9F7]" />;
  }

  return (
  <div className="relative h-full w-full">
    <Image
      src={signedUrl}
      alt={alt}
      fill
      className={className}
      sizes="100vw"
    />
  </div>
);
}