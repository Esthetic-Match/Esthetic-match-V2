import { cn } from "@/lib/utils/utils";

type LoadingProps = {
  className?: string;
  label?: string;
  /** "default" = centered block with bars; "compact" = inline dots + label */
  variant?: "default" | "compact";
};

export default function Loading({
  className,
  label = "Chargement…",
  variant = "default",
}: LoadingProps) {
  if (variant === "compact") {
    return (
      <span
        role="status"
        aria-label={label}
        className={cn("inline-flex items-center gap-2 mt-4", className)}
      >
        {/* Three sequential dots */}
        <span className="flex items-center gap-[5px]">
          <span className="h-[5px] w-[5px] rounded-full bg-[#D6B981] animate-[em-dot_1.4s_ease-in-out_infinite]" />
          <span className="h-[5px] w-[5px] rounded-full bg-[#D6B981] animate-[em-dot_1.4s_ease-in-out_0.2s_infinite]" />
          <span className="h-[5px] w-[5px] rounded-full bg-[#D6B981] animate-[em-dot_1.4s_ease-in-out_0.4s_infinite]" />
        </span>
        {label && (
          <span className="text-[10px] font-light tracking-[0.18em] uppercase text-[#9e7d5e]">
            {label}
          </span>
        )}
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  // Default variant — five animated bars
  return (
    <div className={cn("flex min-h-[300px] items-center justify-center", className)}>
      <div role="status" aria-label={label} className="flex flex-col items-center gap-6">

        {/* Bar equalizer */}
        <div className="flex items-end gap-[5px] h-[36px]">
          <span className="w-[3px] h-full rounded-full bg-[#D6B981] origin-bottom animate-[em-bar_1.4s_ease-in-out_infinite]" />
          <span className="w-[3px] h-full rounded-full bg-[#D6B981] origin-bottom animate-[em-bar_1.4s_ease-in-out_0.15s_infinite]" />
          <span className="w-[3px] h-full rounded-full bg-[#c9a882] origin-bottom animate-[em-bar_1.4s_ease-in-out_0.30s_infinite]" />
          <span className="w-[3px] h-full rounded-full bg-[#D6B981] origin-bottom animate-[em-bar_1.4s_ease-in-out_0.45s_infinite]" />
          <span className="w-[3px] h-full rounded-full bg-[#D6B981] origin-bottom animate-[em-bar_1.4s_ease-in-out_0.60s_infinite]" />
        </div>

        {/* Label */}
        {label && (
          <span className="text-[10px] font-light tracking-[0.2em] uppercase text-[#9e7d5e]">
            {label}
          </span>
        )}

        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
