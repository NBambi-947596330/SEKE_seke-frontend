"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, MapPin, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  /** Desativa o envio (ex.: conversa não carregada). */
  disabled?: boolean;
  sending: boolean;
  /** Texto inicial do campo (ex.: saudação ao iniciar uma conversa). */
  defaultValue?: string;
  /** Placeholder do campo de texto. */
  placeholder?: string;
  onSendText: (content: string) => boolean | Promise<boolean>;
  onSendImage: (file: File) => void;
  onSendLocation: () => void;
}

export default function ChatComposer({
  disabled = false,
  sending = false,
  defaultValue = "",
  placeholder = "Escreva uma mensagem...",
  onSendText,
  onSendImage,
  onSendLocation,
}: ChatComposerProps) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = !disabled && !sending && value.trim().length > 0;

  const handleSubmit = async () => {
    const content = value.trim();
    if (!content || disabled || sending) return;

    const sent = await onSendText(content);

    // Mantém o texto quando o envio falha, para o utilizador poder tentar de novo.
    if (sent) setValue("");
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      await onSendImage(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="shrink-0 border-t border-border bg-background p-3 sm:p-4">
      <div className="flex items-end gap-2 sm:gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFileChange(e.target.files?.[0])}
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={disabled || sending || uploading}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Enviar imagem"
          title="Enviar imagem"
          className="shrink-0 border-2 border-border/50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={disabled || sending}
          onClick={onSendLocation}
          aria-label="Enviar localização"
          title="Enviar localização"
          className="shrink-0 border-2 border-border/50"
        >
          <MapPin className="h-4 w-4" />
        </Button>

        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              void handleSubmit()
            }
          }}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          aria-label="Mensagem"
          className={cn(
            "max-h-32 min-h-10 flex-1 resize-none rounded-xl border-border bg-card px-3 py-2 text-sm leading-relaxed sm:text-base",
            "focus-visible:border-[#1876f2] focus-visible:ring-[#1876f2]/20"
          )}
        />

        <Button
          type="button"
          size="icon"
          onClick={() => void handleSubmit()}
          disabled={!canSend}
          aria-label="Enviar mensagem"
          className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground sm:h-11 sm:w-11"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
