"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Search, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type ConversationUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type Conversation = {
  id: string;
  status: "ACTIVE" | "CLOSED";
  lastMessageAt: string | null;
  patientUser: ConversationUser;
  doctorProfile: {
    id: string;
    clinicName: string;
    avatar: string | null;
    user: ConversationUser;
  };
};

type Message = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderRole: "PATIENT" | "DOCTOR";
  text: string;
  createdAt: string;
};

type MeResponse = {
  user: {
    id: string;
    role: "PATIENT" | "DOCTOR";
  };
};

function getInitials(name?: string | null, email?: string) {
  const value = name || email || "U";

  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Messenger() {
  const t = useTranslations("dashboard.messages");
  const [me, setMe] = useState<MeResponse["user"] | null>(null);
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

  function getOtherPerson(conversation: Conversation) {
    if (!me) return null;

    if (me.role === "PATIENT") {
      return {
        name:
          conversation.doctorProfile.user.name ||
          conversation.doctorProfile.clinicName,
        email: conversation.doctorProfile.user.email,
        image:
          conversation.doctorProfile.avatar ||
          conversation.doctorProfile.user.image,
        label: conversation.doctorProfile.clinicName,
      };
    }

    return {
      name: conversation.patientUser.name || "Patient",
      email: conversation.patientUser.email,
      image: conversation.patientUser.image,
      label: conversation.patientUser.email,
    };
  }

  return (
    <section className=" bg-[#FAF9F7] p-2 md:pt-2">
      <div className="mx-auto grid h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-2xl border border-[#283C5D]/10 bg-white shadow-xl md:grid-cols-[360px_1fr]">
        <aside className="flex min-h-0 flex-col border-r border-[#283C5D]/10 bg-[#283C5D] text-white">
          <div className="border-b border-white/10 p-6">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="mt-1 text-sm text-white/60">
              {t("subtitle")}
            </p>

            <div className="mt-5 flex items-center gap-3 rounded-full bg-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-white/50" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {loadingConversations ? (
              <p className="p-4 text-sm text-white/60">
                {t("loadingConversations")}
              </p>
            ) : filteredConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 p-6 text-center">
                <MessageCircle className="mb-3 h-8 w-8 text-white/40" />
                <p className="text-sm font-semibold">{t("noActiveChats")}</p>
                <p className="mt-1 text-xs text-white/50">
                  {t("noActiveChatsDescription")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conversation) => {
                  const person = getOtherPerson(conversation);
                  const isActive = conversation.id === selectedConversationId;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                        isActive
                          ? "bg-white text-[#283C5D]"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20">
                        {person?.image ? (
                          <Image
                            src={person.image}
                            alt={person.name || t("profileAlt")}
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
                        <p className="truncate text-sm font-semibold">
                          {person?.name}
                        </p>
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
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col bg-[#FAF9F7]">
          {selectedConversation && me ? (
            <>
              <div className="flex items-center gap-4 border-b border-[#283C5D]/10 bg-white px-6 py-5">
                {(() => {
                  const person = getOtherPerson(selectedConversation);

                  return (
                    <>
                      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#283C5D]/10 text-[#283C5D]">
                        {person?.image ? (
                          <Image
                            src={person.image}
                            alt={person.name || "Profile"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold">
                            {getInitials(person?.name, person?.email)}
                          </span>
                        )}
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-[#283C5D]">
                          {person?.name}
                        </h2>
                        <p className="text-sm text-[#283C5D]/50">
                          {t("activeOnlineConsultation")}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
                {loadingMessages ? (
                  <p className="text-sm text-[#283C5D]/50">
                    {t("loadingMessages")}
                  </p>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#283C5D]/10">
                      <MessageCircle className="h-7 w-7 text-[#283C5D]" />
                    </div>
                      <h3 className="text-lg font-bold text-[#283C5D]">
                        {t("startConversation")}
                      </h3>
                      <p className="mt-1 max-w-sm text-sm text-[#283C5D]/50">
                        {t("startConversationDescription")}
                      </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isMine = message.senderUserId === me.id;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
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
                    })}

                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-[#283C5D]/10 bg-white p-4 md:p-5">
                <div className="flex items-end gap-3 rounded-[1.75rem] bg-[#F2F3F5] px-4 py-3 shadow-inner">
                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={t("messagePlaceholder")}
                    rows={1}
                    className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm text-[#283C5D] outline-none placeholder:text-[#283C5D]/40"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim() || sending}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#283C5D] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#283C5D]/10">
                <MessageCircle className="h-8 w-8 text-[#283C5D]" />
              </div>
              <h2 className="text-xl font-bold text-[#283C5D]">
                {t("noConversationSelected")}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-[#283C5D]/50">
                {t("noConversationSelectedDescription")}
              </p>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}