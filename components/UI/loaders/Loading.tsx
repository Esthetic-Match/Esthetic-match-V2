import { cn } from "@/lib/utils/utils";

type LoadingProps = {
  className?: string;
  label?: string;
};

export default function Loading({
  className,
  label = "Loading...",
}: LoadingProps) {
  return (
<div className="flex min-h-[300px] items-center justify-center">
    <div
      role="status"
      aria-label={label}
      className={cn(
        "grid aspect-square w-[100px] box-border bg-transparent p-[10px]",
        "blur-[4px] contrast-[2]",
        "before:content-[''] hue-rotate-[320deg] after:content-['']",
        "before:[grid-area:1/1] after:[grid-area:1/1]",
        "before:h-[40px] before:w-[40px]",
        "after:h-[40px] after:w-[40px]",
        "before:bg-[#D6B981] after:bg-[#D6B981]",
        "before:animate-[loader-square_2s_infinite]",
        "after:animate-[loader-square_2s_infinite]",
        "after:[animation-delay:-1s]",
        className
      )}
    >
      <span className="sr-only">{label}</span>
    </div>
</div>
  );
}