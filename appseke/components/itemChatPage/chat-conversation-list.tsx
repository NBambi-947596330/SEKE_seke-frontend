"use client";

import Image from "next/image";
import { Archive, ArchiveRestore, Loader2, MessageCircle, RefreshCw, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatConversationTimestamp } from "@/lib/chat-format";
import { resolveUserAvatarUrl, userAvatarSrcUnoptimized } from "@/lib/user-avatar";
import type { ChatConversation } from "@/types/chat";

interface ChatConversationListProps {
  conversations: ChatConversation[];
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  /** Conversas ativas ou arquivadas. */
  filter: "active" | "archived";
  onFilterChange: (value: "active" | "archived") => void;
  onToggleArchive: (conversation: ChatConversation) => void;
  /** Oculta a lista no mobile quando existe uma conversa aberta. */
  hiddenOnMobile: boolean;
}

export default function ChatConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
  error,
  onRetry,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onToggleArchive,
  hiddenOnMobile,
}: ChatConversationListProps) {
  const query = search.trim().toLowerCase();
  const scoped = conversations.filter((c) =>
    filter === "archived" ? c.archived : !c.archived
  );
  const filtered = query
    ? scoped.filter(
        (c) =>
          c.participantName.toLowerCase().includes(query) ||
          (c.contextTitle ?? "").toLowerCase().includes(query) ||
          c.lastMessage.toLowerCase().includes(query)
      )
    : scoped;

  const activeCount = conversations.filter((c) => !c.archived).length;
  const archivedCount = conversations.length - activeCount;

  return (
    <aside
      className={cn(
        "flex w-full shrink-0 flex-col border-r border-border bg-card sm:w-72 md:w-80",
        hiddenOnMobile && "hidden sm:flex"
      )}
    >
      {/* Pesquisa + filtro de arquivadas */}
      <div className="space-y-2 p-2.5 sm:p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 rounded-lg border-border bg-card pl-9 text-sm sm:h-10"
            aria-label="Buscar conversas"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {filter === "archived"
              ? `${archivedCount} arquivada${archivedCount === 1 ? "" : "s"}`
              : `${activeCount} conversa${activeCount === 1 ? "" : "s"}`}
          </span>
          {archivedCount > 0 ? (
            <div className="flex items-center gap-1 rounded-full border border-border p-0.5">
              <button
                type="button"
                onClick={() => onFilterChange("active")}
                className={cn(
                  "cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                  filter === "active"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={filter === "active"}
              >
                Ativas
              </button>
              <button
                type="button"
                onClick={() => onFilterChange("archived")}
                className={cn(
                  "cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                  filter === "archived"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={filter === "archived"}
              >
                Arquivadas
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Lista */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">A carregar conversas…</span>
          </div>
        ) : error && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="h-3.5 w-3.5" />
              Tentar novamente
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center text-muted-foreground">
            <MessageCircle className="h-8 w-8 opacity-50" strokeWidth={1.5} />
            <p className="text-sm">
              {query
                ? "Nenhuma conversa encontrada."
                : filter === "archived"
                  ? "Não tens conversas arquivadas."
                  : "Ainda não tens conversas."}
            </p>
            {!query && filter === "active" && (
              <p className="text-xs">
                Contacta um profissional a partir do perfil para começar.
              </p>
            )}
          </div>
        ) : (
          <ul>
            {filtered.map((conversation) => {
              const avatarSrc = resolveUserAvatarUrl(conversation.participantAvatar);
              const active = conversation.id === selectedId;
              return (
                <li key={conversation.id}>
                  <div
                    className={cn(
                      "group relative flex w-full items-start gap-2.5 p-2.5 text-left transition-colors sm:gap-3 sm:p-3",
                      active ? "bg-muted" : "hover:bg-accent"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(conversation.id)}
                      className="flex min-w-0 flex-1 items-start gap-2.5 text-left sm:gap-3"
                    >
                      <span className="relative shrink-0">
                        <Image
                          src={avatarSrc}
                          alt={conversation.participantName}
                          width={44}
                          height={44}
                          className="h-10 w-10 rounded-full object-cover sm:h-11 sm:w-11"
                          unoptimized={userAvatarSrcUnoptimized(avatarSrc)}
                        />
                        {conversation.unreadCount > 0 ? (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-card">
                            {conversation.unreadCount > 99
                              ? "99+"
                              : conversation.unreadCount}
                          </span>
                        ) : null}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "truncate text-sm text-foreground",
                              conversation.unreadCount > 0 && "font-bold"
                            )}
                          >
                            {conversation.participantName}
                          </span>
                          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                            {formatConversationTimestamp(conversation.lastMessageAt)}
                          </span>
                        </span>

                        {conversation.contextTitle ? (
                          <span className="mt-0.5 block truncate text-xs text-primary">
                            {conversation.contextTitle}
                          </span>
                        ) : null}

                        <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                          {conversation.lastMessage || "Sem mensagens"}
                        </span>

                        {conversation.archived ? (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            <Archive className="h-2.5 w-2.5" />
                            Arquivada
                          </span>
                        ) : null}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleArchive(conversation)}
                      className="absolute right-2 top-2 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                      aria-label={
                        conversation.archived
                          ? "Desarquivar conversa"
                          : "Arquivar conversa"
                      }
                      title={
                        conversation.archived
                          ? "Desarquivar conversa"
                          : "Arquivar conversa"
                      }
                    >
                      {conversation.archived ? (
                        <ArchiveRestore className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
