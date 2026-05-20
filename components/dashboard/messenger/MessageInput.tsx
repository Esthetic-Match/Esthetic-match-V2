import { useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import Image from "next/image";

type MessageInputProps = {
  value: string;
  sending: boolean;
  uploadingImage?: boolean;
  isDisabled?: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSendImage: (file: File) => void;
};

export default function MessageInput({
  value,
  sending,
  uploadingImage = false,
  isDisabled = false,
  placeholder,
  onChange,
  onSend,
  onSendImage,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const disabled = isDisabled || sending || uploadingImage;
  const previewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;

  function handleSend() {
    if (selectedImage) {
      onSendImage(selectedImage);
      setSelectedImage(null);
      return;
    }

    onSend();
  }

return (
  <div className="border-t border-[#283C5D]/10 bg-white p-2 sm:p-3 lg:p-5">
    {previewUrl && (
      <div className="mb-3 flex items-start justify-between gap-3 rounded-2xl bg-[#F2F3F5] p-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white sm:h-20 sm:w-20">
          <Image
            src={previewUrl}
            alt="Selected image"
            fill
            className="object-cover"
          />
        </div>

        <button
          type="button"
          onClick={() => setSelectedImage(null)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#283C5D] shadow-sm transition hover:bg-red-50 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )}

    <div
      className={`flex w-full items-end gap-2 rounded-[1.5rem] px-2 py-2 shadow-inner transition sm:gap-3 sm:rounded-[1.75rem] sm:px-4 sm:py-3 ${
        disabled ? "bg-[#ECECEC]" : "bg-[#F2F3F5]"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (!file) return;

          setSelectedImage(file);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#283C5D] transition hover:bg-[#283c5d] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
      >
        <ImagePlus className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !disabled) {
            event.preventDefault();
            handleSend();
          }
        }}
        placeholder={
          isDisabled ? "This conversation has been closed" : placeholder
        }
        rows={1}
        className="max-h-28 min-h-9 min-w-0 flex-1 resize-none bg-transparent py-2 text-sm leading-5 text-[#283C5D] outline-none placeholder:text-[#283C5D]/40 disabled:cursor-not-allowed disabled:opacity-60 sm:max-h-32 sm:min-h-10"
      />

      <button
        onClick={handleSend}
        disabled={(!value.trim() && !selectedImage) || disabled}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#283C5D] text-white transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  </div>
);
}