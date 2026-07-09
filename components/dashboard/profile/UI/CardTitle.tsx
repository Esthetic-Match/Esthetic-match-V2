import type { ReactNode } from "react";

type CardTitleProps = {
  icon: ReactNode;
  title: string;
};

export default function CardTitle({ icon, title }: CardTitleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#d8bd8d]">{icon}</span>
      <h2 className="text-sm font-bold uppercase tracking-[0.05em] text-[#283C5D]">
        {title}
      </h2>
    </div>
  );
}