import type { HTMLInputTypeAttribute } from "react";

type TextInputProps = {
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
};

export default function TextInput({
  placeholder,
  type = "text",
  value,
  onChange,
}: TextInputProps) {
  return (
    <input
      className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#263F63] focus:bg-white focus:outline-none"
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}