"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { useViewerUserId } from "@/lib/viewer-user-id";
import { getClientGeolocation } from "@/lib/geolocation";
import { resolveUserAvatarUrl, userAvatarSrcUnoptimized } from "@/lib/user-avatar";
import {
  archiveConversation,
  createConversation,
  deleteMessage,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
  uploadChatMedia,
} from "@/lib/chat-client";
import type { ChatConversation, ChatMessage } from "@/types/chat";

import ChatComposer from "./chat-composer";
import ChatConversationList from "./chat-conversation-list";
import ChatThread from "./chat-thread";

const CONVERSATION_POLL_MS = 30_000;
const MESSAGE_POLL_MS = 15_000;
const PAGE_LIMIT = 50;

const EMPTY_MESSAGES: ChatMessage[] = [];

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  const token = window.sessionStorage.getItem("auth_token")
  return token && token.trim() ? token : null
}

/** Junta mensagens sem duplicar e mantém a ordem cronológica. */
function mergeMessages(
  base: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] {
  const map = new Map<string, ChatMessage>()
  for (const message of base) map.set(message.id, message)
  for (const message of incoming) {
    const existing = map.get(message.id)
    map.set(message.id, existing ? { ...existing, ...message } : message)
  }
  return [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

/** Estado de uma conversa aberta (mensagens, paginação e erros). */
interface ThreadState {
  id: string;
  messages: ChatMessage[];
  hasMore: boolean;
  /** true depois da primeira tentativa de carga (evita ecrãs de loading eternos). */
  loaded: boolean;
  loadingMore: boolean;
  error: string | null;
}

function createThread(id: string): ThreadState {
  return {
    id,
    messages: [],
    hasMore: false,
    loaded: false,
    loadingMore: false,
    error: null,
  }
}

interface ItemChatPageProps {
  /** 'profissional' vê conversas com clientes; 'cliente' vê conversas com profissionais */
  role: "profissional" | "cliente";
  /** Título da página */
  pageTitle?: string;
  /** Subtítulo */
  pageSubtitle?: string;
}

export default function ItemChatPage({
  role,
  pageTitle,
  pageSubtitle,
}: ItemChatPageProps) {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const viewerId = useViewerUserId();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  /** true quando a primeira carga de conversas já terminou (com sucesso ou erro). */
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Estado de cada conversa aberta, indexado pelo id da conversa. */
  const [threads, setThreads] = useState<Record<string, ThreadState>>({});
  const [sending, setSending] = useState(false);

  const targetUserId = searchParams.get("userId")?.trim() ?? "";
  const targetConversationId = searchParams.get("conversation")?.trim() ?? "";
  /** Parâmetros da URL já aplicados (evita repor a selecção do utilizador). */
  const appliedConversationParamRef = useRef<string | null>(null);
  const appliedUserParamRef = useRef<string | null>(null);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const thread = selectedId ? threads[selectedId] : undefined;
  const messages = thread?.messages ?? EMPTY_MESSAGES;
  const messagesLoading = !!selectedId && !thread?.loaded && !thread?.error;
  const messagesError = thread?.error ?? null;
  const hasMore = thread?.hasMore ?? false;
  const loadingMore = thread?.loadingMore ?? false;
  const conversationsLoading = !conversationsLoaded && conversationsError === null;

  /* ---------------------------------------------------------------------- */
  /* Conversas                                                              */
  /* ---------------------------------------------------------------------- */

  const loadConversations = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setConversationsLoaded(true);
      return;
    }

    const result = await listConversations(token, {
      includeArchived: true,
      limit: PAGE_LIMIT,
    });

    if (result.success) {
      setConversations(result.data.conversations);
      setConversationsError(null);
    } else {
      setConversationsError(result.error);
    }

    setConversationsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    void (async () => {
      await loadConversations();
    })();
  }, [isAuthenticated, authLoading, loadConversations]);

  // Actualização periódica (novas mensagens / contadores).
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = window.setInterval(() => {
      void (async () => {
        await loadConversations();
      })();
    }, CONVERSATION_POLL_MS);
    return () => window.clearInterval(id);
  }, [isAuthenticated, loadConversations]);

  /* ---------------------------------------------------------------------- */
  /* Mensagens                                                              */
  /* ---------------------------------------------------------------------- */

  /** Actualiza o estado de uma conversa (criada se ainda não existir). */
  const updateThread = useCallback(
    (
      conversationId: string,
      updater: (current: ThreadState) => ThreadState
    ) => {
      setThreads((prev) => {
        const current = prev[conversationId] ?? createThread(conversationId);
        return { ...prev, [conversationId]: updater(current) };
      });
    },
    []
  );

  const loadMessages = useCallback(
    async (
      conversationId: string,
      options: { before?: string | null } = {}
    ) => {
      const token = getStoredToken();
      if (!token) return;

      const result = await listMessages(token, conversationId, {
        before: options.before ?? undefined,
        limit: PAGE_LIMIT,
      });

      if (!result.success) {
        updateThread(conversationId, (current) => ({
          ...current,
          loaded: true,
          loadingMore: false,
          error: result.error,
        }));
        return;
      }

      updateThread(conversationId, (current) => ({
        ...current,
        messages: mergeMessages(current.messages, result.data.messages),
        hasMore: result.data.hasMore,
        loaded: true,
        loadingMore: false,
        error: null,
      }));
    },
    [updateThread]
  );

  // Carrega (e marca como lida) a conversa selecionada.
  useEffect(() => {
    if (!selectedId) return;
    void (async () => {
      await loadMessages(selectedId);

      const token = getStoredToken();
      if (!token) return;

      const result = await markConversationRead(token, selectedId);
      if (!result.success) return;
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, unreadCount: 0 } : c))
      );
    })();
  }, [selectedId, loadMessages]);

  // Sonda as mensagens da conversa aberta.
  useEffect(() => {
    if (!selectedId) return;
    const id = window.setInterval(() => {
      void (async () => {
        await loadMessages(selectedId);
      })();
    }, MESSAGE_POLL_MS);
    return () => window.clearInterval(id);
  }, [selectedId, loadMessages]);

  /* ---------------------------------------------------------------------- */
  /* Parâmetros da URL (?conversation=… / ?userId=…)                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!isAuthenticated || !conversationsLoaded) return;

    void (async () => {
      // Abrir uma conversa específica (?conversation=…)
      if (
        targetConversationId &&
        appliedConversationParamRef.current !== targetConversationId
      ) {
        const exists = conversations.some((c) => c.id === targetConversationId);
        if (exists) {
          appliedConversationParamRef.current = targetConversationId;
          setSelectedId(targetConversationId);
          return;
        }
      }

      // Iniciar conversa a partir do perfil (?userId=…)
      if (!targetUserId || appliedUserParamRef.current === targetUserId) return;

      const token = getStoredToken();
      if (!token) return;

      const existing = conversations.find(
        (c) => c.participantId === targetUserId
      );
      if (existing) {
        appliedUserParamRef.current = targetUserId;
        setSelectedId(existing.id);
        return;
      }

      const created = await createConversation(token, {
        professionalId: targetUserId,
      });

      if (!created.success) {
        toast.error(created.error);
        return;
      }

      const list = await listConversations(token, {
        includeArchived: true,
        limit: PAGE_LIMIT,
      });
      if (!list.success) return;

      setConversations(list.data.conversations);

      const match = created.data?.id
        ? list.data.conversations.find((c) => c.id === created.data?.id)
        : list.data.conversations.find((c) => c.participantId === targetUserId);

      if (match) {
        appliedUserParamRef.current = targetUserId;
        setSelectedId(match.id);
      }
    })();
  }, [
    isAuthenticated,
    conversationsLoaded,
    conversations,
    targetConversationId,
    targetUserId,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Acções                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleSelect = useCallback((conversationId: string) => {
    setSelectedId(conversationId);
  }, []);

  const handleToggleArchive = useCallback(
    async (conversation: ChatConversation) => {
      const token = getStoredToken();
      if (!token) return;

      const next = !conversation.archived;
      const result = await archiveConversation(token, conversation.id, next);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setConversations((prev) =>
        prev.map((c) => (c.id === conversation.id ? { ...c, archived: next } : c))
      );
      toast.success(next ? "Conversa arquivada." : "Conversa restaurada.");
    },
    []
  );

  const handleSendText = useCallback(
    async (content: string) => {
      const token = getStoredToken();
      if (!token || !selectedId) return;
      const conversationId = selectedId;

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: ChatMessage = {
        id: tempId,
        conversationId,
        senderId: viewerId,
        type: "text",
        content,
        mediaUrl: null,
        latitude: null,
        longitude: null,
        locationLabel: null,
        createdAt: new Date().toISOString(),
        read: false,
        isOwn: true,
        pending: true,
      };

      updateThread(conversationId, (current) => ({
        ...current,
        messages: mergeMessages(current.messages, [optimistic]),
      }));
      setSending(true);

      const result = await sendMessage(token, {
        conversationId,
        type: "text",
        content,
      });
      setSending(false);

      if (!result.success) {
        updateThread(conversationId, (current) => ({
          ...current,
          messages: current.messages.map((m) =>
            m.id === tempId ? { ...m, pending: false, failed: true } : m
          ),
        }));
        toast.error(result.error);
        return;
      }

      updateThread(conversationId, (current) => ({
        ...current,
        messages: mergeMessages(
          current.messages.filter((m) => m.id !== tempId),
          result.data ? [result.data] : [{ ...optimistic, pending: false }]
        ),
      }));
      void (async () => {
        await loadConversations();
      })();
    },
    [selectedId, viewerId, loadConversations, updateThread]
  );

  const handleSendImage = useCallback(
    async (file: File) => {
      const token = getStoredToken();
      if (!token || !selectedId) return;
      const conversationId = selectedId;

      setSending(true);
      const upload = await uploadChatMedia(token, file);
      if (!upload.success) {
        setSending(false);
        toast.error(upload.error);
        return;
      }

      const result = await sendMessage(token, {
        conversationId,
        type: "image",
        mediaUrl: upload.data,
      });
      setSending(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (result.data) {
        updateThread(conversationId, (current) => ({
          ...current,
          messages: mergeMessages(current.messages, [result.data as ChatMessage]),
        }));
      }
      void (async () => {
        await loadConversations();
      })();
    },
    [selectedId, loadConversations, updateThread]
  );

  const handleSendLocation = useCallback(async () => {
    const token = getStoredToken();
    if (!token || !selectedId) return;
    const conversationId = selectedId;

    const geo = await getClientGeolocation();
    if (!geo.success) {
      toast.error(geo.message);
      return;
    }

    setSending(true);
    const result = await sendMessage(token, {
      conversationId,
      type: "location",
      latitude: geo.coords.latitude,
      longitude: geo.coords.longitude,
      locationLabel: "Localização atual",
    });
    setSending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    if (result.data) {
      updateThread(conversationId, (current) => ({
        ...current,
        messages: mergeMessages(current.messages, [result.data as ChatMessage]),
      }));
    }
    void (async () => {
      await loadConversations();
    })();
  }, [selectedId, loadConversations, updateThread]);

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      const token = getStoredToken();
      if (!token || !selectedId) return;
      const conversationId = selectedId;

      const result = await deleteMessage(token, messageId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      updateThread(conversationId, (current) => ({
        ...current,
        messages: current.messages.filter((m) => m.id !== messageId),
      }));
      toast.success("Mensagem apagada.");
    },
    [selectedId, updateThread]
  );

  const handleLoadMore = useCallback(() => {
    if (!selectedId) return;
    const current = threads[selectedId];
    if (!current || current.loadingMore) return;

    const oldest = current.messages.length > 0 ? current.messages[0].createdAt : null;
    if (!oldest) return;

    updateThread(selectedId, (state) => ({ ...state, loadingMore: true }));
    void (async () => {
      await loadMessages(selectedId, { before: oldest });
    })();
  }, [selectedId, threads, loadMessages, updateThread]);

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  const title =
    pageTitle ?? (role === "profissional" ? "Propostas e Mensagens" : "Mensagens");
  const subtitle =
    pageSubtitle ??
    (role === "profissional"
      ? "Receba propostas de clientes e negocie aqui."
      : "Conversas com os profissionais que contratou.");

  const showEmptyState = !authLoading && !isAuthenticated;

  return (
    <div className="flex h-[calc(100vh-6rem)] min-h-[320px] max-h-[calc(100vh-6rem)] flex-col overflow-hidden border-border bg-card shadow-sm sm:min-h-[420px]">
      {/* Header da página */}
      <div className="shrink-0 border-b border-border bg-card px-3 py-3 sm:px-4">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h1>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
          {subtitle}
        </p>
      </div>

      {showEmptyState ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="rounded-full bg-muted p-4">
            <MessageCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Inicie sessão para ver as suas mensagens
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              As conversas ficam disponíveis apenas para utilizadores autenticados.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/auth/login">Iniciar sessão</Link>
          </Button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          <ChatConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelect}
            loading={conversationsLoading}
            error={conversationsError}
            onRetry={() => void loadConversations()}
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            onToggleArchive={handleToggleArchive}
            hiddenOnMobile={!!selectedId}
          />

          {/* Área do chat */}
          <main className="flex min-w-0 flex-1 flex-col bg-card">
            {selected ? (
              <>
                {/* Voltar (mobile) */}
                <div className="flex min-h-[48px] shrink-0 items-center gap-2 border-b border-border px-3 py-2 sm:hidden">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="-ml-1 flex cursor-pointer items-center gap-1 rounded-lg py-2 pr-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </button>
                </div>

                {/* Header da conversa */}
                <div className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
                  <Image
                    src={resolveUserAvatarUrl(selected.participantAvatar)}
                    alt={selected.participantName}
                    width={44}
                    height={44}
                    className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-11 sm:w-11"
                    unoptimized={userAvatarSrcUnoptimized(
                      resolveUserAvatarUrl(selected.participantAvatar)
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                      {selected.participantName}
                    </p>
                    {selected.contextTitle ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                        {selected.contextTitle}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleToggleArchive(selected)}
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label={
                      selected.archived
                        ? "Desarquivar conversa"
                        : "Arquivar conversa"
                    }
                    title={
                      selected.archived
                        ? "Desarquivar conversa"
                        : "Arquivar conversa"
                    }
                  >
                    <span className="text-xs font-medium">
                      {selected.archived ? "Restaurar" : "Arquivar"}
                    </span>
                  </button>
                </div>

                <ChatThread
                  messages={messages}
                  viewerId={viewerId}
                  loading={messagesLoading}
                  error={messagesError}
                  onRetry={() => selectedId && void loadMessages(selectedId)}
                  onDeleteMessage={(id) => void handleDeleteMessage(id)}
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  onLoadMore={handleLoadMore}
                />

                <ChatComposer
                  disabled={!selectedId || sending}
                  sending={sending}
                  onSendText={(content) => void handleSendText(content)}
                  onSendImage={(file) => void handleSendImage(file)}
                  onSendLocation={() => void handleSendLocation()}
                />
              </>
            ) : (
              <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center p-6 text-center sm:p-8">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <MessageCircle className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
                </div>
                <p className="text-sm font-semibold text-foreground sm:text-base">
                  Selecione uma conversa
                </p>
                <p className="mt-1.5 max-w-[260px] text-xs text-muted-foreground sm:text-sm">
                  {role === "profissional"
                    ? "Aqui aparecem as conversas com os clientes."
                    : "Suas conversas com os profissionais aparecem aqui."}
                </p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
