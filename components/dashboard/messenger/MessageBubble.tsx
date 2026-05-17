import type { Message } from "./types";
import { formatMessageTime } from "./utils";

type MessageBubbleProps = {
  message: Message;
  isMine: boolean;
};

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-3xl px-5 py-3 shadow-sm ${
          isMine
            ? "rounded-br-md bg-[#283C5D] text-white"
            : "rounded-bl-md bg-white text-[#283C5D]"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.text}
        </p>

        <p
          className={`mt-2 text-right text-[10px] ${
            isMine ? "text-white/50" : "text-[#283C5D]/40"
          }`}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}