"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import ItemChatWidget from "@/components/itemChatWidget/itemChatWidget"

const EXCLUDED_PREFIXES = ["/auth", "/optionregister"]

/** Páginas que já têm o chat em ecrã inteiro — o widget flutuante é escondido. */
const CHAT_PAGES = ["/chat", "/profissional/mensagens"]

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const excluded = EXCLUDED_PREFIXES.some((prefix) => pathname?.startsWith(prefix))
  const isChatPage = CHAT_PAGES.some((page) => pathname === page)

  if (excluded) return <>{children}</>

  return (
    <>
      <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-4 md:px-6 lg:px-8 pt-32 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pt-20 md:pb-10">
        {children}
      </div>

      {/* Chat flutuante — escondido nas páginas de mensagens */}
      {!isChatPage && <ItemChatWidget title="Mensagens" />}
    </>
  )
}
