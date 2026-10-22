"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Loader2, MapPin, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatMessageDayLabel,
  formatMessageTime,
} from "@/lib/chat-format";
import { userAvatarSrcUnoptimized } from "@/lib/user-avatar";
import type { ChatMessage } from "@/types/chat";

interface ChatThreadProps {
  messages: ChatMessage[];
  /** ID do utilizador em sessão (para identificar as mensagens próprias). */
  viewerId: string | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onDeleteMessage: (messageId: string) => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

type ThreadItem =
  | { kind: "day"; key: string; label: string }
  | { kind: "message"; key: string; message: ChatMessage };

function isOwnMessage(message: ChatMessage, viewerId: string | null): boolean {
  if (message.isOwn !== null) return message.isOwn
  if (!viewerId || !message.senderId) return false
  return message.senderId === viewerId
}

function buildMapUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
}

export default function ChatThread({
  messages,
  viewerId,
  loading,
  error,
  onRetry,
  onDeleteMessage,
  hasMore,
  loadingMore,
  onLoadMore,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

  // Agrupa as mensagens por dia, para inserir os separadores.
  const items = useMemo<ThreadItem[]>(() => {
    const grouped: ThreadItem[] = []
    let lastLabel: string | null = null
    for (const message of messages) {
      const label = formatMessageDayLabel(message.createdAt)
      if (label !== lastLabel) {
        grouped.push({ kind: "day", key: `dia-${message.id}`, label })
        lastLabel = label
      }
      grouped.push({ kind: "message", key: message.id, message })
    }
    return grouped
  }, [messages])

  // Mantém a vista colada à última mensagem.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [lastMessageId])

  if (loading && messages.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">A carregar mensagens…</span>
      </div>
    )
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
        <p className="text-sm font-medium text-foreground">
          Ainda não há mensagens
        </p>
        <p className="max-w-[280px] text-xs">
          Escreva a primeira mensagem para iniciar a conversa.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
      {hasMore ? (
        <div className="flex justify-center py-3">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-xs"
          >
            {loadingMore ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Ver mensagens anteriores
          </Button>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-3 py-4 sm:gap-3 sm:px-4">
        {items.map((item) => {
          if (item.kind === "day") {
            return (
              <div key={item.key} className="my-1 flex justify-center">
                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  {item.label}
                </span>
              </div>
            )
          }

          const message = item.message
          const own = isOwnMessage(message, viewerId)

          return (
            <Fragment key={item.key}>
              <div
                className={cn(
                  "group flex max-w-[90%] flex-col gap-0.5 sm:max-w-[75%]",
                  own ? "self-end items-end" : "self-start items-start"
                )}
              >
                <div
                  className={cn(
                    "break-words rounded-2xl px-3 py-2 text-sm leading-relaxed sm:px-4 sm:text-[15px]",
                    own
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md border border-border/80 bg-secondary text-foreground"
                  )}
                >
                  {message.type === "image" && message.mediaUrl ? (
                    <a
                      href={message.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <Image
                        src={message.mediaUrl}
                        alt={message.content || "Imagem enviada"}
                        width={320}
                        height={320}
                        className="max-h-64 w-full rounded-lg object-cover"
                        unoptimized={userAvatarSrcUnoptimized(message.mediaUrl)}
                      />
                    </a>
                  ) : null}

                  {message.type === "location" &&
                  message.latitude !== null &&
                  message.longitude !== null ? (
                    <a
                      href={buildMapUrl(message.latitude, message.longitude)}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "mb-1 flex items-center gap-1.5 underline underline-offset-2",
                        own ? "text-primary-foreground" : "text-primary"
                      )}
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {message.locationLabel ||
                          `${message.latitude}, ${message.longitude}`}
                      </span>
                    </a>
                  ) : null}

                  {message.content ? (
                    <span className="block whitespace-pre-wrap break-words">
                      {message.content}
                    </span>
                  ) : null}

                  {message.failed ? (
                    <span className="mt-1 block text-[11px] font-medium text-destructive">
                      Falhou ao enviar.
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {message.pending
                      ? "A enviar…"
                      : formatMessageTime(message.createdAt)}
                  </span>
                  {own ? (
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(message.id)}
                      className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                      aria-label="Apagar mensagem"
                      title="Apagar mensagem"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </Fragment>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
