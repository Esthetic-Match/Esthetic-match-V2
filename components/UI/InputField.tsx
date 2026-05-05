import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputFieldProps = {
  label: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  disabled?: boolean;
  styleChange?: string;
};

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      placeholder,
      type = "text",
      value,
      onChange,
      icon,
      disabled,
      styleChange
    },
    ref
  ) => {
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-black">
          {label}
        </label>

        <div className="relative z-50">
          <input
            ref={ref}
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "h-10 w-full rounded-full border border-white/10 bg-white/85 px-4 pr-11 text-sm text-black outline-none placeholder:text-black/25 focus:border-[#d8bd8d] shadow-md [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0",
              styleChange
            )}
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFD78C]">
            {icon}
          </div>
        </div>
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;