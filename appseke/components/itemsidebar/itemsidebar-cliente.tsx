"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  Search,
  FileText,
  MessageCircle,
  User,
  Settings,
  UserPlus,
} from "lucide-react"
import { DashboardHeader } from "@/components/itemnavbar/dashboard-header"
import ItemChatWidget from "@/components/itemChatWidget/itemChatWidget"

interface SidebarClienteProps {
  children: ReactNode
}

export default function SidebarCliente({ children }: SidebarClienteProps) {
  const pathname = usePathname()
  const isChatPage = pathname === "/clientes/mensagens"

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon">
        {/* HEADER (Perfil Cliente) */}
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <Image
              src="/avatar.jpg"
              alt="Cliente"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">
                Cliente
              </span>
              <span className="text-xs text-muted-foreground">
                Área do Cliente
              </span>
            </div>
          </div>
        </SidebarHeader>

        {/* MENU - itens para contratar profissional e gerir serviços */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/clientes">
                      <LayoutDashboard />
                      <span>Início</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/clientes/buscar-profissional">
                      <Search />
                      <span>Buscar Profissional</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/clientes/contratar">
                      <UserPlus />
                      <span>Contratar Profissional</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/clientes/meus-pedidos">
                      <FileText />
                      <span>Meus Pedidos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/clientes/mensagens">
                      <MessageCircle />
                      <span>Mensagens</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/clientes/perfil">
                      <User />
                      <span>Perfil</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/clientes/configuracoes">
                      <Settings />
                      <span>Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter />
      </Sidebar>

      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>

      {!isChatPage && <ItemChatWidget unreadCount={0} title="Mensagens" />}
    </SidebarProvider>
  )
}
