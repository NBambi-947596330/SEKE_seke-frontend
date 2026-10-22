"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/use-auth";
import { listConversations } from "@/lib/chat-client";
import { formatConversationTimestamp } from "@/lib/chat-format";
import { resolveUserAvatarUrl, userAvatarSrcUnoptimized } from "@/lib/user-avatar";
import type { ChatConversation } from "@/types/chat";

/** Cores do projeto (light.ts): primary #2b81e5, surface #ffffff, border #c7ddf6, text #192f52, textSecondary #214b87 */
const CHAT_COLORS = {
  primary: "#2b81e5",
  primaryHover: "#236bd2",
  surface: "#ffffff",
  background: "#f0f8fe",
  border: "#c7ddf6",
  text: "#192f52",
  textSecondary: "#214b87",
};

const POLL_MS = 60_000;
const PREVIEW_LIMIT = 5;

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.sessionStorage.getItem("auth_token");
  return token && token.trim() ? token : null;
}

interface ItemChatWidgetProps {
  /** Número de mensagens não lidas (badge no bubble). Se omitido, é calculado pela API. */
  unreadCount?: number;
  /** Título no header quando expandido */
  title?: string;
  /** Largura do painel expandido */
  width?: number;
  /** Altura do painel expandido */
  height?: number;
  /** Conteúdo customizado do corpo (ex: lista de conversas). Se não passar, usa a lista real. */
  children?: React.ReactNode;
}

export default function ItemChatWidget({
  unreadCount,
  title = "Mensagens",
  width = 380,
  height = 520,
  children,
}: ItemChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiUnread, setApiUnread] = useState(0);

  const load = useCallback(async (mode: "full" | "silent" = "silent") => {
    const token = getStoredToken();
    if (!token) return;
    if (mode === "full") setLoading(true);
    try {
      const result = await listConversations(token, { limit: PREVIEW_LIMIT });
      if (result.success) {
        setConversations(result.data.conversations.slice(0, PREVIEW_LIMIT));
        setApiUnread(result.data.unreadTotal);
      }
    } finally {
      if (mode === "full") setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void load("silent");
    const id = window.setInterval(() => void load("silent"), POLL_MS);
    return () => window.clearInterval(id);
  }, [isAuthenticated, load]);

  useEffect(() => {
    if (!isOpen) return;
    void load("full");
  }, [isOpen, load]);

  // Comportamento tipo LinkedIn: clicar fora fecha apenas o foco visual (header), não minimiza
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const badgeCount = unreadCount ?? apiUnread;

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-0 md:bottom-6 md:right-6 md:z-50">
      {/* Painel expandido (comportamento igual LinkedIn: aparece por cima, cantos arredondados no topo) */}
      {isOpen && (
        <div
          ref={panelRef}
          className="flex flex-col rounded-t-xl border border-b-0 shadow-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
          style={{
            width: width,
            maxWidth: "calc(100vw - 24px)",
            height: height,
            maxHeight: "calc(100vh - 120px)",
            backgroundColor: CHAT_COLORS.background,
            borderColor: CHAT_COLORS.border,
          }}
        >
          {/* Header: cor sólida quando ativo (como LinkedIn), fundo claro quando inativo */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{
              backgroundColor: isFocused ? CHAT_COLORS.primary : CHAT_COLORS.surface,
              color: isFocused ? "#FFFFFF" : CHAT_COLORS.text,
              borderBottom: `1px solid ${CHAT_COLORS.border}`,
            }}
            onMouseDown={() => setIsFocused(true)}
          >
            <span className="font-semibold text-sm">{title}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white/20 text-inherit"
              onClick={() => setIsOpen(false)}
              aria-label="Minimizar chat"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Corpo: lista de conversas ou conteúdo customizado */}
          <div
            className="flex-1 overflow-auto flex flex-col"
            style={{ backgroundColor: CHAT_COLORS.background }}
          >
            {children ?? (
              <div className="flex flex-1 flex-col">
                {loading && conversations.length === 0 ? (
                  <div
                    className="flex flex-1 items-center justify-center p-4 text-sm"
                    style={{ color: CHAT_COLORS.textSecondary }}
                  >
                    A carregar conversas…
                  </div>
                ) : conversations.length === 0 ? (
                  <div
                    className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center text-sm"
                    style={{ color: CHAT_COLORS.textSecondary }}
                  >
                    <MessageCircle className="h-8 w-8 opacity-50" strokeWidth={1.5} />
                    <p>
                      Nenhuma conversa ainda.
                      <br />
                      As mensagens aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  <ul>
                    {conversations.map((conversation) => {
                      const avatarSrc = resolveUserAvatarUrl(
                        conversation.participantAvatar
                      );
                      return (
                        <li key={conversation.id}>
                          <Link
                            href={`/chat?conversation=${encodeURIComponent(conversation.id)}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/70"
                          >
                            <span className="relative shrink-0">
                              <Image
                                src={avatarSrc}
                                alt={conversation.participantName}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                                unoptimized={userAvatarSrcUnoptimized(avatarSrc)}
                              />
                              {conversation.unreadCount > 0 ? (
                                <span
                                  className="absolute -bottom-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white"
                                  style={{ backgroundColor: "#EF4444" }}
                                >
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
                                    "truncate text-sm",
                                    conversation.unreadCount > 0 && "font-bold"
                                  )}
                                  style={{ color: CHAT_COLORS.text }}
                                >
                                  {conversation.participantName}
                                </span>
                                <span
                                  className="shrink-0 text-[11px]"
                                  style={{ color: CHAT_COLORS.textSecondary }}
                                >
                                  {formatConversationTimestamp(
                                    conversation.lastMessageAt
                                  )}
                                </span>
                              </span>
                              <span
                                className="mt-0.5 block truncate text-xs"
                                style={{ color: CHAT_COLORS.textSecondary }}
                              >
                                {conversation.lastMessage || "Sem mensagens"}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Rodapé: acesso à página completa de mensagens */}
          <div
            className="shrink-0 p-3 border-t"
            style={{ backgroundColor: CHAT_COLORS.surface, borderColor: CHAT_COLORS.border }}
          >
            <Link
              href="/chat"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: CHAT_COLORS.primary }}
            >
              <MessageCircle className="h-4 w-4" />
              Abrir mensagens
            </Link>
          </div>
        </div>
      )}

      {/* Bubble minimizado: clique abre o painel (comportamento LinkedIn) */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((o) => !o);
          if (!isOpen) setIsFocused(true);
        }}
        className={cn(
          "relative flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        )}
        style={{
          width: 56,
          height: 56,
          backgroundColor: CHAT_COLORS.primary,
        }}
        aria-label={isOpen ? "Fechar mensagens" : "Abrir mensagens"}
      >
        <MessageCircle className="h-6 w-6 text-white" />
        {badgeCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full text-xs font-bold text-white px-1"
            style={{ backgroundColor: "#EF4444" }}
          >
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </button>
    </div>
  );
}
