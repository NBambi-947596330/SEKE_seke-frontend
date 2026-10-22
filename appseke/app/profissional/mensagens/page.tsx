import { Suspense } from "react";

import ItemChatPage from "@/components/itemChatPage/itemChatPage";

export default function ProfissionalMensagensPage() {
  return (
    <div className="p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="flex h-[calc(100vh-6rem)] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
            A carregar conversas…
          </div>
        }
      >
        <ItemChatPage
          role="profissional"
          pageTitle="Propostas e Mensagens"
          pageSubtitle="Receba propostas de trabalho de vários clientes e negocie aqui."
        />
      </Suspense>
    </div>
  );
}
