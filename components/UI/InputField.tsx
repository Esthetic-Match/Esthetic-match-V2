
type InputFieldProps = {
  label: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
};

export default function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  icon,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-black">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-full border border-white/10 bg-white/85 px-4 pr-11 text-xs text-black outline-none placeholder:text-black/25 focus:border-[#d8bd8d] 
          [&::-webkit-calendar-picker-indicator]:opacity-0 
          [&::-webkit-calendar-picker-indicator]:absolute 
          [&::-webkit-calendar-picker-indicator]:right-0"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFD78C]">
          {icon}
        </div>
      </div>
    </div>
  );
}