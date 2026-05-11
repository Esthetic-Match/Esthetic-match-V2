import Image from "next/image";
import { Lock, SquareArrowOutUpRight } from "lucide-react";

type SocialLockedRowProps = {
  label: string;
  iconSrc?: string;
  className?: string;
  locked?: boolean;
  href?: string;
};

export default function SocialLockedRow({
  label,
  iconSrc = "/images/fallback/socialFallback.svg",
  className = "",
  locked = true,
  href,
}: SocialLockedRowProps) {
  const content = (
    <>
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

      {locked ? (
        <Lock size={15} className="text-[#283C5D]/40" />
      ) : (
        <SquareArrowOutUpRight size={15} className="text-[#283C5D]/40" />
      )}
    </>
  );

  const baseClassName = `mb-3 flex items-center justify-between rounded-full border border-gray-200 px-4 py-2 text-sm text-[#283C5D]/70 ${className}`;

  if (!locked && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${baseClassName} transition hover:border-[#d8bd8d]/60 hover:bg-[#d8bd8d]/10`}
      >
        {content}
      </a>
    );
  }

  return <div className={baseClassName}>{content}</div>;
}