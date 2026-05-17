import type { Message, MeUser } from "./types";
import MessageBubble from "./MessageBubble";
import EmptyState from "./EmptyState";

type MessageListProps = {
  messages: Message[];
  me: MeUser;
  loading: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  t: (key: string) => string;
};

export type MessageAttachment = {
  id: string;
  objectPath: string;
  readUrl: string;
  fileName: string | null;
  contentType: string;
  sizeBytes: number | null;
  createdAt?: string;
};

export default function MessageList({
  messages,
  me,
  loading,
  bottomRef,
  t,
}: MessageListProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
      {loading ? (
        <p className="text-sm text-[#283C5D]/50">{t("loadingMessages")}</p>
      ) : messages.length === 0 ? (
        <EmptyState
          title={t("startConversation")}
          description={t("startConversationDescription")}
        />
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={message.senderUserId === me.id}
            />
          ))}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}