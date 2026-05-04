import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type TextareaFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  rows?: number;
  className?: string;
};

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      icon,
      disabled,
      rows = 5,
      className,
    },
    ref
  ) => {
    return (
      <div className={className}>
        <label className="mb-2 block text-sm font-medium text-black">
          {label}
        </label>

        <div className="relative">
          <textarea
            ref={ref}
            rows={rows}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full rounded-2xl border border-white/10 px-4 pr-11 py-3 text-sm text-black outline-none placeholder:text-black/25 shadow-md resize-none",
              "focus:border-[#d8bd8d]",
              disabled
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-white/85"
            )}
          />

          {icon && (
            <div className="absolute right-4 top-4 text-[#FFD78C]">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TextareaField.displayName = "TextareaField";

export default TextareaField;