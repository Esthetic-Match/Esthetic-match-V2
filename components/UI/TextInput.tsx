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
      className="w-full rounded border p-3"
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}