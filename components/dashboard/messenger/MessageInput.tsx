import { Send } from "lucide-react";

type MessageInputProps = {
  value: string;
  sending: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export default function MessageInput({
  value,
  sending,
  placeholder,
  onChange,
  onSend,
}: MessageInputProps) {
  return (
    <div className="border-t border-[#283C5D]/10 bg-white p-4 md:p-5">
      <div className="flex items-end gap-3 rounded-[1.75rem] bg-[#F2F3F5] px-4 py-3 shadow-inner">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder}
          rows={1}
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm text-[#283C5D] outline-none placeholder:text-[#283C5D]/40"
        />

        <button
          onClick={onSend}
          disabled={!value.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#283C5D] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}