import { Search } from "lucide-react";
import type { Conversation, MeUser } from "./types";
import { getOtherPerson } from "./utils";
import ConversationListItem from "./ConversationListItem";
import EmptyState from "./EmptyState";

type ConversationSidebarProps = {
  activeConversations: Conversation[];
  closedConversations: Conversation[];
  selectedConversationId: string | null;
  search: string;
  loading: boolean;
  me: MeUser | null;
  t: (key: string) => string;
  onSearchChange: (value: string) => void;
  onSelectConversation: (id: string) => void;
};

export default function ConversationSidebar({
  activeConversations,
  closedConversations,
  selectedConversationId,
  search,
  loading,
  me,
  t,
  onSearchChange,
  onSelectConversation,
}: ConversationSidebarProps) {
  const hasConversations =
    activeConversations.length > 0 || closedConversations.length > 0;

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-[#283C5D]/10 bg-[#283C5D] text-white md:w-[360px]">
      <div className="border-b border-white/10 p-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-white/60">{t("subtitle")}</p>

        <div className="mt-5 flex items-center gap-3 rounded-full bg-white/10 px-4 py-3">
          <Search className="h-4 w-4 text-white/50" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="p-4 text-sm text-white/60">
            {t("loadingConversations")}
          </p>
        ) : !hasConversations ? (
          <EmptyState
            variant="dark"
            title={t("noActiveChats")}
            description={t("noActiveChatsDescription")}
          />
        ) : (
          <div className="space-y-6">
            {activeConversations.length > 0 && (
              <div className="space-y-3">
                {activeConversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    person={getOtherPerson(conversation, me)}
                    isActive={conversation.id === selectedConversationId}
                    profileAlt={t("profileAlt")}
                    onSelect={() => onSelectConversation(conversation.id)}
                  />
                ))}
              </div>
            )}

            {closedConversations.length > 0 && (
              <>
                <div className="flex items-center gap-3 px-2">
                  <div className="h-px flex-1 bg-white/10" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    {t("closed")}
                  </span>

                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="space-y-3 opacity-70">
                  {closedConversations.map((conversation) => (
                    <ConversationListItem
                      key={conversation.id}
                      conversation={conversation}
                      person={getOtherPerson(conversation, me)}
                      isActive={conversation.id === selectedConversationId}
                      profileAlt={t("profileAlt")}
                      onSelect={() => onSelectConversation(conversation.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}