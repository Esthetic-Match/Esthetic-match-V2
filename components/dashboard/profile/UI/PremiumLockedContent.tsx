// components/UI/PremiumLockedContent.tsx

import { Lock } from "lucide-react";
import UpgradeButton from "@/components/dashboard/profile/UI/UpgradeButton";

type PremiumLockedContentProps = {
  title: string;
  description: string;
  showUpgrade?: boolean;
  className?: string;
};

export default function PremiumLockedContent({
  title,
  description,
  showUpgrade = true,
  className = "",
}: PremiumLockedContentProps) {
  return (
    <div className={`mt-14 flex flex-col items-center text-center ${className}`}>
      <Lock size={64} strokeWidth={1.4} className="text-[#d8bd8d]" />

      <p className="mt-5 text-sm font-medium text-[#283C5D]">{title}</p>
      <p className="mt-1 text-sm text-[#283C5D]/60">{description}</p>

      {showUpgrade && <UpgradeButton />}
    </div>
  );
}