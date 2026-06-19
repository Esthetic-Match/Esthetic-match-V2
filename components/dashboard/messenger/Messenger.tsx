"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Conversation, MeUser, Message } from "./types";
import ConversationSidebar from "./ConversationSidebar";
import ChatPanel from "./ChatPanel";
import EmptyChatHero from "./EmptyChatHero";
import { MessageSquareReply  } from "lucide-react";

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  const activeConversations = useMemo(
    () =>
      filteredConversations.filter(
        (conversation) => conversation.status === "ACTIVE"
      ),
    [filteredConversations]
  );

  const closedConversations = useMemo(
    () =>
      filteredConversations.filter(
        (conversation) => conversation.status === "CLOSED"
      ),
    [filteredConversations]
  );
  
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

    if (
      !cleanText ||
      !selectedConversationId ||
      sending ||
      selectedConversation?.status !== "ACTIVE"
    ) {
      return;
    }

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversationId,
      senderUserId: me?.id || "",
      senderRole: me?.role === "DOCTOR" ? "DOCTOR" : "PATIENT",
      messageType: "TEXT",
      text: cleanText,
      attachments: [],
      createdAt: new Date().toISOString(),
      readAt: null,
      editedAt: null,
      deletedAt: null,
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

async function handleEndConversation(conversationId: string) {
  try {
    const res = await fetch(`/api/conversations/${conversationId}/close`, {
      method: "PATCH",
    });

    if (!res.ok) {
      throw new Error("Failed to end conversation");
    }

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              status: "CLOSED",
            }
          : conversation
      )
    );

    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
      setMessages([]);
      setMessageText("");
    }
  } catch (error) {
    console.error(error);
  }
}

async function sendImageMessage(file: File, text?: string) {
  if (!selectedConversationId || uploadingImage || sending) return;

  if (selectedConversation?.status !== "ACTIVE") return;
  
  const cleanText = text?.trim() || "";
  

  try {
    setUploadingImage(true);

    const signedUrlRes = await fetch("/api/images/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType: file.type,
        access: "private",
        type: "medical",
        folder: `conversations/${selectedConversationId}/${me?.id}`,
      }),
    });

    if (!signedUrlRes.ok) {
      const error = await signedUrlRes.text();
      console.error("Signed URL error:", error);
      throw new Error("Failed to create signed upload URL");
    }

    const { uploadUrl, objectPath } = await signedUrlRes.json();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload image");
    }

    const messageRes = await fetch(
      `/api/conversations/${selectedConversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageType: "IMAGE",
          text: cleanText || null,
          attachment: {
            objectPath,
            fileName: file.name,
            contentType: file.type,
            sizeBytes: file.size,
          },
        }),
      }
    );

    if (!messageRes.ok) {
      const error = await messageRes.text();
      console.error("Send image message error:", error);
      throw new Error("Failed to send image message");
    }
    const data: { message: Message } = await messageRes.json();

    setMessageText("");

    setMessages((current) => [...current, data.message]);

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
  } finally {
    setUploadingImage(false);
  }
}

  return (
<div className="h-[100dvh] w-full bg-[#FAF9F7] p-1 lg:pl-2 lg:pt-2">
  <div className="relative mx-auto flex h-full w-full max-w-8xl overflow-hidden rounded-xl bg-white shadow-xl">
    <div className="hidden lg:block">
      <ConversationSidebar
        activeConversations={activeConversations}
        closedConversations={closedConversations}
        selectedConversationId={selectedConversationId}
        search={search}
        loading={loadingConversations}
        me={me}
        t={t}
        onSearchChange={setSearch}
        onSelectConversation={handleSelectConversation}
      />
    </div>

    {isMobileSidebarOpen ? (
      <div className="fixed inset-0 z-50 lg:hidden">
        <button
          type="button"
          aria-label="Close conversations"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <div className="relative h-full w-[86%] max-w-sm overflow-hidden rounded-r-3xl bg-[#283C5D] shadow-2xl">
          <ConversationSidebar
            activeConversations={activeConversations}
            closedConversations={closedConversations}
            selectedConversationId={selectedConversationId}
            search={search}
            loading={loadingConversations}
            me={me}
            t={t}
            onSearchChange={setSearch}
            onSelectConversation={(conversationId) => {
              handleSelectConversation(conversationId);
              setIsMobileSidebarOpen(false);
            }}
          />
        </div>
      </div>
    ) : null}

    <div className="min-h-0 flex-1">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-[#283C5D]/10 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#283C5D] text-white shadow-md"
          >
            <MessageSquareReply  size={20} />
          </button>

          <p className="text-sm font-semibold text-[#283C5D]">
            {t("title")}
          </p>

          <div className="h-10 w-10" />
        </div>

        <div className="min-h-0 flex-1">
          {selectedConversation && me ? (
            <ChatPanel
              selectedConversation={selectedConversation}
              me={me}
              messages={messages}
              messageText={messageText}
              loadingMessages={loadingMessages}
              sending={sending}
              uploadingImage={uploadingImage}
              bottomRef={bottomRef}
              t={t}
              onMessageTextChange={setMessageText}
              onSendMessage={sendMessage}
              onSendImage={sendImageMessage}
              onEndConversation={handleEndConversation}
            />
          ) : (
            <EmptyChatHero />
          )}
        </div>
      </div>
    </div>
  </div>
</div>
  );
}