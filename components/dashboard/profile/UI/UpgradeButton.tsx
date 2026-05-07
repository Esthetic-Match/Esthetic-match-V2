import { Link } from "@/i18n/navigation";

type UpgradeButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

export default function UpgradeButton({
  href = "/dashboard/settings",
  label = "Upgrade to Premium",
  className = "",
}: UpgradeButtonProps) {
  return (
    <Link
      href={href}
      className={`mt-6 inline-flex rounded-full bg-gradient-to-r from-[#d8bd8d] to-[#f4e4c6] px-8 py-3 text-sm font-semibold text-[#283C5D] transition hover:opacity-90 active:scale-[0.98] ${className}`}
    >
      {label}
    </Link>
  );
}