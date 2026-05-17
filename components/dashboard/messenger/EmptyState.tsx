import { MessageCircle } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  variant?: "dark" | "light";
};

export default function EmptyState({
  title,
  description,
  variant = "light",
}: EmptyStateProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={`flex h-full flex-col items-center justify-center text-center ${
        isDark
          ? "rounded-3xl border border-dashed border-white/20 p-6 text-white"
          : "p-6 text-[#283C5D]"
      }`}
    >
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
          isDark ? "bg-white/10" : "bg-[#283C5D]/10"
        }`}
      >
        <MessageCircle
          className={`h-7 w-7 ${isDark ? "text-white/40" : "text-[#283C5D]"}`}
        />
      </div>

      <h3 className="text-lg font-bold">{title}</h3>

      {description && (
        <p
          className={`mt-1 max-w-sm text-sm ${
            isDark ? "text-white/50" : "text-[#283C5D]/50"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}