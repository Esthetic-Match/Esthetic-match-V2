"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

type CopyBookingLinkButtonProps = {
  bookingLink: string;
};

export default function CopyBookingLinkButton({
  bookingLink,
}: CopyBookingLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(bookingLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#283C5D] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#1f2f49] active:scale-[0.98]"
    >
      <Copy size={14} />
      {copied ? "Copied" : "Copy booking link"}
    </button>
  );
}