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
    <div className="border-t border-[#283C5D]/10 bg-white p-4 md:p-5">
      {previewUrl && (
        <div className="mb-3 flex items-start gap-3 rounded-2xl bg-[#F2F3F5] p-3">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-white">
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
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#283C5D] shadow-sm transition hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        className={`flex items-end gap-3 rounded-[1.75rem] px-4 py-3 shadow-inner transition ${
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#283C5D] 
          transition hover:bg-[#283c5d] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ImagePlus className="h-5 w-5" />
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
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm text-[#283C5D] outline-none placeholder:text-[#283C5D]/40 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          onClick={handleSend}
          disabled={(!value.trim() && !selectedImage) || disabled}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#283C5D] text-white transition  active:scale-95 hover:scale-105 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}