"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Conversation, MeUser, Message } from "./types";
import ConversationSidebar from "./ConversationSidebar";
import ChatPanel from "./ChatPanel";
import EmptyChatHero from "./EmptyChatHero";

type MeResponse = {
  user: MeUser;
};

export default function Messenger() {
  const t = useTranslations("dashboard.messages");

  const [me, setMe] = useState<MeUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const patientName = conversation.patientUser.name || "";
      const patientEmail = conversation.patientUser.email || "";
      const doctorName = conversation.doctorProfile.user.name || "";
      const doctorEmail = conversation.doctorProfile.user.email || "";
      const clinicName = conversation.doctorProfile.clinicName || "";

      return [
        patientName,
        patientEmail,
        doctorName,
        doctorEmail,
        clinicName,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [conversations, search]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoadingConversations(true);

        const meRes = await fetch("/api/me", {
          method: "GET",
        });

        if (!meRes.ok) {
          throw new Error("Failed to load current user");
        }

        const meData: MeResponse = await meRes.json();
        setMe(meData.user);

        const conversationsRes = await fetch("/api/conversations", {
          method: "GET",
        });

        if (!conversationsRes.ok) {
          throw new Error("Failed to load conversations");
        }

        const conversationsData: { conversations: Conversation[] } =
          await conversationsRes.json();

        setConversations(conversationsData.conversations);

        if (conversationsData.conversations.length > 0) {
          setSelectedConversationId(conversationsData.conversations[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingConversations(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversationId) return;

      try {
        setLoadingMessages(true);

        const res = await fetch(
          `/api/conversations/${selectedConversationId}/messages`,
          {
            method: "GET",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load messages");
        }

        const data: { messages: Message[] } = await res.json();
        setMessages(data.messages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [selectedConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const cleanText = messageText.trim();

    if (!cleanText || !selectedConversationId || sending) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversationId,
      senderUserId: me?.id || "",
      senderRole: me?.role === "DOCTOR" ? "DOCTOR" : "PATIENT",
      text: cleanText,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, tempMessage]);
    setMessageText("");

    try {
      setSending(true);

      const res = await fetch(
        `/api/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const data: { message: Message } = await res.json();

      setMessages((current) =>
        current.map((message) =>
          message.id === tempMessage.id ? data.message : message
        )
      );

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                lastMessageAt: data.message.createdAt,
              }
            : conversation
        )
      );
    } catch (error) {
      console.error(error);

      setMessages((current) =>
        current.filter((message) => message.id !== tempMessage.id)
      );

      setMessageText(cleanText);
    } finally {
      setSending(false);
    }
  }

  function handleSelectConversation(conversationId: string) {
  setSelectedConversationId(conversationId);

  setConversations((current) =>
    current.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            unreadCount: 0,
          }
        : conversation
    )
  );
}

  return (
    <div className="h-screen w-full bg-[#FAF9F7] pl-2 pt-2">
      <div className="mx-auto flex h-full w-full max-w-8xl overflow-hidden rounded-t-xl rounded-tr-xl rounded-br-xl bg-white shadow-xl max-md:flex-col">
        <ConversationSidebar
          conversations={filteredConversations}
          selectedConversationId={selectedConversationId}
          search={search}
          loading={loadingConversations}
          me={me}
          t={t}
          onSearchChange={setSearch}
          onSelectConversation={handleSelectConversation}
        />
    
      <div className="min-h-0 flex-1">
        {selectedConversation && me ? (
          <ChatPanel
            selectedConversation={selectedConversation}
            me={me}
            messages={messages}
            messageText={messageText}
            loadingMessages={loadingMessages}
            sending={sending}
            bottomRef={bottomRef}
            t={t}
            onMessageTextChange={setMessageText}
            onSendMessage={sendMessage}
          />
        ) : (
          <EmptyChatHero />
        )}
      </div>
      </div>
    </div>
  );
}