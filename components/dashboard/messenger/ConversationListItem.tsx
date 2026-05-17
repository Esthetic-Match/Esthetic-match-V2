import Image from "next/image";
import type { Conversation, OtherPerson } from "./types";
import { formatMessageTime, getInitials } from "./utils";

type ConversationListItemProps = {
  conversation: Conversation;
  person: OtherPerson | null;
  isActive: boolean;
  profileAlt: string;
  onSelect: () => void;
};

export default function ConversationListItem({
  conversation,
  person,
  isActive,
  profileAlt,
  onSelect,
}: ConversationListItemProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
        isActive
          ? "bg-white text-[#283C5D]"
          : "bg-white/5 text-white hover:bg-white/10"
      }`}
    >
      {conversation.unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-9 items-center justify-center rounded-full bg-[#dabf90] px-1.5 text-[10px] font-bold text-black">
          {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
        </span>
      )}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20">
        {person?.image ? (
          <Image
            src={person.image}
            alt={person.name || profileAlt}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-sm font-bold">
            {getInitials(person?.name, person?.email)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{person?.name}</p>
        <p
          className={`truncate text-xs ${
            isActive ? "text-[#283C5D]/60" : "text-white/50"
          }`}
        >
          {person?.label}
        </p>
      </div>

      {conversation.lastMessageAt && (
        <span
          className={`text-[10px] ${
            isActive ? "text-[#283C5D]/50" : "text-white/40"
          }`}
        >
          {formatMessageTime(conversation.lastMessageAt)}
        </span>
      )}
    </button>
  );
}