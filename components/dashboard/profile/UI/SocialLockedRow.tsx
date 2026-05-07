import Image from "next/image";
import { Lock } from "lucide-react";

type SocialLockedRowProps = {
  label: string;
  iconSrc?: string; // 👈 svg path
  className?: string;
};

export default function SocialLockedRow({
  label,
  iconSrc,
  className = "",
}: SocialLockedRowProps) {
  return (
    <div
      className={`mb-3 flex items-center justify-between rounded-full border border-gray-200 px-4 py-2 text-sm text-[#283C5D]/70 ${className}`}
    >
      <div className="flex items-center gap-3">
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={label}
            width={16}
            height={16}
            className="object-contain"
          />
        ) : null}

        <span>{label}</span>
      </div>

      <Lock size={15} className="text-[#283C5D]/40" />
    </div>
  );
}