import type { Conversation, MeUser, Message } from "./types";
import { getOtherPerson } from "./utils";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import EmptyState from "./EmptyState";

type ChatPanelProps = {
  selectedConversation: Conversation | undefined;
  me: MeUser | null;
  messages: Message[];
  messageText: string;
  loadingMessages: boolean;
  sending: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  t: (key: string) => string;
  onMessageTextChange: (value: string) => void;
  onSendMessage: () => void;
  onEndConversation: (conversationId: string) => void;
  uploadingImage: boolean;
  onSendImage: (file: File) => void;
};

export default function ChatPanel({
  selectedConversation,
  me,
  messages,
  messageText,
  loadingMessages,
  sending,
  bottomRef,
  t,
  onMessageTextChange,
  onSendMessage,
  onEndConversation,
  uploadingImage,
  onSendImage
}: ChatPanelProps) {
  if (!selectedConversation || !me) {
    return (
      <main className="flex min-h-0 flex-col bg-[#FAF9F7]">
        <EmptyState
          title={t("noConversationSelected")}
          description={t("noConversationSelectedDescription")}
        />
      </main>
    );
  }

  const person = getOtherPerson(selectedConversation, me);

  return (
    <main className="flex h-full min-h-0 flex-col bg-[#FAF9F7]">
      <ChatHeader
        person={person}
        subtitle={t("activeOnlineConsultation")}
        me={me}
        conversation={selectedConversation}
        onEndConversation={onEndConversation}
      />

      <MessageList
        messages={messages}
        me={me}
        loading={loadingMessages}
        bottomRef={bottomRef}
        t={t}
      />

      <MessageInput
        value={messageText}
        sending={sending}
        uploadingImage={uploadingImage}
        isDisabled={selectedConversation.status === "CLOSED"}
        placeholder={t("messagePlaceholder")}
        onChange={onMessageTextChange}
        onSend={onSendMessage}
        onSendImage={onSendImage}
      />
    </main>
  );
}