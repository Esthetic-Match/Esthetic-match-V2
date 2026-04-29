import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  onBack: () => void;
  variant?: "light" | "dark";
};

export default function BackButton({
  onBack,
  variant = "light",
}: BackButtonProps) {
  const router = useRouter();

  const isDark = variant === "dark";

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "absolute left-6 top-6 flex items-center gap-2 text-sm transition hover:scale-[1.02] rounded-full px-2 pr-5 py-1 cursor-pointer",
        
        !isDark &&
          "text-white border border-white/40 hover:bg-white hover:text-black active:scale-[0.98]",

        isDark &&
          "text-black border border-black max-md:border-white max-md:text-white hover:bg-[#283C5D]/80 hover:text-white active:scale-[0.98]"
      )}
    >
      <ChevronLeft size={18} />
      Back
    </button>
  );
}