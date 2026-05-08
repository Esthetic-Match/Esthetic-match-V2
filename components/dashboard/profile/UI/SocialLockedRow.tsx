import Image from "next/image";
import { Lock, SquareArrowOutUpRight  } from "lucide-react";

type SocialLockedRowProps = {
  label: string;
  iconSrc?: string; 
  className?: string;
  locked?: boolean;
};

export default function SocialLockedRow({
  label,
  iconSrc="/images/fallback/socialFallback.svg",
  className = "",
  locked = true,
}: SocialLockedRowProps) {
  return (
    <div
      className={`mb-3 flex items-center justify-between rounded-full border border-gray-200 px-4 py-2 text-sm text-[#283C5D]/70 ${className}`}
    >
      <div className="flex items-center gap-3">
          <Image
            src={iconSrc}
            alt={label}
            width={16}
            height={16}
            className="object-contain"
          />
        <span>{label}</span>
      </div>
        {locked? <Lock size={15} className="text-[#283C5D]/40" />: <SquareArrowOutUpRight   size={15} className="text-[#283C5D]/40" />}
    </div>
  );
}